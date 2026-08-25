package com.hospital.integration.otp;

import com.hospital.exception.InvalidOtpException;
import com.hospital.exception.OtpProviderException;
import com.hospital.exception.OtpRateLimitException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@ConditionalOnProperty(name = "app.demo-mode", havingValue = "true", matchIfMissing = true)
public class MockOtpProvider implements OtpProvider {

    private static final Logger log = LoggerFactory.getLogger(MockOtpProvider.class);

    @Value("${app.demo-otp:123456}")
    private String demoOtp;

    @Value("${app.otp.expiry-minutes:10}")
    private int expiryMinutes;

    @Value("${app.otp.max-attempts:5}")
    private int maxAttempts;

    @Value("${app.otp.resend-cooldown-seconds:60}")
    private int resendCooldownSeconds;

    private static class OtpRecord {
        String otp;
        LocalDateTime createdAt;
        LocalDateTime expiresAt;
        int attempts;
    }

    private final Map<String, OtpRecord> otpStore = new ConcurrentHashMap<>();

    private String normalizeMobile(String mobile) {
        if (mobile == null) return "";
        mobile = mobile.replaceAll("[^0-9]", "");
        if (mobile.length() == 10) {
            mobile = "91" + mobile;
        }
        return mobile;
    }

    @Override
    public void sendOtp(String mobile) {
        String normalized = normalizeMobile(mobile);
        
        OtpRecord existing = otpStore.get(normalized);
        if (existing != null) {
            long secondsSince = java.time.Duration.between(existing.createdAt, LocalDateTime.now()).getSeconds();
            if (secondsSince < resendCooldownSeconds) {
                throw new OtpRateLimitException("Please wait " + (resendCooldownSeconds - secondsSince) + " seconds before requesting a new OTP.");
            }
        }

        OtpRecord record = new OtpRecord();
        record.otp = demoOtp;
        record.createdAt = LocalDateTime.now();
        record.expiresAt = LocalDateTime.now().plusMinutes(expiryMinutes);
        record.attempts = 0;
        
        otpStore.put(normalized, record);
        
        log.info("[DEMO OTP] Mobile: +{} | OTP: {}", normalized, demoOtp);
    }

    @Override
    public boolean verifyOtp(String mobile, String otp) {
        String normalized = normalizeMobile(mobile);
        OtpRecord record = otpStore.get(normalized);
        
        if (record == null) {
            throw new InvalidOtpException("No active OTP found for this mobile number.");
        }
        
        if (LocalDateTime.now().isAfter(record.expiresAt)) {
            otpStore.remove(normalized);
            throw new InvalidOtpException("OTP has expired. Please request a new one.");
        }
        
        record.attempts++;
        if (record.attempts > maxAttempts) {
            otpStore.remove(normalized);
            throw new OtpRateLimitException("Maximum OTP verification attempts exceeded. Please request a new OTP.");
        }
        
        if (!record.otp.equals(otp)) {
            throw new InvalidOtpException("Invalid OTP.");
        }
        
        // Success
        otpStore.remove(normalized);
        return true;
    }
}
