package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pre_consultation_responses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreConsultationResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String responseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pre_consultation_id")
    private PreConsultation preConsultation;

    @Column(columnDefinition = "TEXT")
    private String question;
    
    @Column(columnDefinition = "TEXT")
    private String answerText;

    private String inputType; // TEXT, VOICE

    private LocalDateTime timestamp;
}
