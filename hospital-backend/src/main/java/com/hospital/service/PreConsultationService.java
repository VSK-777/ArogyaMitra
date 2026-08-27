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
        
        PreConsultation pc = preConsultationRepository.findByAppointment_Id(appointment.getId())
                .map(existing -> {
                    existing.setChiefComplaint(complaint);
                    existing.setStatus("IN_PROGRESS");
                    return preConsultationRepository.save(existing);
                })
                .orElseGet(() -> {
                    PreConsultation newPc = PreConsultation.builder()
                            .preConsultationId("PRE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                            .appointment(appointment)
                            .patient(appointment.getPatient())
                            .chiefComplaint(complaint)
                            .status("IN_PROGRESS")
                            .build();
                    return preConsultationRepository.save(newPc);
                });

        java.util.List<PreConsultationResponse> previous = responseRepository.findByPreConsultation_IdOrderByTimestampAsc(pc.getId());
        if (!previous.isEmpty()) {
            pc.setFirstQuestion(previous.get(0).getQuestion());
            return pc;
        }

        // Generate the first real AI question instead of relying on frontend hardcoding
        String history = "Initial complaint: " + complaint;
        String question = aiProvider.generateFollowUpQuestion(complaint, java.util.Collections.emptyList(), complaint);

        PreConsultationResponse response = PreConsultationResponse.builder()
                .responseId("RES-" + UUID.randomUUID().toString().substring(0, 8))
                .preConsultation(pc)
                .question(question)
                .answerText(complaint)
                .inputType("TEXT")
                .timestamp(LocalDateTime.now())
                .build();
        responseRepository.save(response);

        pc.setFirstQuestion(question);
        return pc;
    }

    @Transactional
    public String handleTextInput(String appointmentId, String textInput) {
        PreConsultation preConsultation = getByAppointmentId(appointmentId);
        
        java.util.List<PreConsultationResponse> previous = responseRepository.findByPreConsultation_IdOrderByTimestampAsc(preConsultation.getId());
        
        String question = aiProvider.generateFollowUpQuestion(preConsultation.getChiefComplaint(), previous, textInput);

        PreConsultationResponse response = PreConsultationResponse.builder()
                .responseId("RES-" + UUID.randomUUID().toString().substring(0, 8))
                .preConsultation(preConsultation)
                .question(question)
                .answerText(textInput)
                .inputType("TEXT")
                .timestamp(LocalDateTime.now())
                .build();
        responseRepository.save(response);

        return question;
    }

    public String handleAudioInput(String appointmentId, MultipartFile audio) {
        if (audio.getSize() > 10_000_000) {
            throw new IllegalArgumentException("Audio file too large");
        }
        return speechProvider.transcribeAudio(audio);
    }

    private PreConsultation getByAppointmentId(String appointmentId) {
        Long id = appointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found")).getId();
        return preConsultationRepository.findByAppointment_Id(id)
                .orElseThrow(() -> new IllegalArgumentException("PreConsultation not found"));
    }

    @Transactional
    public PreConsultation completePreConsultation(String appointmentId) {
        PreConsultation preConsultation = getByAppointmentId(appointmentId);
        
        java.util.List<PreConsultationResponse> previous = responseRepository.findByPreConsultation_IdOrderByTimestampAsc(preConsultation.getId());
        StringBuilder fullConv = new StringBuilder("Initial complaint: ").append(preConsultation.getChiefComplaint()).append("\n");
        for (PreConsultationResponse r : previous) {
            fullConv.append("Doctor AI: ").append(r.getQuestion()).append("\n");
            fullConv.append("Patient: ").append(r.getAnswerText()).append("\n");
        }

        String summary = aiProvider.generateStructuredSummary(fullConv.toString());
        preConsultation.setAiSummary(summary);
        preConsultation.setAiGenerated(true);
        preConsultation.setStatus("COMPLETED");
        preConsultation.setCompletedAt(LocalDateTime.now());

        return preConsultationRepository.save(preConsultation);
    }
}

