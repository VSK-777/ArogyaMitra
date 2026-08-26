package com.hospital.integration.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GroqAiProvider implements AiProvider {

    @Value("${groq.api.key}")
    private String groqApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    @Override
    public String generateFollowUpQuestion(String patientInput, String contextHistory) {
        String prompt = "You are an AI medical assistant conducting a pre-consultation. " +
                "Patient initial context: " + contextHistory + ". " +
                "Patient just said: " + patientInput + ". " +
                "Ask exactly ONE brief, relevant follow-up medical question.";
        return callGroqApi(prompt);
    }

    @Override
    public String generateStructuredSummary(String fullConversation) {
        String prompt = "You are a clinical AI. Summarize the following patient complaint into a structured JSON format. " +
                "Include 'chiefComplaint', 'duration', 'symptoms' (array), 'severity', and a brief 'summary' string. " +
                "Conversation: " + fullConversation;
        return callGroqApi(prompt);
    }

    @Override
    public String draftClinicalDocumentation(String doctorNotes) {
        String prompt = "Expand these brief doctor notes into a professional clinical assessment draft: " + doctorNotes;
        return callGroqApi(prompt);
    }

    private String callGroqApi(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.1-8b-instant",
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "temperature", 0.5
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_API_URL, request, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
            return "Unable to generate response from AI. Please try again.";
        } catch (Exception e) {
            System.err.println("Groq API Error: " + e.getMessage());
            if (e.getMessage() != null && e.getMessage().contains("401")) {
                return "The AI Assistant is currently unavailable because the API key is missing or invalid. Please check the backend configuration.";
            }
            return "Sorry, I am having trouble connecting to the medical intelligence server right now. (" + e.getMessage() + ")";
        }
    }
}
