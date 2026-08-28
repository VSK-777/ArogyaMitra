package com.hospital.service;

import com.hospital.entity.AadhaarVerificationTransaction;
import com.hospital.entity.Patient;
import com.hospital.entity.VerificationStatus;
import com.hospital.repository.AadhaarVerificationTransactionRepository;
import com.hospital.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class AadhaarAppToAppService {

    private final AadhaarVerificationTransactionRepository transactionRepository;
    private final PatientRepository patientRepository;

    @Value("${aadhaar.ovse.enabled:false}")
    private boolean ovseEnabled;

    @Value("${aadhaar.ovse.callback-url:https://api.example.com/api/aadhaar/callback}")
    private String callbackUrl;

    @Value("${aadhaar.ovse.app-id-android:in.gov.uidai.mAadhaarPlus}")
    private String androidAppId;

    @Value("${aadhaar.ovse.domain:example.com}")
    private String ovseDomain;

    @Transactional
    public Map<String, String> initiateVerification(String patientMobile) {
        Patient patient = patientRepository.findByMobile(patientMobile)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        String transactionId = UUID.randomUUID().toString();
        String nonce = UUID.randomUUID().toString();

        AadhaarVerificationTransaction tx = AadhaarVerificationTransaction.builder()
                .transactionId(transactionId)
                .patient(patient)
                .status("PENDING")
                .provider(ovseEnabled ? "APP_TO_APP" : "MOCK_APP_TO_APP")
                .nonce(nonce)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .build();

        transactionRepository.save(tx);

        // Build Intent URL based on UIDAI OVSE spec placeholders
        String intentUrl = ovseEnabled ? 
            String.format("intent://verify?txnid=%s&nonce=%s&callback=%s&domain=%s#Intent;scheme=aadhaar;package=%s;end", 
                transactionId, nonce, callbackUrl, ovseDomain, androidAppId) 
            : "mock-aadhaar://verify?txnid=" + transactionId;

        Map<String, String> response = new HashMap<>();
        response.put("transactionId", transactionId);
        response.put("intentUrl", intentUrl);
        response.put("provider", tx.getProvider());
        
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, String> getTransactionStatus(String transactionId, String patientMobile) {
        AadhaarVerificationTransaction tx = transactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        if (!tx.getPatient().getMobile().equals(patientMobile)) {
            throw new SecurityException("Unauthorized");
        }

        Map<String, String> res = new HashMap<>();
        res.put("status", tx.getStatus());
        if ("FAILED".equals(tx.getStatus())) {
            res.put("error", tx.getCallbackStatus());
        }
        return res;
    }

    @Transactional
    public void processCallback(String transactionId, String nonce, boolean success, String aadhaarData) {
        AadhaarVerificationTransaction tx = transactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        if (tx.getExpiresAt().isBefore(LocalDateTime.now())) {
            tx.setStatus("EXPIRED");
            tx.setCallbackStatus("Transaction expired");
            transactionRepository.save(tx);
            throw new IllegalArgumentException("Transaction expired");
        }

        if (!tx.getNonce().equals(nonce)) {
            tx.setStatus("FAILED");
            tx.setCallbackStatus("Nonce mismatch - possible replay attack");
            transactionRepository.save(tx);
            throw new SecurityException("Invalid nonce");
        }

        if (!"PENDING".equals(tx.getStatus())) {
            throw new IllegalStateException("Transaction is not pending");
        }

        if (success) {
            tx.setStatus("VERIFIED");
            tx.setCallbackStatus("Verified via Aadhaar App");
            
            Patient patient = tx.getPatient();
            patient.setVerificationStatus(VerificationStatus.VERIFIED);
            patient.setVerificationMethod(tx.getProvider());
            patient.setVerificationReference(transactionId);
            patient.setVerifiedAt(LocalDateTime.now());
            patientRepository.save(patient);
        } else {
            tx.setStatus("FAILED");
            tx.setCallbackStatus("Aadhaar authentication failed or user denied consent");
        }
        transactionRepository.save(tx);
    }
}
