package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String patientId;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String fullName;
    
    @Column(unique = true, nullable = false)
    private String mobile;

    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    
    @Column(columnDefinition = "TEXT")
    private String address;
    private String emergencyContact;
    
    @Column(columnDefinition = "TEXT")
    private String allergies;
    
    @Column(columnDefinition = "TEXT")
    private String existingConditions;
    
    @Column(columnDefinition = "TEXT")
    private String medicalHistory;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
