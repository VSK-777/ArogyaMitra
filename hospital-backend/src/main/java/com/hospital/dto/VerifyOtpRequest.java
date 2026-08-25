package com.hospital.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyOtpRequest {
    @NotBlank
    private String mobile;
    
    @NotBlank
    private String otp;
}
