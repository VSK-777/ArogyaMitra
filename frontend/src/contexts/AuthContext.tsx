import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthResponse } from '../types/auth';

interface AuthState {
    token: string | null;
    role: string | null;
    userId: string | null;
    name: string | null;
    mobile: string | null;
    patientId: string | null;
    doctorId: string | null;
    hospitalId: string | null;
    department: string | null;
    isAuthenticated: boolean;
    login: (authData: AuthResponse) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
    const [role, setRole] = useState<string | null>(localStorage.getItem('user_role'));
    const [userId, setUserId] = useState<string | null>(localStorage.getItem('user_id'));
    const [name, setName] = useState<string | null>(localStorage.getItem('user_name'));
    const [mobile, setMobile] = useState<string | null>(localStorage.getItem('user_mobile'));
    const [patientId, setPatientId] = useState<string | null>(localStorage.getItem('patient_id'));
    const [doctorId, setDoctorId] = useState<string | null>(localStorage.getItem('doctor_id'));
    const [hospitalId, setHospitalId] = useState<string | null>(localStorage.getItem('hospital_id'));
    const [department, setDepartment] = useState<string | null>(localStorage.getItem('department'));

    useEffect(() => {
        const handleStorageChange = () => {
            setToken(localStorage.getItem('jwt_token'));
            setRole(localStorage.getItem('user_role'));
            setUserId(localStorage.getItem('user_id'));
            setName(localStorage.getItem('user_name'));
            setMobile(localStorage.getItem('user_mobile'));
            setPatientId(localStorage.getItem('patient_id'));
            setDoctorId(localStorage.getItem('doctor_id'));
            setHospitalId(localStorage.getItem('hospital_id'));
            setDepartment(localStorage.getItem('department'));
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = (authData: AuthResponse) => {
        localStorage.setItem('jwt_token', authData.token);
        localStorage.setItem('user_role', authData.role);
        localStorage.setItem('user_id', authData.userId);
        if(authData.name) localStorage.setItem('user_name', authData.name);
        if(authData.mobile) localStorage.setItem('user_mobile', authData.mobile);
        if(authData.patientId) localStorage.setItem('patient_id', authData.patientId);
        if(authData.doctorId) localStorage.setItem('doctor_id', authData.doctorId);
        if(authData.hospitalId) localStorage.setItem('hospital_id', authData.hospitalId.toString());
        if(authData.department) localStorage.setItem('department', authData.department);
        
        setToken(authData.token);
        setRole(authData.role);
        setUserId(authData.userId);
        setName(authData.name || null);
        setMobile(authData.mobile || null);
        setPatientId(authData.patientId || null);
        setDoctorId(authData.doctorId || null);
        setHospitalId(authData.hospitalId?.toString() || null);
        setDepartment(authData.department || null);
    };

    const logout = () => {
        localStorage.clear();
        setToken(null);
        setRole(null);
        setUserId(null);
        setName(null);
        setMobile(null);
        setPatientId(null);
        setDoctorId(null);
        setHospitalId(null);
        setDepartment(null);
        window.location.href = '/auth';
    };

    return (
        <AuthContext.Provider value={{ token, role, userId, name, mobile, patientId, doctorId, hospitalId, department, isAuthenticated: !!token, login, logout }}>
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
