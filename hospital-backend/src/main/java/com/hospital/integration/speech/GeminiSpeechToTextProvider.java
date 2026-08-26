package com.hospital.integration.speech;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class GeminiSpeechToTextProvider implements SpeechToTextProvider {

    private static final Logger logger = LoggerFactory.getLogger(GeminiSpeechToTextProvider.class);

    @Value("${gemini.api-key}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public String transcribeAudio(MultipartFile audioFile) {
        String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent?key=" + geminiApiKey;
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            String base64Audio = Base64.getEncoder().encodeToString(audioFile.getBytes());
            String mimeType = audioFile.getContentType() != null ? audioFile.getContentType() : "audio/webm";
            
            // Gemini is multimodal, so we just ask it to transcribe the audio payload.
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", "Please carefully transcribe this audio. Return ONLY the transcribed text with no extra commentary."),
                                    Map.of("inline_data", Map.of(
                                            "mime_type", mimeType,
                                            "data", base64Audio
                                    ))
                            ))
                    )
            );

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, requestEntity, Map.class);
            Map<String, Object> body = response.getBody();

            if (body != null && body.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    if (content != null && content.containsKey("parts")) {
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                        if (!parts.isEmpty()) {
                            return (String) parts.get(0).get("text");
                        }
                    }
                }
            }
            return "Could not parse audio.";
        } catch (Exception e) {
            logger.error("Gemini Speech Error: {}", e.getMessage());
            return "Audio transcription failed.";
        }
    }
}
