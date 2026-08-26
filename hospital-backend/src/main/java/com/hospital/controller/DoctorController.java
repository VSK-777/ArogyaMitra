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
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final ConsultationRepository consultationRepository;
    private final PreConsultationRepository preConsultationRepository;
    private final AuditService auditService;

    @GetMapping("/queue/today")
    public ResponseEntity<ApiResponse<List<QueueToken>>> getTodayQueue() {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByMobile(mobile).orElseThrow();
        List<QueueToken> queue = doctorService.getTodayQueue(user.getId().toString());
        return ResponseEntity.ok(ApiResponse.success("Queue fetched", queue));
    }

    @GetMapping("/consultations")
    public ResponseEntity<ApiResponse<List<Consultation>>> getPastConsultations() {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByMobile(mobile).orElseThrow();
        List<Consultation> consultations = doctorService.getPastConsultations(user.getId().toString());
        return ResponseEntity.ok(ApiResponse.success("Consultations fetched", consultations));
    }

    @GetMapping("/appointments/{appointmentId}/preconsultation")
    public ResponseEntity<ApiResponse<PreConsultation>> getPreConsultationSummary(@PathVariable String appointmentId) {
        Appointment apt = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        Optional<PreConsultation> pc = preConsultationRepository.findByAppointment_Id(apt.getId());
        if (pc.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("Pre-consultation found", pc.get()));
        }
        return ResponseEntity.status(404).body(ApiResponse.error("No pre-consultation found", "NOT_FOUND"));
    }

    @PostMapping("/consultations")
    public ResponseEntity<ApiResponse<Consultation>> saveConsultation(@RequestBody ConsultationRequest request) {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        Appointment appt = appointmentRepository.findByAppointmentId(request.getAppointmentId()).orElseThrow();
        
        Consultation consultation = Consultation.builder()
                .consultationId("CON-" + UUID.randomUUID().toString().substring(0,8))
                .appointment(appt)
                .patient(appt.getPatient())
                .doctor(appt.getDoctor())
                .observations(request.getObservations())
                .assessment(request.getAssessment())
                .diagnosis(request.getDiagnosis())
                .treatmentPlan(request.getTreatmentPlan())
                .doctorNotes(request.getDoctorNotes())
                .status("COMPLETED")
                .build();
                
        consultation = doctorService.createConsultation(consultation);
        
        // Update appointment status
        appt.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appt);
        
        auditService.log("CONSULTATION_COMPLETED", "Consultation", consultation.getConsultationId(), mobile, Role.ROLE_DOCTOR, "For appointment " + request.getAppointmentId());
        
        return ResponseEntity.ok(ApiResponse.success("Consultation saved", consultation));
    }

    @PostMapping("/prescriptions")
    public ResponseEntity<ApiResponse<Prescription>> savePrescription(@RequestBody PrescriptionRequest request) {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        Consultation con = consultationRepository.findByConsultationId(request.getConsultationId()).orElseThrow();
        
        Prescription prescription = Prescription.builder()
                .prescriptionId("PRS-" + UUID.randomUUID().toString().substring(0,8))
                .consultation(con)
                .appointment(con.getAppointment())
                .patient(con.getPatient())
                .doctor(con.getDoctor())
                .generalInstructions(request.getGeneralInstructions())
                .build();
        final Prescription finalPrescription = prescription;
        
        List<PrescriptionMedicine> meds = request.getMedicines().stream().map(m -> 
            PrescriptionMedicine.builder()
                .prescription(finalPrescription)
                .name(m.getName())
                .dosage(m.getDosage())
                .frequency(m.getFrequency())
                .duration(m.getDuration())
                .instructions(m.getInstructions())
                .build()
        ).collect(Collectors.toList());
        
        prescription.setMedicines(meds);
        
        prescription = doctorService.createPrescription(prescription);
        auditService.log("PRESCRIPTION_CREATED", "Prescription", prescription.getPrescriptionId(), mobile, Role.ROLE_DOCTOR, "For consultation " + request.getConsultationId());
        return ResponseEntity.ok(ApiResponse.success("Prescription saved", prescription));
    }
}
