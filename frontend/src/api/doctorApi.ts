import { apiClient } from './client';
import type { ApiResponse } from '../types/auth';

export const doctorApi = {
    getQueueToday: async (): Promise<ApiResponse<any[]>> => {
        const response = await apiClient.get('/api/doctor/queue/today');
        return response.data;
    },
    getPastConsultations: async (): Promise<ApiResponse<any[]>> => {
        const response = await apiClient.get('/api/doctor/consultations');
        return response.data;
    },
    saveConsultation: async (data: any): Promise<ApiResponse<any>> => {
        const response = await apiClient.post('/api/doctor/consultations', data);
        return response.data;
    },
    savePrescription: async (data: any): Promise<ApiResponse<any>> => {
        const response = await apiClient.post('/api/doctor/prescriptions', data);
        return response.data;
    }
};
