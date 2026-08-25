package com.hospital.service;

import com.hospital.dto.AppointmentResponse;
import com.hospital.dto.BookAppointmentRequest;
import com.hospital.entity.*;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final QueueService queueService;

    @Transactional
    public AppointmentResponse bookAppointment(String mobile, BookAppointmentRequest request) {
        Patient patient = patientRepository.findByMobile(mobile)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        Doctor doctor = doctorRepository.findByDoctorId(request.getDoctorId())
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        Hospital hospital = hospitalRepository.findByHospitalId(request.getHospitalId())
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));

        Department department = departmentRepository.findByDepartmentId(request.getDepartmentId())
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        // Slot checking logic should be here.

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
                .slotEnd(request.getSlotEnd())
                .appointmentType(request.getAppointmentType())
                .status(AppointmentStatus.BOOKED)
                .reason(request.getReason())
                .build();

        appointment = appointmentRepository.save(appointment);

        // Atomic token generation
        QueueToken token = queueService.generateToken(appointment);
        appointment.setTokenId(token.getTokenId());
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
