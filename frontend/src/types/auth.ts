export interface AuthResponse {
    token: string;
    userId: string;
    role: string;
    patientId?: string;
    doctorId?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    errorCode: string | null;
    data: T | null;
    timestamp: string;
}
