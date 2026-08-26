import { apiClient } from './client';
import type { ApiResponse } from '../types/auth';

export const patientApi = {
    bookAppointment: async (data: any): Promise<ApiResponse<any>> => {
        const response = await apiClient.post('/api/appointments', data);
        return response.data;
    },
    getDashboard: async (): Promise<ApiResponse<any>> => {
        const response = await apiClient.get('/api/patients/me/dashboard');
        return response.data;
    },
    getBookedSlots: async (doctorId: number, date: string): Promise<ApiResponse<string[]>> => {
        const response = await apiClient.get(`/api/appointments/slots?doctorId=${doctorId}&date=${date}`);
        return response.data;
    },
    getHospitals: async (): Promise<ApiResponse<any>> => {
        const response = await apiClient.get('/api/hospitals');
        return response.data;
    },
    getDepartments: async (hospitalId: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.get(`/api/departments/hospital/${hospitalId}`);
        return response.data;
    },
    getDoctors: async (departmentId: number): Promise<ApiResponse<any>> => {
        const response = await apiClient.get(`/api/public/doctors/department/${departmentId}`);
        return response.data;
    }
};
