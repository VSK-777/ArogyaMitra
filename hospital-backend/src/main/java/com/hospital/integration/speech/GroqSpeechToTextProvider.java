package com.hospital.integration.speech;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class GroqSpeechToTextProvider implements SpeechToTextProvider {

    private static final Logger logger = LoggerFactory.getLogger(GroqSpeechToTextProvider.class);

    @Value("${GROQ_API_KEY:}")
    private String groqApiKey;

    private static final String GROQ_WHISPER_MODEL = "whisper-large-v3";
    private static final String GROQ_AUDIO_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public String transcribeAudio(org.springframework.web.multipart.MultipartFile audioFile) {
        if (groqApiKey == null || groqApiKey.trim().isEmpty() || groqApiKey.contains("YOUR_GROQ_API_KEY")) {
            logger.error("GROQ_API_KEY is not configured.");
            throw new RuntimeException("Speech-to-Text is currently unavailable (API key missing).");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.setBearerAuth(groqApiKey.trim());

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            // Map webm/ogg/etc to a filename Groq accepts
            String contentType = audioFile.getContentType();
            String filename = "audio.webm";
            if (contentType != null && contentType.contains("mp4")) filename = "audio.mp4";
            else if (contentType != null && contentType.contains("mpeg")) filename = "audio.mp3";
            else if (contentType != null && contentType.contains("wav")) filename = "audio.wav";
            else if (contentType != null && contentType.contains("ogg")) filename = "audio.ogg";
            else if (audioFile.getOriginalFilename() != null && !audioFile.getOriginalFilename().isEmpty()) {
                filename = audioFile.getOriginalFilename();
            }

            final String finalFilename = filename;
            byte[] audioData = audioFile.getBytes();
            
            ByteArrayResource audioResource = new ByteArrayResource(audioData) {
                @Override
                public String getFilename() {
                    return finalFilename;
                }
            };
            
            body.add("file", audioResource);
            body.add("model", GROQ_WHISPER_MODEL);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_AUDIO_URL, requestEntity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (String) response.getBody().get("text");
            } else {
                logger.error("Groq Whisper API returned error: {}", response.getStatusCode());
                throw new RuntimeException("Transcription failed with status " + response.getStatusCode());
            }

        } catch (Exception e) {
            logger.error("Error transcribing audio with Groq: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to transcribe audio.", e);
        }
    }
}
