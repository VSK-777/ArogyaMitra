package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.entity.Doctor;
import com.hospital.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/doctors")
@RequiredArgsConstructor
public class PublicDoctorController {
    private final DoctorRepository doctorRepository;

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<ApiResponse<List<Doctor>>> getDoctorsByDepartment(@PathVariable Long departmentId) {
        List<Doctor> doctors = doctorRepository.findAll().stream()
            .filter(d -> d.getDepartment().getId().equals(departmentId))
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Success", doctors));
    }
}
