package com.hospital.service;

import com.hospital.entity.*;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

/**
 * Feature: Patient Feedback and Rating System
 * 
 * Allows patients to submit feedback and ratings for completed consultations,
 * enabling the hospital administration to track doctor performance and patient satisfaction.
 */
@Service
@RequiredArgsConstructor
public class FeedbackService {

    private static final Logger log = LoggerFactory.getLogger(FeedbackService.class);

    private final DoctorFeedbackRepository feedbackRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public DoctorFeedback submitFeedback(Long appointmentId, Integer rating, String comments, Boolean isAnonymous) {
        log.info("Submitting feedback for appointment ID: {}", appointmentId);
        
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        
        if (feedbackRepository.existsByAppointment_Id(appointmentId)) {
            throw new IllegalStateException("Feedback already submitted for this appointment");
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (!"COMPLETED".equalsIgnoreCase(appointment.getStatus())) {
            throw new IllegalStateException("Can only review completed appointments");
        }

        DoctorFeedback feedback = DoctorFeedback.builder()
                .appointment(appointment)
                .patient(appointment.getPatient())
                .doctor(appointment.getDoctor())
                .rating(rating)
                .comments(comments)
                .isAnonymous(isAnonymous != null ? isAnonymous : false)
                .build();

        return feedbackRepository.save(feedback);
    }

    @Transactional(readOnly = true)
    public List<DoctorFeedback> getFeedbackForDoctor(Long doctorId) {
        log.info("Fetching feedback for doctor ID: {}", doctorId);
        return feedbackRepository.findByDoctor_IdOrderByCreatedAtDesc(doctorId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDoctorRatingStats(Long doctorId) {
        Double avg = feedbackRepository.getAverageRatingForDoctor(doctorId);
        Long count = feedbackRepository.countFeedbackForDoctor(doctorId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("doctorId", doctorId);
        stats.put("averageRating", avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        stats.put("totalReviews", count);
        
        return stats;
    }
}
