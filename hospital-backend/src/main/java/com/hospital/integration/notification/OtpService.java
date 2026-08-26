package com.hospital.integration.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class OtpService {

    private final WebClient webClient;
    private final String authKey;
    private final String templateId;
    private final boolean isEnabled;

    // Temporary local cache for OTPs when MSG91 is disabled (development mode)
    private final Map<String, String> localOtpCache = new ConcurrentHashMap<>();

    public OtpService(
            WebClient.Builder webClientBuilder,
            @Value("${msg91.authKey:default}") String authKey,
            @Value("${msg91.templateId:default}") String templateId,
            @Value("${msg91.enabled:false}") boolean isEnabled) {
        
        this.webClient = webClientBuilder.baseUrl("https://control.msg91.com/api/v5").build();
        this.authKey = authKey;
        this.templateId = templateId;
        this.isEnabled = isEnabled;
    }

    public void sendOtp(String mobile) {
        if (!isEnabled) {
            log.info("MSG91 is disabled. Generating mock OTP for mobile: {}", mobile);
            localOtpCache.put(mobile, "123456");
            return;
        }

        try {
            // MSG91 API call for OTP
            webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/otp")
                            .queryParam("authkey", authKey)
                            .queryParam("template_id", templateId)
                            .queryParam("mobile", "91" + mobile) // assuming India (+91)
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            log.info("OTP sent successfully via MSG91 to {}", mobile);
        } catch (Exception e) {
            log.error("Failed to send OTP via MSG91", e);
            throw new RuntimeException("Failed to send OTP", e);
        }
    }

    public boolean verifyOtp(String mobile, String otp) {
        if (!isEnabled) {
            String expected = localOtpCache.get(mobile);
            boolean isValid = otp.equals(expected) || otp.equals("123456"); // Allow 123456 as universal bypass in dev
            if (isValid) localOtpCache.remove(mobile);
            return isValid;
        }

        try {
            // MSG91 API call for verification
            String response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/otp/verify")
                            .queryParam("authkey", authKey)
                            .queryParam("mobile", "91" + mobile)
                            .queryParam("otp", otp)
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            
            // Basic check, proper implementation would parse JSON response
            return response != null && !response.contains("error");
        } catch (Exception e) {
            log.error("Failed to verify OTP via MSG91", e);
            return false;
        }
    }
}
