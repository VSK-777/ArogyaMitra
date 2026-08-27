package com.hospital.dto;

import lombok.Data;
import java.util.List;

@Data
public class CompleteConsultationRequest {
    private String appointmentId;
    private String observations;
    private String assessment;
    private String diagnosis;
    private String treatmentPlan;
    private String doctorNotes;

    private String generalInstructions;
    private List<PrescriptionRequest.MedicineDto> medicines;
}
