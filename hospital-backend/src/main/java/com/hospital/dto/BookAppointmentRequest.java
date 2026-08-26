package com.hospital.dto;

import com.hospital.entity.AppointmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookAppointmentRequest {
    @NotBlank
    private String hospitalId;
    @NotBlank
    private String departmentId;
    @NotBlank
    private String doctorId;
    @NotNull
    private LocalDate appointmentDate;
    @NotNull
    private LocalTime slotStart;
    @NotNull
    private LocalTime slotEnd;
    @NotNull
    private AppointmentType appointmentType;
    private String reason;
    
    // For walk-in appointments booked by receptionist
    private String patientMobile;
}
