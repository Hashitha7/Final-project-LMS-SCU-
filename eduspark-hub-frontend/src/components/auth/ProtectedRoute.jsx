import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
export const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    if (!user)
        return <Navigate to="/login" replace />;
    return <Outlet />;
};
export const RoleGuard = ({ roles }) => {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (!user)
        return <Navigate to="/login" replace />;
    if (!roles.includes(user.role))
        return <Navigate to="/app" replace />;
    return <Outlet />;
};
