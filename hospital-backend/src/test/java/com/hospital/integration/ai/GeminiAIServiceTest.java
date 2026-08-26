package com.hospital.integration.ai;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GeminiAIServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private GeminiAIService geminiAIService;

    @BeforeEach
    void setUp() {
        geminiAIService = new GeminiAIService(restTemplate);
        ReflectionTestUtils.setField(geminiAIService, "geminiApiKey", "test-key");
        ReflectionTestUtils.setField(geminiAIService, "geminiModel", "gemini-1.5-flash");
    }

    @Test
    void testGenerateFollowUpQuestion_Success() {
        Map<String, Object> mockBody = Map.of(
                "candidates", List.of(
                        Map.of("content", Map.of(
                                "parts", List.of(Map.of("text", "How long have you had this pain?"))
                        ))
                )
        );
        ResponseEntity<Map> mockResponse = new ResponseEntity<>(mockBody, HttpStatus.OK);
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(mockResponse);

        String response = geminiAIService.generateFollowUpQuestion("I have sharp pains", "Initial complaint: I have sharp pains");
        assertEquals("How long have you had this pain?", response);
    }

    @Test
    void testGenerateFollowUpQuestion_Failure() {
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(Map.class)))
                .thenThrow(new RuntimeException("API Down"));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            geminiAIService.generateFollowUpQuestion("I have sharp pains", "Initial complaint: I have sharp pains");
        });
        
        assertEquals("AI provider is temporarily unavailable.", exception.getMessage());
    }
}
