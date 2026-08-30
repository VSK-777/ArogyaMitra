import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add JWT token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor to handle errors and HTML responses
apiClient.interceptors.response.use(
    (response) => {
        // If the API base URL is misconfigured in production (e.g. Vercel), it might return the index.html page instead of JSON.
        // We catch that here and throw an error.
        const contentType = response.headers['content-type'] as string | undefined;
        if (contentType && typeof contentType === 'string' && contentType.includes('text/html')) {
            return Promise.reject(new Error("API returned HTML instead of JSON. Please check VITE_API_BASE_URL."));
        }
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_id');
            // Avoid infinite redirect if already on auth
            if (window.location.pathname !== '/auth') {
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);
