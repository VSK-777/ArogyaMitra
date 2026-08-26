package com.hospital.repository;

import com.hospital.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByAppointmentIdAndStatus(Long appointmentId, String status);
    List<Document> findByPatientIdAndStatus(Long patientId, String status);
    Optional<Document> findByIdAndStatus(Long id, String status);
}
