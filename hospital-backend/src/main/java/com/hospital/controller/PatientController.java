package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.entity.Appointment;
import com.hospital.entity.Patient;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.PrescriptionRepository;
import com.hospital.repository.ConsultationRepository;
import com.hospital.service.AppointmentService;
import com.hospital.entity.AppointmentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final ConsultationRepository consultationRepository;
    private final AppointmentService appointmentService;

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

    @GetMapping("/me/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        Patient patient = patientRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        appointmentService.normalizePatientAppointments(patient.getId());
        List<Appointment> appointments = appointmentRepository.findByPatient_Id(patient.getId());
        
        List<Appointment> upcoming = appointments.stream()
            .filter(a -> a.getStatus() == AppointmentStatus.BOOKED)
            .collect(Collectors.toList());
            
        List<Appointment> visited = appointments.stream()
            .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
            .collect(Collectors.toList());
            
        List<Appointment> notVisited = appointments.stream()
            .filter(a -> a.getStatus() == AppointmentStatus.NO_SHOW)
            .collect(Collectors.toList());

        long prescriptionCount = prescriptionRepository.findByPatient_Id(patient.getId()).size();

        Map<String, Object> data = new HashMap<>();
        data.put("upcomingAppointmentsCount", upcoming.size());
        data.put("completedAppointmentsCount", visited.size());
        data.put("notVisitedCount", notVisited.size());
        data.put("prescriptionCount", prescriptionCount);
        
        data.put("upcomingAppointments", upcoming);
        data.put("visitedAppointments", visited);
        data.put("notVisitedAppointments", notVisited);

        return ResponseEntity.ok(ApiResponse.success("Success", data));
    }

    @PostMapping("/me/appointments/{appointmentId}/checkin")
    public ResponseEntity<ApiResponse<String>> checkIn(@PathVariable String appointmentId) {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        appointmentService.checkIn(mobile, appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Successfully checked in.", null));
    }
}