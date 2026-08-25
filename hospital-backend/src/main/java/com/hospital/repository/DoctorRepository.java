package com.hospital.repository;

import com.hospital.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByDoctorId(String doctorId);
    List<Doctor> findByHospital_Id(Long hospitalId);
    List<Doctor> findByDepartment_Id(Long departmentId);
    Optional<Doctor> findByUser_Id(Long userId);
}
