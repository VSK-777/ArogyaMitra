/**
 * Centralized error utility for extracting user-friendly messages from API errors.
 * NEVER exposes raw backend technical details (SQL, Hibernate, stack traces, etc.)
 */

// Map of known error codes to user-friendly messages
const ERROR_CODE_MESSAGES: Record<string, string> = {
    VALIDATION_ERROR: 'Please provide all required details.',
    BAD_REQUEST: 'Please check your input and try again.',
    CONFLICT: 'A conflict occurred. Please refresh and try again.',
    SLOT_UNAVAILABLE: 'This appointment slot is no longer available. Please select another slot.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    UNAUTHORIZED: 'Your session has expired. Please log in again.',
    INTERNAL_ERROR: 'Something went wrong. Please try again later.',
    PAYLOAD_TOO_LARGE: 'The file is too large. Maximum size is 50MB.',
    STORAGE_ERROR: 'Storage service is currently unavailable. Please check configuration or try again later.',
};

// Patterns that indicate a raw technical error that should NEVER be shown
const TECHNICAL_PATTERNS = [
    'exception', 'stacktrace', 'NullPointer', 'hibernate', 'javax.',
    'java.lang', 'org.springframework', 'org.postgresql', 'SQL',
    'DataIntegrity', 'ConstraintViolation', 'ByteBuddy', 'could not execute',
    'PSQLException', 'JPA', 'EntityManager', 'HikariPool',
];

function isTechnicalMessage(msg: string): boolean {
    const lower = msg.toLowerCase();
    return TECHNICAL_PATTERNS.some(p => lower.includes(p.toLowerCase()));
}

/**
 * Extracts a safe, user-friendly error message from any error object.
 * Use this instead of directly accessing error.message or error.response.data.message.
 */
export function getUserFriendlyMessage(error: unknown): string {
    if (!error) {
        return 'Something went wrong. Please try again later.';
    }

    // Axios error with response body
    const axiosError = error as any;
    if (axiosError?.response?.data) {
        const data = axiosError.response.data;

        // If backend returned our structured ApiResponse with errorCode
        if (data.errorCode && ERROR_CODE_MESSAGES[data.errorCode]) {
            // Use the errorCode message, but prefer backend message if it's safe
            if (data.message && !isTechnicalMessage(data.message)) {
                return data.message;
            }
            return ERROR_CODE_MESSAGES[data.errorCode];
        }

        // Backend message exists but check if it's safe
        if (data.message && typeof data.message === 'string') {
            if (!isTechnicalMessage(data.message)) {
                return data.message;
            }
        }

        // HTTP status-based fallback
        const status = axiosError.response.status;
        if (status === 400) return 'Please check your input and try again.';
        if (status === 401) return 'Your session has expired. Please log in again.';
        if (status === 403) return 'You do not have permission to perform this action.';
        if (status === 404) return 'The requested resource was not found.';
        if (status === 409) return 'A conflict occurred. Please refresh and try again.';
        if (status >= 500) return 'Something went wrong. Please try again later.';
    }

    // Network error (no response from server)
    if (axiosError?.code === 'ERR_NETWORK' || axiosError?.message === 'Network Error') {
        return 'Unable to connect to the server. Please check your internet connection and try again.';
    }

    // Request timeout
    if (axiosError?.code === 'ECONNABORTED') {
        return 'The request timed out. Please try again.';
    }

    return 'Something went wrong. Please try again later.';
}
