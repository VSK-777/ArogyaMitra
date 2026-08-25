package com.hospital.repository;

import com.hospital.entity.PreConsultationResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PreConsultationResponseRepository extends JpaRepository<PreConsultationResponse, Long> {
    List<PreConsultationResponse> findByPreConsultation_IdOrderByTimestampAsc(Long preConsultationId);
}
