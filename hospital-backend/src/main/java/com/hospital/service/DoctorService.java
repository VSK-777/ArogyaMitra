package com.hospital.service;

import com.hospital.dto.CompleteConsultationRequest;
import com.hospital.dto.PrescriptionRequest;
import com.hospital.entity.*;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final QueueTokenRepository queueTokenRepository;
    private final ConsultationRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;

    public List<QueueToken> getTodayQueue(String doctorUserId) {
        Doctor doctor = doctorRepository.findByUser_Id(
            Long.parseLong(doctorUserId) 
        ).orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        return queueTokenRepository.findByDoctor_IdAndQueueDateOrderByTokenNumberAsc(doctor.getId(), LocalDate.now());
    }

    public List<Consultation> getPastConsultations(String doctorUserId) {
        Doctor doctor = doctorRepository.findByUser_Id(
            Long.parseLong(doctorUserId) 
        ).orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        return consultationRepository.findByDoctor_IdOrderByCreatedAtDesc(doctor.getId());
    }

    @Transactional
    public Consultation completeConsultation(CompleteConsultationRequest request, String doctorUserId) {
        Doctor doctor = doctorRepository.findByUser_Id(
            Long.parseLong(doctorUserId)
        ).orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        
        Appointment appt = appointmentRepository.findByAppointmentId(request.getAppointmentId())
            .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
            
        if (!appt.getDoctor().getId().equals(doctor.getId())) {
            throw new SecurityException("Unauthorized to complete this consultation");
        }
        
        if (appt.getStatus() == AppointmentStatus.COMPLETED) {
            // Idempotency: if already completed, just return the existing consultation.
            return consultationRepository.findByAppointment_Id(appt.getId())
                    .orElseThrow(() -> new IllegalStateException("Appointment marked completed but consultation missing"));
        }
        
        // 1. Create Consultation
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
                
        consultation = consultationRepository.save(consultation);
        
        // 2. Create Prescription if provided
        if (request.getMedicines() != null && !request.getMedicines().isEmpty()) {
            Prescription prescription = Prescription.builder()
                    .prescriptionId("PRS-" + UUID.randomUUID().toString().substring(0,8))
                    .consultation(consultation)
                    .appointment(appt)
                    .patient(appt.getPatient())
                    .doctor(appt.getDoctor())
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
            prescriptionRepository.save(prescription);
        }
        
        // 3. Update Appointment Status
        appt.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appt);
        
        // 4. Update QueueToken Status
        queueTokenRepository.findByAppointment_Id(appt.getId()).ifPresent(token -> {
            token.setStatus(TokenStatus.COMPLETED);
            token.setCompletedAt(LocalDateTime.now());
            queueTokenRepository.save(token);
        });
        
        return consultation;
    }
}
