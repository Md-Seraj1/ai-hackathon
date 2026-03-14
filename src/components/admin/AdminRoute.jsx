// Update 1
import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../../lib/store';

export const AdminRoute = () => {
    const { user, isAdmin } = useUserStore();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
