package com.hospital.dto.document;
import lombok.Data;
import java.util.List;

@Data
public class MedicalDocumentData {
    private DocumentMeta document;
    private PatientInfo patient;
    private List<VitalSign> vitals;
    private List<LabResult> laboratoryResults;
    private List<String> medications;
    private List<String> diagnoses;
    private List<String> procedures;
    private List<String> allergies;
    private List<String> clinicalNotes;
    
    @Data
    public static class DocumentMeta {
        private String documentType;
        private String documentDate;
        private String sourceType;
    }

    @Data
    public static class PatientInfo {
        private String name;
        private String age;
        private String gender;
        private String dateOfBirth;
    }

    @Data
    public static class VitalSign {
        private String name;
        private String value;
        private String unit;
    }

    @Data
    public static class LabResult {
        private String testName;
        private String value;
        private String unit;
        private String referenceRange;
        private String status;
    }
}
