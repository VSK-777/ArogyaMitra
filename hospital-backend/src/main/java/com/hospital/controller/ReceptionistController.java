package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.entity.Patient;
import com.hospital.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/receptionist")
@RequiredArgsConstructor
public class ReceptionistController {

    private final PatientRepository patientRepository;

    @GetMapping("/patients/search")
    public ResponseEntity<ApiResponse<List<Patient>>> searchPatients(@RequestParam String query) {
        // Simple mock search for MVP (normally we'd use a LIKE query in repository)
        List<Patient> patients = patientRepository.findAll().stream()
                .filter(p -> p.getMobile().contains(query) || (p.getFullName() != null && p.getFullName().toLowerCase().contains(query.toLowerCase())))
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(ApiResponse.success("Patients found", patients));
    }
}
