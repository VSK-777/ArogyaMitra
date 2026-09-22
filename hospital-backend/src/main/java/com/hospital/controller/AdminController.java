package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.entity.AuditLog;
import com.hospital.entity.Doctor;
import com.hospital.entity.Department;
import com.hospital.entity.User;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.UserRepository;
import com.hospital.service.AnalyticsService;
import com.hospital.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AnalyticsService analyticsService;
    private final AuditService auditService;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.success("Analytics", analyticsService.getDashboardAnalytics()));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs() {
        return ResponseEntity.ok(ApiResponse.success("Audit logs", auditService.getRecentLogs()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users", userRepository.findAll()));
    }

    @PutMapping("/users/{id}/activate")
    public ResponseEntity<ApiResponse<User>> activateUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(true);
        return ResponseEntity.ok(ApiResponse.success("User activated", userRepository.save(user)));
    }

    @PutMapping("/users/{id}/deactivate")
    public ResponseEntity<ApiResponse<User>> deactivateUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        return ResponseEntity.ok(ApiResponse.success("User deactivated", userRepository.save(user)));
    }

    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<List<Doctor>>> getAllDoctors() {
        return ResponseEntity.ok(ApiResponse.success("Doctors", doctorRepository.findAll()));
    }

    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<Department>>> getAllDepartments() {
        return ResponseEntity.ok(ApiResponse.success("Departments", departmentRepository.findAll()));
    }
}


