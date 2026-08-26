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

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/patient/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody PatientRegistrationRequest request) {
        try {
            authService.registerPatient(request.getMobile(), request.getPassword());
            return ResponseEntity.ok(ApiResponse.success("Registration successful. Please login.", null));
        } catch (RuntimeException e) {
            e.printStackTrace();
            if (e.getMessage() != null && e.getMessage().contains("already registered")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(ApiResponse.error("Mobile number is already registered.", "DUPLICATE_MOBILE"));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage(), "REGISTRATION_FAILED"));
        } catch (Exception e) {
            e.printStackTrace();
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
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid mobile number or password.", "AUTH_FAILED"));
        }
    }
}
