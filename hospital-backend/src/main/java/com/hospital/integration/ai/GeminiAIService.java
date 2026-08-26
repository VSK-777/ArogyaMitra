package com.hospital.integration.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeminiAIService implements AiProvider {

    private static final Logger logger = LoggerFactory.getLogger(GeminiAIService.class);

    @Value("${gemini.api-key}")
    private String geminiApiKey;
    
    @Value("${gemini.model:gemini-2.5-flash}")
    private String geminiModel;

    private final RestTemplate restTemplate;

    public GeminiAIService() {
        this.restTemplate = new RestTemplate();
    }

    public GeminiAIService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public String generateFollowUpQuestion(String patientInput, String contextHistory) {
        String prompt = "You are an AI medical assistant conducting a pre-consultation. " +
                "Your purpose is to collect structured information that can later help the doctor. " +
                "You MUST NOT diagnose diseases, prescribe medication, or replace a doctor. " +
                "If symptoms are urgent, advise seeking emergency medical attention.\n" +
                "Patient initial context: " + contextHistory + ".\n" +
                "Patient just said: " + patientInput + ".\n" +
                "Ask exactly ONE brief, relevant follow-up medical question.";
        return callGeminiApi(prompt);
    }

    @Override
    public String generateStructuredSummary(String fullConversation) {
        String prompt = "You are a clinical AI. Summarize the following patient complaint into a structured format. " +
                "This MUST be marked as 'AI-generated pre-consultation summary'. " +
                "Do not present this as a medical diagnosis. " +
                "Include 'chiefComplaint', 'duration', 'symptoms' (array), 'severity', and a brief 'summary' string. " +
                "Conversation: \n" + fullConversation;
        return callGeminiApi(prompt);
    }

    @Override
    public String draftClinicalDocumentation(String doctorNotes) {
        String prompt = "Expand these brief doctor notes into a professional clinical assessment draft: " + doctorNotes;
        return callGeminiApi(prompt);
    }

    private String callGeminiApi(String prompt) {
        String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent?key=" + geminiApiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
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
            throw new RuntimeException("AI provider is temporarily unavailable.");
        } catch (Exception e) {
            logger.error("Gemini API Error: {}", e.getMessage());
            throw new RuntimeException("AI provider is temporarily unavailable.", e);
        }
    }
}
