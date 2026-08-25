package com.hospital.integration.speech;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;

import java.util.Map;

@Service
public class GroqWhisperSpeechToTextProvider implements SpeechToTextProvider {

    @Value("${groq.api.key}")
    private String groqApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String GROQ_WHISPER_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

    @Override
    public String transcribeAudio(MultipartFile audioFile) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.setBearerAuth(groqApiKey);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", audioFile.getResource());
        body.add("model", "whisper-large-v3");

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_WHISPER_URL, requestEntity, Map.class);
            if (response.getBody() != null && response.getBody().containsKey("text")) {
                return (String) response.getBody().get("text");
            }
            return "Could not parse audio.";
        } catch (Exception e) {
            System.err.println("Groq Whisper Error: " + e.getMessage());
            return "Audio transcription failed.";
        }
    }
}
