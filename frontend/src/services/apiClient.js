import axios from 'axios';
import { getStore } from '../store/injectStore.js';
import { clearSession, setTokens } from '../store/authSlice.js';

const apiClient = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api' });
apiClient.interceptors.request.use((config) => {
  const store = getStore();
  const token = store?.getState()?.auth?.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
let refreshPromise;
apiClient.interceptors.response.use((response) => response, async (error) => {
  const original = error.config;
  if (error.response?.status !== 401 || original?._retry || original?.url?.includes('/auth/refresh')) return Promise.reject(error);
  original._retry = true;
  const store = getStore();
  const refreshToken = store?.getState()?.auth?.refreshToken;
  if (!refreshToken) return Promise.reject(error);
  try {
    refreshPromise ??= axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, { refreshToken }).then(({ data }) => data.data).finally(() => { refreshPromise = undefined; });
    const data = await refreshPromise;
    if (store) store.dispatch(setTokens(data));
    original.headers.Authorization = `Bearer ${data.accessToken}`;
    return apiClient(original);
  } catch (refreshError) {
    if (store) store.dispatch(clearSession());
    return Promise.reject(refreshError);
  }
});
export default apiClient;
