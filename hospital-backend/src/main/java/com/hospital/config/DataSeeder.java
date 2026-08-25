package com.hospital.config;

import com.hospital.entity.*;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (hospitalRepository.count() == 0) {
            seedData();
        }
    }

    private void seedData() {
        // Seed Hospital
        Hospital hospital = Hospital.builder()
                .hospitalId("HSP-001")
                .name("City General Hospital")
                .address("123 Health Ave, Medical District")
                .phone("1800-123-4567")
                .email("contact@citygeneral.com")
                .build();
        hospital = hospitalRepository.save(hospital);

        // Seed Departments
        Department cardio = departmentRepository.save(Department.builder()
                .departmentId("DEPT-CARD")
                .hospital(hospital)
                .name("Cardiology")
                .description("Heart and cardiovascular diseases")
                .build());

        Department ortho = departmentRepository.save(Department.builder()
                .departmentId("DEPT-ORTH")
                .hospital(hospital)
                .name("Orthopedics")
                .description("Bone and joint care")
                .build());
                
        Department genMed = departmentRepository.save(Department.builder()
                .departmentId("DEPT-GENM")
                .hospital(hospital)
                .name("General Medicine")
                .description("Primary care and general diseases")
                .build());

        // Seed Doctors
        createDoctor("DOC-001", "Dr. Ramesh Sharma", cardio, hospital, "9876543210", "MD, DM Cardiology", 15, 1000);
        createDoctor("DOC-002", "Dr. Priya Desai", ortho, hospital, "9876543211", "MS Orthopedics", 10, 800);
        createDoctor("DOC-003", "Dr. Anil Kumar", genMed, hospital, "9876543212", "MD General Medicine", 5, 500);

        // Seed a Patient
        User pUser = userRepository.save(User.builder()
                .userId("USR-PAT-001")
                .mobile("9999999999")
                .role(Role.ROLE_PATIENT)
                .name("Rahul Verma")
                .build());

        patientRepository.save(Patient.builder()
                .patientId("PAT-000001")
                .user(pUser)
                .fullName("Rahul Verma")
                .mobile("9999999999")
                .dateOfBirth(LocalDate.of(1990, 5, 15))
                .gender("Male")
                .bloodGroup("O+")
                .build());
                
        System.out.println("Demo Data Seeded Successfully!");
    }

    private void createDoctor(String docId, String name, Department dept, Hospital hsp, String mobile, String qual, int exp, int fee) {
        User user = userRepository.save(User.builder()
                .userId("USR-" + docId)
                .mobile(mobile)
                .role(Role.ROLE_DOCTOR)
                .name(name)
                .hospitalId(hsp.getId())
                .build());

        doctorRepository.save(Doctor.builder()
                .doctorId(docId)
                .user(user)
                .hospital(hsp)
                .department(dept)
                .name(name)
                .specialization(dept.getName())
                .qualification(qual)
                .experience(exp)
                .consultationFee(BigDecimal.valueOf(fee))
                .build());
    }
}
