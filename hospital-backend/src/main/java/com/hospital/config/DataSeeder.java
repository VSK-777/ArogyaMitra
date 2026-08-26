package com.hospital.config;

import com.hospital.entity.*;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.List;

@Component
@Profile("!test")
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
        fixShortPasswords(); // Fix passwords that fail the 8-char validation
        seedData();
        seedAdditionalHospitals(); // Seed new hospitals and doctors
    }

    private void fixShortPasswords() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (user.getRole() == Role.ROLE_DOCTOR) {
                // If it's one of the old seeded doctors, their mobile is 9876543210 etc.
                // We just reset all doctor passwords to 'doctor123' for simplicity and length.
                user.setPasswordHash(passwordEncoder.encode("doctor123"));
                userRepository.save(user);
            }
        }
    }

    private void seedData() {
        if (hospitalRepository.count() > 0) return; // Only seed initial if empty

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
        createDoctor("DOC-001", "Dr. Ramesh Sharma", cardio, hospital, "9876543210", "MD, DM Cardiology", 15, 1000, "doctor123");
        createDoctor("DOC-002", "Dr. Priya Desai", ortho, hospital, "9876543211", "MS Orthopedics", 10, 800, "doctor123");
        createDoctor("DOC-003", "Dr. Anil Kumar", genMed, hospital, "9876543212", "MD General Medicine", 5, 500, "doctor123");
        createDoctor("DOC-004", "Dr. Meena Iyer", neuro, hospital, "9876543213", "DM Neurology", 12, 1200, "doctor123");
        createDoctor("DOC-005", "Dr. Suresh Patel", pedia, hospital, "9876543214", "MD Pediatrics", 8, 600, "doctor123");

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
    }

    private void seedAdditionalHospitals() {
        // Check if HSP-002 exists to avoid duplicate seeding
        Optional<Hospital> h2 = hospitalRepository.findById(2L); // Since it's auto-generated, better to check by name or hospitalId
        if (hospitalRepository.findAll().stream().anyMatch(h -> h.getHospitalId().equals("HSP-002"))) {
            return;
        }

        // =================== HOSPITAL 2 ===================
        Hospital hospitalV = Hospital.builder()
                .hospitalId("HSP-002")
                .name("Valley Care Clinic")
                .address("45 River Road, Valley District")
                .phone("1800-222-3333")
                .email("contact@valleycare.com")
                .build();
        hospitalV = hospitalRepository.save(hospitalV);

        Department cardioV = departmentRepository.save(Department.builder()
                .departmentId("DEPT-CARD-2").hospital(hospitalV)
                .name("Cardiology").description("Heart and cardiovascular diseases").build());
        Department dermaV = departmentRepository.save(Department.builder()
                .departmentId("DEPT-DERM-2").hospital(hospitalV)
                .name("Dermatology").description("Skin care").build());

        createDoctor("DOC-006", "Dr. Kavita Singh", cardioV, hospitalV, "9111111111", "MD Cardiology", 12, 1100, "doctor123");
        createDoctor("DOC-007", "Dr. Rohan Das", dermaV, hospitalV, "9222222222", "MD Dermatology", 8, 700, "doctor123");

        // Receptionist for Hospital 2
        userRepository.save(User.builder()
                .userId("USR-REC-002")
                .mobile("8111111111")
                .role(Role.ROLE_RECEPTIONIST)
                .name("Simran Kaur")
                .passwordHash(passwordEncoder.encode("receptionist123"))
                .hospitalId(hospitalV.getId())
                .build());

        // =================== HOSPITAL 3 ===================
        Hospital hospitalM = Hospital.builder()
                .hospitalId("HSP-003")
                .name("Metro Life Hospital")
                .address("789 Metro Blvd, Downtown")
                .phone("1800-444-5555")
                .email("info@metrolife.com")
                .build();
        hospitalM = hospitalRepository.save(hospitalM);

        Department orthoM = departmentRepository.save(Department.builder()
                .departmentId("DEPT-ORTH-3").hospital(hospitalM)
                .name("Orthopedics").description("Bone and joint care").build());
        Department entM = departmentRepository.save(Department.builder()
                .departmentId("DEPT-ENT-3").hospital(hospitalM)
                .name("ENT").description("Ear, Nose, Throat").build());

        createDoctor("DOC-008", "Dr. Vikram Seth", orthoM, hospitalM, "9333333333", "MS Orthopedics", 20, 1500, "doctor123");
        createDoctor("DOC-009", "Dr. Anjali Menon", entM, hospitalM, "9444444444", "MS ENT", 7, 800, "doctor123");
        createDoctor("DOC-010", "Dr. Naveen Kumar", orthoM, hospitalM, "9555555555", "MS Orthopedics", 4, 500, "doctor123");

        // Receptionist for Hospital 3
        userRepository.save(User.builder()
                .userId("USR-REC-003")
                .mobile("8222222222")
                .role(Role.ROLE_RECEPTIONIST)
                .name("Neha Gupta")
                .passwordHash(passwordEncoder.encode("receptionist123"))
                .hospitalId(hospitalM.getId())
                .build());
    }

    private void createDoctor(String docId, String name, Department dept, Hospital hsp, String mobile, String qual, int exp, int fee, String password) {
        // Prevent duplicate user inserts
        if(userRepository.findByMobile(mobile).isPresent()) return;
        
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
