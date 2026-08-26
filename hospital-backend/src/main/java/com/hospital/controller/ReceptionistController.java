package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.entity.Patient;
import com.hospital.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/receptionist")
@RequiredArgsConstructor
public class ReceptionistController {
    private final PatientRepository patientRepository;

    @GetMapping("/patients/search")
    public ResponseEntity<ApiResponse<Patient>> searchPatient(@RequestParam String mobile) {
        Optional<Patient> patient = patientRepository.findByMobile(mobile);
        if (patient.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("Patient found", patient.get()));
        } else {
            return ResponseEntity.status(404).body(ApiResponse.error("404", "Patient not found"));
        }
    }
}
