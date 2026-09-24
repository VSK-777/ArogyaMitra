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
    private final DocumentRepository documentRepository;

    @Transactional(readOnly = true)
    public List<Appointment> getUpcomingAppointments(String doctorUserId) {
        Doctor doctor = doctorRepository.findByUser_Id(
            Long.parseLong(doctorUserId)
        ).orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        // Use parameterized query instead of loading all appointments into memory
        List<Appointment> todayAndFuture = appointmentRepository.findByDoctor_IdAndAppointmentDateGreaterThanEqual(
                doctor.getId(), LocalDate.now());
        
        return todayAndFuture.stream()
                .filter(a -> a.getAppointmentDate().isAfter(LocalDate.now()) || 
                        (a.getAppointmentDate().isEqual(LocalDate.now()) && 
                         (a.getStatus() == AppointmentStatus.BOOKED || a.getStatus() == AppointmentStatus.REASSIGNED)))
                .sorted((a, b) -> {
                    int dateCmp = a.getAppointmentDate().compareTo(b.getAppointmentDate());
                    if (dateCmp != 0) return dateCmp;
                    if (a.getSlotStart() == null) return -1;
                    if (b.getSlotStart() == null) return 1;
                    return a.getSlotStart().compareTo(b.getSlotStart());
                })
                .toList();
    }

    @Transactional
    public List<QueueToken> getTodayQueue(String doctorUserId) {
        Doctor doctor = doctorRepository.findByUser_Id(
            Long.parseLong(doctorUserId) 
        ).orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        List<QueueToken> tokens = queueTokenRepository.findByDoctor_IdAndQueueDateOrderByTokenNumberAsc(doctor.getId(), LocalDate.now());
        
        // Self-healing: fix any tokens that are out of sync with completed appointments
        List<QueueToken> toUpdate = tokens.stream()
                .filter(token -> token.getAppointment() != null 
                        && token.getAppointment().getStatus() == AppointmentStatus.COMPLETED
                        && token.getStatus() != TokenStatus.COMPLETED)
                .toList();
        
        if (!toUpdate.isEmpty()) {
            toUpdate.forEach(token -> {
                token.setStatus(TokenStatus.COMPLETED);
                if (token.getCompletedAt() == null) {
                    token.setCompletedAt(LocalDateTime.now());
                }
            });
            queueTokenRepository.saveAll(toUpdate); // Batch save instead of iterative
            return queueTokenRepository.findByDoctor_IdAndQueueDateOrderByTokenNumberAsc(doctor.getId(), LocalDate.now());
        }
        
        return tokens;
    }

    @Transactional(readOnly = true)
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
        
        // 5. Create Virtual Document for Prescription
        com.hospital.entity.Document doc = new com.hospital.entity.Document();
        doc.setPatient(appt.getPatient());
        doc.setAppointment(appt);
        doc.setFileName("Prescription_" + appt.getAppointmentId() + ".pdf");
        doc.setContentType("application/pdf");
        doc.setFileSize(0L);
        doc.setStoragePath("virtual://" + appt.getAppointmentId());
        doc.setDocumentType("CONSULTATION_SUMMARY");
        doc.setUploadedBy("DOCTOR");
        doc.setUploadedAt(LocalDateTime.now());
        doc.setStatus("ACTIVE");
        doc.setProcessingStatus("COMPLETED");
        documentRepository.save(doc);

        return consultation;
    }
}
