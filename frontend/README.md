# SIH Hospital Management - Frontend Dashboard

This directory contains the professional frontend UI prototype for the SIH Hospital Management System. It is built using modern web technologies to provide a lightning-fast, responsive, and intuitive interface for Patients, Doctors, and Administrators.

## 🛠️ Technology Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (Professional Health-Tech Layout)
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **HTTP Client**: Axios

## 📂 Architecture Overview

The frontend is structured as a Role-Based Dashboard application using a domain-driven module structure:

- `src/App.tsx`: Central router that maps URLs to specific role dashboards.
- `src/components/Layout.tsx`: A dynamic global layout containing a responsive Sidebar and Top Navigation bar. The navigation links automatically adjust depending on whether the authenticated user is a Patient, Doctor, Receptionist, or Admin.
- `src/modules/auth/*`: Unified authentication portal handling registration and login for all user types.
- `src/modules/patient/*`: Views dedicated to patients (Dashboard, Book Appointment flow).
- `src/modules/preconsultation/*`: Voice-enabled AI Pre-Consultation flow with Gemini.
- `src/modules/doctor/*`: Views dedicated to doctors (Live Queue Monitor, Interactive Consultation Mode).
- `src/modules/receptionist/*`: Views dedicated to receptionists (Walk-ins, Patient Search).
- `src/modules/admin/*`: Views dedicated to system administrators (Analytics, Staff Management, Logs).

## 🚀 Local Development

To run this frontend prototype locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

3. Ensure the Spring Boot backend is running concurrently on `http://localhost:8080`. (The API Base URL defaults to this address, but can be overridden via `VITE_API_BASE_URL` in your `.env`).

## 📦 Production Build

To build the application for production deployment (e.g., Vercel, Netlify):

```bash
npm run build
```
This will compile the TypeScript, optimize assets, and output the production-ready static files into the `dist/` directory.
