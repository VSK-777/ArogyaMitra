import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ProtectedRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/auth" replace />;
    return <Outlet />;
};

export const RoleProtectedRoute: React.FC<{ allowedRoles: string[] }> = ({ allowedRoles }) => {
    const { isAuthenticated, role } = useAuth();
    if (!isAuthenticated) return <Navigate to="/auth" replace />;
    if (!role || !allowedRoles.includes(role)) return <Navigate to="/" replace />;
    return <Outlet />;
};

export const PublicOnlyRoute: React.FC = () => {
    const { isAuthenticated, role } = useAuth();
    if (isAuthenticated) {
        if (role === 'ROLE_PATIENT' || role === 'Patient') return <Navigate to="/patient/dashboard" replace />;
        if (role === 'ROLE_DOCTOR' || role === 'Doctor') return <Navigate to="/doctor/dashboard" replace />;
        if (role === 'ROLE_ADMIN' || role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
        if (role === 'ROLE_RECEPTIONIST' || role === 'Receptionist') return <Navigate to="/receptionist/dashboard" replace />;
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
};
