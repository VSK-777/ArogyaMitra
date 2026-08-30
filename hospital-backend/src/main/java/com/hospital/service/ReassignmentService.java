package com.hospital.service;

import com.hospital.entity.*;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReassignmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final QueueService queueService;
    private final QueueTokenRepository queueTokenRepository;
    private final AppointmentReassignmentRepository reassignmentRepository;
    private final NotificationRepository notificationRepository;
    private final AppointmentService appointmentService;

    @Transactional
    public void markDoctorUnavailable(Long doctorId, LocalDate date, String reason) {
        List<Appointment> appointments = appointmentRepository.findByDoctor_IdAndAppointmentDate(doctorId, date);
        for (Appointment app : appointments) {
            if (app.getStatus() == AppointmentStatus.BOOKED || app.getStatus() == AppointmentStatus.REASSIGNED) {
                app.setStatus(AppointmentStatus.REASSIGNMENT_PENDING);
                app.setReassignmentReason(reason);
                appointmentRepository.save(app);
                
                Notification notif = Notification.builder()
                        .patient(app.getPatient())
                        .type("REASSIGNMENT_PENDING")
                        .message("We're sorry for the inconvenience. Your scheduled doctor is temporarily unavailable due to an urgent hospital responsibility. We are arranging the earliest available consultation with another suitable doctor.")
                        .isRead(false)
                        .build();
                notificationRepository.save(notif);
            }
        }
    }

    public List<Map<String, Object>> getAffectedAppointments(Long doctorId, LocalDate date) {
        List<Appointment> appointments = appointmentRepository.findByDoctor_IdAndAppointmentDate(doctorId, date);
        return appointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.REASSIGNMENT_PENDING)
                .map(a -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("appointmentId", a.getId());
                    map.put("patientName", a.getPatient().getFullName());
                    map.put("slotStart", a.getSlotStart().toString());
                    map.put("department", a.getDepartment().getName());
                    map.put("token", a.getTokenId());
                    return map;
                }).collect(Collectors.toList());
    }

    private List<String> getAvailableSlotsForDoctor(Long doctorId, LocalDate date) {
        List<Appointment> booked = appointmentRepository.findByDoctor_IdAndAppointmentDate(doctorId, date);
        Map<Integer, Long> hourCounts = booked.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.BOOKED || a.getStatus() == AppointmentStatus.REASSIGNED)
                .collect(Collectors.groupingBy(
                        a -> a.getSlotStart().getHour(),
                        Collectors.counting()
                ));
                
        List<String> available = new ArrayList<>();
        // Assume working hours 9 AM to 5 PM (17:00)
        for (int hour = 9; hour < 17; hour++) {
            long count = hourCounts.getOrDefault(hour, 0L);
            if (count < 4) { // Max 4 per hour
                available.add(String.format("%02d:00", hour));
            }
        }
        return available;
    }

    public List<Map<String, Object>> findReplacements(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId).orElseThrow(() -> new RuntimeException("Appointment not found"));
        Long departmentId = appointment.getDepartment().getId();
        LocalDate date = appointment.getAppointmentDate();
        
        List<Doctor> departmentDoctors = doctorRepository.findByDepartment_Id(departmentId);
        List<Map<String, Object>> options = new ArrayList<>();
        
        for (Doctor doc : departmentDoctors) {
            if (doc.getId().equals(appointment.getDoctor().getId())) continue;
            
            // Generate slots to find availability
            List<String> availableSlots = getAvailableSlotsForDoctor(doc.getId(), date);
            if (!availableSlots.isEmpty()) {
                // Return the earliest available slot for this doctor
                String earliestSlot = availableSlots.get(0);
                Map<String, Object> option = new HashMap<>();
                option.put("doctorId", doc.getId());
                option.put("doctorName", doc.getUser().getName());
                option.put("slotStart", earliestSlot);
                options.add(option);
            }
        }
        
        return options;
    }

    @Transactional
    public void reassignAppointment(Long appointmentId, Long newDoctorId, String newSlotStartStr) {
        Appointment app = appointmentRepository.findById(appointmentId).orElseThrow(() -> new RuntimeException("Appointment not found"));
        Doctor newDoctor = doctorRepository.findById(newDoctorId).orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        LocalTime newSlotStart = LocalTime.parse(newSlotStartStr);
        LocalTime newSlotEnd = newSlotStart.plusMinutes(15); // Wait, frontend creates slots by hour "10:00". Let's stick to what's requested
        
        // Final availability check
        long overlapping = appointmentRepository.findByDoctor_IdAndAppointmentDate(newDoctorId, app.getAppointmentDate()).stream()
            .filter(a -> a.getStatus() == AppointmentStatus.BOOKED || a.getStatus() == AppointmentStatus.REASSIGNED)
            .filter(a -> a.getSlotStart().getHour() == newSlotStart.getHour())
            .count();
        
        if (overlapping >= 4) {
            throw new RuntimeException("That appointment slot is no longer available.");
        }

        // Save History
        AppointmentReassignment history = AppointmentReassignment.builder()
                .appointment(app)
                .originalDoctor(app.getDoctor())
                .newDoctor(newDoctor)
                .originalSlotStart(app.getAppointmentDate().atTime(app.getSlotStart()))
                .newSlotStart(app.getAppointmentDate().atTime(newSlotStart))
                .originalToken(app.getTokenId())
                .reason(app.getReassignmentReason())
                .reassignedBy("ADMIN")
                .build();
                
        // Set original fields if not already set
        if (app.getOriginalDoctor() == null) {
            app.setOriginalDoctor(app.getDoctor());
            app.setOriginalSlotStart(app.getSlotStart());
            app.setOriginalTokenId(app.getTokenId());
        }

        // Generate new token
        QueueToken oldToken = queueTokenRepository.findByAppointment_Id(app.getId()).orElse(null);
        if (oldToken != null) {
            queueTokenRepository.delete(oldToken);
        }

        app.setDoctor(newDoctor);
        app.setSlotStart(newSlotStart);
        app.setSlotEnd(newSlotStart.plusMinutes(15));
        app.setStatus(AppointmentStatus.REASSIGNED);
        
        QueueToken newToken = queueService.generateToken(app);
        app.setTokenId(String.format("T-%03d", newToken.getTokenNumber()));
        
        history.setNewToken(app.getTokenId());
        reassignmentRepository.save(history);
        appointmentRepository.save(app);

        // Notify patient
        Notification notif = Notification.builder()
                .patient(app.getPatient())
                .type("APPOINTMENT_REASSIGNED")
                .message(String.format("Your appointment has been reassigned to %s. New Time: %s. New Token: %s.", 
                        newDoctor.getUser().getName(), newSlotStart.toString(), app.getTokenId()))
                .isRead(false)
                .build();
        notificationRepository.save(notif);
    }
}
