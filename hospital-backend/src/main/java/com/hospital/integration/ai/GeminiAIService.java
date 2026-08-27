package com.hospital.integration.ai;

import com.hospital.entity.PreConsultationResponse;
import com.hospital.exception.AiIntegrationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GeminiAIService implements AiProvider {

    private static final Logger logger = LoggerFactory.getLogger(GeminiAIService.class);
    private static final String GEMINI_MODEL = "gemini-2.5-flash";

    @Value("${gemini.api-key}")
    private String geminiApiKey;

    private final RestTemplate restTemplate;

    public GeminiAIService() {
        this.restTemplate = new RestTemplate();
    }

    public GeminiAIService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        boolean hasKey = (geminiApiKey != null && !geminiApiKey.trim().isEmpty());
        logger.info("Gemini API key present: {}", hasKey);
    }

    @Override
    public String generateFollowUpQuestion(String chiefComplaint, List<PreConsultationResponse> previousResponses, String patientInput) {
        String systemInstruction = "You are a medical AI pre-consultation assistant, NOT a doctor and NOT a diagnostic system. " +
                "Your purpose is to produce information that can be passed to the doctor as a pre-consultation summary. " +
                "Ask exactly ONE relevant follow-up question per message. " +
                "Collect symptoms, ask about duration, ask about severity when relevant, ask about associated symptoms, " +
                "ask about existing conditions when relevant, and ask about medications/allergies when relevant. " +
                "Identify information useful for the doctor. " +
                "Avoid claiming a definitive diagnosis. Avoid prescribing medication. " +
                "Escalate appropriately when a potentially serious symptom is mentioned.";

        List<Map<String, Object>> contents = new ArrayList<>();
        
        contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", chiefComplaint))));

        for (PreConsultationResponse r : previousResponses) {
            if (r.getQuestion() != null && !r.getQuestion().isEmpty()) {
                contents.add(Map.of("role", "model", "parts", List.of(Map.of("text", r.getQuestion()))));
            }
            if (r.getAnswerText() != null && !r.getAnswerText().isEmpty() && !r.getAnswerText().equals(chiefComplaint)) {
                contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", r.getAnswerText()))));
            }
        }
        
        if (!patientInput.equals(chiefComplaint)) {
            contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", patientInput))));
        }

        return callGeminiChatApi(systemInstruction, contents);
    }

    @Override
    public String generateStructuredSummary(String fullConversation) {
        String systemInstruction = "You are a clinical AI. Summarize the following patient complaint into a structured format. " +
                "This MUST be marked as 'AI-generated pre-consultation summary'. " +
                "Do not present this as a medical diagnosis. " +
                "Include 'chiefComplaint', 'duration', 'symptoms' (array), 'severity', and a brief 'summary' string.";
                
        List<Map<String, Object>> contents = List.of(
                Map.of("role", "user", "parts", List.of(Map.of("text", "Conversation:\n" + fullConversation)))
        );
        return callGeminiChatApi(systemInstruction, contents);
    }

    @Override
    public String draftClinicalDocumentation(String doctorNotes) {
        String systemInstruction = "You are a clinical AI assistant.";
        List<Map<String, Object>> contents = List.of(
                Map.of("role", "user", "parts", List.of(Map.of("text", "Expand these brief doctor notes into a professional clinical assessment draft: " + doctorNotes)))
        );
        return callGeminiChatApi(systemInstruction, contents);
    }

    private String callGeminiChatApi(String systemInstruction, List<Map<String, Object>> contents) {
        String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent?key=" + geminiApiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = Map.of(
                "system_instruction", Map.of("parts", Map.of("text", systemInstruction)),
                "contents", contents
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, request, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    if (content != null && content.containsKey("parts")) {
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                        if (!parts.isEmpty()) {
                            return (String) parts.get(0).get("text");
                        }
                    }
                }
            }
            logger.error("Invalid or empty response from Gemini API.");
            throw new AiIntegrationException("AI assistant is temporarily unavailable. Please try again in a moment.");
        } catch (org.springframework.web.client.RestClientResponseException e) {
            logger.error("Gemini API Error - Status: {}, Response Body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new AiIntegrationException("AI assistant is temporarily unavailable. Please try again in a moment.", e);
        } catch (Exception e) {
            logger.error("Gemini API Error: {}", e.getMessage(), e);
            throw new AiIntegrationException("AI assistant is temporarily unavailable. Please try again in a moment.", e);
        }
    }
}
