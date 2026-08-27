import { apiClient } from './client';
import type { ApiResponse } from '../types/auth';

export const adminApi = {
    getAnalytics: async (): Promise<ApiResponse<any>> => {
        const response = await apiClient.get('/api/admin/analytics');
        return response.data;
    },
    getDoctors: async (): Promise<ApiResponse<any[]>> => {
        const response = await apiClient.get('/api/admin/doctors');
        return response.data;
    },
    getUsers: async (): Promise<ApiResponse<any[]>> => {
        const response = await apiClient.get('/api/admin/users');
        return response.data;
    },
    getAuditLogs: async (): Promise<ApiResponse<any[]>> => {
        const response = await apiClient.get('/api/admin/audit-logs');
        return response.data;
    },
    getHealth: async (): Promise<any> => {
        const response = await apiClient.get('/api/health');
        return response.data;
    }
};
