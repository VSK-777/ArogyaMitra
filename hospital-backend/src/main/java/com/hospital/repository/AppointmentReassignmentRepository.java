package com.hospital.repository;

import com.hospital.entity.AppointmentReassignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentReassignmentRepository extends JpaRepository<AppointmentReassignment, Long> {
    List<AppointmentReassignment> findByAppointment_Id(Long appointmentId);
}
