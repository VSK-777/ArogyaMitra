package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.AppointmentResponse;
import com.hospital.dto.BookAppointmentRequest;
import com.hospital.entity.Appointment;
import com.hospital.entity.AppointmentStatus;
import com.hospital.repository.AppointmentRepository;
import com.hospital.service.AppointmentService;
import com.hospital.service.AuditService;
import com.hospital.entity.Role;
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
    private final AppointmentRepository appointmentRepository;
    private final AuditService auditService;

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> bookAppointment(@Valid @RequestBody BookAppointmentRequest request) {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        AppointmentResponse response = appointmentService.bookAppointment(mobile, request);
        auditService.log("APPOINTMENT_CREATED", "Appointment", response.getAppointmentId(), mobile, Role.ROLE_PATIENT, "Booked online");
        return ResponseEntity.ok(ApiResponse.success("Appointment booked successfully", response));
    }

    @PostMapping("/{appointmentId}/cancel")
    public ResponseEntity<ApiResponse<String>> cancelAppointment(@PathVariable String appointmentId) {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        Appointment apt = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        
        if (!apt.getPatient().getMobile().equals(mobile)) {
            return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized", "FORBIDDEN"));
        }
        
        apt.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(apt);
        auditService.log("APPOINTMENT_CANCELLED", "Appointment", appointmentId, mobile, Role.ROLE_PATIENT, "Cancelled by patient");
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled", appointmentId));
    }

    @GetMapping("/{appointmentId}")
    public ResponseEntity<ApiResponse<Appointment>> getAppointment(@PathVariable String appointmentId) {
        Appointment apt = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        return ResponseEntity.ok(ApiResponse.success("Appointment found", apt));
    }
}
