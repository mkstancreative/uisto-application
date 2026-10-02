import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import FullPageLoader from '../ui/FullPageLoader/FullPageLoader';

/**
 * Guards staff-only routes.
 * - roles: limit to these staff roles (e.g. ['hrm']); others go to the dashboard.
 * - allowPasswordChange: the one route reachable while mustChangePassword is set.
 */
function ProtectedRoute({ roles, allowPasswordChange = false }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageLoader label="Restoring your session…" />;

  if (status !== 'authenticated') {
    return <Navigate to="/" replace state={{ openLogin: true, from: location }} />;
  }

  if (user?.mustChangePassword && !allowPasswordChange) {
    return <Navigate to="/change-password" replace />;
  }

  if (!user?.mustChangePassword && allowPasswordChange) {
    return <Navigate to="/admin" replace />;
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
