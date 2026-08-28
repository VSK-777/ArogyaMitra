package com.hospital.service;

import com.hospital.dto.AuthResponse;
import com.hospital.entity.Patient;
import com.hospital.entity.Doctor;
import com.hospital.entity.Role;
import com.hospital.entity.User;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import com.hospital.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.Optional;
import com.hospital.util.MobileUtils;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;



    @Transactional
    public void registerPatient(String mobile, String password, String fullName) {
        String normalizedMobile = MobileUtils.normalizeMobile(mobile);
        String trimmedName = fullName != null ? fullName.trim() : null;
        
        if (userRepository.findByMobile(normalizedMobile).isPresent()) {
            throw new RuntimeException("Mobile number is already registered.");
        }

        Optional<Patient> existingPatientOpt = patientRepository.findByMobile(normalizedMobile);

        User user = User.builder()
                .userId("USR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .mobile(normalizedMobile)
                .name(trimmedName)
                .passwordHash(passwordEncoder.encode(password))
                .role(Role.ROLE_PATIENT)
                .build();
        user = userRepository.save(user);

        if (existingPatientOpt.isPresent()) {
            Patient existingPatient = existingPatientOpt.get();
            existingPatient.setUser(user);
            if (existingPatient.getFullName() == null || existingPatient.getFullName().trim().isEmpty()) {
                existingPatient.setFullName(trimmedName);
            }
            patientRepository.save(existingPatient);
        } else {
            Patient patient = Patient.builder()
                    .patientId("PAT-" + String.format("%06d", userRepository.count()))
                    .user(user)
                    .fullName(trimmedName)
                    .mobile(normalizedMobile)
                    .build();
            patientRepository.save(patient);
        }
    }

    @Transactional(readOnly = true)
    public AuthResponse login(String mobile, String password, String requestedRole) {
        String normalizedMobile = MobileUtils.normalizeMobile(mobile);

        User user = userRepository.findByMobile(normalizedMobile)
                .orElseThrow(() -> new RuntimeException("Invalid credentials or login role."));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials or login role.");
        }

        String actualRole = user.getRole().name();
        String expectedRole = "ROLE_" + requestedRole.toUpperCase();
        
        if (!actualRole.equals(expectedRole)) {
            throw new RuntimeException("Role mismatch. You are not authorized to login as this role.");
        }

        Patient patient = patientRepository.findByUser_Id(user.getId()).orElse(null);
        Doctor doctor = null;
        if (user.getRole() == Role.ROLE_DOCTOR) {
            doctor = doctorRepository.findByUser_Id(user.getId()).orElse(null);
        }

        String token = jwtTokenProvider.generateToken(normalizedMobile, user.getRole().name(), user.getUserId());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getUserId())
                .name(user.getName() != null ? user.getName() : (patient != null ? patient.getFullName() : (doctor != null ? doctor.getName() : "User")))
                .mobile(user.getMobile())
                .role(user.getRole().name())
                .patientId(patient != null ? patient.getPatientId() : null)
                .doctorId(doctor != null ? doctor.getDoctorId() : null)
                .hospitalId(user.getHospitalId())
                .department(doctor != null && doctor.getDepartment() != null ? doctor.getDepartment().getName() : null)
                .build();
    }
}
