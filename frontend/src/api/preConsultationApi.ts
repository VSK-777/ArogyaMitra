import { apiClient } from './client';
import type { ApiResponse } from '../types/auth';

export const preConsultationApi = {
    start: async (appointmentId: string, initialComplaint: string): Promise<ApiResponse<any>> => {
        const response = await apiClient.post('/api/pre-consultations', { appointmentId, initialComplaint });
        return response.data;
    },
    handleAudio: async (appointmentId: string, audioBlob: Blob): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.webm');
        const response = await apiClient.post(`/api/pre-consultations/${appointmentId}/audio`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    complete: async (appointmentId: string): Promise<ApiResponse<any>> => {
        const response = await apiClient.post(`/api/pre-consultations/${appointmentId}/complete`);
        return response.data;
    }
};
