package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.PreConsultationRequest;
import com.hospital.entity.PreConsultation;
import com.hospital.service.PreConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/pre-consultations")
@RequiredArgsConstructor
public class PreConsultationController {

    private final PreConsultationService preConsultationService;

    @PostMapping
    public ResponseEntity<ApiResponse<PreConsultation>> startPreConsultation(@RequestBody PreConsultationRequest request) {
        String mobile = SecurityContextHolder.getContext().getAuthentication().getName();
        PreConsultation pc = preConsultationService.startPreConsultation(mobile, request.getAppointmentId(), request.getInitialComplaint());
        return ResponseEntity.ok(ApiResponse.success("Started", pc));
    }

    @PostMapping(value = "/{appointmentId}/audio", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<String>> handleAudio(
            @PathVariable String appointmentId,
            @RequestParam("audio") MultipartFile audio) {
        String nextQuestion = preConsultationService.handleAudioInput(appointmentId, audio);
        return ResponseEntity.ok(ApiResponse.success("Audio processed", nextQuestion));
    }

    @PostMapping("/{appointmentId}/chat")
    public ResponseEntity<ApiResponse<String>> handleChat(
            @PathVariable String appointmentId,
            @RequestBody java.util.Map<String, String> payload) {
        String nextQuestion = preConsultationService.handleTextInput(appointmentId, payload.get("message"));
        return ResponseEntity.ok(ApiResponse.success("Message processed", nextQuestion));
    }

    @PostMapping("/{appointmentId}/complete")
    public ResponseEntity<ApiResponse<PreConsultation>> complete(@PathVariable String appointmentId) {
        PreConsultation pc = preConsultationService.completePreConsultation(appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Completed", pc));
    }
}
