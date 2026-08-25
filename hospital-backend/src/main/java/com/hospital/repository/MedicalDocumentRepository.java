package com.hospital.repository;

import com.hospital.entity.MedicalDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MedicalDocumentRepository extends JpaRepository<MedicalDocument, Long> {
    Optional<MedicalDocument> findByDocumentId(String documentId);
    List<MedicalDocument> findByPatient_Id(Long patientId);
    List<MedicalDocument> findByAppointment_Id(Long appointmentId);
}
