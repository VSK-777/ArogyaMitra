package com.hospital.service;

import com.hospital.entity.*;
import com.hospital.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Map;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FeedbackServiceTest {

    @Mock private DoctorFeedbackRepository feedbackRepository;
    @Mock private AppointmentRepository appointmentRepository;

    @InjectMocks
    private FeedbackService feedbackService;

    private Appointment appointment;
    private Doctor doctor;
    private Patient patient;

    @BeforeEach
    void setUp() {
        patient = new Patient();
        patient.setId(1L);

        doctor = new Doctor();
        doctor.setId(2L);

        appointment = new Appointment();
        appointment.setId(10L);
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setStatus(com.hospital.entity.AppointmentStatus.COMPLETED);
    }

    @Test
    void submitFeedback_ShouldSaveAndReturnFeedback() {
        when(appointmentRepository.findById(10L)).thenReturn(Optional.of(appointment));
        when(feedbackRepository.existsByAppointment_Id(10L)).thenReturn(false);
        when(feedbackRepository.save(any(DoctorFeedback.class))).thenAnswer(i -> i.getArguments()[0]);

        DoctorFeedback result = feedbackService.submitFeedback(10L, 5, "Great doctor!", false);

        assertNotNull(result);
        assertEquals(5, result.getRating());
        assertEquals("Great doctor!", result.getComments());
        verify(feedbackRepository, times(1)).save(any(DoctorFeedback.class));
    }

    @Test
    void submitFeedback_ShouldThrowException_WhenRatingInvalid() {
        assertThrows(IllegalArgumentException.class, () -> {
            feedbackService.submitFeedback(10L, 6, "Excellent", false);
        });
    }

    @Test
    void submitFeedback_ShouldThrowException_WhenNotCompleted() {
        appointment.setStatus(com.hospital.entity.AppointmentStatus.BOOKED);
        when(appointmentRepository.findById(10L)).thenReturn(Optional.of(appointment));
        
        assertThrows(IllegalStateException.class, () -> {
            feedbackService.submitFeedback(10L, 4, "Good", false);
        });
    }

    @Test
    void getDoctorRatingStats_ShouldReturnAverages() {
        when(feedbackRepository.getAverageRatingForDoctor(2L)).thenReturn(4.56);
        when(feedbackRepository.countFeedbackForDoctor(2L)).thenReturn(10L);

        Map<String, Object> stats = feedbackService.getDoctorRatingStats(2L);

        assertEquals(4.6, stats.get("averageRating"));
        assertEquals(10L, stats.get("totalReviews"));
    }
}
