package com.hospital.repository;

import com.hospital.entity.DoctorFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorFeedbackRepository extends JpaRepository<DoctorFeedback, Long> {
    
    List<DoctorFeedback> findByDoctor_IdOrderByCreatedAtDesc(Long doctorId);
    
    List<DoctorFeedback> findByPatient_IdOrderByCreatedAtDesc(Long patientId);
    
    boolean existsByAppointment_Id(Long appointmentId);

    @Query("SELECT AVG(f.rating) FROM DoctorFeedback f WHERE f.doctor.id = :doctorId")
    Double getAverageRatingForDoctor(@Param("doctorId") Long doctorId);
    
    @Query("SELECT COUNT(f) FROM DoctorFeedback f WHERE f.doctor.id = :doctorId")
    Long countFeedbackForDoctor(@Param("doctorId") Long doctorId);
}
