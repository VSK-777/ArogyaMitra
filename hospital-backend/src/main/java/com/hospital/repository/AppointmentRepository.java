package com.hospital.repository;

import com.hospital.entity.Appointment;
import com.hospital.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    Optional<Appointment> findByAppointmentId(String appointmentId);
    List<Appointment> findByPatient_Id(Long patientId);
    List<Appointment> findByDoctor_IdAndAppointmentDate(Long doctorId, LocalDate date);
    int countByDoctor_IdAndAppointmentDate(Long doctorId, LocalDate date);
    long countByAppointmentDate(LocalDate date);
    long countByStatus(AppointmentStatus status);
    List<Appointment> findByPatient_IdAndStatus(Long patientId, AppointmentStatus status);

    boolean existsByDoctor_IdAndAppointmentDateAndSlotStartAndStatus(
            Long doctorId, LocalDate date, LocalTime slotStart, AppointmentStatus status);
}
