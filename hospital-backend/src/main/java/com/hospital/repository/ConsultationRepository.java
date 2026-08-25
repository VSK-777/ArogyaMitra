package com.hospital.repository;

import com.hospital.entity.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    Optional<Consultation> findByConsultationId(String consultationId);
    Optional<Consultation> findByAppointment_Id(Long appointmentId);
    List<Consultation> findByPatient_Id(Long patientId);
}
