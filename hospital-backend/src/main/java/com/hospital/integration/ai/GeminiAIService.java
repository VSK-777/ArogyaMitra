package com.hospital.integration.ai;

import com.hospital.entity.PreConsultationResponse;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class GeminiAIService implements AiProvider {

    private static final Logger logger = LoggerFactory.getLogger(GeminiAIService.class);
    private static final String GEMINI_MODEL = "gemini-3.6-flash";

    @Value("${gemini.api-key:}")
    private String geminiApiKeysStr;

    private final RestTemplate restTemplate;
    private final List<ChatLanguageModel> chatModels = new ArrayList<>();
    private final AtomicInteger currentModelIndex = new AtomicInteger(0);

    public GeminiAIService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @PostConstruct
    public void init() {
        if (geminiApiKeysStr != null) {
            for (String key : geminiApiKeysStr.split(",")) {
                if (!key.trim().isEmpty() && !key.contains("YOUR_GEMINI_API_KEY")) {
                    ChatLanguageModel model = GoogleAiGeminiChatModel.builder()
                            .apiKey(key.trim())
                            .modelName(GEMINI_MODEL)
                            .temperature(0.7)
                            .build();
                    chatModels.add(model);
                }
            }
        }
        
        if (chatModels.isEmpty()) {
            logger.warn("NO VALID GEMINI API KEYS FOUND FOR LANGCHAIN4J!");
        } else {
            logger.info("Initialized LangChain4j Gemini AI Service with {} models for round-robin.", chatModels.size());
        }
    }

    private ChatLanguageModel getNextModel() {
        if (chatModels.isEmpty()) return null;
        int index = Math.abs(currentModelIndex.getAndIncrement() % chatModels.size());
        return chatModels.get(index);
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

        List<ChatMessage> messages = new ArrayList<>();
        messages.add(SystemMessage.from(systemInstruction));
        
        for (PreConsultationResponse r : previousResponses) {
            if (r.getAnswerText() != null && !r.getAnswerText().trim().isEmpty()) {
                messages.add(UserMessage.from(r.getAnswerText()));
            }
            if (r.getQuestion() != null && !r.getQuestion().trim().isEmpty()) {
                messages.add(AiMessage.from(r.getQuestion()));
            }
        }
        
        if (patientInput != null && !patientInput.trim().isEmpty()) {
            messages.add(UserMessage.from(patientInput));
        }

        return callLangChainChatApi(messages);
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

            List<ChatMessage> messages = new ArrayList<>();
            messages.add(SystemMessage.from(systemInstruction));
            messages.add(UserMessage.from("Here is the consultation data:\n\n" + fullConversation));

            String aiResponse = callLangChainChatApi(messages);
            return "AI-generated clinical summary:\n\n" + aiResponse;

        } catch (Exception e) {
            logger.error("Error generating Gemini summary via LangChain: {}", e.getMessage(), e);
            return "Could not generate summary due to an error. Please refer to the raw chat logs.";
        }
    }

    @Override
    public String draftClinicalDocumentation(String doctorNotes) {
        String systemInstruction = "You are a clinical AI assistant.";
        List<ChatMessage> messages = List.of(
                SystemMessage.from(systemInstruction),
                UserMessage.from("Expand these brief doctor notes into a professional clinical assessment draft: " + doctorNotes)
        );
        return callLangChainChatApi(messages);
    }

    @Override
    public java.util.Map<String, Object> summarizeClinicalRecord(String text) {
        try {
            String pythonApiUrl = pythonAiBaseUrl + "/summarize";
            java.util.Map<String, Object> request = java.util.Map.of("text", text);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<java.util.Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<java.util.Map> response = restTemplate.postForEntity(pythonApiUrl, entity, java.util.Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
            return java.util.Map.of("error", "Failed to generate summary from Python AI service. Invalid response.");
        } catch (Exception e) {
            logger.error("Error calling Python AI service for record summary: {}", e.getMessage(), e);
            return java.util.Map.of("error", "Exception calling Python AI service: " + e.getMessage());
        }
    }

    private String callLangChainChatApi(List<ChatMessage> messages) {
        if (chatModels.isEmpty()) {
            return "I am processing your symptoms. (Error: No API keys configured).";
        }

        int maxRetries = chatModels.size();
        Exception lastException = null;

        for (int i = 0; i < maxRetries; i++) {
            ChatLanguageModel model = getNextModel();
            try {
                return model.generate(messages).content().text();
            } catch (Exception e) {
                logger.error("LangChain API Error: {}", e.getMessage(), e);
                lastException = e;
                if (i < maxRetries - 1) {
                    logger.warn("LangChain Error hit, retrying with next API key model...");
                    continue;
                }
            }
        }
        
        if (lastException != null) {
            String msg = lastException.getMessage() != null ? lastException.getMessage().toLowerCase() : "";
            if (msg.contains("429") || msg.contains("quota") || msg.contains("rate limit")) {
                return "I've noted your response. (Note: The AI rate limit was reached, but your data is saved). Do you have any other symptoms, or are you ready to finish?";
            }
            return "I'm having trouble connecting to my knowledge base right now (LangChain Error), but please continue or finish the consultation.";
        }

        return "I am processing your symptoms. Please provide any additional details, or click 'Finish Consultation' to proceed.";
    }
}
