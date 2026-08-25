package com.hospital.dto;

import lombok.Data;
import java.util.List;

@Data
public class PrescriptionRequest {
    private String consultationId;
    private String generalInstructions;
    private List<MedicineDto> medicines;

    @Data
    public static class MedicineDto {
        private String name;
        private String dosage;
        private String frequency;
        private String duration;
        private String instructions;
    }
}
