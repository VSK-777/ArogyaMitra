# AI-Powered Hospital Backend

## 1. Overview
The AI-Powered Hospital Appointment, Pre-Consultation & Medical Documentation System is a comprehensive backend built using Java 21 and Spring Boot 3. It facilitates atomic token generation for queueing, integrates AI (Groq/Whisper) for automated pre-consultation medical history gathering, and provides strict role-based access control for Patients, Receptionists, Doctors, and Admins.

## 2. Technology Stack
- **Language**: Java 21 LTS
- **Framework**: Spring Boot 3.3.4 (with Java 21 Virtual Threads enabled for maximum concurrency)
- **Database**: MySQL 8.0+
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security + JWT
- **AI Integration**: Groq API (LLM) & Groq Whisper (Speech-to-Text)
- **API Documentation**: Springdoc OpenAPI (Swagger)

## 3. System Architecture
Layered architecture: `Controller -> Service -> Repository -> Database`.
Providers (`OtpProvider`, `AiProvider`, `SpeechToTextProvider`) abstract third-party API calls, enabling easy swapping and `DEMO_MODE` capabilities.

## 4. User Roles
- `ROLE_PATIENT`: Books appointments, does pre-consultation, views own records.
- `ROLE_RECEPTIONIST`: Books appointments for walk-in patients.
- `ROLE_DOCTOR`: Manages queue, conducts consultations, prescribes meds, signs off AI-generated clinical documentation.
- `ROLE_ADMIN`: Master system configuration.

## 5. Identifier Architecture
- **Patient ID** (e.g. `PAT-000001`): Permanent patient identifier.
- **Appointment ID** (e.g. `APT-20260825-XXXXXX`): Globally unique appointment identifier linking all clinical records.
- **Token ID** (e.g. `TOKEN-1-2026-08-25-17`): Doctor + Date scoped queue position identifier.
- **Mobile Number**: Primary auth mechanism.

## 6. Configuration & Environment Variables
Instead of hardcoding secrets in `application.properties`, this project uses a `.env` file (loaded via `spring-dotenv`).

Ensure a `.env` file exists in the root directory:
```properties
DB_USERNAME=root
DB_PASSWORD=your_actual_db_password_here (or use system env var)
JWT_SECRET=8f4c7e6b9a1d...
DEMO_MODE=false
GROQ_API_KEY=gsk_...
MSG91_AUTHKEY=56432...
MSG91_TEMPLATE_ID=6a8...
```

## 7. Complete Workflow
1. Patient logs in via OTP.
2. Patient books an appointment for a specific slot.
3. System atomically generates a globally unique Appointment ID and a date/doctor-scoped Token ID.
4. Patient performs Pre-consultation (uploads audio).
5. Audio is transcribed via Whisper.
6. Groq LLM asks follow-up questions and generates a structured summary.
7. Doctor opens daily queue, clicks the Token.
8. System maps Token -> Appointment -> Patient + Pre-consultation AI Summary.
9. Doctor completes Consultation.
10. System generates Prescription.

## 8. API Reference

### Base URL
`http://localhost:8080`

### Authentication
`Authorization: Bearer <JWT_TOKEN>`

| Method | Endpoint | Role | Purpose |
| ------ | -------- | ---- | ------- |
| POST | `/api/auth/patient/send-otp` | Public | Send OTP to patient's mobile |
| POST | `/api/auth/patient/verify-otp` | Public | Verify OTP and get JWT |
| POST | `/api/appointments` | Patient | Book a new appointment |
| POST | `/api/pre-consultations` | Patient | Start pre-consultation |
| POST | `/api/pre-consultations/{appointmentId}/audio` | Patient | Upload voice complaint |
| POST | `/api/pre-consultations/{appointmentId}/complete` | Patient | Complete and get AI Summary |
| GET | `/api/doctor/queue/today` | Doctor | Fetch doctor's queue for today |
| POST | `/api/doctor/consultations` | Doctor | Save clinical consultation |
| POST | `/api/doctor/prescriptions` | Doctor | Issue medical prescription |

### Error Responses
```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "timestamp": "2026-08-25T14:00:00"
}
```

*For complete endpoint details, including schemas, request bodies, and examples, please refer to the Swagger UI available at `/swagger-ui/index.html` while running the application.*


## OTP Authentication Architecture
The patient OTP authentication flow has been redesigned to support both SIH Demo conditions (where no DLT/MSG91 templates exist) and real production messaging.

### Configured Modes:
- pp.demo-mode=true (Default for SIH Demo): Employs MockOtpProvider. No real SMS sent. Generates OTP 123456 by default. Enforces rate limiting, cooldown, and expiry logic.
- pp.demo-mode=false (Production/Real SMS): Employs Msg91OtpProvider. Sends a real SMS via MSG91 API. Requires correct environment variables.

### How to configure MSG91:
Create a .env file in the root with:
`
MSG91_AUTHKEY=your-key
MSG91_TEMPLATE_ID=your-template
MSG91_SENDER_ID=your-sender
`
Set pp.demo-mode=false in pplication.properties.

### Endpoints
**1. POST /api/auth/patient/send-otp**
- **Request**: {"mobile": "9999999999"}
- **Success (200 OK)**: {"success": true, "message": "OTP request submitted successfully"}
- **Failure**: Handled gracefully based on the provider outcome. If MSG91 rejects with HTTP 200 (type: error) or HTTP 400, the backend accurately intercepts this and throws an exception, returning a 502 Bad Gateway (OTP_PROVIDER_ERROR).

**2. POST /api/auth/patient/verify-otp**
- **Request**: {"mobile": "9999999999", "otp": "123456"}
- **Success (200 OK)**: {"success": true, "data": {"token": "eyJhb..."}}
- **Failure (401 Unauthorized)**: Invalid or Expired OTP. Returns {"success": false, "message": "Invalid OTP"}.
- **Failure (429 Too Many Requests)**: Rate limit exceeded for OTP attempts (in Demo Mode).


## Sample Frontend
A sample React (Vite, TypeScript, Tailwind) frontend has been created at ../frontend for deployment and API testing.

**Purpose**: 
1. Provide a public URL/Landing page for Meta/WhatsApp Business onboarding and SIH presentations.
2. Provide a built-in Developer API Testing Console to test the actual backend directly from the browser.

**Directory**: rontend/
**Technology**: React, Vite, TypeScript, Tailwind CSS, Lucide React, Axios, React Router.

**Commands**:
- 
pm install (Install dependencies)
- 
pm run dev (Run locally on port 5173)
- 
pm run build (Build for production)

**Deployment**: The frontend can be hosted statically on Vercel, Netlify, or GitHub Pages. The backend URL is configurable via VITE_API_BASE_URL in .env.

---

## API Test Report (Developer Console)

The frontend API testing console allows testing these real endpoints:

| API | Method | Endpoint | Auth | Status | Notes |
|-----|--------|----------|------|--------|-------|
| Send OTP | POST | /api/auth/patient/send-otp | No | PASS | Hits MSG91 (or Mock if demo mode) |
| Verify OTP | POST | /api/auth/patient/verify-otp | No | PASS | Returns JWT token |
| Get Hospitals | GET | /api/public/hospitals | No | PASS | Retrieves hospital list |
| Get Departments | GET | /api/public/hospitals/1/departments | No | PASS | Retrieves department list |
| Get Doctors | GET | /api/public/departments/1/doctors | No | PASS | Retrieves doctor list |
| Create Appointment| POST | /api/appointments | JWT | PASS | Creates new appointment |
| Get Appointments | GET | /api/appointments/patient | JWT | PASS | Retrieves patient's appointments |
| Submit Pre-consult| POST | /api/pre-consultation/1 | JWT | PASS | Submits patient symptoms/history |

---

## Backend Docker Deployment

### Prerequisites
- Docker Engine 20+ (or Docker Desktop)
- A running MySQL database accessible from the container

### Dockerfile Location
`hospital-backend/Dockerfile` — a multi-stage build (JDK 21 build → JRE 21 runtime).

### Build Command
```bash
cd hospital-backend
docker build -t sih-hospital-backend .
```

### Run Command
```bash
docker run -d \
  --name hospital-api \
  -p 8080:8080 \
  -e DB_URL="jdbc:mysql://host.docker.internal:3306/hospital_db?createDatabaseIfNotExist=true&serverTimezone=UTC" \
  -e DB_USERNAME="root" \
  -e DB_PASSWORD="<your-db-password>" \
  -e JWT_SECRET="<your-jwt-secret>" \
  -e DEMO_MODE="true" \
  -e GROQ_API_KEY="<your-groq-key>" \
  -e MSG91_AUTHKEY="<your-msg91-key>" \
  -e MSG91_TEMPLATE_ID="<your-template-id>" \
  sih-hospital-backend
```

> **Note:** Use `host.docker.internal` to reach MySQL running on the host machine from inside the container.

### Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: `8080`) | No |
| `DB_URL` | Full JDBC MySQL URL | Yes |
| `DB_USERNAME` | MySQL username | Yes |
| `DB_PASSWORD` | MySQL password | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `DEMO_MODE` | `true` = mock OTP, `false` = real MSG91 | Yes |
| `GROQ_API_KEY` | Groq API key for AI features | Yes |
| `MSG91_AUTHKEY` | MSG91 auth key for OTP | Only if `DEMO_MODE=false` |
| `MSG91_TEMPLATE_ID` | MSG91 template ID | Only if `DEMO_MODE=false` |

### Port Configuration
The application reads `server.port=${PORT:8080}`. Locally it defaults to `8080`. Deployment platforms like Render inject `PORT` automatically.

### Render Deployment
1. Push this repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com).
3. Connect to `VSK-777/sih-hospital-management`.
4. Set **Root Directory** to `hospital-backend`.
5. Set **Environment** to `Docker`.
6. Add all required environment variables in the Render dashboard.
7. Render will auto-detect the Dockerfile, build, and deploy.

### Security Notes
- The Docker image runs as a non-root user (`appuser`).
- No secrets, `.env` files, or API keys are baked into the image.
- All credentials are injected at runtime via environment variables.
- The `.dockerignore` excludes `.env`, `target/`, `.git/`, and IDE files.

### Troubleshooting
- **Container exits immediately**: Check logs with `docker logs hospital-api`. Usually a missing env var or unreachable database.
- **Cannot connect to MySQL**: Use `host.docker.internal` instead of `localhost` for host-machine databases. On Linux, add `--network host`.
- **Port conflict**: Change the host port mapping: `-p 9090:8080`.

