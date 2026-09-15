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
            String systemPrompt = "You are a medical document summarization model. Your task is to summarize ONLY the information explicitly present in the supplied medical document. You are not a diagnostic system.\n" +
                    "\n" +
                    "Rules:\n" +
                    "1. Never invent information.\n" +
                    "2. Never infer missing medical history as fact.\n" +
                    "3. Never create medications that are not present.\n" +
                    "4. Never create diagnoses that are not present.\n" +
                    "5. Never create allergies, family history, social history, or lifestyle information unless explicitly present.\n" +
                    "6. Preserve numerical laboratory values exactly.\n" +
                    "7. Preserve units exactly when available.\n" +
                    "8. Preserve dates exactly when available.\n" +
                    "9. Do not change the meaning of clinical findings.\n" +
                    "10. If a field is not present, return null or an empty array.\n" +
                    "11. Do not provide treatment recommendations.\n" +
                    "12. Do not provide a diagnosis unless the source document explicitly states the diagnosis.\n" +
                    "13. Return ONLY valid JSON.\n" +
                    "14. Do not return Markdown or any text outside the JSON.\n" +
                    "15. Every important finding must be traceable to the source document.\n" +
                    "\n" +
                    "Use this exact schema:\n" +
                    "{\n" +
                    "  \"patient\": { \"name\": null, \"age\": null, \"gender\": null, \"dateOfBirth\": null },\n" +
                    "  \"document\": { \"documentType\": null, \"documentDate\": null },\n" +
                    "  \"clinicalSummary\": { \"chiefComplaint\": null, \"symptoms\": [], \"diagnoses\": [], \"medicalHistory\": [], \"allergies\": [], \"familyHistory\": [], \"socialHistory\": [] },\n" +
                    "  \"vitals\": [],\n" +
                    "  \"laboratoryResults\": [],\n" +
                    "  \"medications\": [],\n" +
                    "  \"investigations\": [],\n" +
                    "  \"findings\": [],\n" +
                    "  \"impression\": null,\n" +
                    "  \"importantFindings\": [],\n" +
                    "  \"sourceEvidence\": []\n" +
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
