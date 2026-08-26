package com.hospital.config;

import com.hospital.entity.*;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (hospitalRepository.count() == 0) {
            seedData();
        }
    }

    private void seedData() {
        // =================== HOSPITAL ===================
        Hospital hospital = Hospital.builder()
                .hospitalId("HSP-001")
                .name("City General Hospital")
                .address("123 Health Ave, Medical District")
                .phone("1800-123-4567")
                .email("contact@citygeneral.com")
                .build();
        hospital = hospitalRepository.save(hospital);

        // =================== DEPARTMENTS ===================
        Department cardio = departmentRepository.save(Department.builder()
                .departmentId("DEPT-CARD").hospital(hospital)
                .name("Cardiology").description("Heart and cardiovascular diseases").build());

        Department ortho = departmentRepository.save(Department.builder()
                .departmentId("DEPT-ORTH").hospital(hospital)
                .name("Orthopedics").description("Bone and joint care").build());
                
        Department genMed = departmentRepository.save(Department.builder()
                .departmentId("DEPT-GENM").hospital(hospital)
                .name("General Medicine").description("Primary care and general diseases").build());

        Department neuro = departmentRepository.save(Department.builder()
                .departmentId("DEPT-NEUR").hospital(hospital)
                .name("Neurology").description("Brain and nervous system").build());

        Department pedia = departmentRepository.save(Department.builder()
                .departmentId("DEPT-PEDI").hospital(hospital)
                .name("Pediatrics").description("Child healthcare").build());

        // =================== DOCTORS ===================
        createDoctor("DOC-001", "Dr. Ramesh Sharma", cardio, hospital, "9876543210", "MD, DM Cardiology", 15, 1000, "doctor1");
        createDoctor("DOC-002", "Dr. Priya Desai", ortho, hospital, "9876543211", "MS Orthopedics", 10, 800, "doctor2");
        createDoctor("DOC-003", "Dr. Anil Kumar", genMed, hospital, "9876543212", "MD General Medicine", 5, 500, "doctor3");
        createDoctor("DOC-004", "Dr. Meena Iyer", neuro, hospital, "9876543213", "DM Neurology", 12, 1200, "doctor4");
        createDoctor("DOC-005", "Dr. Suresh Patel", pedia, hospital, "9876543214", "MD Pediatrics", 8, 600, "doctor5");

        // =================== DEMO PATIENT ===================
        User pUser = userRepository.save(User.builder()
                .userId("USR-PAT-001")
                .mobile("9999999999")
                .role(Role.ROLE_PATIENT)
                .name("Rahul Verma")
                .passwordHash(passwordEncoder.encode("patient123"))
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

        // =================== RECEPTIONIST ===================
        userRepository.save(User.builder()
                .userId("USR-REC-001")
                .mobile("8888888888")
                .role(Role.ROLE_RECEPTIONIST)
                .name("Anita Sharma")
                .passwordHash(passwordEncoder.encode("receptionist123"))
                .hospitalId(hospital.getId())
                .build());

        // =================== ADMIN ===================
        userRepository.save(User.builder()
                .userId("USR-ADM-001")
                .mobile("7777777777")
                .role(Role.ROLE_ADMIN)
                .name("System Admin")
                .passwordHash(passwordEncoder.encode("admin123"))
                .hospitalId(hospital.getId())
                .build());
                
        System.out.println("=== DEMO DATA SEEDED ===");
        System.out.println("Patient:       9999999999 / patient123");
        System.out.println("Doctor:        9876543210 / doctor1");
        System.out.println("Receptionist:  8888888888 / receptionist123");
        System.out.println("Admin:         7777777777 / admin123");
        System.out.println("========================");
    }

    private void createDoctor(String docId, String name, Department dept, Hospital hsp, String mobile, String qual, int exp, int fee, String password) {
        User user = userRepository.save(User.builder()
                .userId("USR-" + docId)
                .mobile(mobile)
                .role(Role.ROLE_DOCTOR)
                .name(name)
                .passwordHash(passwordEncoder.encode(password))
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
