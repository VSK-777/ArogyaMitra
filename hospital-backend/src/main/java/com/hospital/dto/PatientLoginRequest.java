package com.hospital.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PatientLoginRequest {
    
    @NotBlank(message = "Mobile number is required")
    private String mobile;
    
    @NotBlank(message = "Password is required")
    private String password;
}
