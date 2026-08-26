import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthState {
    token: string | null;
    role: string | null;
    userId: string | null;
    isAuthenticated: boolean;
    login: (token: string, role: string, userId: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
    const [role, setRole] = useState<string | null>(localStorage.getItem('user_role'));
    const [userId, setUserId] = useState<string | null>(localStorage.getItem('user_id'));

    useEffect(() => {
        const handleStorageChange = () => {
            setToken(localStorage.getItem('jwt_token'));
            setRole(localStorage.getItem('user_role'));
            setUserId(localStorage.getItem('user_id'));
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = (newToken: string, newRole: string, newUserId: string) => {
        localStorage.setItem('jwt_token', newToken);
        localStorage.setItem('user_role', newRole);
        localStorage.setItem('user_id', newUserId);
        setToken(newToken);
        setRole(newRole);
        setUserId(newUserId);
    };

    const logout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_id');
        setToken(null);
        setRole(null);
        setUserId(null);
        window.location.href = '/auth';
    };

    return (
        <AuthContext.Provider value={{ token, role, userId, isAuthenticated: !!token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
