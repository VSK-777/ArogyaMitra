package com.hospital.integration.ai;

public interface AiProvider {
    String generateFollowUpQuestion(String patientInput, String contextHistory);
    String generateStructuredSummary(String fullConversation);
    String draftClinicalDocumentation(String doctorNotes);
}
