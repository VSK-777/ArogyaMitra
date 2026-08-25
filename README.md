# SIH Hospital Management System 🏥

> AI-Powered Hospital Appointment, Pre-Consultation & Medical Documentation System developed as a prototype for the **Smart India Hackathon**.

This project provides a complete digital workflow for a modern hospital, aiming to streamline the patient journey from authentication and appointment booking to AI-assisted pre-consultation and structured medical documentation for doctors.

---

## 🌟 Key Features

### 🧑‍⚕️ For Patients
- **OTP Authentication**: Secure login via MSG91 WhatsApp OTP.
- **Appointment Booking**: Browse hospital departments, select doctors, and book appointments seamlessly.
- **Queue Tokens**: Automatically receive daily queue token numbers.
- **AI Pre-Consultation**: Chat with an AI agent to describe symptoms before seeing the doctor.
- **Medical Records**: View past prescriptions and diagnosis history.

### 🩺 For Doctors
- **Live Queue Dashboard**: View patients waiting in today's queue.
- **AI Summarization**: Instantly read AI-generated summaries of patient symptoms before they enter the room.
- **Structured Consultations**: Record observations, diagnosis, and treatment plans digitally.
- **E-Prescriptions**: Create and issue digital prescriptions securely.

---

## 🏗️ Project Structure

This repository is organized into a full-stack monorepo:

- **/hospital-backend**: A robust **Java 21 + Spring Boot 3** RESTful API backend.
- **/frontend**: A modern **React + Vite + Tailwind CSS** sample landing page & Developer API Console.
- **MASTER_DOCUMENTATION.md**: Detailed technical specifications, API contracts, and architecture diagrams.

---

## 💻 Tech Stack

**Backend:**
- Java 21 & Spring Boot 3.3.4
- Spring Security + JWT
- MySQL + Hibernate/JPA
- Groq LLaMA (AI Summarization & Agent)
- Groq Whisper (Speech-to-Text)
- MSG91 API (WhatsApp/SMS OTP)

**Frontend:**
- React 18 & TypeScript
- Vite
- Tailwind CSS v4
- Axios & React Router

---

## 🚀 Getting Started

### 1. Run the Backend
Ensure you have **Java 21** and **MySQL** installed.

`ash
cd hospital-backend

# Configure your environment variables in a .env file:
# DB_USERNAME=...
# DB_PASSWORD=...
# JWT_SECRET=...
# GROQ_API_KEY=...
# MSG91_AUTHKEY=...
# MSG91_TEMPLATE_ID=...
# DEMO_MODE=true # Use true for local testing without real SMS

mvn spring-boot:run
`
*The backend will start on http://localhost:8080.*

### 2. Run the Frontend & API Console
`ash
cd frontend
npm install
npm run dev
`
*The frontend will start on http://localhost:5173.*

> **API Testing Note:** The frontend includes a built-in Developer API Console designed for testing the backend's capabilities directly from the browser!

---

## 📚 Documentation
For an in-depth understanding of the database schema, security configuration, AI prompt strategies, and full API endpoint documentation, please refer to the [MASTER_DOCUMENTATION.md](./hospital-backend/MASTER_DOCUMENTATION.md) located in the backend folder.
