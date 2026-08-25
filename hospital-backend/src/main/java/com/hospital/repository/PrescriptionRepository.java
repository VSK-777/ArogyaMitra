package com.hospital.repository;

import com.hospital.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    Optional<Prescription> findByPrescriptionId(String prescriptionId);
    Optional<Prescription> findByAppointment_Id(Long appointmentId);
    List<Prescription> findByPatient_Id(Long patientId);
}
