package com.hospital.integration.speech;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;

import java.util.Map;

@Service
@Primary
public class GroqSpeechToTextProvider implements SpeechToTextProvider {

    private static final Logger logger = LoggerFactory.getLogger(GroqSpeechToTextProvider.class);

    @Value("${groq.api-key:}")
    private String groqApiKeysStr;

    private static final String GROQ_WHISPER_MODEL = "whisper-large-v3-turbo";
    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

    private final RestTemplate restTemplate = new RestTemplate();

    private String getFirstApiKey() {
        if (groqApiKeysStr != null) {
            String[] keys = groqApiKeysStr.split(",");
            for (String key : keys) {
                if (!key.trim().isEmpty() && !key.contains("YOUR_GROQ_API_KEY")) {
                    return key.trim();
                }
            }
        }
        return "";
    }

    @Override
    public String transcribeAudio(MultipartFile audioFile) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.setBearerAuth(getFirstApiKey());

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", audioFile.getResource());
        body.add("model", GROQ_WHISPER_MODEL);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_API_URL, requestEntity, Map.class);
            Map<String, Object> responseBody = response.getBody();

            if (responseBody != null && responseBody.containsKey("text")) {
                return (String) responseBody.get("text");
            }
            return "Could not parse audio.";
        } catch (org.springframework.web.client.RestClientResponseException e) {
            logger.error("Groq Speech-to-Text API Error - Status: {}, Body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return "Audio processed, but transcription failed.";
        } catch (Exception e) {
            logger.error("Groq Speech-to-Text Error: {}", e.getMessage(), e);
            return "Audio processed, but transcription failed.";
        }
    }
}
