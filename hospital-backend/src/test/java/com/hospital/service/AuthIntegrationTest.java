package com.hospital.service;

import com.hospital.entity.Patient;
import com.hospital.entity.Role;
import com.hospital.entity.User;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AuthIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Test
    public void testRegistration_ScenarioA_NewPatient() {
        String mobile = "9998887771";
        
        assertTrue(userRepository.findByMobile(mobile).isEmpty());
        assertTrue(patientRepository.findByMobile(mobile).isEmpty());

        authService.registerPatient(mobile, "password123", "Test User");

        Optional<User> userOpt = userRepository.findByMobile(mobile);
        assertTrue(userOpt.isPresent());
        
        Optional<Patient> patientOpt = patientRepository.findByMobile(mobile);
        assertTrue(patientOpt.isPresent());
        
        assertEquals(userOpt.get().getId(), patientOpt.get().getUser().getId());
    }

    @Test
    public void testRegistration_ScenarioB_ExistingPatientNoUser() {
        String mobile = "9998887772";
        
        Patient patient = Patient.builder()
                .patientId("PAT-TEST-002")
                .fullName("Walkin Test")
                .mobile(mobile)
                .build();
        patientRepository.save(patient);
        
        assertTrue(userRepository.findByMobile(mobile).isEmpty());
        assertTrue(patientRepository.findByMobile(mobile).isPresent());

        authService.registerPatient(mobile, "password123", "Test User");

        Optional<User> userOpt = userRepository.findByMobile(mobile);
        assertTrue(userOpt.isPresent());
        
        Optional<Patient> patientOpt = patientRepository.findByMobile(mobile);
        assertTrue(patientOpt.isPresent());
        
        assertNotNull(patientOpt.get().getUser());
        assertEquals(userOpt.get().getId(), patientOpt.get().getUser().getId());
        
        assertEquals(1, patientRepository.findAll().stream().filter(p -> mobile.equals(p.getMobile())).count());
    }

    @Test
    public void testRegistration_ScenarioC_ExistingUser() {
        String mobile = "9998887773";
        
        User user = User.builder()
                .userId("USR-TEST-003")
                .mobile(mobile)
                .passwordHash("hash")
                .role(Role.ROLE_PATIENT)
                .build();
        userRepository.save(user);

        Patient patient = Patient.builder()
                .patientId("PAT-TEST-003")
                .user(user)
                .mobile(mobile)
                .build();
        patientRepository.save(patient);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.registerPatient(mobile, "password123", "Test User");
        });
        
        assertTrue(exception.getMessage().contains("already registered"));
    }

    @Test
    public void testLogin_Success_NoInserts() {
        String mobile = "9998887774";
        String rawPassword = "password123";
        
        authService.registerPatient(mobile, rawPassword, "Test User");
        
        long userCountBefore = userRepository.count();
        long patientCountBefore = patientRepository.count();

        var response = authService.loginPatient(mobile, rawPassword);
        
        assertNotNull(response.getToken());
        assertEquals("ROLE_PATIENT", response.getRole());

        assertEquals(userCountBefore, userRepository.count());
        assertEquals(patientCountBefore, patientRepository.count());
    }
}
