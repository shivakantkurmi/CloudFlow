import axios from 'axios';
import { getStore } from '../store/injectStore.js';
import { clearSession, setTokens } from '../store/authSlice.js';
import { toast } from 'react-toastify';

const apiClient = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api' });

// ── Request: attach access token ──────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const store = getStore();
  const token = store?.getState()?.auth?.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: transparent token refresh + session invalidation ───
let refreshPromise = null;

const forceLogout = (message = 'Your session has expired. Please sign in again.') => {
  const store = getStore();
  if (store) store.dispatch(clearSession());
  // Show toast before redirect so user knows why
  toast.error(message, { toastId: 'session-expired', autoClose: 4000 });
  // Use replace to prevent back navigation to a protected page
  if (!window.location.pathname.startsWith('/login')) {
    window.location.replace('/login');
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    // ── 401 handling ──────────────────────────────────────────────
    if (status === 401) {
      // On auth routes (login/register/refresh), a 401 is a normal "wrong credentials"
      // response — do NOT trigger forceLogout here; let the form handle it
      const isAuthCall = original?.url?.includes('/auth/login')
        || original?.url?.includes('/auth/register');
      const isRefreshCall = original?.url?.includes('/auth/refresh');
      const alreadyRetried = original?._retry;

      if (isAuthCall) {
        // Let it fall through so the catch block in AuthPage shows the toast
        return Promise.reject(error);
      }

      if (isRefreshCall || alreadyRetried) {
        // Refresh token is also invalid/expired → hard logout
        forceLogout('Your session has expired. Please sign in again.');
        return Promise.reject(error);
      }

      original._retry = true;
      const store = getStore();
      const refreshToken = store?.getState()?.auth?.refreshToken;

      if (!refreshToken) {
        forceLogout('You are not authenticated. Please sign in.');
        return Promise.reject(error);
      }

      try {
        // Deduplicate concurrent refresh attempts
        refreshPromise ??= axios
          .post(`${apiClient.defaults.baseURL}/auth/refresh`, { refreshToken })
          .then(({ data }) => data.data)
          .finally(() => { refreshPromise = null; });

        const data = await refreshPromise;
        if (store) store.dispatch(setTokens(data));
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(original);
      } catch {
        forceLogout('Your session has expired. Please sign in again.');
        return Promise.reject(error);
      }
    }

    // ── 403: show specific backend reason but NOT on auth pages ───
    if (status === 403) {
      const isAuthPage = window.location.pathname.startsWith('/login')
        || window.location.pathname.startsWith('/register');
      if (!isAuthPage) {
        const msg = serverMessage || 'You do not have permission to perform this action.';
        toast.error(msg, { toastId: `forbidden-${Date.now()}` });
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
