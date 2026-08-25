package com.hospital.dto;

import com.hospital.entity.AppointmentStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class AppointmentResponse {
    private String appointmentId;
    private String patientId;
    private String doctorName;
    private String departmentName;
    private String hospitalName;
    private LocalDate appointmentDate;
    private LocalTime slotStart;
    private AppointmentStatus status;
    private String tokenId;
}
