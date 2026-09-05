# ArogyaMitra Management System

**AI-Powered Hospital Appointment, Pre-Consultation & Documentation System**

🚀 **Live Demo:** [https://arogyamitra.vercel.app](https://arogyamitra.vercel.app)

## 1. Project Overview
This project is a complete full-stack application designed to streamline hospital workflows. It manages everything from patient authentication and appointment booking to AI-driven pre-consultations, doctor queue management, and final clinical documentation.

**Crucial Constraint:** There is ZERO mock data in the frontend. Every button, every count, and every queue position is strictly driven by the real Spring Boot backend and the underlying SQL database via REST APIs.

## 2. System Architecture
The application strictly follows the Authoritative System Architecture diagram.

```text
                    USERS (Patients, Doctors, Receptionists, Admins)
                      │
                      ▼
              APPLICATION LAYER (React + TypeScript)
                 - Auth Module
                 - Patient Module
                 - Doctor Module
                 - Receptionist Module
                 - Admin Module
                      │
                      ▼
              API GATEWAY / REST APIs (Spring MVC)
                 - JWT Security Filter Chain
                 - Role-Based Access Control (RBAC)
                      │
                      ▼
          BUSINESS LOGIC / WORKFLOW ENGINE (Spring Boot Services)
                 - Appointment Engine
                 - Queue / Token Management
                 - AI Pre-Consultation (Gemini 2.5 Flash + Gemini Speech-to-Text)
                 - Audit Logging
                 - Integrations (Notification, Lab, EMR, Insurance, Payment)
                      │
                      ▼
                  DATA LAYER (Spring Data JPA)
                      │
                      ▼
        DATABASES / DOCUMENT STORAGE (MySQL / PostgreSQL, AWS SDK v2)
```

### 2.1 Identity vs Queue Order
- **Appointment ID:** (e.g., `APT-20260826-000482`) Globally unique identity for a visit. Ties together the pre-consultation, consultation, and prescriptions.
- **Token ID:** (e.g., `TOKEN-1-2026-08-26-17`) Represents the daily queue order for a specific doctor. Resets every day.

## 3. Technology Stack
**Frontend:**
- React 18, TypeScript, Vite
- React Router v7
- Tailwind CSS & Lucide React (with a redesigned professional health-tech layout)
- React Hot Toast for UI notifications (replaced native alerts)
- Axios (centralized API client)

**Backend:**
- Java 21 LTS, Spring Boot 3.3
- Spring Security + JWT Authentication
- Spring Data JPA + Hibernate
- Database: MySQL (or Neon PostgreSQL in cloud deployment)
- AI Text: Gemini API
- Local AI Summarization: Python, FastAPI, PyTorch, HuggingFace Transformers
- AI Speech: Gemini Speech-to-Text (Speech-to-Text)

## 4. Role-Based Workflows
### Patient Workflow (Mobile-First Web App)
- **Login:** Mobile number + Password.
- **Dashboard:** Real-time stats fetched from backend.
- **Book Appointment:** Multi-step wizard fetching real hospitals, departments, and doctors.
- **Pre-Consultation:** Voice input via MediaRecorder. Audio is sent as `multipart/form-data` to Spring Boot, which calls Gemini Speech-to-Text, then Gemini AI generates follow-up questions and a final structured summary.

### Receptionist Workflow
- **Patient Search:** Search by mobile, ID, or name via `/api/receptionist/patients/search`.
- **Walk-in Registration:** Register patients who arrive physically.
- **Walk-in Booking:** Book appointments on behalf of the walk-in patient. System generates the Appointment ID and Token ID.

### Doctor Workflow
- **Real-Time Queue:** Auto-refreshing dashboard showing today's waiting tokens (`/api/doctor/queue/today`). Includes self-healing capabilities for out-of-sync tokens and filtering completed from live queue.
- **Consultation:** Doctor selects a token, views the AI-generated pre-consultation summary.
- **Documentation:** Doctor inputs clinical notes. System generates prescription. Doctor approves final document.

### Admin Workflow
- **Real-Time Analytics:** Views true `COUNT(*)` metrics from the database (Total Patients, Today's Waiting, etc.) via `/api/admin/analytics`.
- **Staff Management:** Complete admin dashboard for managing staff (doctors, receptionists) and system access.
- **Audit Logs:** Views the immutable system trail (`AuditLog`) of who booked what, who cancelled what, and who viewed what.

## 5. Security & AI Policy
### Security
- **Aadhaar Offline e-KYC Identity Verification:** Authenticates patients cryptographically by parsing official UIDAI Offline Paperless e-KYC .zip packages, extracting the XML, and validating the digital signature. Safe memory parsing without persisting sensitive files.
- **Rate Limiting:** Enforces strict limits on critical endpoints (e.g., 3 verification attempts/15 min) to prevent abuse.
- **Authentication:** Stateless JWT tokens passed in the `Authorization: Bearer` header.
- **RBAC:** Endpoints are strictly protected by roles (`ROLE_PATIENT`, `ROLE_DOCTOR`, `ROLE_RECEPTIONIST`, `ROLE_ADMIN`).
- **Audit Trail:** The `AuditService` logs all critical mutations to the `audit_logs` table.

### AI Policy
- **AI is Assistive Only:** The AI *never* makes a final diagnosis. It *never* prescribes medication automatically.
- **Doctor Approval:** The AI generates structured summaries (pre-consultation) and drafts (clinical notes). The human doctor must review, edit, and click "Finalize" to commit the record.

## 6. Folder Structure
### Frontend (`frontend/src/`)
```text
├── api/                  # Axios clients mapped to backend controllers (patientApi.ts, etc.)
├── components/           # Shared UI and Layout components
├── contexts/             # AuthContext (JWT management)
├── modules/              # Domain-driven feature modules (Replaced old pages/ structure)
│   ├── admin/            # AdminDashboard.tsx
│   ├── appointments/     # BookAppointment.tsx
│   ├── auth/             # Auth.tsx
│   ├── consultation/     # ConsultationMode.tsx
│   ├── doctor/           # DoctorDashboard.tsx
│   ├── patient/          # PatientDashboard.tsx
│   ├── preconsultation/  # PreConsultation.tsx
│   ├── public/           # LandingPage.tsx
│   └── receptionist/     # ReceptionistDashboard.tsx
```

### Backend (`hospital-backend/src/main/java/com/hospital/`)
```text
├── config/               # DataSeeder, CorsConfig
├── controller/           # Spring MVC REST Controllers (Admin, Auth, Doctor, Patient, etc.)
├── dto/                  # Request/Response objects, ApiResponse wrapper
├── entity/               # JPA Entities (Appointment, QueueToken, AuditLog, etc.)
├── integration/          # External Provider Interfaces
│   ├── ai/               # GeminiAiProvider
│   ├── emr/              # EmrHisSystem (Future HIS sync)
│   ├── insurance/        # InsuranceSystem (Future claims)
│   ├── lab/              # LabRadiologySystem (Future scans)
│   ├── payment/          # PaymentGateway (Future billing)
│   └── speech/           # GeminiSpeechToTextProvider
├── repository/           # Spring Data JPA Repositories
├── security/             # JwtFilter, SecurityConfig (RBAC rules)
└── service/              # Core Business Logic (AppointmentService, AuditService, etc.)
```

### AI Microservice (`python-ai/`)
```text
├── Medical_Sumzr/               # Core AI Application Directory
│   └── medical_summarizer/      # Python Package
│       ├── app.py               # FastAPI Server and Endpoints
│       ├── requirements.txt     # Python Dependencies
│       └── utils/               # AI Utility functions and logic
├── main.py                      # Application Entrypoint
└── Dockerfile                   # Docker container configuration
```

## 7. Demo Mode Credentials
The `DataSeeder` automatically populates the database if it is empty.
- **Patient:** Mobile: `9999999999` | Password: `patient123`
- **Doctor:** Mobile: `9876543210` | Password: `doctor1`
- **Receptionist:** Mobile: `8888888888` | Password: `receptionist123`
- **Admin:** Mobile: `7777777777` | Password: `admin123`

## 8. Deployment & Docker Notes

The project natively supports both **Cloud Deployment (Vercel + Render)** and local containerization via **Docker Compose**.

### 8.1 Local Docker Compose (One-Click Start)
Run the entire Hybrid Architecture (React + Java Spring Boot + Python FastAPI) locally using Docker:
```bash
docker-compose up --build
```
- Frontend available at: `http://localhost:5173`
- Java Backend at: `http://localhost:8080`
- Python AI Microservice at: `http://localhost:8000`

### 8.2 Cloud Deployment (Vercel + Render)
1. **Frontend (Vercel):** Deploy the `frontend` directory. Set `VITE_API_BASE_URL` to your Java backend URL.
2. **Java Backend (Render):** Deploy `hospital-backend` as a Java Web Service (`mvn clean package -DskipTests`). Set `PYTHON_AI_URL` to your Python service URL, along with your DB credentials and `GEMINI_API_KEY`.
3. **Python AI (Render):** Deploy `python-ai` as a Python Web Service. Use `pip install -r Medical_Sumzr/medical_summarizer/requirements.txt` and start with `uvicorn main:app --host 0.0.0.0 --port $PORT`.

## 9. Supabase Storage Document Storage Architecture

Medical documents (Reports, Prescriptions, Scans) are **not stored as BLOBs in MySQL**. Instead, we use Supabase Storage as our S3-compatible object storage layer.

### 9.1 Storage Flow
```text
Patient/Doctor -> React -> Spring Boot REST API -> Authorization -> DocumentService -> SupabaseStorageService -> Supabase Storage
```

### 9.2 Data Storage Separation
- **MySQL Database:** Stores the lightweight `Document` entity (metadata).
- **Supabase Storage Bucket:** Stores the actual PDF/JPG/PNG files.

### 9.3 Secure Supabase Storage Object Keys
Object keys are structured to prevent collisions and securely partition data:
`patients/{patientId}/appointments/{appointmentId}/documents/{uuid}.pdf`

### 9.4 Supabase Environment Variables
The application does not hardcode credentials. It expects the following environment variables:
```properties
supabase.storage.endpoint=${SUPABASE_STORAGE_ENDPOINT}
supabase.storage.region=${SUPABASE_STORAGE_REGION}
supabase.storage.access-key=${SUPABASE_STORAGE_ACCESS_KEY}
supabase.storage.secret-key=${SUPABASE_STORAGE_SECRET_KEY}
supabase.storage.bucket=${SUPABASE_STORAGE_BUCKET:hospital-medical-documents}
```

### 9.5 Document API Endpoints
**POST /api/documents/upload**
- **Content-Type:** `multipart/form-data`
- **Params:** `file`, `appointmentId`, `documentType`
- **Validation:** 50MB limit, PDF/JPG/PNG/WEBP only.
- **Authorization:** Only the associated Patient or Doctor can upload.

**GET /api/documents/appointment/{appointmentId}**
- Retrieves document metadata for an appointment.

**GET /api/documents/{documentId}/download-url**
- Generates a short-lived **Pre-signed URL** to access the file securely directly from Supabase Storage without making the bucket public.

**DELETE /api/documents/{documentId}**
- Logically deletes metadata in MySQL and physically removes the object from Supabase Storage.

### Supabase Storage Architecture

- **Database:** Neon PostgreSQL (Metadata only)
- **Object Storage:** Supabase Storage (Actual Files)
- **Client Library:** AWS SDK for Java v2 (`software.amazon.awssdk:s3`)
- **Bucket:** `hospital-medical-documents` (Private)
- **Upload Flow:** React -> Spring Boot (Authorization & Validation) -> Supabase Storage (via S3Client)
- **Download Flow:** React -> Spring Boot -> Supabase Storage (Presigned URL generation via S3Presigner)
- **Deletion:** React -> Spring Boot -> Supabase Storage (DeleteObjectRequest)

**Security:** 
- The bucket is PRIVATE.
- Credentials (`SUPABASE_STORAGE_ACCESS_KEY`, `SUPABASE_STORAGE_SECRET_KEY`) must never be exposed to the frontend or committed to source control.
- Access is strictly mediated by Spring Boot REST API ensuring RBAC (Role Based Access Control).

**Render Deployment:**
The following environment variables must be provided in Render:
- `SUPABASE_STORAGE_ENDPOINT`
- `SUPABASE_STORAGE_REGION`
- `SUPABASE_STORAGE_ACCESS_KEY`
- `SUPABASE_STORAGE_SECRET_KEY`
- `SUPABASE_STORAGE_BUCKET`

## 10. API Contracts

### 10.1 Appointment Creation
**Endpoint:** `POST /api/appointments`

**Authentication:** Required (JWT Bearer Token for `ROLE_PATIENT` or `ROLE_RECEPTIONIST`)

**Request Body (`BookAppointmentRequest`):**
```json
{
  "hospitalId": 3,
  "departmentId": 5,
  "doctorId": 2,
  "appointmentDate": "2026-08-30",
  "slotStart": "09:00:00"
}
```

**Required Fields:**
- `hospitalId` (Numeric ID)
- `departmentId` (Numeric ID)
- `doctorId` (Numeric ID)
- `appointmentDate` (YYYY-MM-DD)
- `slotStart` (HH:MM:SS)

**Optional Fields:**
- `slotEnd` (Auto-defaults to slotStart + 30 min)
- `appointmentType` (Defaults to `ONLINE`)

**Success Response (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "errorCode": null,
  "data": {
    "appointmentId": "APT-20260830-1A2B3C",
    "patientId": "PAT-000001",
    "doctorName": "Dr. Smith",
    "departmentName": "Cardiology",
    "hospitalName": "City General Hospital",
    "appointmentDate": "2026-08-30",
    "slotStart": "09:00:00",
    "status": "BOOKED",
    "tokenId": "T-15"
  }
}
```

**Global Error Handling Responses (HTTP 4xx/5xx):**
The API uses a global `GlobalExceptionHandler` to prevent any technical details from reaching the frontend.

- **Validation Error (HTTP 400):**
```json
{
  "success": false,
  "message": "Please provide all required details.",
  "errorCode": "VALIDATION_ERROR"
}
```

- **Slot Unavailable Error (HTTP 409):**
```json
{
  "success": false,
  "message": "This appointment slot is no longer available. Please select another slot.",
  "errorCode": "CONFLICT"
}
```

- **Unauthorized Error (HTTP 401):**
```json
{
  "success": false,
  "message": "Your session has expired. Please log in again.",
  "errorCode": "UNAUTHORIZED"
}
```

- **Forbidden Error (HTTP 403):**
```json
{
  "success": false,
  "message": "You do not have permission to perform this action.",
  "errorCode": "FORBIDDEN"
}
```

- **Server Error (HTTP 500):**
```json
{
  "success": false,
  "message": "Something went wrong. Please try again later.",
  "errorCode": "INTERNAL_ERROR"
}
```




## 11. Advanced Workflows

### 11.1 Doctor Unavailability & Bulk Rescheduling
The system handles sudden doctor unavailabilities robustly without indiscriminately canceling patient appointments.
- **Creation:** A doctor (or admin) can mark a date range as unavailable via /api/doctor-unavailability/create. This immediately blocks new bookings and flags existing affected appointments as \REASSIGNMENT_PENDING\.
- **Primary Reassignment:** The \utoReschedule\ algorithm first attempts to reassign the patient to a different available doctor within the *exact same department* (e.g., Cardiology to Cardiology) on the *same day*. It rigorously verifies that the replacement doctor is currently active and hasn't also marked themselves unavailable. If successful, the appointment status becomes \REASSIGNED\ and a new token is generated.
- **Fallback Reassignment (Option B):** If no peer doctors are available on the same day, the algorithm scans up to 3 days ahead of the unavailability end date. If the *original doctor* has open slots within those 3 days, the patient is automatically pushed to the doctor's next working day.
- **Pending Manual:** If both automated reassignments fail, the appointment safely remains in \REASSIGNMENT_PENDING\ (Pending Manual) so a receptionist can intervene. The system *never* cancels the appointment.
- **Database Architecture:** A Postgres \DatabaseConstraintFixer\ runs on startup to ensure enum transitions on legacy database check constraints don't crash the reassignment engine.


## 12. Hybrid AI Architecture

The system utilizes a split-workload Hybrid AI architecture to maximize performance and minimize hallucinations:

1. **Gemini 2.5 Flash API (Native Java Integration)**
   - **Role:** Conversational AI & Rapid Inference
   - **Responsibilities:** Powers the Pre-Consultation patient chat, asks contextual follow-up questions, extracts structured summaries from the chat, and expands brief doctor notes into full clinical assessments.

2. **Python FastAPI Microservice (google/pegasus-pubmed)**
   - **Role:** Heavy NLP Document Analysis
   - **Responsibilities:** Summarizes dense clinical records and uploaded medical documents. By running a Hugging Face model natively fine-tuned on PubMed medical abstracts, it achieves superior clinical abstraction while keeping the main Spring Boot transactional backend lightweight.

