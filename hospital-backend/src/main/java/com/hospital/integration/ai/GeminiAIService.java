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
import java.util.concurrent.atomic.AtomicInteger;
import jakarta.annotation.PostConstruct;

@Service
public class GeminiAIService implements AiProvider {

    private static final Logger logger = LoggerFactory.getLogger(GeminiAIService.class);
    private static final String GEMINI_MODEL = "gemini-2.5-flash";

    @Value("${gemini.api-key:}")
    private String geminiApiKeysStr;

    private final RestTemplate restTemplate;
    private final List<String> apiKeys = new ArrayList<>();
    private final AtomicInteger currentKeyIndex = new AtomicInteger(0);

    public GeminiAIService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        if (geminiApiKeysStr != null) {
            for (String key : geminiApiKeysStr.split(",")) {
                if (!key.trim().isEmpty() && !key.contains("YOUR_GEMINI_API_KEY")) {
                    apiKeys.add(key.trim());
                }
            }
        }
        
        if (apiKeys.isEmpty()) {
            logger.warn("NO VALID GEMINI API KEYS FOUND IN ENVIRONMENT VARIABLES!");
        } else {
            logger.info("Initialized Gemini AI Service with {} API keys for round-robin.", apiKeys.size());
        }
    }

    private String getNextApiKey() {
        if (apiKeys.isEmpty()) return "";
        int index = Math.abs(currentKeyIndex.getAndIncrement() % apiKeys.size());
        return apiKeys.get(index);
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
        
        for (PreConsultationResponse r : previousResponses) {
            if (r.getAnswerText() != null && !r.getAnswerText().trim().isEmpty()) {
                contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", r.getAnswerText()))));
            }
            if (r.getQuestion() != null && !r.getQuestion().trim().isEmpty()) {
                contents.add(Map.of("role", "model", "parts", List.of(Map.of("text", r.getQuestion()))));
            }
        }
        
        if (patientInput != null && !patientInput.trim().isEmpty()) {
            contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", patientInput))));
        }

        return callGeminiChatApi(systemInstruction, contents);
    }

    @Value("${python.ai.url:https://discolor-palpitate-lard.ngrok-free.dev}")
    private String pythonAiBaseUrl;

    @Override
    public String generateStructuredSummary(String fullConversation) {
        try {
            String systemInstruction = "You are a clinical AI assistant. You will be provided with a raw transcript of a pre-consultation chat between a patient and an AI, as well as any uploaded document text. "
                    + "Your job is to carefully extract the facts and write a professional, clinical structured summary for the doctor. "
                    + "Do NOT invent or hallucinate any information. Only use the provided text. "
                    + "Format your response EXACTLY like this (include the bullet points):\n"
                    + "• Summary: [A concise 2-3 sentence clinical summary of the patient's condition]\n"
                    + "• Symptoms: [Comma-separated list of symptoms]\n"
                    + "• Diagnosis: [Potential diagnosis if mentioned, else 'Not specified']\n"
                    + "• Medications: [Any medications mentioned, else 'Not specified']\n"
                    + "• Lab Values: [Any lab values or vitals mentioned, else 'Not specified']";

            List<Map<String, Object>> contents = new ArrayList<>();
            contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", "Here is the consultation data:\n\n" + fullConversation))));

            String aiResponse = callGeminiChatApi(systemInstruction, contents);
            
            // Format the response slightly if needed to match the frontend expectations
            return "AI-generated clinical summary:\n\n" + aiResponse;

        } catch (Exception e) {
            logger.error("Error generating Gemini summary: {}", e.getMessage(), e);
            return "Could not generate summary due to an error. Please refer to the raw chat logs.";
        }
    }

    @Override
    public String draftClinicalDocumentation(String doctorNotes) {
        String systemInstruction = "You are a clinical AI assistant.";
        List<Map<String, Object>> contents = List.of(
                Map.of("role", "user", "parts", List.of(Map.of("text", "Expand these brief doctor notes into a professional clinical assessment draft: " + doctorNotes)))
        );
        return callGeminiChatApi(systemInstruction, contents);
    }

    @Override
    public java.util.Map<String, Object> summarizeClinicalRecord(String text) {
        try {
            String pythonApiUrl = pythonAiBaseUrl + "/summarize";
            java.util.Map<String, Object> request = java.util.Map.of("text", text);
            
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            org.springframework.http.HttpEntity<java.util.Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(request, headers);
            
            org.springframework.http.ResponseEntity<java.util.Map> response = restTemplate.postForEntity(pythonApiUrl, entity, java.util.Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
            return java.util.Map.of("error", "Failed to generate summary from Python AI service. Invalid response.");
        } catch (Exception e) {
            logger.error("Error calling Python AI service for record summary: {}", e.getMessage(), e);
            return java.util.Map.of("error", "Exception calling Python AI service: " + e.getMessage());
        }
    }

    private String callGeminiChatApi(String systemInstruction, List<Map<String, Object>> contents) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = Map.of(
                "system_instruction", Map.of("parts", List.of(Map.of("text", systemInstruction))),
                "contents", contents
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        int maxRetries = Math.max(1, apiKeys.size());
        org.springframework.web.client.RestClientResponseException lastException = null;

        for (int i = 0; i < maxRetries; i++) {
            String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent?key=" + getNextApiKey();
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
                return "I am processing your symptoms. Please provide any additional details, or click 'Finish Consultation' to proceed.";
            } catch (org.springframework.web.client.RestClientResponseException e) {
                logger.error("Gemini API Error - Status: {}, Response Body: {}", e.getStatusCode(), e.getResponseBodyAsString());
                lastException = e;
                if (e.getStatusCode().value() == 429) {
                    if (i < maxRetries - 1) {
                        logger.warn("Rate limit hit, retrying with next API key...");
                        continue;
                    }
                } else {
                    return "I'm having trouble connecting to my knowledge base right now, but please continue or finish the consultation.";
                }
            } catch (Exception e) {
                logger.error("Gemini API Error: {}", e.getMessage(), e);
                return "Thank you for the information. Is there anything else you'd like to add before we finish?";
            }
        }
        
        if (lastException != null && lastException.getStatusCode().value() == 429) {
            return "I've noted your response. (Note: The AI rate limit was reached, but your data is saved). Do you have any other symptoms, or are you ready to finish?";
        }

        return "I am processing your symptoms. Please provide any additional details, or click 'Finish Consultation' to proceed.";
    }
}


