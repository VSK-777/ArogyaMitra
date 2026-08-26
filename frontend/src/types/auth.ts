export interface AuthResponse {
    token: string;
    userId: string;
    name?: string;
    mobile?: string;
    role: string;
    patientId?: string;
    doctorId?: string;
    hospitalId?: number;
    department?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    errorCode: string | null;
    data: T | null;
    timestamp: string;
}
