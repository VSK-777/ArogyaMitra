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
        getPreConsultation: async (appointmentId: string): Promise<ApiResponse<any>> => {
        const response = await apiClient.get('/api/doctor/appointments/' + appointmentId + '/preconsultation');
        return response.data;
    },
    completeConsultation: async (data: any): Promise<ApiResponse<any>> => {
        const response = await apiClient.post('/api/doctor/consultations/complete', data);
        return response.data;
    }
};

