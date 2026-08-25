package com.hospital.integration.otp;

import com.hospital.exception.OtpProviderException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@ConditionalOnProperty(name = "app.demo-mode", havingValue = "false")
public class Msg91OtpProvider implements OtpProvider {

    private static final Logger log = LoggerFactory.getLogger(Msg91OtpProvider.class);

    @Value("${msg91.authkey:}")
    private String authKey;

    @Value("${msg91.template-id:}")
    private String templateId;
    
    @Value("${app.otp.expiry-minutes:10}")
    private int expiryMinutes;

    private final RestTemplate restTemplate = new RestTemplate();

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
        String url = "https://control.msg91.com/api/v5/otp?template_id=" + templateId + "&mobile=" + normalized + "&expiry=" + expiryMinutes;

        HttpHeaders headers = new HttpHeaders();
        headers.set("authkey", authKey);
        headers.set("Content-Type", "application/json");

        HttpEntity<String> entity = new HttpEntity<>("{}", headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            Map<String, Object> body = response.getBody();
            
            if (body != null && "error".equalsIgnoreCase(String.valueOf(body.get("type")))) {
                String errorMsg = String.valueOf(body.get("message"));
                String errorCode = String.valueOf(body.get("code"));
                log.error("MSG91 OTP request failed. Mobile: +{} | HTTP Status: {} | Provider Error: {} | Provider Code: {}", 
                          normalized, response.getStatusCode(), errorMsg, errorCode);
                throw new OtpProviderException("Unable to send OTP. Please try again.");
            }
            
            log.info("MSG91 OTP request submitted successfully for mobile: +{}", normalized);
        } catch (HttpClientErrorException e) {
            log.error("MSG91 OTP request failed with HTTP {}. Mobile: +{} | Response: {}", e.getStatusCode(), normalized, e.getResponseBodyAsString());
            throw new OtpProviderException("Unable to send OTP. Please try again.");
        } catch (Exception e) {
            log.error("Failed to connect to MSG91 for mobile: +{} | Error: {}", normalized, e.getMessage());
            throw new OtpProviderException("Unable to send OTP. Please try again.");
        }
    }

    @Override
    public boolean verifyOtp(String mobile, String otp) {
        String normalized = normalizeMobile(mobile);
        String url = "https://control.msg91.com/api/v5/otp/verify?otp=" + otp + "&mobile=" + normalized;

        HttpHeaders headers = new HttpHeaders();
        headers.set("authkey", authKey);

        HttpEntity<String> entity = new HttpEntity<>("", headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            Map<String, Object> body = response.getBody();
            
            if (body != null && "error".equalsIgnoreCase(String.valueOf(body.get("type")))) {
                log.warn("MSG91 OTP verify failed. Mobile: +{} | Error: {}", normalized, body.get("message"));
                return false;
            }
            
            if (body != null && "success".equalsIgnoreCase(String.valueOf(body.get("type")))) {
                return true;
            }
            return false;
        } catch (HttpClientErrorException e) {
            log.warn("MSG91 OTP verify failed with HTTP {}. Mobile: +{}", e.getStatusCode(), normalized);
            return false;
        } catch (Exception e) {
            log.error("Failed to verify OTP via MSG91. Mobile: +{} | Error: {}", normalized, e.getMessage());
            return false;
        }
    }
}
