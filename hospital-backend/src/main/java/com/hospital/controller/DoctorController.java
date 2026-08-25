package com.hospital.controller;

import com.hospital.dto.*;
import com.hospital.entity.*;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.ConsultationRepository;
import com.hospital.repository.UserRepository;
import com.hospital.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
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

    @GetMapping("/queue/today")
    public ResponseEntity<ApiResponse<List<QueueToken>>> getTodayQueue() {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByMobile(mobile).orElseThrow();
        List<QueueToken> queue = doctorService.getTodayQueue(user.getId().toString());
        return ResponseEntity.ok(ApiResponse.success("Queue fetched", queue));
    }

    @PostMapping("/consultations")
    public ResponseEntity<ApiResponse<Consultation>> saveConsultation(@RequestBody ConsultationRequest request) {
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
        return ResponseEntity.ok(ApiResponse.success("Consultation saved", consultation));
    }

    @PostMapping("/prescriptions")
    public ResponseEntity<ApiResponse<Prescription>> savePrescription(@RequestBody PrescriptionRequest request) {
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
        return ResponseEntity.ok(ApiResponse.success("Prescription saved", prescription));
    }
}
