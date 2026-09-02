package com.hospital.integration.ai;

import com.hospital.entity.PreConsultationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import jakarta.annotation.PostConstruct;

@Service
@Primary
public class GroqAIService implements AiProvider {

    private static final Logger logger = LoggerFactory.getLogger(GroqAIService.class);
    private static final String GROQ_MODEL = "llama-3.1-70b-versatile";
    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    @Value("${groq.api-key:}")
    private String groqApiKeysStr;

    private final RestTemplate restTemplate;
    private final List<String> apiKeys = new ArrayList<>();
    private final AtomicInteger currentKeyIndex = new AtomicInteger(0);

    public GroqAIService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @PostConstruct
    public void init() {
        if (groqApiKeysStr != null) {
            for (String key : groqApiKeysStr.split(",")) {
                if (!key.trim().isEmpty() && !key.contains("YOUR_GROQ_API_KEY")) {
                    apiKeys.add(key.trim());
                }
            }
        }
        
        if (apiKeys.isEmpty()) {
            logger.warn("NO VALID GROQ API KEYS FOUND IN ENVIRONMENT VARIABLES!");
        } else {
            logger.info("Initialized Groq AI Service with {} API keys for round-robin.", apiKeys.size());
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

        List<Map<String, Object>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemInstruction));
        
        for (PreConsultationResponse r : previousResponses) {
            if (r.getAnswerText() != null && !r.getAnswerText().trim().isEmpty()) {
                messages.add(Map.of("role", "user", "content", r.getAnswerText()));
            }
            if (r.getQuestion() != null && !r.getQuestion().trim().isEmpty()) {
                messages.add(Map.of("role", "assistant", "content", r.getQuestion()));
            }
        }
        
        if (patientInput != null && !patientInput.trim().isEmpty()) {
            messages.add(Map.of("role", "user", "content", patientInput));
        }

        return callGroqChatApi(messages);
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

            List<Map<String, Object>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemInstruction));
            messages.add(Map.of("role", "user", "content", "Here is the consultation data:\n\n" + fullConversation));

            String aiResponse = callGroqChatApi(messages);
            
            return "AI-generated clinical summary:\n\n" + aiResponse;

        } catch (Exception e) {
            logger.error("Error generating Groq summary: {}", e.getMessage(), e);
            return "Could not generate summary due to an error. Please refer to the raw chat logs.";
        }
    }

    @Override
    public String draftClinicalDocumentation(String doctorNotes) {
        String systemInstruction = "You are a clinical AI assistant.";
        List<Map<String, Object>> messages = List.of(
                Map.of("role", "system", "content", systemInstruction),
                Map.of("role", "user", "content", "Expand these brief doctor notes into a professional clinical assessment draft: " + doctorNotes)
        );
        return callGroqChatApi(messages);
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

    private String callGroqChatApi(List<Map<String, Object>> messages) {
        int maxRetries = Math.max(1, apiKeys.size());
        org.springframework.web.client.RestClientResponseException lastException = null;

        for (int i = 0; i < maxRetries; i++) {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(getNextApiKey());

            Map<String, Object> requestBody = Map.of(
                    "model", GROQ_MODEL,
                    "messages", messages,
                    "temperature", 0.3
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            try {
                ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_API_URL, request, Map.class);
                Map<String, Object> body = response.getBody();
                if (body != null && body.containsKey("choices")) {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
                    if (!choices.isEmpty()) {
                        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                        if (message != null && message.containsKey("content")) {
                            return (String) message.get("content");
                        }
                    }
                }
                logger.error("Invalid or empty response from Groq API.");
                return "I am processing your symptoms. Please provide any additional details, or click 'Finish Consultation' to proceed.";
            } catch (org.springframework.web.client.RestClientResponseException e) {
                logger.error("Groq API Error - Status: {}, Response Body: {}", e.getStatusCode(), e.getResponseBodyAsString());
                lastException = e;
                if (i < maxRetries - 1) {
                    logger.warn("API Error hit, retrying with next API key...");
                    continue;
                }
            } catch (Exception e) {
                logger.error("Groq API Error: {}", e.getMessage(), e);
                return "Thank you for the information. Is there anything else you'd like to add before we finish?";
            }
        }
        
        if (lastException != null) {
            if (lastException.getStatusCode().value() == 429) {
                return "I've noted your response. (Note: The AI rate limit was reached, but your data is saved). Do you have any other symptoms, or are you ready to finish?";
            }
            return "I'm having trouble connecting to my knowledge base right now (Error " + lastException.getStatusCode().value() + "), but please continue or finish the consultation.";
        }

        return "I am processing your symptoms. Please provide any additional details, or click 'Finish Consultation' to proceed.";
    }
}
