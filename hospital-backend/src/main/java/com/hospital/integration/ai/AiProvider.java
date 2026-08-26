package com.hospital.integration.ai;

import com.hospital.entity.PreConsultationResponse;
import java.util.List;

public interface AiProvider {
    String generateFollowUpQuestion(String chiefComplaint, List<PreConsultationResponse> previousResponses, String patientInput);
    String generateStructuredSummary(String fullConversation);
    String draftClinicalDocumentation(String doctorNotes);
}
