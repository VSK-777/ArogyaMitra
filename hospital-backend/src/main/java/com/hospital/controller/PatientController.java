package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.entity.Appointment;
import com.hospital.entity.Patient;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.PrescriptionRepository;
import com.hospital.repository.ConsultationRepository;
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

        List<Appointment> appointments = appointmentRepository.findByPatient_Id(patient.getId());
        long upcomingCount = appointments.stream().filter(a -> a.getStatus().name().equals("BOOKED") || a.getStatus().name().equals("SCHEDULED")).count();
        
        long completedCount = consultationRepository.findByPatient_Id(patient.getId()).size();
        long prescriptionCount = prescriptionRepository.findByPatient_Id(patient.getId()).size();

        Map<String, Object> data = new HashMap<>();
        data.put("upcomingAppointmentsCount", upcomingCount);
        data.put("completedAppointmentsCount", completedCount);
        data.put("prescriptionCount", prescriptionCount);
        
        List<Appointment> upcoming = appointments.stream()
            .filter(a -> a.getStatus().name().equals("BOOKED") || a.getStatus().name().equals("SCHEDULED"))
            .collect(Collectors.toList());
            
        data.put("upcomingAppointments", upcoming);

        return ResponseEntity.ok(ApiResponse.success("Success", data));
    }
}
