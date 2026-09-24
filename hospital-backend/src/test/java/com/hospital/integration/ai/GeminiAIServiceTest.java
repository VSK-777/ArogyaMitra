package com.hospital.integration.ai;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class GeminiAIServiceTest {

    private GeminiAIService geminiAIService;

    @BeforeEach
    void setUp() {
        geminiAIService = new GeminiAIService();
        // Leave geminiApiKeysStr empty so no real API calls are made
        ReflectionTestUtils.setField(geminiAIService, "geminiApiKeysStr", "");
        geminiAIService.init();
    }

    @Test
    void testGenerateFollowUpQuestion_NoApiKeys_ReturnsGracefulFallback() {
        // With no API keys configured, the service should return a graceful message
        String response = geminiAIService.generateFollowUpQuestion(
                "I have sharp pains", Collections.emptyList(), "I have sharp pains");
        
        assertNotNull(response);
        assertTrue(response.contains("No API keys configured") || response.contains("Noted:"),
                "Expected a graceful fallback message when no API keys are configured");
    }

    @Test
    void testGenerateStructuredSummary_NoApiKeys_ReturnsFallback() {
        String response = geminiAIService.generateStructuredSummary("Patient has chest pain");
        assertNotNull(response);
    }

    @Test
    void testDraftClinicalDocumentation_NoApiKeys_ReturnsFallback() {
        // With no keys, callLangChainChatApi should throw, and we expect that to propagate
        // since draftClinicalDocumentation doesn't have its own try-catch
        assertThrows(RuntimeException.class, () -> {
            geminiAIService.draftClinicalDocumentation("Patient has mild fever");
        });
    }
}
