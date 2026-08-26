import { apiClient } from './client';
import type { AuthResponse, ApiResponse } from '../types/auth';

export const authApi = {
    patientLogin: async (mobile: string, password: string): Promise<ApiResponse<AuthResponse>> => {
        const response = await apiClient.post('/api/auth/patient/login', { mobile, password });
        return response.data;
    },
    patientRegister: async (mobile: string, password: string): Promise<ApiResponse<string>> => {
        const response = await apiClient.post('/api/auth/patient/register', { mobile, password });
        return response.data;
    }
};
