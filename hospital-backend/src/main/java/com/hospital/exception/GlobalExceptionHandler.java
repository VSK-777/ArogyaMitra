package com.hospital.exception;

import com.hospital.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ── Validation errors (e.g. @NotNull, @NotBlank) ──────────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        // Build field-specific messages for internal logging
        String fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining("; "));
        logger.warn("Validation failed: {}", fieldErrors);

        // Build user-friendly message from custom messages on annotations
        String userMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .distinct()
                .collect(Collectors.joining(" "));

        // If the messages are still raw defaults, use a generic one
        if (userMessage.contains("must not be null") || userMessage.contains("must not be blank") || userMessage.contains("must not be empty")) {
            userMessage = "Please provide all required details.";
        }

        return ResponseEntity.badRequest()
                .body(ApiResponse.error(userMessage, "VALIDATION_ERROR"));
    }

    // ── Malformed JSON / unreadable request body ──────────────────
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Object>> handleUnreadable(HttpMessageNotReadableException ex) {
        logger.warn("Unreadable request: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponse.error("The request could not be understood. Please check your input and try again.", "BAD_REQUEST"));
    }

    // ── Business validation (IllegalArgument) ──────────────────
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgument(IllegalArgumentException ex) {
        logger.warn("Business validation failed: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(ex.getMessage(), "BAD_REQUEST"));
    }

    // ── State violations (e.g. slot already taken) ──────────────────
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalState(IllegalStateException ex) {
        logger.warn("State violation: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(ex.getMessage(), "CONFLICT"));
    }

    // ── Database constraint violations ──────────────────
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        logger.error("Database constraint violation: {}", ex.getMostSpecificCause().getMessage());

        String rootMsg = ex.getMostSpecificCause().getMessage().toLowerCase();
        String userMessage;

        if (rootMsg.contains("mobile")) {
            userMessage = "An account with this mobile number already exists.";
        } else if (rootMsg.contains("appointment") || rootMsg.contains("slot") || rootMsg.contains("token_number")) {
            userMessage = "This appointment slot is no longer available. Please select another slot.";
        } else if (rootMsg.contains("email")) {
            userMessage = "An account with this email already exists.";
        } else {
            userMessage = "Unable to complete your request due to a data conflict. Please try again.";
        }

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(userMessage, "CONFLICT"));
    }

    // ── Access denied (wrong role) ──────────────────
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDenied(AccessDeniedException ex) {
        logger.warn("Access denied: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("You do not have permission to perform this action.", "FORBIDDEN"));
    }

    // ── Authentication failure ──────────────────
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthentication(AuthenticationException ex) {
        logger.warn("Authentication failed: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Your session has expired. Please log in again.", "UNAUTHORIZED"));
    }

    // ── File Upload Size ──────────────────
    @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Object>> handleMaxSizeException(org.springframework.web.multipart.MaxUploadSizeExceededException exc) {
        logger.warn("File upload too large");
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ApiResponse.error("The file is too large. Maximum size is 50MB.", "PAYLOAD_TOO_LARGE"));
    }

    // ── Storage Errors ──────────────────
    @ExceptionHandler(com.hospital.integration.storage.StorageException.class)
    public ResponseEntity<ApiResponse<Object>> handleStorageException(com.hospital.integration.storage.StorageException ex) {
        logger.error("Storage error: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiResponse.error("Storage service is currently unavailable. Please check configuration or try again later.", "STORAGE_ERROR"));
    }

    // ── AI Service Errors ──────────────────
    @ExceptionHandler(AiIntegrationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAiException(AiIntegrationException ex) {
        logger.error("AI Integration error: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiResponse.error(ex.getMessage(), "AI_ERROR"));
    }

    // ── Catch-all for any unexpected exception ──────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGeneric(Exception ex) {
        logger.error("Unexpected error occurred", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Something went wrong. Please try again later.", "INTERNAL_ERROR"));
    }
}
