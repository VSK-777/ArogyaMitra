package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.AppointmentResponse;
import com.hospital.dto.BookAppointmentRequest;
import com.hospital.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> bookAppointment(@Valid @RequestBody BookAppointmentRequest request) {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        AppointmentResponse response = appointmentService.bookAppointment(mobile, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment booked successfully", response));
    }
}
