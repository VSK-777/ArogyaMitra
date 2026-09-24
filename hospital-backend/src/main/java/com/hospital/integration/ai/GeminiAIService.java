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
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class GeminiAIService implements AiProvider {

    private static final Logger logger = LoggerFactory.getLogger(GeminiAIService.class);
    private static final String GEMINI_MODEL = "gemini-3.7-flash";

    @Value("${GEMINI_API_KEY:}")
    private String geminiApiKeysStr;

    private final List<ChatLanguageModel> chatModels = new ArrayList<>();
    private final AtomicInteger currentModelIndex = new AtomicInteger(0);

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
        String systemInstruction = "You are an expert, highly efficient clinical triage nurse conducting a rapid pre-consultation intake. " +
                "CRITICAL RULES:\n" +
                "1. NO MEDICAL DISCLAIMERS: You are inside a secure hospital software system. DO NOT output any warnings or advice to seek emergency care.\n" +
                "2. BE EFFICIENT & CLINICAL: Do not act like a conversational chatbot. Ask sharp, targeted, and medically relevant follow-up questions to rule in/out critical conditions. Be empathetic but extremely concise.\n" +
                "3. CONVERSATION CONTEXT: You must carefully read the prior conversation history. Build logically on the patient's previous answers. DO NOT repeat questions you have already asked.\n" +
                "4. STRICT FORMATTING REQUIRED: You MUST format your response with exactly two keywords: 'Noted:' and 'Question:'. Do not use conversational filler.\n" +
                "Format EXACTLY like this:\n" +
                "Noted: [Summarize the patient's symptom efficiently in clinical third-person, e.g., 'Patient reports sharp, radiating chest pain.']\n" +
                "Question: [Ask EXACTLY ONE focused clinical follow-up question, e.g., 'Does the pain worsen when you take a deep breath?']\n" +
                "5. Always respond in the exact same language the patient used.";

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

        try {
            return callLangChainChatApi(messages);
        } catch (RuntimeException e) {
            logger.error("Pre-consultation AI call failed after retries: {}", e.getMessage());
            String fallbackNote = (patientInput != null && !patientInput.trim().isEmpty()) 
                ? "Patient reported: \"" + patientInput + "\"" 
                : "Patient's response has been recorded.";
            return "Noted: " + fallbackNote + "\nQuestion: Could you please describe any other symptoms you are experiencing, or click 'Finish Consultation' to proceed to the doctor?";
        }
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
            return aiResponse;

        } catch (Exception e) {
            logger.error("Error generating Gemini summary via LangChain: {}", e.getMessage(), e);
            return "Could not generate summary due to an error: " + e.getMessage() + ". Please ensure GEMINI_API_KEY is valid and has quota.";
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
            logger.info("Using Python AI backend for Document Summarization...");
            String pythonApiUrl = System.getenv().getOrDefault("PYTHON_AI_URL", "http://localhost:8000");
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            java.util.Map<String, Object> request = java.util.Map.of("text", text);
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            org.springframework.http.HttpEntity<java.util.Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(request, headers);
            
            org.springframework.http.ResponseEntity<java.util.Map> response = restTemplate.postForEntity(
                pythonApiUrl + "/summarize", entity, java.util.Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                java.util.Map<String, Object> body = response.getBody();
                
                String summary = (String) body.getOrDefault("summary", "No summary generated.");
                String diagnosisStr = (String) body.getOrDefault("diagnosis", "");
                String symptomsStr = (String) body.getOrDefault("symptoms", "");
                
                List<String> diagnoses = diagnosisStr.isEmpty() || diagnosisStr.equals("Not specified") ? List.of() : List.of(diagnosisStr);
                List<String> keyFindings = symptomsStr.isEmpty() || symptomsStr.equals("Not specified") ? List.of() : List.of(symptomsStr);
                
                return java.util.Map.of(
                    "summary", summary,
                    "key_findings", keyFindings,
                    "diagnoses", diagnoses
                );
            }
            return java.util.Map.of("error", "Python AI returned an error status.");
        } catch (Exception e) {
            logger.error("Error calling Python AI for record summary: {}", e.getMessage(), e);
            return java.util.Map.of("error", "Exception calling Python AI: " + e.getMessage());
        }
    }

    private String callLangChainChatApi(List<ChatMessage> messages) {
        if (chatModels.isEmpty()) {
            return "I am processing your symptoms. (Error: No API keys configured).";
        }

        // Try each API key, and for retriable errors (429/503), wait and retry with backoff
        int totalAttempts = chatModels.size() * 3; // 3 retry rounds across all keys
        int delayMs = 2000;
        Exception lastException = null;

        for (int i = 0; i < totalAttempts; i++) {
            ChatLanguageModel model = getNextModel();
            try {
                return model.generate(messages).content().text();
            } catch (Exception e) {
                lastException = e;
                String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
                boolean retriable = msg.contains("429") || msg.contains("503") || msg.contains("quota") || msg.contains("rate limit") || msg.contains("unavailable") || msg.contains("overloaded");
                
                if (retriable && i < totalAttempts - 1) {
                    logger.warn("Gemini API returned retriable error (attempt {}/{}). Waiting {}ms before retry...", i + 1, totalAttempts, delayMs);
                    try {
                        Thread.sleep(delayMs);
                        delayMs = Math.min(delayMs * 2, 10000); // Cap at 10 seconds
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("AI call interrupted", ie);
                    }
                } else if (!retriable) {
                    // Non-retriable error, propagate immediately
                    logger.error("Non-retriable LangChain API Error: {}", e.getMessage());
                    throw new RuntimeException("AI service error: " + e.getMessage(), e);
                }
            }
        }
        
        // All retries exhausted — throw so caller can handle it properly
        logger.error("All Gemini API retries exhausted. Last error: {}", lastException != null ? lastException.getMessage() : "unknown");
        throw new RuntimeException("AI service temporarily unavailable after retries", lastException);
    }
}
