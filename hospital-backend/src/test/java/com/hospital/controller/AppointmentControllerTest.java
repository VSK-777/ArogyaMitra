package com.hospital.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.dto.BookAppointmentRequest;
import com.hospital.entity.Hospital;
import com.hospital.entity.Department;
import com.hospital.entity.Doctor;
import com.hospital.entity.Patient;
import com.hospital.entity.User;
import com.hospital.entity.Role;
import com.hospital.repository.HospitalRepository;
import com.hospital.repository.DepartmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
public class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private HospitalRepository hospitalRepository;
    @Autowired
    private DepartmentRepository departmentRepository;
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private UserRepository userRepository;

    private Hospital hospital;
    private Department dept;
    private Doctor doctor;
    private Patient patient;

    @BeforeEach
    public void setup() {
        hospital = hospitalRepository.save(Hospital.builder().hospitalId("H-TEST").name("Test Hospital").build());
        dept = departmentRepository.save(Department.builder().departmentId("D-TEST").name("Test Dept").hospital(hospital).build());
        
        User docUser = userRepository.save(User.builder().userId("U-DOC").mobile("111").role(Role.ROLE_DOCTOR).build());
        doctor = doctorRepository.save(Doctor.builder().doctorId("DOC-TEST").name("Dr. Test").hospital(hospital).department(dept).user(docUser).build());
        
        User patUser = userRepository.save(User.builder().userId("U-PAT").mobile("1787739252").role(Role.ROLE_PATIENT).build());
        patient = patientRepository.save(Patient.builder().patientId("P-TEST").mobile("1787739252").user(patUser).build());
    }

    @Test
    @WithMockUser(username = "1787739252", roles = "PATIENT")
    public void testBookAppointment_Success() throws Exception {
        BookAppointmentRequest req = new BookAppointmentRequest();
        req.setHospitalId(hospital.getHospitalId());
        req.setDepartmentId(dept.getDepartmentId());
        req.setDoctorId(doctor.getDoctorId());
        req.setAppointmentDate(LocalDate.now().plusDays(1));
        req.setSlotStart(LocalTime.of(10, 0));
        req.setSlotEnd(LocalTime.of(10, 30));
        req.setAppointmentType(com.hospital.entity.AppointmentType.WALK_IN);

        mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.appointmentId").exists())
                .andExpect(jsonPath("$.data.tokenId").exists());
    }
}
