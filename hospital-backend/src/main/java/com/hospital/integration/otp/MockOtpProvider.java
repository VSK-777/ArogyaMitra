package com.hospital.integration.otp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "app.demo-mode", havingValue = "true", matchIfMissing = true)
public class MockOtpProvider implements OtpProvider {

    private static final Logger log = LoggerFactory.getLogger(MockOtpProvider.class);

    @Override
    public void sendOtpMessage(String mobile, String otp) {
        // Just log it. The database handles creation, storage, limits and expiry.
        log.info("[DEMO WHATSAPP OTP] Mobile: +{} | WhatsApp OTP: {}", mobile, otp);
    }
}
