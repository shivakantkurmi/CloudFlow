import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { TopNavbar } from './TopNavbar.jsx';

export const ProtectedRoute = () => {
  const { accessToken, initialized } = useSelector((state) => state.auth);
  if (!initialized) return <div className="grid min-h-screen place-items-center text-slate-600">Loading CloudFlow…</div>;
  if (!accessToken) return <Navigate to="/login" replace />;
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <TopNavbar />
      <div className="flex-1 pb-10">
        <Outlet />
      </div>
    </div>
  );
};
