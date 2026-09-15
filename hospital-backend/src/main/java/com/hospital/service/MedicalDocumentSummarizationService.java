package com.hospital.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class MedicalDocumentSummarizationService {

    private final ObjectMapper objectMapper;
    private ChatLanguageModel chatModel;

    @Value("${DEFAULT_AI_PROVIDER:gemini}")
    private String aiProvider;

    @Value("${GEMINI_API_KEY:}")
    private String geminiApiKey;

    @Value("${GEMINI_MODEL:gemini-3.6-flash}")
    private String geminiModel;

    public MedicalDocumentSummarizationService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        if ("gemini".equalsIgnoreCase(aiProvider) && geminiApiKey != null && !geminiApiKey.isEmpty() && !geminiApiKey.contains("YOUR_GEMINI_API_KEY")) {
            this.chatModel = GoogleAiGeminiChatModel.builder()
                    .apiKey(geminiApiKey)
                    .modelName(geminiModel)
                    .temperature(0.0) // Deterministic output
                    .build();
            log.info("Initialized MedicalDocumentSummarizationService with Gemini model: {}", geminiModel);
        } else {
            log.warn("MedicalDocumentSummarizationService: No valid configuration found for AI Provider: {}. Summarization will fail.", aiProvider);
        }
    }

    public String summarizeDocument(String documentText) {
        if (chatModel == null) {
            throw new IllegalStateException("AI Model is not configured for medical summarization.");
        }

        try {
            String systemPrompt = "You are an expert medical AI assistant. Your task is to intelligently read and summarize the supplied medical document, extracting ALL useful information comprehensively.\n" +
                    "\n" +
                    "Rules:\n" +
                    "1. Provide a smart, readable 'Executive Summary' that synthesizes the overall clinical picture, main findings, and context using your own intelligence, while remaining strictly factual to the document.\n" +
                    "2. Extract ALL test names, laboratory results, values, units, and reference ranges. Do not skip any tests.\n" +
                    "3. Extract ALL medications, including dosages, frequencies, and durations.\n" +
                    "4. Extract dates, patient details, and document types.\n" +
                    "5. Never invent information or infer diagnoses not present in the text.\n" +
                    "6. Return the response as a clean JSON object.\n" +
                    "7. Do not return Markdown or any text outside the JSON.\n" +
                    "\n" +
                    "Use this schema:\n" +
                    "{\n" +
                    "  \"patientDetails\": { \"name\": \"\", \"age\": \"\", \"gender\": \"\" },\n" +
                    "  \"documentInfo\": { \"type\": \"\", \"date\": \"\" },\n" +
                    "  \"executiveSummary\": \"A detailed, intelligent paragraph summarizing the document's contents, overall findings, and clinical picture.\",\n" +
                    "  \"laboratoryResults\": [ { \"testName\": \"\", \"result\": \"\", \"unit\": \"\", \"referenceRange\": \"\", \"interpretation\": \"\" } ],\n" +
                    "  \"medications\": [ { \"medicineName\": \"\", \"dosage\": \"\", \"frequency\": \"\", \"duration\": \"\" } ],\n" +
                    "  \"keyFindings\": [ \"Detailed finding 1\", \"Detailed finding 2\" ],\n" +
                    "  \"otherDetails\": {}\n" +
                    "}";

            List<ChatMessage> messages = new ArrayList<>();
            messages.add(SystemMessage.from(systemPrompt));
            messages.add(UserMessage.from("Summarize the following medical document:\n\n" + documentText));

            String content = chatModel.generate(messages).content().text();

            // Clean markdown blocks if present (e.g. ```json ... ```)
            if (content.startsWith("```json")) {
                content = content.substring(7);
            }
            if (content.startsWith("```")) {
                content = content.substring(3);
            }
            if (content.endsWith("```")) {
                content = content.substring(0, content.length() - 3);
            }

            // Validate JSON
            JsonNode jsonNode = objectMapper.readTree(content.trim());
            return jsonNode.toString();

        } catch (Exception e) {
            log.error("Failed to summarize document with LangChain4j: {}", e.getMessage());
            throw new RuntimeException("Error generating document summary: " + e.getMessage(), e);
        }
    }

    public String getProviderName() {
        return aiProvider;
    }

    public String getModelName() {
        if ("gemini".equalsIgnoreCase(aiProvider)) return geminiModel;
        return "unknown";
    }
    
    // For testing injection
    public void setChatModel(ChatLanguageModel chatModel) {
        this.chatModel = chatModel;
    }
}
