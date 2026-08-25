package com.hospital.repository;

import com.hospital.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByDepartmentId(String departmentId);
    List<Department> findByHospital_Id(Long hospitalId);
}
