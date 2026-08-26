import ApiTest from './pages/dev/ApiTest';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointment from './pages/patient/BookAppointment';
import PreConsultation from './pages/patient/PreConsultation';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ConsultationMode from './pages/doctor/ConsultationMode';
import AdminDashboard from './pages/admin/AdminDashboard';
import { ProtectedRoute, PublicOnlyRoute } from './components/layout/ProtectedRoutes';
import Layout from './components/Layout';


export default function App() {
  
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dev/api-test" element={<ApiTest />} />
        
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
           </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
