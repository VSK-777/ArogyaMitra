package com.hospital.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.dto.SendOtpRequest;
import com.hospital.dto.VerifyOtpRequest;
import com.hospital.integration.otp.OtpProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OtpProvider otpProvider;

    @Test
    public void testSendOtp_Success() throws Exception {
        SendOtpRequest request = new SendOtpRequest();
        request.setMobile("9999999999");

        mockMvc.perform(post("/api/auth/patient/send-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    public void testVerifyOtp_Success() throws Exception {
        when(otpProvider.verifyOtp(anyString(), anyString())).thenReturn(true);

        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setMobile("9999999999");
        request.setOtp("123456");

        mockMvc.perform(post("/api/auth/patient/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists());
    }
    
    @Test
    public void testVerifyOtp_Invalid() throws Exception {
        when(otpProvider.verifyOtp(anyString(), anyString())).thenReturn(false);

        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setMobile("9999999999");
        request.setOtp("000000");

        mockMvc.perform(post("/api/auth/patient/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }
}
