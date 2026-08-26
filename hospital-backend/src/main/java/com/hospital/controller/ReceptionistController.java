package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.AppointmentResponse;
import com.hospital.dto.BookAppointmentRequest;
import com.hospital.entity.*;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import com.hospital.service.AppointmentService;
import com.hospital.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/receptionist")
@RequiredArgsConstructor
public class ReceptionistController {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AppointmentService appointmentService;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/patients/search")
    public ResponseEntity<ApiResponse<Patient>> searchPatient(
            @RequestParam(required = false) String mobile,
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) String name) {
        
        Optional<Patient> patient = Optional.empty();
        
        if (mobile != null && !mobile.isEmpty()) {
            patient = patientRepository.findByMobile(mobile);
        } else if (patientId != null && !patientId.isEmpty()) {
            patient = patientRepository.findByPatientId(patientId);
        } else if (name != null && !name.isEmpty()) {
            patient = patientRepository.findByFullNameContainingIgnoreCase(name).stream().findFirst();
        }
        
        if (patient.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("Patient found", patient.get()));
        }
        return ResponseEntity.status(404).body(ApiResponse.error("Patient not found", "NOT_FOUND"));
    }

    @PostMapping("/patients/register")
    public ResponseEntity<ApiResponse<Patient>> registerWalkInPatient(@RequestBody WalkInRegistrationRequest request) {
        // Check if patient already exists
        String mobile = request.getMobile();
        if (mobile != null) {
            mobile = mobile.replaceAll("[^0-9]", "");
            if (mobile.length() == 12 && mobile.startsWith("91")) {
                mobile = mobile.substring(2);
            }
        }
        Optional<Patient> existing = patientRepository.findByMobile(mobile);
        if (existing.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("Patient already exists", existing.get()));
        }

        String usrId = "USR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        User user = User.builder()
                .userId(usrId)
                .mobile(mobile)
                .name(request.getFullName())
                .role(Role.ROLE_PATIENT)
                .passwordHash(passwordEncoder.encode("walkin123")) // default password for walk-in
                .build();
        user = userRepository.save(user);

        String patId = "PAT-" + String.format("%06d", patientRepository.count() + 1);
        Patient patient = Patient.builder()
                .patientId(patId)
                .user(user)
                .fullName(request.getFullName())
                .mobile(mobile)
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .build();
        patient = patientRepository.save(patient);

        String recMobile = SecurityContextHolder.getContext().getAuthentication().getName();
        auditService.log("WALKIN_PATIENT_REGISTERED", "Patient", patId, recMobile, Role.ROLE_RECEPTIONIST, "Walk-in: " + request.getFullName());

        return ResponseEntity.ok(ApiResponse.success("Patient registered", patient));
    }

    @PostMapping("/appointments/walkin")
    public ResponseEntity<ApiResponse<AppointmentResponse>> bookWalkInAppointment(@RequestBody BookAppointmentRequest request) {
        // For walk-in, we use the patient's mobile found in the request context
        // The receptionist specifies which patient via a patientMobile field
        String recMobile = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // We need the patient mobile — for walk-in, the receptionist provides it
        // For simplicity, we reuse the same booking service with the patient's mobile
        AppointmentResponse response = appointmentService.bookAppointment(request.getPatientMobile(), request);

        auditService.log("WALKIN_APPOINTMENT_BOOKED", "Appointment", response.getAppointmentId(), recMobile, Role.ROLE_RECEPTIONIST, "Walk-in booking");

        return ResponseEntity.ok(ApiResponse.success("Walk-in appointment booked", response));
    }

    // Inner DTO for walk-in registration
    @lombok.Data
    public static class WalkInRegistrationRequest {
        private String fullName;
        private String mobile;
        private java.time.LocalDate dateOfBirth;
        private String gender;
    }
}
