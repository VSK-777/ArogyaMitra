package com.hospital.integration.otp;

public interface OtpProvider {
    void sendOtpMessage(String mobile, String otp);
}
