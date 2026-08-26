package com.hospital.service;

import com.hospital.entity.OtpVerification;
import com.hospital.exception.InvalidOtpException;
import com.hospital.exception.OtpRateLimitException;
import com.hospital.integration.otp.OtpProvider;
import com.hospital.repository.OtpVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpVerificationRepository repository;
    private final OtpProvider otpProvider;

    @Value("${app.otp.expiry-minutes:5}")
    private int expiryMinutes;

    @Value("${app.otp.max-attempts:5}")
    private int maxAttempts;

    @Value("${app.otp.resend-cooldown-seconds:60}")
    private int resendCooldownSeconds;

    private final SecureRandom secureRandom = new SecureRandom();

    private String normalizeMobile(String mobile) {
        if (mobile == null) return "";
        mobile = mobile.replaceAll("[^0-9]", "");
        if (mobile.length() == 10) {
            mobile = "91" + mobile;
        }
        return mobile;
    }

    private String generateSecureOtp() {
        int number = secureRandom.nextInt(999999);
        return String.format("%06d", number);
    }

    private String hashOtp(String otp) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(otp.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing OTP", e);
        }
    }

    @Transactional
    public void generateAndSendOtp(String rawMobile) {
        String mobile = normalizeMobile(rawMobile);

        Optional<OtpVerification> existing = repository.findTopByMobileOrderByCreatedAtDesc(mobile);
        
        if (existing.isPresent()) {
            OtpVerification record = existing.get();
            if (!record.isVerified() && record.getExpiresAt().isAfter(LocalDateTime.now())) {
                long secondsSince = java.time.Duration.between(record.getCreatedAt(), LocalDateTime.now()).getSeconds();
                if (secondsSince < resendCooldownSeconds) {
                    throw new OtpRateLimitException("Please wait " + (resendCooldownSeconds - secondsSince) + " seconds before requesting a new OTP.");
                }
                // Invalidate old OTP implicitly by creating a new one (we always take top by created at)
            }
        }

        String rawOtp = generateSecureOtp();
        String hashedOtp = hashOtp(rawOtp);

        OtpVerification verification = OtpVerification.builder()
                .mobile(mobile)
                .otpHash(hashedOtp)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(expiryMinutes))
                .attemptCount(0)
                .verified(false)
                .build();

        repository.save(verification);

        // Send via provider (WhatsApp or Mock)
        otpProvider.sendOtpMessage(mobile, rawOtp);
    }

    @Transactional
    public boolean verifyOtp(String rawMobile, String rawOtp) {
        String mobile = normalizeMobile(rawMobile);
        
        OtpVerification record = repository.findTopByMobileOrderByCreatedAtDesc(mobile)
                .orElseThrow(() -> new InvalidOtpException("No active OTP found for this mobile number."));
                
        if (record.isVerified()) {
            throw new InvalidOtpException("OTP has already been verified.");
        }

        if (LocalDateTime.now().isAfter(record.getExpiresAt())) {
            throw new InvalidOtpException("OTP has expired. Please request a new one.");
        }

        record.setAttemptCount(record.getAttemptCount() + 1);
        repository.save(record);

        if (record.getAttemptCount() > maxAttempts) {
            throw new OtpRateLimitException("Too many incorrect attempts. Please request a new OTP.");
        }

        String hashedInput = hashOtp(rawOtp);
        if (!record.getOtpHash().equals(hashedInput)) {
            throw new InvalidOtpException("Invalid OTP.");
        }

        // Success
        record.setVerified(true);
        record.setUsedAt(LocalDateTime.now());
        repository.save(record);
        
        return true;
    }
}
