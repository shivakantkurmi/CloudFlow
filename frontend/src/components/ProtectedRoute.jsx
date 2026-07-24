import { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { TopNavbar } from './TopNavbar.jsx';
import { OrganizationOnboarding } from './OrganizationOnboarding.jsx';
import { fetchCurrentUser, clearSession } from '../store/authSlice.js';
import { fetchOrganizations } from '../store/orgSlice.js';

const Spinner = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cf">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-DEFAULT to-accent-violet text-white shadow-glow">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    </div>
    <div className="flex items-center gap-2">
      <svg className="animate-spin h-4 w-4 text-primary-DEFAULT" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <p className="text-sm font-medium text-cf-2">Loading CloudFlow…</p>
    </div>
  </div>
);

export const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { accessToken, initialized, isLoading } = useSelector((state) => state.auth);
  const { items: orgs, status: orgStatus } = useSelector((state) => state.orgs);

  // If we have a stored token but haven't verified it yet, do it now.
  // fetchCurrentUser will fail gracefully if the token is expired — the
  // apiClient interceptor will attempt a token refresh and, if that fails,
  // call forceLogout() which clears the session + redirects to /login.
  useEffect(() => {
    if (accessToken && !initialized && !isLoading) {
      dispatch(fetchCurrentUser())
        .unwrap()
        .catch(() => {
          // fetchCurrentUser rejected means the stored token is dead and
          // the apiClient interceptor already handled the redirect/logout.
          // We just clear redux state here as a safety net.
          dispatch(clearSession());
        });
    }
  }, [accessToken, initialized, isLoading, dispatch]);

  // Fetch orgs once auth is ready
  useEffect(() => {
    if (accessToken && initialized && orgStatus === 'idle') {
      dispatch(fetchOrganizations());
    }
  }, [accessToken, initialized, orgStatus, dispatch]);

  // Show spinner while bootstrapping
  if (!initialized || isLoading) return <Spinner />;

  // No valid session → go to login
  if (!accessToken) return <Navigate to="/login" replace />;

  // Orgs still loading → spinner
  if (orgStatus === 'loading' || orgStatus === 'idle') return <Spinner />;

  // First-time user with no org → onboarding
  if (orgStatus === 'succeeded' && orgs.length === 0) {
    return <OrganizationOnboarding />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-cf">
      <TopNavbar />
      <div className="flex-1 pb-10">
        <Outlet />
      </div>
    </div>
  );
};
