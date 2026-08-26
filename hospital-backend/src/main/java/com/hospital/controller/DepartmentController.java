package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.entity.Department;
import com.hospital.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {
    private final DepartmentRepository departmentRepository;

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<ApiResponse<List<Department>>> getDepartmentsByHospital(@PathVariable Long hospitalId) {
        List<Department> deps = departmentRepository.findByHospital_Id(hospitalId);
        return ResponseEntity.ok(ApiResponse.success("Success", deps));
    }
}
