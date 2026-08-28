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

        List<QueueToken> tokens = queueTokenRepository.findByDoctor_IdAndQueueDateOrderByTokenNumberAsc(doctor.getId(), LocalDate.now());
        
        // Self-healing: fix any tokens that are out of sync with completed appointments
        boolean updated = false;
        for (QueueToken token : tokens) {
            if (token.getAppointment() != null && token.getAppointment().getStatus() == AppointmentStatus.COMPLETED) {
                if (token.getStatus() != TokenStatus.COMPLETED) {
                    token.setStatus(TokenStatus.COMPLETED);
                    if (token.getCompletedAt() == null) {
                        token.setCompletedAt(LocalDateTime.now());
                    }
                    queueTokenRepository.save(token);
                    updated = true;
                }
            }
        }
        
        return updated ? queueTokenRepository.findByDoctor_IdAndQueueDateOrderByTokenNumberAsc(doctor.getId(), LocalDate.now()) : tokens;
    }

    public List<Consultation> getPastConsultations(String doctorUserId) {
        Doctor doctor = doctorRepository.findByUser_Id(
            Long.parseLong(doctorUserId) 
        ).orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        return consultationRepository.findByDoctor_IdOrderByCreatedAtDesc(doctor.getId());
    }

    @Transactional
    public void markNoShow(String appointmentId, String doctorUserId) {
        Doctor doctor = doctorRepository.findByUser_Id(
            Long.parseLong(doctorUserId)
        ).orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        
        Appointment appt = appointmentRepository.findByAppointmentId(appointmentId)
            .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
            
        if (!appt.getDoctor().getId().equals(doctor.getId())) {
            throw new SecurityException("Unauthorized to update this appointment");
        }
        
        if (appt.getStatus() != AppointmentStatus.BOOKED) {
            throw new IllegalStateException("Only BOOKED appointments can be marked as No Show");
        }
        
        appt.setStatus(AppointmentStatus.NO_SHOW);
        appointmentRepository.save(appt);
        
        queueTokenRepository.findByAppointment_Id(appt.getId()).ifPresent(token -> {
            token.setStatus(TokenStatus.NO_SHOW);
            queueTokenRepository.save(token);
        });
    }


    @Transactional
    public void startConsultation(String appointmentId, String doctorUserId) {
        Doctor doctor = doctorRepository.findByUser_Id(
            Long.parseLong(doctorUserId)
        ).orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        
        Appointment appt = appointmentRepository.findByAppointmentId(appointmentId)
            .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
            
        if (!appt.getDoctor().getId().equals(doctor.getId())) {
            throw new SecurityException("Unauthorized to update this appointment");
        }
        
        if (appt.getCheckInStatus() != CheckInStatus.CHECKED_IN) {
            throw new IllegalStateException("Patient has not checked in or already in consultation.");
        }
        
        appt.setCheckInStatus(CheckInStatus.IN_CONSULTATION);
        appointmentRepository.save(appt);
        
        queueTokenRepository.findByAppointment_Id(appt.getId()).ifPresent(token -> {
            token.setStatus(TokenStatus.IN_CONSULTATION);
            token.setCalledAt(LocalDateTime.now());
            queueTokenRepository.save(token);
        });
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
