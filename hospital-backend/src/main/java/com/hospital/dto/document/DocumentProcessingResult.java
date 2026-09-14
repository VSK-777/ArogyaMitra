package com.hospital.dto.document;
import lombok.Data;
@Data
public class DocumentProcessingResult {
    private Long documentId;
    private DocumentProcessingState state;
    private MedicalDocumentData extractedData;
    private String errorMessage;
}
