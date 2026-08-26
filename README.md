# SIH Hospital Management System 🏥

> AI-Powered Hospital Appointment, Pre-Consultation & Medical Documentation System developed as a prototype for the **Smart India Hackathon**.

This project provides a complete digital workflow for a modern hospital, aiming to streamline the patient journey from authentication and appointment booking to AI-assisted pre-consultation and structured medical documentation for doctors.

---

## 🌟 Key Features

### 🧑‍⚕️ For Patients
- **Secure Authentication**: Simple, secure Phone Number and Password login powered by BCrypt and JWT.
- **Appointment Booking**: Browse hospital departments, select doctors, and book appointments seamlessly.
- **Queue Tokens**: Automatically receive daily queue token numbers.
- **AI Pre-Consultation**: Complete an AI-assisted triage form to describe symptoms before seeing the doctor.
- **Medical Records**: View past prescriptions and diagnosis history.

### 🩺 For Doctors
- **Live Queue Dashboard**: View patients waiting in today's queue with auto-refreshing wait times and AI triage priority.
- **AI Summarization**: Instantly read AI-generated summaries of patient symptoms and chief complaints before they enter the room.
- **Structured Consultations**: Record observations, diagnosis, and treatment plans digitally.
- **E-Prescriptions**: Create and issue digital prescriptions securely.

### 🏢 For Administrators
- **System Management**: Monitor hospital and department status, manage staff accounts, and view system activity logs.

---

## 🏗️ Project Structure

This repository is organized into a full-stack monorepo:

- **/hospital-backend**: A robust **Java 21 + Spring Boot 3** RESTful API backend.
- **/frontend**: A comprehensive **React + Vite + Tailwind CSS** prototype featuring dedicated dashboards for Patients, Doctors, and Admins.
- **MASTER_DOCUMENTATION.md**: Detailed technical specifications, API contracts, and architecture diagrams located in the backend folder.

---

## 💻 Tech Stack

**Backend:**
- Java 21 & Spring Boot 3.3.4
- Spring Security + JWT + BCrypt
- PostgreSQL + Hibernate/JPA
- Groq LLaMA (AI Summarization & Agent)
- Groq Whisper (Speech-to-Text)

**Frontend:**
- React 18 & TypeScript
- Vite
- Tailwind CSS v4 & Lucide React
- React Router DOM
- Axios

---

## 🚀 Getting Started

### 1. Run the Backend
Ensure you have **Java 21** and **PostgreSQL** installed (or use a cloud provider like Neon).

```bash
cd hospital-backend

# Configure your environment variables in a .env file:
# DB_URL=jdbc:postgresql://localhost:5432/hospital_db
# DB_USERNAME=...
# DB_PASSWORD=...
# JWT_SECRET=...
# GROQ_API_KEY=...

mvn spring-boot:run
```
*The backend will start on http://localhost:8080.*

### 2. Run the Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
*The frontend will start on http://localhost:5173.*

> **Frontend Note:** The frontend provides a fully responsive role-based layout. You can switch between Patient, Doctor, and Admin roles directly from the unified Authentication portal.

---

## 🐋 Docker Deployment
The backend is fully containerized and production-ready for platforms like Render.
```bash
cd hospital-backend
docker build -t sih-hospital-backend .
docker run -p 8080:8080 -e DB_URL="..." -e DB_USERNAME="..." -e DB_PASSWORD="..." -e JWT_SECRET="..." -e GROQ_API_KEY="..." sih-hospital-backend
```

---

## 📚 Documentation
For an in-depth understanding of the database schema, security configuration, AI prompt strategies, and full API endpoint documentation, please refer to the [MASTER_DOCUMENTATION.md](./hospital-backend/MASTER_DOCUMENTATION.md) located in the backend folder.
