package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action;       // LOGIN, APPOINTMENT_CREATED, CONSULTATION_COMPLETED, etc.
    private String entityType;   // Patient, Appointment, Consultation, etc.
    private String entityId;     // The business ID of the entity
    private String performedBy;  // User ID or mobile
    private String details;      // Additional JSON or text details

    @Enumerated(EnumType.STRING)
    private Role performedByRole;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
