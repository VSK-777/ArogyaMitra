package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "appointment_reassignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class AppointmentReassignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_doctor_id")
    private Doctor originalDoctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "new_doctor_id")
    private Doctor newDoctor;

    private String originalToken;
    private String newToken;
    
    private LocalDateTime originalSlotStart;
    private LocalDateTime newSlotStart;

    private String reason;
    private String reassignedBy;

    @CreatedDate
    private LocalDateTime reassignedAt;
}
