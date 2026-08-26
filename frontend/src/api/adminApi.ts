import { apiClient } from './client';
import type { ApiResponse } from '../types/auth';

export const adminApi = {
    getAnalytics: async (): Promise<ApiResponse<any>> => {
        const response = await apiClient.get('/api/admin/analytics');
        return response.data;
    }
};
