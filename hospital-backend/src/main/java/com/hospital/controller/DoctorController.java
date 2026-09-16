package com.hospital.controller;

import com.hospital.dto.*;
import com.hospital.entity.*;
import com.hospital.repository.*;
import com.hospital.service.AuditService;
import com.hospital.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final PreConsultationRepository preConsultationRepository;
    private final AuditService auditService;
    private final com.hospital.integration.ai.AiProvider aiProvider;
    private final com.hospital.service.PatientSummaryService patientSummaryService;
    private final DoctorRepository doctorRepository;
    private final ConsultationRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;

    @GetMapping("/appointments/{appointmentId}/patient-summary")
    public ResponseEntity<ApiResponse<String>> getFinalPatientSummary(@PathVariable String appointmentId) {
        try {
            Appointment apt = appointmentRepository.findByAppointmentId(appointmentId)
                    .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
            String summary = patientSummaryService.getFinalConsolidatedSummary(apt.getId(), apt.getPatient().getId());
            return ResponseEntity.ok(ApiResponse.success("Final summary generated", summary));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to generate summary: " + e.getMessage(), "SUMMARY_ERROR"));
        }
    }

    @PostMapping("/summarize-clinical-record")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> summarizeClinicalRecord(@RequestBody java.util.Map<String, String> request) {
        String text = request.get("text");
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("No text provided", "INVALID_REQUEST"));
        }
        
        try {
            java.util.Map<String, Object> summary = aiProvider.summarizeClinicalRecord(text);
            if (summary.containsKey("error")) {
                return ResponseEntity.status(500).body(ApiResponse.error((String) summary.get("error"), "AI_ERROR"));
            }
            return ResponseEntity.ok(ApiResponse.success("Summarized successfully", summary));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Exception calling Python AI service: " + e.getMessage(), "AI_ERROR"));
        }
    }

    @GetMapping("/queue/today")
    public ResponseEntity<ApiResponse<List<QueueToken>>> getTodayQueue() {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByMobile(mobile).orElseThrow();
        List<QueueToken> queue = doctorService.getTodayQueue(user.getId().toString());
        return ResponseEntity.ok(ApiResponse.success("Queue fetched", queue));
    }

    @GetMapping("/queue/upcoming")
    public ResponseEntity<ApiResponse<List<Appointment>>> getUpcomingAppointments() {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByMobile(mobile).orElseThrow();
        List<Appointment> upcoming = doctorService.getUpcomingAppointments(user.getId().toString());
        
        for (Appointment a : upcoming) {
            preConsultationRepository.findByAppointment_Id(a.getId()).ifPresent(pc -> {
                if ("COMPLETED".equals(pc.getStatus())) {
                    a.setPreConsultationCompleted(true);
                }
            });
        }
        
        return ResponseEntity.ok(ApiResponse.success("Upcoming appointments fetched", upcoming));
    }

    @GetMapping("/consultations")
    public ResponseEntity<ApiResponse<List<Consultation>>> getPastConsultations() {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByMobile(mobile).orElseThrow();
        List<Consultation> consultations = doctorService.getPastConsultations(user.getId().toString());
        return ResponseEntity.ok(ApiResponse.success("Consultations fetched", consultations));
    }

    @GetMapping("/appointments/{appointmentId}/preconsultation")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getPreConsultationSummary(@PathVariable String appointmentId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Appointment apt = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        
        if (apt.getDoctor() != null && apt.getDoctor().getUser() != null && !apt.getDoctor().getUser().getMobile().equals(username)) {
             throw new org.springframework.security.access.AccessDeniedException("Unauthorized to view this patient's data");
        }

        java.util.Map<String, Object> responseData = new java.util.HashMap<>();
        java.util.Map<String, Object> patientMap = new java.util.HashMap<>();
        patientMap.put("id", apt.getPatient().getId());
        java.util.Map<String, Object> aptMap = new java.util.HashMap<>();
        aptMap.put("patient", patientMap);
        responseData.put("appointment", aptMap);

        String consolidated = null;
        try {
            consolidated = patientSummaryService.getFinalConsolidatedSummary(apt.getId(), apt.getPatient().getId());
        } catch (Exception e) {
            System.err.println("Failed to get consolidated summary: " + e.getMessage());
        }

        Optional<PreConsultation> pc = preConsultationRepository.findByAppointment_Id(apt.getId());
        if (pc.isPresent()) {
            PreConsultation preConsultation = pc.get();
            if (consolidated != null) {
                preConsultation.setAiSummary(consolidated);
            }
            responseData.put("preConsultation", preConsultation);
            responseData.put("aiSummary", preConsultation.getAiSummary());
        } else {
            responseData.put("aiSummary", consolidated); // Fallback to doc-only summary if no pre-consultation
        }

        return ResponseEntity.ok(ApiResponse.success("Consultation data fetched", responseData));
    }

    @PostMapping("/appointments/{appointmentId}/no-show")
    public ResponseEntity<ApiResponse<String>> markNoShow(@PathVariable String appointmentId) {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByMobile(mobile).orElseThrow();
        
        doctorService.markNoShow(appointmentId, user.getId().toString());
        
        auditService.log("APPOINTMENT_NO_SHOW", "Appointment", appointmentId, mobile, Role.ROLE_DOCTOR, "Marked as No Show by Doctor");
        
        return ResponseEntity.ok(ApiResponse.success("Appointment marked as No Show", appointmentId));
    }


    @PostMapping("/appointments/{appointmentId}/start")
    public ResponseEntity<ApiResponse<String>> startConsultation(@PathVariable String appointmentId) {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByMobile(mobile).orElseThrow();
        doctorService.startConsultation(appointmentId, user.getId().toString());
        return ResponseEntity.ok(ApiResponse.success("Consultation started", null));
    }

    @PostMapping("/consultations/complete")
    public ResponseEntity<ApiResponse<Consultation>> completeConsultation(@RequestBody CompleteConsultationRequest request) {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByMobile(mobile).orElseThrow();
        
        Consultation consultation = doctorService.completeConsultation(request, user.getId().toString());
        
        auditService.log("CONSULTATION_COMPLETED", "Consultation", consultation.getConsultationId(), mobile, Role.ROLE_DOCTOR, "For appointment " + request.getAppointmentId());
        
        return ResponseEntity.ok(ApiResponse.success("Consultation completed successfully", consultation));
    }

    @GetMapping("/appointments/{appointmentId}/consultation")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getConsultationDetails(@PathVariable String appointmentId) {
        System.out.println("Fetching consultation details for appointmentId: " + appointmentId);
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByMobile(mobile).orElseThrow();
        Doctor doctor = doctorRepository.findByUser_Id(user.getId()).orElseThrow();
        
        Appointment appt = appointmentRepository.findByAppointmentId(appointmentId)
            .orElseThrow(() -> {
                System.out.println("Appointment not found: " + appointmentId);
                return new IllegalArgumentException("Appointment not found");
            });
            
        if (!appt.getDoctor().getId().equals(doctor.getId())) {
            System.out.println("Doctor mismatch. appt doctor: " + appt.getDoctor().getId() + " user doctor: " + doctor.getId());
            throw new SecurityException("Unauthorized");
        }
        
        Consultation consultation = consultationRepository.findByAppointment_Id(appt.getId())
            .orElseThrow(() -> {
                System.out.println("Consultation not found for internal ID: " + appt.getId());
                return new IllegalArgumentException("Consultation not found for this appointment");
            });
            
        com.hospital.entity.Prescription prescription = prescriptionRepository.findByConsultation_Id(consultation.getId()).orElse(null);
        
        if (consultation.getAiDraft() == null || consultation.getAiDraft().isEmpty()) {
            StringBuilder promptBuilder = new StringBuilder("Summarize the following doctor's consultation into a 3-4 sentence patient-friendly summary. ");
            promptBuilder.append("Make it clear and professional. Explicitly explain the prescribed medications if any.\n\n");
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
        
        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("consultation", consultation);
        data.put("prescription", prescription);
        data.put("summary", consultation.getAiDraft());
        
        return ResponseEntity.ok(ApiResponse.success("Success", data));
    }
}

