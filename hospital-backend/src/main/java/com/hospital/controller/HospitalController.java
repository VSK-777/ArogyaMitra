package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.entity.Hospital;
import com.hospital.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.cache.annotation.Cacheable;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
public class HospitalController {
    private final HospitalRepository hospitalRepository;

    @GetMapping
    @Cacheable("hospitals")
    public ResponseEntity<ApiResponse<List<Hospital>>> getAllHospitals() {
        return ResponseEntity.ok(ApiResponse.success("Success", hospitalRepository.findAll()));
    }
}

