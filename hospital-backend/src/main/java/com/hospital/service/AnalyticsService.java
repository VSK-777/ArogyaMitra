package com.hospital.service;

import com.hospital.entity.AppointmentStatus;
import com.hospital.entity.TokenStatus;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final ConsultationRepository consultationRepository;
    private final QueueTokenRepository queueTokenRepository;
    private final AuditLogRepository auditLogRepository;

    public Map<String, Object> getDashboardAnalytics() {
        Map<String, Object> data = new HashMap<>();
        
        // Core counts
        data.put("totalPatients", patientRepository.count());
        data.put("totalDoctors", doctorRepository.count());
        data.put("totalDepartments", departmentRepository.count());
        data.put("totalAppointments", appointmentRepository.count());
        data.put("totalConsultations", consultationRepository.count());
        
        // Today's stats
        LocalDate today = LocalDate.now();
        long todayAppointments = appointmentRepository.countByAppointmentDate(today);
        long todayWaiting = queueTokenRepository.countByQueueDateAndStatus(today, TokenStatus.WAITING);
        long todayCompleted = queueTokenRepository.countByQueueDateAndStatus(today, TokenStatus.COMPLETED);
        
        data.put("todayAppointments", todayAppointments);
        data.put("todayWaiting", todayWaiting);
        data.put("todayCompleted", todayCompleted);
        
        // Recent audit logs count
        data.put("recentAuditCount", auditLogRepository.findTop50ByOrderByCreatedAtDesc().size());
        
        return data;
    }
}
