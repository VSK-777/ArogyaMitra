package com.hospital.integration.otp;

import com.hospital.exception.OtpProviderException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
@ConditionalOnProperty(name = "app.demo-mode", havingValue = "false")
public class WhatsAppOtpProvider implements OtpProvider {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppOtpProvider.class);

    @Value("${msg91.authkey:}")
    private String authKey;

    @Value("${msg91.whatsapp.number:}")
    private String whatsappNumber;

    @Value("${msg91.whatsapp.template.name:}")
    private String templateName;

    @Value("${msg91.whatsapp.template.language:en_US}")
    private String templateLanguage;

    @Value("${msg91.whatsapp.namespace:}")
    private String templateNamespace;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void sendOtpMessage(String mobile, String otp) {
        String url = "https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/";

        HttpHeaders headers = new HttpHeaders();
        headers.set("authkey", authKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("integrated-number", whatsappNumber);
        body.put("content_type", "template");

        Map<String, Object> payload = new HashMap<>();
        payload.put("messaging_product", "whatsapp");
        payload.put("type", "template");

        Map<String, Object> template = new HashMap<>();
        template.put("name", templateName);
        
        Map<String, Object> language = new HashMap<>();
        language.put("code", templateLanguage);
        language.put("policy", "deterministic");
        template.put("language", language);
        
        if (templateNamespace != null && !templateNamespace.isEmpty()) {
            template.put("namespace", templateNamespace);
        }

        Map<String, Object> toAndComponents = new HashMap<>();
        toAndComponents.put("to", Collections.singletonList(mobile));

        Map<String, Object> components = new HashMap<>();
        Map<String, Object> bodyComponent = new HashMap<>();
        bodyComponent.put("type", "text");
        bodyComponent.put("value", otp);
        
        // This is based on typical MSG91 WhatsApp template where {{1}} maps to body_1
        components.put("body_1", bodyComponent);
        toAndComponents.put("components", components);

        template.put("to_and_components", Collections.singletonList(toAndComponents));
        payload.put("template", template);
        body.put("payload", payload);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            
            if (responseBody != null && responseBody.containsKey("hasError") && Boolean.TRUE.equals(responseBody.get("hasError"))) {
                log.error("MSG91 WhatsApp API Error: {}", responseBody);
                throw new OtpProviderException("Unable to send WhatsApp message. Provider error.");
            }
            
            log.info("WhatsApp OTP request submitted successfully for mobile: +{}", mobile);
        } catch (HttpClientErrorException e) {
            log.error("MSG91 WhatsApp request failed with HTTP {}. Mobile: +{} | Response: {}", e.getStatusCode(), mobile, e.getResponseBodyAsString());
            throw new OtpProviderException("Unable to send WhatsApp OTP. Please try again.");
        } catch (Exception e) {
            log.error("Failed to connect to MSG91 WhatsApp API for mobile: +{} | Error: {}", mobile, e.getMessage());
            throw new OtpProviderException("Unable to send WhatsApp OTP. Connection failed.");
        }
    }
}
