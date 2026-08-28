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

    @org.springframework.beans.factory.annotation.Value("${razorpay.key.secret:}")
    private String razorpaySecret;

    @Transactional
    public void normalizePatientAppointments(Long patientId) {
        List<Appointment> appointments = appointmentRepository.findByPatient_Id(patientId);
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalTime now = java.time.LocalTime.now();
        boolean changed = false;

        for (Appointment a : appointments) {
            if (a.getStatus() == AppointmentStatus.BOOKED) {
                boolean isPast = a.getAppointmentDate().isBefore(today) || 
                                 (a.getAppointmentDate().isEqual(today) && a.getSlotStart() != null && a.getSlotStart().isBefore(now));
                if (isPast) {
                    a.setStatus(AppointmentStatus.NOT_VISITED);
                    changed = true;
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
                JSONObject options = new JSONObject();
                options.put("razorpay_payment_id", request.getRazorpayPaymentId());
                options.put("razorpay_order_id", request.getRazorpayOrderId());
                options.put("razorpay_signature", request.getRazorpaySignature());
                boolean isValid = Utils.verifyPaymentSignature(options, razorpaySecret);
                if (!isValid) {
                    throw new SecurityException("Invalid payment signature");
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

        // 6. Default appointmentType to ONLINE if not provided
        AppointmentType appointmentType = request.getAppointmentType() != null
                ? request.getAppointmentType()
                : AppointmentType.ONLINE;

        // 7. Default slotEnd to slotStart + 30 minutes if not provided
        var slotEnd = request.getSlotEnd() != null
                ? request.getSlotEnd()
                : request.getSlotStart().plusMinutes(30);

        // 8. Check for duplicate booking (same doctor, same date, same slot, not cancelled)
        boolean slotTaken = appointmentRepository
                .existsByDoctor_IdAndAppointmentDateAndSlotStartAndStatus(
                        doctor.getId(),
                        request.getAppointmentDate(),
                        request.getSlotStart(),
                        AppointmentStatus.BOOKED
                );
        if (slotTaken) {
            throw new IllegalStateException("This appointment slot is no longer available. Please select another slot.");
        }

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
                .slotStart(request.getSlotStart())
                .slotEnd(slotEnd)
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
}

