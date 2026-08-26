package com.hospital.service;

import com.hospital.entity.*;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

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
    public Consultation createConsultation(Consultation request) {
        return consultationRepository.save(request);
    }
    
    @Transactional
    public Prescription createPrescription(Prescription request) {
        return prescriptionRepository.save(request);
    }
}
