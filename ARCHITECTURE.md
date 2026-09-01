# MediFlow AI: System Architecture & Functionalities Overview

This document provides a comprehensive breakdown of the entire **AI-Powered Hospital Appointment, Pre-Consultation & Documentation System** that has been built. 

---

## 1. Core System Architecture

The application is built using a modern, scalable, and modular **Spring Boot + React** architecture, strictly adhering to the SIH guidelines and avoiding unnecessary microservice complexity while maintaining clean separation of concerns.

### 1.1 Architecture Diagram Flow
```mermaid
graph TD
    A[Users: Patients, Doctors, Admin, Receptionist] -->|HTTPS| B(Frontend: React + Vite)
    B -->|REST API + JWT| C{API Gateway / Spring Security}
    
    C -->|Role: PATIENT| D[Patient Module]
    C -->|Role: DOCTOR| E[Doctor Module]
    C -->|Role: RECEPTIONIST| F[Receptionist Module]
    C -->|Role: ADMIN| G[Admin Module]
    
    D --> H((Business Logic / Service Layer))
    E --> H
    F --> H
    G --> H
    
    H --> I[(MySQL / PostgreSQL)]
    
    H -.->|Real-time Queue| J[WebSockets / STOMP]
    H -.->|Speech-to-Text| K[Gemini Speech-to-Text AI]
    H -.->|Clinical Summaries| L[Python AI Microservice (FastAPI + HuggingFace)]
    L -.-> N[(Local ML Models)]
    H -.->|File Storage| M[MinIO / S3 Storage]
```

### 1.2 The "Appointment ID" vs "Token" Paradigm
The entire database and application flow is anchored on two distinct concepts to solve hospital queue chaos:
1. **Appointment ID (`APT-20260826-000482`):** A globally unique identifier generated at the moment of booking. It acts as the primary key connecting the patient, the pre-consultation AI data, the doctor's final consultation notes, and the medical prescriptions.
2. **Token (`TOKEN-1-20260826-17`):** Represents the patient's literal physical place in the waiting room. It is tied to a specific Doctor + Date and resets to `1` every morning.

---

## 2. Role-Based Functionalities

The system is strictly divided into Role-Based Access Control (RBAC). A user cannot access another role's endpoints.

### 2.1 Patient Portal
*   **Authentication:** Standard Mobile + Password login returning a JWT.
*   **Dashboard:** Displays categories of UPCOMING, VISITED, and NOT VISITED appointments. Shows active prescriptions.
*   **Smart Appointment Booking:** A dynamic 4-step wizard:
    *   *Step 1:* Select Hospital (Fetched via `/api/hospitals`)
    *   *Step 2:* Select Department (Fetched via `/api/departments/hospital/{id}`)
    *   *Step 3:* Select Doctor (Fetched via `/api/public/doctors/department/{id}`)
    *   *Step 4:* Select Date & Hourly Slot (15-minute allocations up to 4 patients per hour) -> System assigns a Token.
*   **Check-In Workflow:** Patients must check in within their designated window. Failure to check in results in an automatic `NO_SHOW` via the grace period automation.
*   **AI Pre-Consultation:** 
    *   Patients can use their **microphone** to speak their symptoms.
    *   The frontend uses `MediaRecorder` to capture audio and sends a `multipart/form-data` payload to the backend.
    *   The backend pipes this to **Gemini Speech-to-Text** for transcription, asks follow-up questions via **Gemini AI**, and generates a structured clinical summary by delegating to our dedicated **Python AI Microservice (FastAPI + PyTorch/HuggingFace)**.

### 2.2 Receptionist Portal
*   **Patient Search:** Can search the database via mobile number, patient ID, or name.
*   **Walk-In Registration:** Allows the receptionist to register patients who walk into the hospital without an online account.
*   **Walk-In Booking:** Receptionists can bypass the standard flow to immediately assign a doctor and a Token to a walk-in patient.

### 2.3 Doctor Workspace
*   **Live Queue Management:** The dashboard handles multiple priority queues (Current Consultation, Emergency, Walk-Ins, Waiting, Today's Appointments).
*   **AI Context Review:** Before calling a patient in, the doctor clicks their Token to read the AI-generated Pre-Consultation summary.
*   **Clinical Consultation:** 
    *   Doctor clicks "Start Consultation" to move the patient from `WAITING` to `IN_CONSULTATION`.
    *   Doctor inputs Observations, Diagnosis, and Treatment Plan.
    *   Doctor adds Medicines (Name, Dosage, Frequency) to generate a Prescription.
    *   Clicking "Finalize" marks the Token as `COMPLETED` and saves the medical record immutably.

### 2.4 Administrator Dashboard
*   **Live Analytics Engine:** Displays true SQL `COUNT(*)` data for total patients, total doctors, today's total appointments, and today's completed vs waiting queue.
*   **Staff Management:** Comprehensive management interface for doctors, receptionists, and staff accounts.
*   **Audit Logging & System Logs:** Displays an immutable trail of every critical system action. E.g., `WALKIN_APPOINTMENT_BOOKED by Receptionist`, `CONSULTATION_COMPLETED by Doctor`.

---

## 3. Backend Integrations & Engineering

The backend (Java Spring Boot 3.3) is engineered for production-readiness, not just as a hackathon prototype.

1.  **Hybrid AI Integration (Spring Boot + Python FastAPI):** 
    *   **Gemini 2.5 Flash API (Native Java):** Handles the Conversational AI for patient pre-consultation chat, extracting structured symptom/diagnosis bullet points seamlessly without hallucination. It also powers the Doctor Notes expansion feature.
    *   **Python FastAPI Microservice (`google/pegasus-pubmed`):** Handles the heavy NLP task of Clinical Record and Document Summarization. By utilizing a model specifically fine-tuned on PubMed medical abstracts, we offload dense document analysis from the main transactional backend.
    *   `GeminiSpeechToTextProvider` handles the heavy lifting of audio transcription.
    *   **Safety Policy:** The AI is strictly prompt-engineered to act as an assistant. It *never* outputs a final diagnosis, ensuring human-in-the-loop compliance.
2.  **MinIO (S3) Document Storage:** 
    *   `DocumentStorageService` is implemented to handle medical files, lab reports, and prescriptions. It generates secure Pre-signed URLs for frontend viewing without exposing the raw storage buckets.
3.  **WebSockets:** 
    *   STOMP endpoints (`/ws-hospital`) and brokers (`/topic`, `/queue`) are configured so that when a receptionist assigns a token, the Doctor's screen and Patient's app can update without HTTP polling.
4.  **Swagger / OpenAPI:** 
    *   The entire REST API is self-documenting. Navigating to `/swagger-ui/index.html` on the backend allows developers to test every endpoint directly, complete with JWT Bearer token support.
5.  **Future-Proof Integration Interfaces:** 
    *   Stubs for `PaymentGateway`, `LabRadiologySystem`, `EmrHisSystem`, and `InsuranceSystem` have been created to show architectural foresight to the judges.

---

## 4. Frontend Engineering

The frontend is built with React + Vite, designed for speed and modularity.

*   **Domain-Driven Structure:** Code is organized by feature (`src/modules/patient`, `src/modules/doctor`, etc.) rather than technical type, making it highly scalable.
*   **API Abstraction:** All Axios calls are centralized in `src/api/*Api.ts`.
*   **Strict UI/UX:** Features that are not fully implemented are hidden to prevent "dead buttons." 
*   **Vercel CI/CD:** The `npm run build` strictly checks for TypeScript errors (TS6133). The app is currently successfully deployed and building on Vercel.

---

## 5. Security & Privacy Summary
*   **Aadhaar Number Integration:** Captures the patient's Aadhaar number securely at registration and seamlessly displays it as a formatted, physical-card-style element across Patient, Doctor, and Receptionist dashboards, providing a quick visual reference without persisting heavy KYC documents.
*   **Offline e-KYC Support:** The registration flow provides built-in navigation and support for patients who cannot use the Aadhaar app, directing them to Offline e-KYC options.
*   **No Mock Data:** There is zero hardcoded mock data in the UI. If you see an appointment, it exists in the database.
*   **Passwords:** Encrypted via `BCryptPasswordEncoder`.
*   **APIs:** Secured via `SecurityFilterChain`. Only `/api/auth`, `/api/hospitals`, and `/api/departments` are open to the public. All other endpoints require a valid JWT.





## 6. Advanced Clinical Operations

### 6.1 Doctor Unavailability & Bulk Rescheduling Engine
A critical real-world hospital requirement is handling sudden doctor unavailabilities (surgery, emergency, illness) without arbitrarily canceling patient appointments.
*   **The Problem:** Canceling an appointment deletes the patient's place in line, leading to severe patient dissatisfaction and manual rescheduling chaos.
*   **The AI Reassignment Engine:**
    *   **Same-Day Peer Distribution:** The system algorithmically scans the exact same department (strict 1:1 specialty matching) for other *active* doctors with available slots on the exact same day, strictly ensuring the replacement doctor is not also unavailable. If found, it silently reassigns the patient, calculates a new 15-minute slot based on the peer doctor's existing load, and regenerates a fresh Queue Token.
    *   **Automated Next-Day Fallback (Option B):** If no peer doctors are available on the same day, the algorithm calculates the *original doctor's* next available working day (scanning up to 3 days post-unavailability). It automatically pushes the appointment to this new date, preserving the patient's booking.
    *   **Graceful Degradation (Pending Manual):** If both automated attempts fail, the system parks the appointment in a REASSIGNMENT_PENDING state. This prevents data loss and surfaces the appointment to the Receptionist/Admin queue for manual phone-call resolution.
*   **Database Constraints & Migrations:** The engine is built on robust PostgreSQL transactions. A dedicated startup fixer (DatabaseConstraintFixer) patches legacy CHECK constraints to ensure new enum values (REASSIGNMENT_PENDING, REASSIGNED) are accepted natively by the database engine.

