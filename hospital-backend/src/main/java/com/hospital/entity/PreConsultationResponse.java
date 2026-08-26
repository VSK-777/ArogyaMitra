package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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
