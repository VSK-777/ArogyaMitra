package com.hospital.service;

import com.hospital.entity.Appointment;
import com.hospital.entity.Patient;
import com.hospital.entity.PreConsultation;
import com.hospital.entity.PreConsultationResponse;
import com.hospital.integration.ai.AiProvider;
import com.hospital.integration.speech.SpeechToTextProvider;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.PreConsultationRepository;
import com.hospital.repository.PreConsultationResponseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PreConsultationService {

    private final PreConsultationRepository preConsultationRepository;
    private final PreConsultationResponseRepository responseRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final AiProvider aiProvider;
    private final SpeechToTextProvider speechProvider;

    @Transactional
    public PreConsultation startPreConsultation(String mobile, String appointmentId, String complaint) {
        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (!appointment.getPatient().getMobile().equals(mobile)) {
            throw new RuntimeException("Unauthorized");
        }

        PreConsultation preConsultation = PreConsultation.builder()
                .preConsultationId("PRE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .appointment(appointment)
                .patient(appointment.getPatient())
                .chiefComplaint(complaint)
                .status("IN_PROGRESS")
                .build();

        return preConsultationRepository.save(preConsultation);
    }

    @Transactional
    public String handleAudioInput(String appointmentId, MultipartFile audio) {
        PreConsultation preConsultation = preConsultationRepository.findByAppointment_Id(
                appointmentRepository.findByAppointmentId(appointmentId).orElseThrow().getId()
        ).orElseThrow(() -> new IllegalArgumentException("PreConsultation not found"));

        String transcript = speechProvider.transcribeAudio(audio);
        String question = aiProvider.generateFollowUpQuestion(transcript, "Initial: " + preConsultation.getChiefComplaint());

        PreConsultationResponse response = PreConsultationResponse.builder()
                .responseId("RES-" + UUID.randomUUID().toString().substring(0, 8))
                .preConsultation(preConsultation)
                .question(question)
                .answerText(transcript)
                .inputType("VOICE")
                .timestamp(LocalDateTime.now())
                .build();
        responseRepository.save(response);

        return question;
    }

    @Transactional
    public PreConsultation completePreConsultation(String appointmentId) {
        PreConsultation preConsultation = preConsultationRepository.findByAppointment_Id(
                appointmentRepository.findByAppointmentId(appointmentId).orElseThrow().getId()
        ).orElseThrow(() -> new IllegalArgumentException("PreConsultation not found"));

        String summary = aiProvider.generateStructuredSummary(preConsultation.getChiefComplaint());
        preConsultation.setAiSummary(summary);
        preConsultation.setAiGenerated(true);
        preConsultation.setStatus("COMPLETED");
        preConsultation.setCompletedAt(LocalDateTime.now());

        return preConsultationRepository.save(preConsultation);
    }
}
