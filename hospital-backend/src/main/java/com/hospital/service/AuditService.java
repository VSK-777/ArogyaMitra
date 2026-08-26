package com.hospital.service;

import com.hospital.entity.AuditLog;
import com.hospital.entity.Role;
import com.hospital.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(String action, String entityType, String entityId, String performedBy, Role role, String details) {
        AuditLog entry = AuditLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .performedBy(performedBy)
                .performedByRole(role)
                .details(details)
                .build();
        auditLogRepository.save(entry);
        log.info("AUDIT: {} {} {} by {} ({})", action, entityType, entityId, performedBy, role);
    }

    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop50ByOrderByCreatedAtDesc();
    }
}
