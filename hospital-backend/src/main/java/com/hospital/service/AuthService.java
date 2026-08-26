package com.hospital.service;

import com.hospital.dto.AuthResponse;
import com.hospital.entity.Patient;
import com.hospital.entity.Role;
import com.hospital.entity.User;
import com.hospital.exception.InvalidOtpException;
import com.hospital.integration.otp.OtpProvider;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import com.hospital.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final OtpService otpService;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public void sendPatientOtp(String mobile) {
        otpService.generateAndSendOtp(mobile);
    }

    @Transactional
    public AuthResponse verifyPatientOtp(String mobile, String otp) {
        boolean isValid = otpService.verifyOtp(mobile, otp);
        if (!isValid) {
            throw new InvalidOtpException("Invalid OTP");
        }

        String normalized = mobile.replaceAll("[^0-9]", "");
        if (normalized.length() == 12 && normalized.startsWith("91")) {
            normalized = normalized.substring(2);
        }
        final String searchMobile = normalized;

        User user = userRepository.findByMobile(searchMobile).orElseGet(() -> createNewPatientUser(searchMobile));
        Patient patient = patientRepository.findByUser_Id(user.getId()).orElse(null);

        String token = jwtTokenProvider.generateToken(searchMobile, user.getRole().name(), user.getUserId());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getUserId())
                .role(user.getRole().name())
                .patientId(patient != null ? patient.getPatientId() : null)
                .build();
    }

    private User createNewPatientUser(String mobile) {
        User user = User.builder()
                .userId("USR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .mobile(mobile)
                .role(Role.ROLE_PATIENT)
                .build();
        user = userRepository.save(user);

        Patient patient = Patient.builder()
                .patientId("PAT-" + String.format("%06d", userRepository.count()))
                .user(user)
                .mobile(mobile)
                .build();
        patientRepository.save(patient);

        return user;
    }
}
