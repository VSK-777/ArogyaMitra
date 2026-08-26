import { apiClient } from './client';
import type { ApiResponse } from '../types/auth';

export const receptionistApi = {
    searchPatient: async (mobile: string): Promise<ApiResponse<any>> => {
        const response = await apiClient.get(`/api/receptionist/patients/search?mobile=${mobile}`);
        return response.data;
    },
    registerPatient: async (data: any): Promise<ApiResponse<any>> => {
        const response = await apiClient.post('/api/receptionist/patients', data);
        return response.data;
    },
    generateToken: async (patientId: string, doctorId: string): Promise<ApiResponse<any>> => {
        const response = await apiClient.post('/api/receptionist/tokens', { patientId, doctorId });
        return response.data;
    }
};
