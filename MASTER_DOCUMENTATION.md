# MASTER_DOCUMENTATION.md
**SIH-Style AI-Powered Hospital Appointment, Pre-Consultation & Documentation System**

## 1. Project Overview
This project is a complete full-stack application designed to streamline the hospital workflow. It manages everything from patient authentication and appointment booking to AI-driven pre-consultations and doctor queue management.

## 2. Problem Statement & Objectives
Current hospital systems involve long waiting times, manual symptom collection, and heavy documentation burdens for doctors.
**Objectives:**
- Enable seamless patient self-booking via a mobile-first web app.
- Automate symptom collection using Speech-to-Text and AI (Groq + Whisper).
- Generate AI-drafted clinical documentation for doctor review.
- Organize physical queues intelligently via Token IDs linked to unique Appointment IDs.

## 3. Technology Stack
**Frontend:**
- React 18 (TypeScript, Vite)
- React Router v7
- Tailwind CSS & Lucide React
- React Hook Form & Zod for strict validation
- Axios (centralized API client with interceptors)

**Backend:**
- Java 21 LTS
- Spring Boot 3.3.4 (Spring MVC, Spring Data JPA, Spring Security)
- JWT Authentication
- MySQL (via HikariCP & Hibernate)
- Groq API for LLM inference (AI Follow-ups, Summaries)
- Groq Whisper for Speech-to-Text

## 4. System Architecture
**Frontend Architecture:**
Follows a strict domain-driven architecture separated by roles: Patient, Doctor, Receptionist, Admin.
All API calls are abstracted in `src/api/*Api.ts`. `AuthContext` governs global state, and route protection is heavily enforced.

**Backend Architecture:**
Standard layered architecture: `Controller -> Service -> Repository -> Entity`.
External integrations (AI, Speech, Storage, Notifications) are behind Java interfaces in `com.hospital.integration.*`.

**Database Architecture:**
A relational schema designed around the `Appointment` entity.
- `Patient` (1) -> `Appointment` (N)
- `Appointment` (1) -> `PreConsultation` (1), `Consultation` (1), `QueueToken` (1)
- Tokens represent daily queue position, while `AppointmentId` is a globally unique identifier.

## 5. Workflows
- **Patient Workflow:** Login (Mobile+Password) -> Select Doctor & Slot -> Book -> Start Pre-consultation (Audio/Text) -> Wait for Queue.
- **Receptionist Workflow:** Search Patient -> Create Walk-in -> Book -> Hand over to queue.
- **Doctor Workflow:** View Queue -> Select Token -> System retrieves associated Pre-consultation -> Conduct Consultation -> Generate AI Draft -> Approve -> Finalize Prescription.

## 6. Security Considerations & AI Safety
- Passwords are encrypted via BCrypt.
- All requests require Bearer JWT.
- Routes are protected via `@PreAuthorize` backend annotations and frontend `RoleProtectedRoute`s.
- **AI Safety Limitation:** The AI is strictly prompt-engineered to *never* output a final diagnosis. It must only output "Draft summaries" and "Potential Flags" which require explicit doctor approval before saving as a Medical Record.

## 7. Frontend API Requirements
Below is the documentation for frontend-required APIs.

### Authentication
**POST /api/auth/patient/login**
- **Purpose:** Login a patient and return JWT.
- **Request:** `{"mobile": "9999999999", "password": "..."}`
- **Response:** `{"success": true, "data": {"token": "...", "role": "PATIENT"}}`

**POST /api/auth/patient/register**
- **Purpose:** Register a new patient.

### Patient
**GET /api/patients/me**
- **Auth:** Bearer JWT (PATIENT)
- **Response:** `{"success": true, "data": {"id": 1, "mobile": "9999999999", "patientId": "PAT-000001"}}`

**GET /api/patients/me/appointments**
- **Auth:** Bearer JWT (PATIENT)
- **Response:** `{"success": true, "data": [{...}]}`

### Appointments
**POST /api/appointments**
- **Auth:** Bearer JWT (PATIENT)
- **Purpose:** Book an appointment.
- **Request:** `{"doctorId": 1, "departmentId": 1, "appointmentDate": "2026-08-26", "slotStart": "10:30"}`
- **Response:** `{"success": true, "data": {"appointmentId": "APT-...", "token": 1}}`

### Pre-Consultation
**POST /api/pre-consultations**
- **Auth:** Bearer JWT
- **Request:** `{"appointmentId": "APT-...", "initialComplaint": "Fever"}`

**POST /api/pre-consultations/{appointmentId}/audio**
- **Auth:** Bearer JWT
- **Request:** `multipart/form-data` with `audio` File.
- **Response:** `{"success": true, "data": "Have you checked your temperature?"}`

**POST /api/pre-consultations/{appointmentId}/complete**
- **Auth:** Bearer JWT
- **Response:** `{"success": true, "data": {"aiSummary": "..."}}`

### Doctor
**GET /api/doctor/queue/today**
- **Auth:** Bearer JWT (DOCTOR)
- **Response:** List of QueueToken objects representing the doctor's active daily queue.

**POST /api/doctor/consultations**
- **Auth:** Bearer JWT (DOCTOR)
- **Request:** Consultation observations and diagnosis.

**POST /api/doctor/prescriptions**
- **Auth:** Bearer JWT (DOCTOR)
- **Request:** Medicine array.

## 8. Setup Instructions
### Local Setup (Backend)
1. Start MySQL on port 3306. Create database `hospital_db`.
2. Configure `application.properties` with DB credentials and Groq API Key.
3. Run `mvn clean install`
4. Run `mvn spring-boot:run`

### Local Setup (Frontend)
1. cd `frontend`
2. Run `npm install`
3. Create `.env` containing `VITE_API_BASE_URL=http://localhost:8080`
4. Run `npm run dev`

### Demo Mode
By default, standard testing uses Mock components where external APIs fail.
Demo user: `9999999999` / `Patient@123`

## 9. Folder Structure
```
hospital-system/
├── backend/
│   ├── src/main/java/com/hospital/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── integration/ (ai, speech)
│   │   ├── repository/
│   │   ├── security/
│   │   └── service/
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── types/
│   └── package.json
└── MASTER_DOCUMENTATION.md
```
