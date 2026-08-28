package com.hospital.dto;

import com.hospital.entity.AppointmentType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookAppointmentRequest {
    @NotNull(message = "Please select a hospital.")
    private Long hospitalId;
    @NotNull(message = "Please select a department.")
    private Long departmentId;
    @NotNull(message = "Please select a doctor.")
    private Long doctorId;
    @NotNull(message = "Please select an appointment date.")
    private LocalDate appointmentDate;
    @NotNull(message = "Please select a time slot.")
    private LocalTime slotStart;

    private LocalTime slotEnd;
    private AppointmentType appointmentType;
    private String reason;

    // For walk-in appointments booked by receptionist
    private String patientMobile;

    private String razorpayPaymentId;
    private String razorpayOrderId;
    private String razorpaySignature;
}

