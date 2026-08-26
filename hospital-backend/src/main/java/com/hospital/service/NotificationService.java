package com.hospital.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class NotificationService {
    
    public void sendSms(String mobile, String message) {
        // Integration abstraction for MSG91 / Twilio
        log.info("Sending SMS to {}: {}", mobile, message);
    }
    
    public void sendEmail(String email, String subject, String body) {
        log.info("Sending Email to {}: {}", email, subject);
    }
}
