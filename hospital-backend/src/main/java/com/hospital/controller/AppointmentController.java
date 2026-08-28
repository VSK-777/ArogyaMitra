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

    

    @GetMapping("/slots")
    public ResponseEntity<ApiResponse<java.util.List<String>>> getBookedSlots(
            @RequestParam Long doctorId,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate date) {
        
        java.util.List<Appointment> booked = appointmentRepository.findByDoctor_IdAndAppointmentDate(doctorId, date);
        java.util.List<String> bookedSlots = booked.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.BOOKED)
                .map(a -> {
                    String time = a.getSlotStart().toString();
                    if(time.length() == 5) time += ":00"; // Normalize HH:mm to HH:mm:ss if needed, but the frontend sends HH:mm usually. Actually frontend sends HH:mm, backend saves it as time.
                    // Return HH:mm
                    return String.format("%02d:%02d", a.getSlotStart().getHour(), a.getSlotStart().getMinute());
                })
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Booked slots", bookedSlots));
    }

    @GetMapping("/{appointmentId}")
    public ResponseEntity<ApiResponse<Appointment>> getAppointment(@PathVariable String appointmentId) {
        Appointment apt = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        return ResponseEntity.ok(ApiResponse.success("Appointment found", apt));
    }
}

