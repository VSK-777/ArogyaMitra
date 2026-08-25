package com.hospital.repository;

import com.hospital.entity.QueueToken;
import com.hospital.entity.TokenStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface QueueTokenRepository extends JpaRepository<QueueToken, Long> {
    Optional<QueueToken> findByTokenId(String tokenId);
    List<QueueToken> findByDoctor_IdAndQueueDateOrderByTokenNumberAsc(Long doctorId, LocalDate date);
    Optional<QueueToken> findTopByDoctor_IdAndQueueDateOrderByTokenNumberDesc(Long doctorId, LocalDate date);
    Optional<QueueToken> findByAppointment_Id(Long appointmentId);
}
