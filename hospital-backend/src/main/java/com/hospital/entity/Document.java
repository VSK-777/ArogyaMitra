package com.hospital.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "documents")
@Data
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;
    
    private String fileName;
    private String contentType;
    private Long fileSize;
    
    @Column(length = 1024)
    private String storagePath;
    
    private String documentType; // e.g. LAB_REPORT, PRESCRIPTION, SCAN, CONSULTATION
    private String uploadedBy; // Role of uploader
    private LocalDateTime uploadedAt;
    private String status; // ACTIVE, DELETED
    
    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        if (status == null) status = "ACTIVE";
    }
}
