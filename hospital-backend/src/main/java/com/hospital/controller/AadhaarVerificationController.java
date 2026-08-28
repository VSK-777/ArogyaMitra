package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.entity.Patient;
import com.hospital.repository.PatientRepository;
import com.hospital.service.AadhaarVerificationService;
import com.hospital.service.AadhaarAppToAppService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class AadhaarVerificationController {

    private final AadhaarVerificationService aadhaarVerificationService;
    private final AadhaarAppToAppService aadhaarAppToAppService;
    private final PatientRepository patientRepository;

    @PostMapping("/me/aadhaar/offline-ekyc")
    public ResponseEntity<?> verifyOfflineEkyc(
            @RequestParam("file") MultipartFile zipFile,
            @RequestParam("shareCode") String shareCode) {
        try {
            String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
            
            Patient patient = patientRepository.findByMobile(mobile)
                    .orElseThrow(() -> new IllegalArgumentException("Patient not found."));
            
            aadhaarVerificationService.verifyOfflineEkyc(zipFile, shareCode, patient);
            
            return ResponseEntity.ok(ApiResponse.success("Aadhaar Offline e-KYC processed successfully.", patient.getVerificationStatus()));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "VERIFICATION_FAILED"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("An unexpected error occurred during verification.", "INTERNAL_ERROR"));
        }
    }

    @PostMapping("/me/aadhaar/app-to-app/initiate")
    public ResponseEntity<ApiResponse<Map<String, String>>> initiateAppToAppVerification() {
        try {
            String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
            Map<String, String> response = aadhaarAppToAppService.initiateVerification(mobile);
            return ResponseEntity.ok(ApiResponse.success("Verification transaction created", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "INITIATE_FAILED"));
        }
    }

    @GetMapping("/me/aadhaar/app-to-app/status/{transactionId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> getVerificationStatus(@PathVariable String transactionId) {
        try {
            String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
            Map<String, String> status = aadhaarAppToAppService.getTransactionStatus(transactionId, mobile);
            return ResponseEntity.ok(ApiResponse.success("Status retrieved", status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "STATUS_FAILED"));
        }
    }

    // Mock callback endpoint for local development testing
    @PostMapping("/me/aadhaar/app-to-app/callback")
    public ResponseEntity<ApiResponse<String>> processMockCallback(
            @RequestParam String transactionId,
            @RequestParam String nonce,
            @RequestParam boolean success) {
        try {
            aadhaarAppToAppService.processCallback(transactionId, nonce, success, "{\"mock\":\"data\"}");
            return ResponseEntity.ok(ApiResponse.success("Callback processed", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "CALLBACK_FAILED"));
        }
    }
}
