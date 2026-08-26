package com.hospital.service;

import com.hospital.dto.AuthResponse;
import com.hospital.entity.Patient;
import com.hospital.entity.Role;
import com.hospital.entity.User;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import com.hospital.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    private String normalizeMobile(String mobile) {
        if (mobile == null) return "";
        String normalized = mobile.replaceAll("[^0-9]", "");
        if (normalized.length() == 12 && normalized.startsWith("91")) {
            normalized = normalized.substring(2);
        }
        return normalized;
    }

    @Transactional
    public void registerPatient(String mobile, String password) {
        String normalizedMobile = normalizeMobile(mobile);
        
        if (userRepository.findByMobile(normalizedMobile).isPresent()) {
            throw new RuntimeException("Mobile number is already registered.");
        }

        User user = User.builder()
                .userId("USR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .mobile(normalizedMobile)
                .passwordHash(passwordEncoder.encode(password))
                .role(Role.ROLE_PATIENT)
                .build();
        user = userRepository.save(user);

        Patient patient = Patient.builder()
                .patientId("PAT-" + String.format("%06d", userRepository.count()))
                .user(user)
                .mobile(normalizedMobile)
                .build();
        patientRepository.save(patient);
    }

    @Transactional(readOnly = true)
    public AuthResponse loginPatient(String mobile, String password) {
        String normalizedMobile = normalizeMobile(mobile);

        User user = userRepository.findByMobile(normalizedMobile)
                .orElseThrow(() -> new RuntimeException("Invalid mobile number or password."));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid mobile number or password.");
        }

        Patient patient = patientRepository.findByUser_Id(user.getId()).orElse(null);

        String token = jwtTokenProvider.generateToken(normalizedMobile, user.getRole().name(), user.getUserId());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getUserId())
                .role(user.getRole().name())
                .patientId(patient != null ? patient.getPatientId() : null)
                .build();
    }
}
