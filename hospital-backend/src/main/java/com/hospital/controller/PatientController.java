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
    private final com.hospital.integration.ai.AiProvider aiProvider;
    private final com.hospital.repository.NotificationRepository notificationRepository;
    private final AppointmentService appointmentService;
    private final com.hospital.repository.PreConsultationRepository preConsultationRepository;

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
            .filter(a -> (a.getStatus() == AppointmentStatus.BOOKED || a.getStatus() == AppointmentStatus.REASSIGNED || a.getStatus() == AppointmentStatus.REASSIGNMENT_PENDING))
            .filter(a -> !a.getAppointmentDate().isBefore(java.time.LocalDate.now(java.time.ZoneId.of("Asia/Kolkata"))))
            .collect(Collectors.toList());
            
        List<Appointment> visited = appointments.stream()
            .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
            .collect(Collectors.toList());
            
        List<Appointment> notVisited = appointments.stream()
            .filter(a -> a.getStatus() == AppointmentStatus.NO_SHOW)
            .collect(Collectors.toList());

        long prescriptionCount = prescriptionRepository.findByPatient_Id(patient.getId()).size();

        Map<String, Object> data = new HashMap<>();
        data.put("patient", patient);
        data.put("upcomingAppointmentsCount", upcoming.size());
        data.put("completedAppointmentsCount", visited.size());
        data.put("notVisitedCount", notVisited.size());
        data.put("prescriptionCount", prescriptionCount);
        
        data.put("upcomingAppointments", upcoming);

        boolean requiresPreConsultation = false;
        String pendingPreConsultationAppointmentId = null;
        for (Appointment a : upcoming) {
            com.hospital.entity.PreConsultation pc = preConsultationRepository.findByAppointment_Id(a.getId()).orElse(null);
            if (pc == null || !"COMPLETED".equals(pc.getStatus())) {
                requiresPreConsultation = true;
                pendingPreConsultationAppointmentId = a.getAppointmentId();
                break;
            }
        }
        data.put("requiresPreConsultation", requiresPreConsultation);
        data.put("pendingPreConsultationAppointmentId", pendingPreConsultationAppointmentId);
        data.put("visitedAppointments", visited);
        data.put("notVisitedAppointments", notVisited);

        // Fetch notifications (only show recent ones to avoid cluttering)
        java.time.LocalDateTime twoDaysAgo = java.time.LocalDateTime.now().minusDays(2);
        List<com.hospital.entity.Notification> notifications = notificationRepository.findByPatient_IdOrderByCreatedAtDesc(patient.getId())
                .stream()
                .filter(n -> n.getCreatedAt() != null && n.getCreatedAt().isAfter(twoDaysAgo))
                .collect(java.util.stream.Collectors.toList());
        data.put("notifications", notifications);

        return ResponseEntity.ok(ApiResponse.success("Dashboard data fetched successfully", data));
    }

    @PostMapping("/me/appointments/{appointmentId}/checkin")
    public ResponseEntity<ApiResponse<String>> checkIn(@PathVariable String appointmentId) {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        appointmentService.checkIn(mobile, appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Successfully checked in.", null));
    }

    @GetMapping("/me/appointments/{appointmentId}/consultation")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getConsultationDetails(@PathVariable String appointmentId) {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        Patient patient = patientRepository.findByMobile(mobile).orElseThrow();
        
        Appointment appt = appointmentRepository.findByAppointmentId(appointmentId)
            .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
            
        if (!appt.getPatient().getId().equals(patient.getId())) {
            throw new SecurityException("Unauthorized");
        }
        
        com.hospital.entity.Consultation consultation = consultationRepository.findByAppointment_Id(appt.getId())
            .orElseThrow(() -> new IllegalArgumentException("Consultation not found for this appointment"));
            
        com.hospital.entity.Prescription prescription = prescriptionRepository.findByConsultation_Id(consultation.getId()).orElse(null);
        
        if (consultation.getAiDraft() == null || consultation.getAiDraft().isEmpty()) {
            StringBuilder promptBuilder = new StringBuilder("Summarize the following doctor's consultation into a 3-4 sentence patient-friendly summary. ");
            promptBuilder.append("Make it empathetic, clear, and easy to understand for the patient. Strip out heavy medical jargon. Explicitly explain the prescribed medications if any.\n\n");
            promptBuilder.append("Diagnosis: ").append(consultation.getDiagnosis()).append("\n");
            promptBuilder.append("Observations: ").append(consultation.getObservations()).append("\n");
            promptBuilder.append("Treatment Plan: ").append(consultation.getTreatmentPlan()).append("\n");
            
            if (prescription != null && prescription.getMedicines() != null && !prescription.getMedicines().isEmpty()) {
                promptBuilder.append("Prescribed Medicines:\n");
                for (com.hospital.entity.PrescriptionMedicine pm : prescription.getMedicines()) {
                    promptBuilder.append("- ").append(pm.getName())
                                 .append(" (").append(pm.getDosage()).append(", ")
                                 .append(pm.getFrequency()).append(" for ")
                                 .append(pm.getDuration()).append(")\n");
                }
            }
            String prompt = promptBuilder.toString();
            try {
                String summary = aiProvider.generateStructuredSummary(prompt);
                consultation.setAiDraft(summary);
                consultationRepository.save(consultation);
            } catch(Exception e) {
                // ignore
            }
        }
        
        Map<String, Object> data = new HashMap<>();
        data.put("consultation", consultation);
        data.put("prescription", prescription);
        data.put("summary", consultation.getAiDraft());
        
        return ResponseEntity.ok(ApiResponse.success("Success", data));
    }
}