import { apiClient } from './client';
import type { AuthResponse, ApiResponse } from '../types/auth';

export const authApi = {
    login: async (mobile: string, password: string, role: string): Promise<ApiResponse<AuthResponse>> => {
        const response = await apiClient.post('/api/auth/login', { mobile, password, role: role.toUpperCase() });
        return response.data;
    },
    patientRegister: async (mobile: string, password: string, fullName: string): Promise<ApiResponse<string>> => {
        const response = await apiClient.post('/api/auth/patient/register', { mobile, password, fullName });
        return response.data;
    }
};
