package com.hospital.controller;

import com.hospital.entity.DoctorFeedback;
import com.hospital.service.FeedbackService;
import com.hospital.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<DoctorFeedback>> submitFeedback(
            @RequestParam Long appointmentId,
            @RequestParam Integer rating,
            @RequestParam(required = false) String comments,
            @RequestParam(defaultValue = "false") Boolean isAnonymous) {
        
        DoctorFeedback feedback = feedbackService.submitFeedback(appointmentId, rating, comments, isAnonymous);
        return ResponseEntity.ok(ApiResponse.success("Feedback submitted successfully", feedback));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<DoctorFeedback>>> getDoctorFeedback(@PathVariable Long doctorId) {
        List<DoctorFeedback> feedbackList = feedbackService.getFeedbackForDoctor(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor feedback retrieved", feedbackList));
    }

    @GetMapping("/doctor/{doctorId}/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDoctorStats(@PathVariable Long doctorId) {
        Map<String, Object> stats = feedbackService.getDoctorRatingStats(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor rating statistics retrieved", stats));
    }
}
