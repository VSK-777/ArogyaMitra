package com.hospital.repository;

import com.hospital.entity.PreConsultation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PreConsultationRepository extends JpaRepository<PreConsultation, Long> {
    Optional<PreConsultation> findByPreConsultationId(String preConsultationId);
    Optional<PreConsultation> findByAppointment_Id(Long appointmentId);
}
