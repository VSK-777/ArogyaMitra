package com.hospital.repository;

import com.hospital.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByMobile(String mobile);
    Optional<Patient> findByUser_Id(Long userId);
    Optional<Patient> findByPatientId(String patientId);
    List<Patient> findByFullNameContainingIgnoreCase(String name);
}
