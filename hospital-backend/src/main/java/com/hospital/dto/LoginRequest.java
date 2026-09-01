package com.hospital.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import com.hospital.validation.ValidPhoneNumber;

@Data
public class LoginRequest {
    
    @NotBlank(message = "Mobile number is required")
    @ValidPhoneNumber(region = "IN", message = "Must be a valid mobile number")
    private String mobile;
    
    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Role is required")
    private String role;
}
