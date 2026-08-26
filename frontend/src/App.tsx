
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './modules/public/LandingPage';
import Auth from './modules/auth/Auth';
import PatientDashboard from './modules/patient/PatientDashboard';
import BookAppointment from './modules/appointments/BookAppointment';
import PreConsultation from './modules/preconsultation/PreConsultation';
import DoctorDashboard from './modules/doctor/DoctorDashboard';
import ConsultationMode from './modules/consultation/ConsultationMode';
import ReceptionistDashboard from './modules/receptionist/ReceptionistDashboard';
import AdminDashboard from './modules/admin/AdminDashboard';
import { ProtectedRoute, PublicOnlyRoute } from './components/layout/ProtectedRoutes';
import Layout from './components/Layout';


export default function App() {
  
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        
        <Route element={<PublicOnlyRoute />}>
           <Route path="/auth" element={<Auth />} />
        </Route>
        
        <Route element={<ProtectedRoute />}>
           <Route element={<Layout />}>
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/book" element={<BookAppointment />} />
              <Route path="/patient/pre-consultation" element={<PreConsultation />} />
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/consultation/:id" element={<ConsultationMode />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
           </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
