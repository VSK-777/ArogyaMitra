package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.AuthResponse;
import com.hospital.dto.SendOtpRequest;
import com.hospital.dto.VerifyOtpRequest;
import com.hospital.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/patient/send-otp")
    public ResponseEntity<ApiResponse<String>> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        authService.sendPatientOtp(request.getMobile());
        return ResponseEntity.ok(ApiResponse.success("OTP request submitted successfully", null));
    }

    @PostMapping("/patient/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse response = authService.verifyPatientOtp(request.getMobile(), request.getOtp());
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", response));
    }
}
