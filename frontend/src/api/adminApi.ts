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
    },
    activateUser: async (userId: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.put(`/api/admin/users/${userId}/activate`);
        return response.data;
    },
    deactivateUser: async (userId: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.put(`/api/admin/users/${userId}/deactivate`);
        return response.data;
    }
};
