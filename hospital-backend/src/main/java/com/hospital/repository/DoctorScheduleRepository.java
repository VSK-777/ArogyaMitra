package com.hospital.repository;

import com.hospital.entity.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {
    List<DoctorSchedule> findByDoctor_Id(Long doctorId);
    Optional<DoctorSchedule> findByDoctor_IdAndDayOfWeek(Long doctorId, DayOfWeek dayOfWeek);
}
