package com.hospital.repository;

import com.hospital.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    Optional<Appointment> findByAppointmentId(String appointmentId);
    List<Appointment> findByPatient_Id(Long patientId);
    List<Appointment> findByDoctor_IdAndAppointmentDate(Long doctorId, LocalDate date);
    int countByDoctor_IdAndAppointmentDate(Long doctorId, LocalDate date);
}
