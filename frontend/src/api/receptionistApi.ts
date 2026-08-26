import { apiClient } from './client';
import type { ApiResponse } from '../types/auth';

export const receptionistApi = {
    searchPatient: async (mobile: string): Promise<ApiResponse<any>> => {
        const response = await apiClient.get(`/api/receptionist/patients/search?mobile=${mobile}`);
        return response.data;
    },
    registerPatient: async (data: any): Promise<ApiResponse<any>> => {
        const response = await apiClient.post('/api/receptionist/patients/register', data);
        return response.data;
    },
    bookWalkIn: async (data: any): Promise<ApiResponse<any>> => {
        const response = await apiClient.post('/api/receptionist/appointments/walkin', data);
        return response.data;
    }
};
