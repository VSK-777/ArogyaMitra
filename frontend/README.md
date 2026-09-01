# SIH Hospital Management - Frontend Dashboard

🚀 **Live Demo:** [https://sih-hospital-management.vercel.app](https://sih-hospital-management.vercel.app)

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

For a detailed breakdown of the frontend's Domain-Driven Modularity, state management, and role-based routing, please see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 🚀 Local Development

To run this frontend prototype locally:

1. Install dependencies:
   `ash
   npm install
   `

2. Run the development server:
   `ash
   npm run dev
   `
   The application will be available at http://localhost:5173.

3. Ensure the Spring Boot backend is running concurrently on http://localhost:8080. (The API Base URL defaults to this address, but can be overridden via VITE_API_BASE_URL in your .env).

## 📦 Production Build

To build the application for production deployment (e.g., Vercel, Netlify):

`ash
npm run build
`
This will compile the TypeScript, optimize assets, and output the production-ready static files into the dist/ directory.
