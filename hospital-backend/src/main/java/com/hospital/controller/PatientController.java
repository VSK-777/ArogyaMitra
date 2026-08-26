package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.entity.Appointment;
import com.hospital.entity.Patient;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Patient>> getMe() {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        Patient patient = patientRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return ResponseEntity.ok(ApiResponse.success("Success", patient));
    }

    @GetMapping("/me/appointments")
    public ResponseEntity<ApiResponse<List<Appointment>>> getMyAppointments() {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        Patient patient = patientRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        List<Appointment> appointments = appointmentRepository.findByPatient_Id(patient.getId());
        return ResponseEntity.ok(ApiResponse.success("Success", appointments));
    }
}
