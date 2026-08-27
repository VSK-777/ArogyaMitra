package com.hospital.controller;

import com.hospital.dto.*;
import com.hospital.entity.*;
import com.hospital.repository.*;
import com.hospital.service.AuditService;
import com.hospital.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final PreConsultationRepository preConsultationRepository;
    private final AuditService auditService;

    @GetMapping("/queue/today")
    public ResponseEntity<ApiResponse<List<QueueToken>>> getTodayQueue() {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByMobile(mobile).orElseThrow();
        List<QueueToken> queue = doctorService.getTodayQueue(user.getId().toString());
        return ResponseEntity.ok(ApiResponse.success("Queue fetched", queue));
    }

    @GetMapping("/consultations")
    public ResponseEntity<ApiResponse<List<Consultation>>> getPastConsultations() {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByMobile(mobile).orElseThrow();
        List<Consultation> consultations = doctorService.getPastConsultations(user.getId().toString());
        return ResponseEntity.ok(ApiResponse.success("Consultations fetched", consultations));
    }

    @GetMapping("/appointments/{appointmentId}/preconsultation")
    public ResponseEntity<ApiResponse<PreConsultation>> getPreConsultationSummary(@PathVariable String appointmentId) {
        Appointment apt = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        Optional<PreConsultation> pc = preConsultationRepository.findByAppointment_Id(apt.getId());
        if (pc.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("Pre-consultation found", pc.get()));
        }
        return ResponseEntity.status(404).body(ApiResponse.error("No pre-consultation found", "NOT_FOUND"));
    }

    @PostMapping("/consultations/complete")
    public ResponseEntity<ApiResponse<Consultation>> completeConsultation(@RequestBody CompleteConsultationRequest request) {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByMobile(mobile).orElseThrow();
        
        Consultation consultation = doctorService.completeConsultation(request, user.getId().toString());
        
        auditService.log("CONSULTATION_COMPLETED", "Consultation", consultation.getConsultationId(), mobile, Role.ROLE_DOCTOR, "For appointment " + request.getAppointmentId());
        
        return ResponseEntity.ok(ApiResponse.success("Consultation completed successfully", consultation));
    }
}
