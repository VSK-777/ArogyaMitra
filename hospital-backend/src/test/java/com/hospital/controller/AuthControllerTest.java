package com.hospital.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.dto.LoginRequest;
import com.hospital.dto.PatientRegistrationRequest;
import com.hospital.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    public void testRegister_Success() throws Exception {
        PatientRegistrationRequest request = new PatientRegistrationRequest();
        request.setMobile("9999999999");
        request.setPassword("Patient@123");
        request.setFullName("Test User");

        mockMvc.perform(post("/api/auth/patient/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    public void testRegister_Duplicate() throws Exception {
        doThrow(new RuntimeException("Mobile number is already registered."))
            .when(authService).registerPatient(anyString(), anyString(), anyString());

        PatientRegistrationRequest request = new PatientRegistrationRequest();
        request.setMobile("9999999999");
        request.setPassword("Patient@123");
        request.setFullName("Test User");

        mockMvc.perform(post("/api/auth/patient/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    public void testLogin_Success() throws Exception {
        com.hospital.dto.AuthResponse mockResponse = com.hospital.dto.AuthResponse.builder()
                .token("mock-jwt-token")
                .userId("USR-123")
                .role("ROLE_PATIENT")
                .build();
                
        when(authService.login(anyString(), anyString(), anyString())).thenReturn(mockResponse);

        LoginRequest request = new LoginRequest();
        request.setMobile("9999999999");
        request.setPassword("Patient@123");
        request.setRole("PATIENT");

        mockMvc.perform(post("/api/auth/patient/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists());
    }
    
    @Test
    public void testLogin_Invalid() throws Exception {
        when(authService.login(anyString(), anyString(), anyString())).thenThrow(new RuntimeException("Invalid mobile number or password."));

        LoginRequest request = new LoginRequest();
        request.setMobile("9999999999");
        request.setPassword("WrongPassword");
        request.setRole("PATIENT");

        mockMvc.perform(post("/api/auth/patient/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }
}
