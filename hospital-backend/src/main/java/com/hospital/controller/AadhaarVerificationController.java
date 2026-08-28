package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.entity.Patient;
import com.hospital.repository.PatientRepository;
import com.hospital.service.AadhaarVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class AadhaarVerificationController {

    private final AadhaarVerificationService aadhaarVerificationService;
    private final PatientRepository patientRepository;

    @PostMapping("/me/aadhaar/offline-ekyc")
    public ResponseEntity<?> verifyOfflineEkyc(
            @RequestParam("file") MultipartFile zipFile,
            @RequestParam("shareCode") String shareCode) {
        try {
            // Get currently authenticated patient mobile
            String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
            
            Patient patient = patientRepository.findByMobile(mobile)
                    .orElseThrow(() -> new IllegalArgumentException("Patient not found."));
            
            aadhaarVerificationService.verifyOfflineEkyc(zipFile, shareCode, patient);
            
            return ResponseEntity.ok(ApiResponse.success("Aadhaar Offline e-KYC processed successfully. Status: " + patient.getVerificationStatus(), patient.getVerificationStatus()));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "VERIFICATION_FAILED"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("An unexpected error occurred during verification.", "INTERNAL_ERROR"));
        }
    }
}
