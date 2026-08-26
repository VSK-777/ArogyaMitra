package com.hospital.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class NotificationService {
    
    // Provider abstraction — swap for MSG91 or Twilio when configured
    public void sendAppointmentConfirmation(String mobile, String appointmentId, String doctorName, String dateTime) {
        String msg = String.format("Appointment %s confirmed with %s on %s", appointmentId, doctorName, dateTime);
        sendSms(mobile, msg);
    }

    public void sendTokenNotification(String mobile, int tokenNumber, String doctorName) {
        String msg = String.format("Your token number is %d for %s. Please wait for your turn.", tokenNumber, doctorName);
        sendSms(mobile, msg);
    }

    public void sendPrescriptionReady(String mobile, String appointmentId) {
        String msg = String.format("Your prescription for appointment %s is ready. Please check your portal.", appointmentId);
        sendSms(mobile, msg);
    }

    public void sendSms(String mobile, String message) {
        // DEMO MODE: Log instead of sending real SMS
        // Replace with MSG91 API call when configured
        log.info("[SMS DEMO] To: {} | Message: {}", mobile, message);
    }
    
    public void sendEmail(String email, String subject, String body) {
        // DEMO MODE: Log instead of sending real email
        log.info("[EMAIL DEMO] To: {} | Subject: {} | Body: {}", email, subject, body);
    }
}
