# AI-Powered Hospital Backend

## 1. Overview
The AI-Powered Hospital Appointment, Pre-Consultation & Medical Documentation System is a comprehensive backend built using Java 21 and Spring Boot 3. It facilitates atomic token generation for queueing, integrates AI (Gemini AI & Gemini Speech-to-Text) for automated pre-consultation medical history gathering, and provides strict role-based access control for Patients, Receptionists, Doctors, and Admins.

## 2. Technology Stack
- **Language**: Java 21 LTS
- **Framework**: Spring Boot 3.3.4 (with Java 21 Virtual Threads enabled for maximum concurrency)
- **Database**: PostgreSQL 8.0+
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security + JWT
- **AI Integration**: Gemini API (LLM) & Gemini Speech-to-Text (Speech-to-Text)
- **API Documentation**: Springdoc OpenAPI (Swagger)

## 3. System Architecture
Layered architecture: `Controller -> Service -> Repository -> Database`.
Providers (`AiProvider`, `SpeechToTextProvider`) abstract third-party API calls, enabling easy swapping and `DEMO_MODE` capabilities.

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
GEMINI_API_KEY=gsk_...
```

## 7. Complete Workflow
1. Patient logs in via Mobile and Password.
2. Patient books an appointment for a specific slot.
3. System atomically generates a globally unique Appointment ID and a date/doctor-scoped Token ID.
4. Patient performs Pre-consultation (uploads audio).
5. Audio is transcribed via Gemini Speech-to-Text.
6. Gemini AI asks follow-up questions and generates a structured summary.
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
| POST | `/api/auth/patient/register` | Public | Register a new patient account |
| POST | `/api/auth/patient/login` | Public | Patient login and get JWT |
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


## Patient Phone Number + Password Authentication
The patient authentication flow uses a secure phone number and password mechanism, protected by BCrypt hashing.

### Architecture Overview
- **Registration**: The patient registers with their mobile number and a password. The password is hashed using BCrypt before being saved to the database. The raw password is NEVER stored.
- **Login**: The patient logs in using the same mobile number and password. The backend securely checks the password against the BCrypt hash in the database and returns a JWT if valid.

### Endpoints
**1. POST /api/auth/patient/register**
- **Request**: `{"mobile": "9951117631", "password": "Patient@123"}`
- **Success (200 OK)**: `{"success": true, "message": "Patient registration successful"}`
- **Failure**: Handled gracefully. If the mobile number is already registered, returns HTTP 400 Bad Request.

**2. POST /api/auth/patient/login**
- **Request**: `{"mobile": "9951117631", "password": "Patient@123"}`
- **Success (200 OK)**: `{"success": true, "message": "Login successful", "data": {"token": "eyJhb..."}}`
- **Failure (401 Unauthorized)**: Returns generic message `"Invalid mobile number or password."` to prevent account enumeration.

### Note on Forgot Password
Forgot-password / self-service password recovery is not included in the current SIH prototype.


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
| Register | POST | /api/auth/patient/register | No | PASS | Registers patient |
| Login | POST | /api/auth/patient/login | No | PASS | Returns JWT token |
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
- A running PostgreSQL database accessible from the container

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
  -e DB_URL="jdbc:PostgreSQL://host.docker.internal:5432/hospital_db?createDatabaseIfNotExist=true&serverTimezone=UTC" \
  -e DB_USERNAME="root" \
  -e DB_PASSWORD="<your-db-password>" \
  -e JWT_SECRET="<your-jwt-secret>" \
  -e Gemini_API_KEY="<your-Gemini-key>" \
  sih-hospital-backend
```

> **Note:** Use `host.docker.internal` to reach PostgreSQL running on the host machine from inside the container.

### Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: `8080`) | No |
| `DB_URL` | Full JDBC PostgreSQL URL | Yes |
| `DB_USERNAME` | PostgreSQL username | Yes |
| `DB_PASSWORD` | PostgreSQL password | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `Gemini_API_KEY` | Gemini API key for AI features | Yes |

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
- **Cannot connect to PostgreSQL**: Use `host.docker.internal` instead of `localhost` for host-machine databases. On Linux, add `--network host`.
- **Port conflict**: Change the host port mapping: `-p 9090:8080`.



