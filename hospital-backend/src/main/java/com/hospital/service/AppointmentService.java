package com.hospital.service;

import com.hospital.dto.AppointmentResponse;
import com.hospital.dto.BookAppointmentRequest;
import com.hospital.entity.*;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.List;
import org.springframework.security.core.context.SecurityContextHolder;
import com.razorpay.Utils;
import org.json.JSONObject;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentService.class);

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final QueueService queueService;
    private final com.hospital.repository.QueueTokenRepository queueTokenRepository;
    private final com.hospital.repository.DoctorUnavailabilityRepository unavailabilityRepository;

    @org.springframework.beans.factory.annotation.Value("${razorpay.key.secret:}")
    private String razorpaySecret;

    @org.springframework.beans.factory.annotation.Value("${hospital.appointment.grace-period-minutes:15}")
    private int gracePeriodMinutes;

    @org.springframework.beans.factory.annotation.Value("${hospital.appointment.check-in-window-minutes:30}")
    private int checkInWindowMinutes;

    @Transactional
    public void normalizePatientAppointments(Long patientId) {
        List<Appointment> appointments = appointmentRepository.findByPatient_Id(patientId);
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalTime now = java.time.LocalTime.now();
        boolean changed = false;

        for (Appointment a : appointments) {
            if (a.getStatus() == AppointmentStatus.BOOKED && a.getCheckInStatus() == com.hospital.entity.CheckInStatus.NOT_CHECKED_IN) {
                boolean isPast = a.getAppointmentDate().isBefore(today) || 
                                 (a.getAppointmentDate().isEqual(today) && a.getSlotStart() != null && 
                                  a.getSlotStart().plusMinutes(gracePeriodMinutes).isBefore(now));
                if (isPast) {
                    a.setStatus(AppointmentStatus.NO_SHOW);
                    changed = true;
                    com.hospital.entity.QueueToken token = queueTokenRepository.findByAppointment_Id(a.getId()).orElse(null);
                    if (token != null) {
                        token.setStatus(com.hospital.entity.TokenStatus.NO_SHOW);
                        queueTokenRepository.save(token);
                    }
                }
            }
        }
        if (changed) {
            appointmentRepository.saveAll(appointments);
        }
    }

    public AppointmentResponse bookAppointment(String mobile, BookAppointmentRequest request) {
        // Verify Payment for online patients
        boolean isPatient = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"));
            
        if (isPatient) {
            if (request.getRazorpayPaymentId() == null || request.getRazorpayOrderId() == null || request.getRazorpaySignature() == null) {
                throw new IllegalArgumentException("Payment details are required to book an appointment");
            }
            try {
                // If demo mode or missing razorpay secret, bypass verification
                if (razorpaySecret != null && !razorpaySecret.trim().isEmpty() && !request.getRazorpayPaymentId().startsWith("mock_")) {
                    JSONObject options = new JSONObject();
                    options.put("razorpay_payment_id", request.getRazorpayPaymentId());
                    options.put("razorpay_order_id", request.getRazorpayOrderId());
                    options.put("razorpay_signature", request.getRazorpaySignature());
                    boolean isValid = Utils.verifyPaymentSignature(options, razorpaySecret);
                    if (!isValid) {
                        throw new SecurityException("Invalid payment signature");
                    }
                }
            } catch (Exception e) {
                throw new SecurityException("Payment verification failed", e);
            }
        }
        // 1. Find patient from authenticated mobile
        Patient patient = patientRepository.findByMobile(mobile)
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found. Please complete your registration."));

        // 2. Find hospital by numeric ID
        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                .orElseThrow(() -> new IllegalArgumentException("The selected hospital is no longer available. Please refresh and try again."));

        // 3. Find department by numeric ID
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new IllegalArgumentException("The selected department is no longer available. Please refresh and try again."));

        // 4. Find doctor by numeric ID
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new IllegalArgumentException("The selected doctor is no longer available. Please refresh and try again."));

        // 5. Validate appointment date is not in the past
        if (request.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Appointment date cannot be in the past. Please select a future date.");
        }

        // 5.5 Validate doctor is available on this date
        if (unavailabilityRepository.isDoctorUnavailableOnDate(doctor.getId(), request.getAppointmentDate())) {
            throw new IllegalStateException("The selected doctor is unavailable on this date due to an urgent hospital responsibility.");
        }

        // 6. Default appointmentType to ONLINE if not provided
        AppointmentType appointmentType = request.getAppointmentType() != null
                ? request.getAppointmentType()
                : AppointmentType.ONLINE;

        // 7. Find available 15-minute slot in the requested hour
        int hour = request.getSlotStart().getHour();
        java.util.List<Appointment> existingInHour = appointmentRepository.findByDoctor_IdAndAppointmentDate(doctor.getId(), request.getAppointmentDate())
            .stream()
            .filter(a -> a.getStatus() == AppointmentStatus.BOOKED && a.getSlotStart() != null && a.getSlotStart().getHour() == hour)
            .toList();

        if (existingInHour.size() >= 4) {
            throw new IllegalStateException("This time slot is fully booked. Please select another slot.");
        }

        java.time.LocalTime exactSlotStart = null;
        for (int i = 0; i < 4; i++) {
            java.time.LocalTime candidate = request.getSlotStart().withMinute(i * 15).withSecond(0).withNano(0);
            boolean taken = existingInHour.stream().anyMatch(a -> a.getSlotStart().equals(candidate));
            if (!taken) {
                exactSlotStart = candidate;
                break;
            }
        }

        if (exactSlotStart == null) {
            throw new IllegalStateException("This time slot is fully booked. Please select another slot.");
        }

        java.time.LocalTime exactSlotEnd = exactSlotStart.plusMinutes(15);

        // 9. Create the appointment
        String dateStr = request.getAppointmentDate().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uniqueId = "APT-" + dateStr + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Appointment appointment = Appointment.builder()
                .appointmentId(uniqueId)
                .patient(patient)
                .hospital(hospital)
                .department(department)
                .doctor(doctor)
                .appointmentDate(request.getAppointmentDate())
                .slotStart(exactSlotStart)
                .slotEnd(exactSlotEnd)
                .appointmentType(appointmentType)
                .status(AppointmentStatus.BOOKED)
                .reason(request.getReason())
                .build();

        appointment = appointmentRepository.save(appointment);
        logger.info("Appointment created: {} for patient {} with doctor {}", uniqueId, patient.getPatientId(), doctor.getDoctorId());

        // 10. Generate queue token
        QueueToken token = queueService.generateToken(appointment);
        appointment.setTokenId(String.format("T-%03d", token.getTokenNumber()));
        appointment = appointmentRepository.save(appointment);

        return AppointmentResponse.builder()
                .appointmentId(appointment.getAppointmentId())
                .patientId(patient.getPatientId())
                .doctorName(doctor.getName())
                .departmentName(department.getName())
                .hospitalName(hospital.getName())
                .appointmentDate(appointment.getAppointmentDate())
                .slotStart(appointment.getSlotStart())
                .status(appointment.getStatus())
                .tokenId(appointment.getTokenId())
                .build();
    }

    @Transactional
    public void checkIn(String mobile, String appointmentId) {
        Patient patient = patientRepository.findByMobile(mobile)
            .orElseThrow(() -> new IllegalArgumentException("Patient not found."));

        Appointment appointment = appointmentRepository.findByAppointmentId(appointmentId)
            .orElseThrow(() -> new IllegalArgumentException("Appointment not found."));

        if (!appointment.getPatient().getId().equals(patient.getId())) {
            throw new SecurityException("You can only check in for your own appointments.");
        }

        if (appointment.getStatus() != AppointmentStatus.BOOKED) {
            throw new IllegalStateException("Appointment is not in BOOKED state.");
        }

        if (appointment.getCheckInStatus() != com.hospital.entity.CheckInStatus.NOT_CHECKED_IN) {
            throw new IllegalStateException("Already checked in or in consultation.");
        }

        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalTime now = java.time.LocalTime.now();

        if (appointment.getAppointmentDate().isAfter(today)) {
            throw new IllegalStateException("Cannot check in before the appointment date.");
        }
        if (appointment.getAppointmentDate().isBefore(today)) {
            throw new IllegalStateException("Appointment date has passed.");
        }

        if (appointment.getSlotStart() != null) {
            java.time.LocalTime windowStart = appointment.getSlotStart().minusMinutes(checkInWindowMinutes);
            if (now.isBefore(windowStart)) {
                throw new IllegalStateException("Check-in is not yet open. Opens " + checkInWindowMinutes + " mins before slot.");
            }
            java.time.LocalTime expiryTime = appointment.getSlotStart().plusMinutes(gracePeriodMinutes);
            if (now.isAfter(expiryTime)) {
                appointment.setStatus(AppointmentStatus.NO_SHOW);
                appointmentRepository.save(appointment);
                throw new IllegalStateException("Appointment time has passed and was marked as NO_SHOW.");
            }
        }

        appointment.setCheckInStatus(com.hospital.entity.CheckInStatus.CHECKED_IN);
        appointmentRepository.save(appointment);

        com.hospital.entity.QueueToken token = queueTokenRepository.findByAppointment_Id(appointment.getId()).orElse(null);
        if (token != null) {
            token.setStatus(com.hospital.entity.TokenStatus.WAITING);
            queueTokenRepository.save(token);
        }
    }
}

