package com.hospital.integration.otp;

public interface OtpProvider {
    void sendOtp(String mobile);
    boolean verifyOtp(String mobile, String otp);
}
