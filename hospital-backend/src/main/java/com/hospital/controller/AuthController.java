package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.AuthResponse;
import com.hospital.dto.PatientLoginRequest;
import com.hospital.dto.PatientRegistrationRequest;
import com.hospital.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;




    @PostMapping("/patient/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody PatientRegistrationRequest request) {
        try {
            authService.registerPatient(request.getMobile(), request.getPassword());
            return ResponseEntity.ok(ApiResponse.success("Registration successful. Please login.", null));
        } catch (DataIntegrityViolationException e) {
            logger.warn("Registration data integrity violation for mobile: {}", request.getMobile());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("An account with this mobile number already exists. Please log in instead.", "MOBILE_ALREADY_EXISTS"));
        } catch (RuntimeException e) {
            logger.warn("Registration runtime exception for mobile {}: {}", request.getMobile(), e.getMessage());
            if (e.getMessage() != null && e.getMessage().contains("already registered")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(ApiResponse.error("An account with this mobile number already exists. Please log in instead.", "MOBILE_ALREADY_EXISTS"));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Unable to complete the request. Please try again.", "REGISTRATION_FAILED"));
        } catch (Exception e) {
            logger.error("Unexpected error during registration for mobile: {}", request.getMobile(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An unexpected error occurred.", "SERVER_ERROR"));
        }
    }

    @PostMapping("/patient/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody PatientLoginRequest request) {
        try {
            AuthResponse response = authService.loginPatient(request.getMobile(), request.getPassword());
            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        } catch (Exception e) {
            logger.warn("Login failed for mobile: {}", request.getMobile());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid mobile number or password.", "AUTH_FAILED"));
        }
    }
}
