package com.hospital.repository;

import com.hospital.entity.PrescriptionFulfillment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionFulfillmentRepository extends JpaRepository<PrescriptionFulfillment, Long> {
    List<PrescriptionFulfillment> findByPatient_Id(Long patientId);
    List<PrescriptionFulfillment> findByStatus(String status);
}
