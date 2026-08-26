package com.hospital.repository;

import com.hospital.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop50ByOrderByCreatedAtDesc();
    List<AuditLog> findByPerformedBy(String userId);
    List<AuditLog> findByEntityTypeAndEntityId(String entityType, String entityId);
}
