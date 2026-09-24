package com.hospital.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
public class MedicalDocumentSummarizationService {

    private final ObjectMapper objectMapper;

    @Value("${PYTHON_AI_URL:http://localhost:8000}")
    private String pythonAiUrl;

    public MedicalDocumentSummarizationService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String summarizeDocument(String documentText) {
        log.info("Delegating document summarization to Python AI microservice at {}", pythonAiUrl);
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            Map<String, Object> request = Map.of("text", documentText);
            
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            
            org.springframework.http.HttpEntity<Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(request, headers);
            
            org.springframework.http.ResponseEntity<Map> response = restTemplate.postForEntity(
                pythonAiUrl + "/summarize", entity, Map.class);
                
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Ensure it returns valid JSON string
                return objectMapper.writeValueAsString(response.getBody());
            } else {
                throw new RuntimeException("Python AI returned non-200 status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Failed to summarize document with Python AI microservice: {}", e.getMessage());
            try {
                return objectMapper.writeValueAsString(Map.of(
                    "summary", "Error analyzing document.",
                    "error", e.getMessage()
                ));
            } catch (Exception ex) {
                return "{\"summary\":\"Error analyzing document.\"}";
            }
        }
    }

    public String getProviderName() {
        return "Python FastAPI";
    }

    public String getModelName() {
        return "Falconsai/medical_summarization";
    }
}
