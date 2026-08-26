import { apiClient } from './client';
import type { ApiResponse } from '../types/auth';

export const preConsultationApi = {
    start: async (appointmentId: string, complaint: string): Promise<ApiResponse<any>> => {
        const response = await apiClient.post('/api/pre-consultations', { appointmentId, initialComplaint: complaint });
        return response.data;
    },
    sendAudio: async (appointmentId: string, audioBlob: Blob): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        const response = await apiClient.post(`/api/pre-consultations/${appointmentId}/audio`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    chat: async (appointmentId: string, message: string): Promise<ApiResponse<string>> => {
        const response = await apiClient.post(`/api/pre-consultations/${appointmentId}/chat`, { message });
        return response.data;
    },
    complete: async (appointmentId: string): Promise<ApiResponse<any>> => {
        const response = await apiClient.post(`/api/pre-consultations/${appointmentId}/complete`);
        return response.data;
    }
};
