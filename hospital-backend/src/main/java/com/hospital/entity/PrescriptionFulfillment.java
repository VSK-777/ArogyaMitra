package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prescription_fulfillments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PrescriptionFulfillment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    private String status; // PENDING, PARTIALLY_FULFILLED, COMPLETED, CANCELLED

    private String dispensedBy; // Pharmacist name/ID

    private LocalDateTime fulfilledAt;
    
    @Column(length = 1000)
    private String pharmacistNotes;

    @PrePersist
    protected void onCreate() {
        if (this.fulfilledAt == null) {
            this.fulfilledAt = LocalDateTime.now();
        }
    }
}
