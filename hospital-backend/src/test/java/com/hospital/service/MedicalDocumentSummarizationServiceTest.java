package com.hospital.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.output.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class MedicalDocumentSummarizationServiceTest {

    private ChatLanguageModel chatModel;
    private ObjectMapper objectMapper;
    private MedicalDocumentSummarizationService summarizationService;

    @BeforeEach
    void setUp() {
        chatModel = mock(ChatLanguageModel.class);
        objectMapper = new ObjectMapper();
        summarizationService = new MedicalDocumentSummarizationService(objectMapper);
        summarizationService.setChatModel(chatModel);
    }

    @Test
    void testSummarizeDocument_B12_Regression_Test_No_Hallucination() throws Exception {
        String inputDoc = "VITAMIN B12 1081 pg/ml\nNormal 204 - 673\nAcceptable > 199\nDeficiency(WHO) < 149";
        
        // Simulating the strict, non-hallucinated response from LangChain
        String expectedJsonResponse = "{" +
                "\"patient\": {}," +
                "\"laboratoryResults\": [{\"test\": \"VITAMIN B12\", \"result\": \"1081\", \"units\": \"pg/ml\"}]," +
                "\"medicalHistory\": []," +
                "\"allergies\": []" +
                "}";

        when(chatModel.generate(any(List.class)))
            .thenReturn(new Response<>(AiMessage.from(expectedJsonResponse)));

        String jsonResult = summarizationService.summarizeDocument(inputDoc);
        
        assertTrue(jsonResult.contains("1081"));
        assertFalse(jsonResult.contains("Asthma"), "Should not hallucinate Asthma");
        assertFalse(jsonResult.contains("Appendectomy"), "Should not hallucinate Appendectomy");
        assertFalse(jsonResult.contains("Family History"), "Should not hallucinate Family History");
    }
    
    @Test
    void testSummarizeDocument_Invalid_Json_ThrowsException() {
        String inputDoc = "Some text";
        
        when(chatModel.generate(any(List.class)))
            .thenReturn(new Response<>(AiMessage.from("This is not JSON!")));

        assertThrows(RuntimeException.class, () -> summarizationService.summarizeDocument(inputDoc));
    }
}
