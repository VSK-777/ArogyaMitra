package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.entity.Doctor;
import com.hospital.entity.User;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.UserRepository;
import com.hospital.service.ReassignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor-unavailability")
@RequiredArgsConstructor
public class DoctorUnavailabilityController {

    private final ReassignmentService reassignmentService;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;

    private Long resolveDoctorId(Long requestedDoctorId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByMobile(username).orElseThrow();
        
        if (user.getRole() == com.hospital.entity.Role.ROLE_DOCTOR) {
            Doctor doc = doctorRepository.findByUser_Id(user.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Doctor profile not found"));
            return doc.getId();
        }
        
        if (requestedDoctorId != null) return requestedDoctorId;
        throw new IllegalArgumentException("Doctor ID is required for non-doctor users");
    }

    @GetMapping("/preview")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> previewAffectedAppointments(
            @RequestParam(required = false) Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Long resolvedId = resolveDoctorId(doctorId);
        List<Map<String, Object>> affected = reassignmentService.previewAffectedAppointments(resolvedId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Affected appointments retrieved", affected));
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<String>> createUnavailability(@RequestBody Map<String, Object> request) {
        Long requestedId = request.get("doctorId") != null ? Long.valueOf(request.get("doctorId").toString()) : null;
        Long doctorId = resolveDoctorId(requestedId);
        LocalDate startDate = LocalDate.parse(request.get("startDate").toString());
        LocalDate endDate = LocalDate.parse(request.get("endDate").toString());
        String reason = request.get("reason") != null ? request.get("reason").toString() : "Urgent hospital responsibility";

        reassignmentService.createUnavailability(doctorId, startDate, endDate, reason);
        return ResponseEntity.ok(ApiResponse.success("Doctor marked unavailable successfully", null));
    }

    @PostMapping("/auto-reschedule")
    public ResponseEntity<ApiResponse<Map<String, Object>>> autoReschedule(@RequestBody Map<String, Object> request) {
        Long requestedId = request.get("doctorId") != null ? Long.valueOf(request.get("doctorId").toString()) : null;
        Long doctorId = resolveDoctorId(requestedId);
        LocalDate startDate = LocalDate.parse(request.get("startDate").toString());
        LocalDate endDate = LocalDate.parse(request.get("endDate").toString());

        Map<String, Object> summary = reassignmentService.autoReschedule(doctorId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Auto-reschedule complete", summary));
    }
}
