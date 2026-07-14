import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getPathForRoleId } from "../../utils/rolePaths";

const PublicRoutes = () => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) return null;

    if (isAuthenticated) {
        const dest = getPathForRoleId(user?.role_id);
        return <Navigate to={dest} replace />;
    }

    return <Outlet />;
};

export default PublicRoutes;