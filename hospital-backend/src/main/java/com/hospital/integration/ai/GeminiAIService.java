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
        String systemInstruction = "You are a highly intelligent, expert clinical triage nurse/doctor. You are talking directly to the patient to conduct a rapid, advanced pre-consultation intake. " +
                "CRITICAL RULES:\n" +
                "1. NO MEDICAL DISCLAIMERS: You are inside a secure hospital software system that handles emergency routing. DO NOT output any warnings, disclaimers, or advice to seek emergency care (e.g., NEVER say 'call 911' or 'go to the ER').\n" +
                "2. BE INTELLIGENT & CLINICAL: Show your medical reasoning implicitly to build trust. (e.g., 'To help us understand if this might be related to your heart, does the pain travel to your neck or jaw?').\n" +
                "3. STRICT FORMATTING REQUIRED: You MUST format your response with exactly two keywords: 'Noted:' and 'Question:'. Do not use conversational filler.\n" +
                "Format EXACTLY like this:\n" +
                "Noted: [Briefly acknowledge their symptom as a clinical note in third-person or passive voice, e.g., 'Patient reports chest pain radiating to the jaw.']\n" +
                "Question: [Ask EXACTLY ONE sharp, advanced follow-up question to the patient directly, e.g., 'When did this pain start?']\n" +
                "4. Always respond in the exact same language the patient used (e.g. if Telugu, respond in Telugu).";

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

    @Override
    public String generateStructuredSummary(String fullConversation) {
        try {
            String systemInstruction = "You are a clinical AI assistant. You will be provided with a raw transcript of a pre-consultation chat between a patient and an AI, as well as any uploaded document text. "
                    + "Your job is to carefully extract the facts and write a professional, clinical structured summary for the doctor. "
                    + "Do NOT invent or hallucinate any information. Only use the provided text. "
                    + "If the condition seems of low/moderate severity, you may suggest standard preliminary tests (e.g., CBC, X-Ray) that the doctor might consider ordering. "
                    + "Format your response EXACTLY like this (include the bullet points):\n"
                    + "• Summary: [A concise 2-3 sentence clinical summary of the patient's condition]\n"
                    + "• Symptoms: [Comma-separated list of symptoms]\n"
                    + "• Diagnosis: [Potential differential diagnosis if evident, else 'Not specified']\n"
                    + "• Recommended Tests: [Suggested preliminary tests, if applicable, else 'None at this stage']\n"
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
            String systemInstruction = "You are a medical AI summarizer. Read the following raw clinical text and extract key information into a structured JSON format with EXACTLY these keys: 'summary', 'key_findings', 'diagnoses'. Do not use markdown blocks, just raw JSON. If any data is missing, put an empty string or empty array.";
            
            List<ChatMessage> messages = new ArrayList<>();
            messages.add(SystemMessage.from(systemInstruction));
            messages.add(UserMessage.from(text));

            String aiResponse = callLangChainChatApi(messages);
            
            if (aiResponse.startsWith("```json")) {
                aiResponse = aiResponse.substring(7);
            }
            if (aiResponse.startsWith("```")) {
                aiResponse = aiResponse.substring(3);
            }
            if (aiResponse.endsWith("```")) {
                aiResponse = aiResponse.substring(0, aiResponse.length() - 3);
            }
            
            // Basic manual JSON parsing or fallback if it isn't perfect json
            try {
                return new com.fasterxml.jackson.databind.ObjectMapper().readValue(aiResponse.trim(), java.util.Map.class);
            } catch (Exception parseEx) {
                return java.util.Map.of("summary", aiResponse, "key_findings", List.of(), "diagnoses", List.of());
            }

        } catch (Exception e) {
            logger.error("Error calling Gemini for record summary: {}", e.getMessage(), e);
            return java.util.Map.of("error", "Exception calling Gemini AI: " + e.getMessage());
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
                return "Noted: Your response has been recorded.\nQuestion: The system is currently busy. Do you have any other symptoms to share, or would you like to finish the consultation?";
            }
            return "Noted: Your response has been recorded.\nQuestion: I'm experiencing a brief connection issue. Please continue sharing your symptoms, or click 'Finish Consultation' to proceed.";
        }

        return "I am processing your symptoms. Please provide any additional details, or click 'Finish Consultation' to proceed.";
    }
}
