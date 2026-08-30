package com.hospital.repository;

import com.hospital.entity.DoctorUnavailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface DoctorUnavailabilityRepository extends JpaRepository<DoctorUnavailability, Long> {

    @Query("SELECT d FROM DoctorUnavailability d WHERE d.doctor.id = :doctorId AND " +
           "(d.startDate <= :endDate AND d.endDate >= :startDate)")
    List<DoctorUnavailability> findOverlapping(@Param("doctorId") Long doctorId, 
                                               @Param("startDate") LocalDate startDate, 
                                               @Param("endDate") LocalDate endDate);
                                               
    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM DoctorUnavailability d " +
           "WHERE d.doctor.id = :doctorId AND (d.startDate <= :date AND d.endDate >= :date)")
    boolean isDoctorUnavailableOnDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);
}
