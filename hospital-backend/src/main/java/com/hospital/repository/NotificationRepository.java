package com.hospital.repository;

import com.hospital.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByPatient_IdOrderByCreatedAtDesc(Long patientId);
    List<Notification> findByPatient_IdAndIsReadFalse(Long patientId);
}
