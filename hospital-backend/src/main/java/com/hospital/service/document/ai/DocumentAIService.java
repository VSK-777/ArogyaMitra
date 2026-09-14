package com.hospital.service.document.ai;
import com.hospital.dto.document.MedicalDocumentData;
import java.util.List;
import java.util.Set;

public interface DocumentAIService {
    String getProviderName();
    Set<ModelCapability> getCapabilities();
    MedicalDocumentData analyzeText(String systemPrompt, String documentText);
    MedicalDocumentData analyzeImages(String systemPrompt, List<byte[]> pageImages);
}
