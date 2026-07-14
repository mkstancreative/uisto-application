import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function ProtectedRoute({ allowedRoleIds = [] }) {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoleIds.length > 0) {
        const userRoleId = Number(user?.role_id);
        if (!allowedRoleIds.includes(userRoleId)) {
            return <Navigate to="/" replace />;
        }
    }

    
    return <Outlet />;
}

export default ProtectedRoute;
