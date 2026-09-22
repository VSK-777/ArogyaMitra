package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.service.ReassignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/reassignment")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
public class ReassignmentController {
    
    private final ReassignmentService reassignmentService;
    private final com.hospital.repository.DoctorRepository doctorRepository;

    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDoctorsForReassignment() {
        // Return doctors mapped for UI dropdowns
        List<Map<String, Object>> docs = doctorRepository.findAll().stream().map(d -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", d.getId());
            m.put("user", Map.of("name", d.getUser().getName()));
            m.put("department", Map.of("name", d.getDepartment().getName()));
            return m;
        }).toList();
        return ResponseEntity.ok(ApiResponse.success("Doctors retrieved", docs));
    }

    @GetMapping("/affected")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAffectedAppointments(
            @RequestParam Long doctorId,
            @RequestParam String date) {
        return ResponseEntity.ok(ApiResponse.success("Affected appointments retrieved", reassignmentService.getAffectedAppointments(doctorId, LocalDate.parse(date))));
    }
    
    @PostMapping("/mark-unavailable")
    public ResponseEntity<ApiResponse<String>> markDoctorUnavailable(
            @RequestParam Long doctorId,
            @RequestParam String date,
            @RequestParam String reason) {
        reassignmentService.markDoctorUnavailable(doctorId, LocalDate.parse(date), reason);
        return ResponseEntity.ok(ApiResponse.success("Doctor marked unavailable and affected appointments flagged.", null));
    }
    
    @GetMapping("/replacements")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getReplacements(
            @RequestParam Long originalAppointmentId) {
        return ResponseEntity.ok(ApiResponse.success("Replacement doctors found", reassignmentService.findReplacements(originalAppointmentId)));
    }
    
    @PostMapping("/assign")
    public ResponseEntity<ApiResponse<String>> assignReplacement(
            @RequestParam Long appointmentId,
            @RequestParam Long newDoctorId,
            @RequestParam String newSlotStart) {
        reassignmentService.reassignAppointment(appointmentId, newDoctorId, newSlotStart);
        return ResponseEntity.ok(ApiResponse.success("Appointment reassigned successfully.", null));
    }
}
