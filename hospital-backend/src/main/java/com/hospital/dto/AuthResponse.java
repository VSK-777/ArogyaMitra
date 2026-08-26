package com.hospital.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String userId;
    private String name;
    private String role;
    private String mobile;
    private String patientId;
    private String doctorId;
    private Long hospitalId;
    private String department;
}
