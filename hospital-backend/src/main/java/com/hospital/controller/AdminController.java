package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.entity.Hospital;
import com.hospital.entity.Department;
import com.hospital.entity.User;
import com.hospital.repository.HospitalRepository;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;

    @GetMapping("/users")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users fetched", userRepository.findAll()));
    }

    @GetMapping("/hospitals")
    public ResponseEntity<ApiResponse<List<Hospital>>> getHospitals() {
        return ResponseEntity.ok(ApiResponse.success("Hospitals fetched", hospitalRepository.findAll()));
    }

    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<Department>>> getDepartments() {
        return ResponseEntity.ok(ApiResponse.success("Departments fetched", departmentRepository.findAll()));
    }
}
