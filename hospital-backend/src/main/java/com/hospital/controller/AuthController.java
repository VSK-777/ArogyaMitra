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
            return ResponseEntity.ok(ApiResponse.success("Patient registration successful", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage(), "REGISTRATION_FAILED"));
        }
    }

    @PostMapping("/patient/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody PatientLoginRequest request) {
        try {
            AuthResponse response = authService.loginPatient(request.getMobile(), request.getPassword());
            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid mobile number or password.", "AUTH_FAILED"));
        }
    }
}
