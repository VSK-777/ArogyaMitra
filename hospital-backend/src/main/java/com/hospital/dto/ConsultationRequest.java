package com.hospital.dto;

import lombok.Data;

@Data
public class ConsultationRequest {
    private String appointmentId;
    private String observations;
    private String assessment;
    private String diagnosis;
    private String treatmentPlan;
    private String doctorNotes;
}
