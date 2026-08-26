import { apiClient } from './client';
import type { ApiResponse } from '../types/auth';

export const patientApi = {
    bookAppointment: async (data: any): Promise<ApiResponse<any>> => {
        const response = await apiClient.post('/api/appointments', data);
        return response.data;
    }
};
