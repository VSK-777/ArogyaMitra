package com.hospital.integration.speech;

import org.springframework.web.multipart.MultipartFile;

public interface SpeechToTextProvider {
    String transcribeAudio(MultipartFile audioFile);
}
