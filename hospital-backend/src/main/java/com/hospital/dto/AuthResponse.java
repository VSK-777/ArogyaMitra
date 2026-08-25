package com.hospital.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String userId;
    private String role;
    private String patientId; // null if not patient
}
