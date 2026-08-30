
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './modules/public/LandingPage';
import Auth from './modules/auth/Auth';
import PatientDashboard from './modules/patient/PatientDashboard';
import BookAppointment from './modules/appointments/BookAppointment';
import PreConsultation from './modules/preconsultation/PreConsultation';
import DoctorDashboard from './modules/doctor/DoctorDashboard';
import ConsultationMode from './modules/consultation/ConsultationMode';
import ReceptionistDashboard from './modules/receptionist/ReceptionistDashboard';
import AdminDashboard from './modules/admin/AdminDashboard';
import StaffManagement from './modules/admin/StaffManagement';
import SystemLogs from './modules/admin/SystemLogs';
import ReassignmentManager from './modules/admin/ReassignmentManager';
import PastConsultations from './modules/doctor/PastConsultations';
import DoctorSettings from './modules/doctor/DoctorSettings';
import DoctorUpcomingAppointments from './modules/doctor/DoctorUpcomingAppointments';
import { ProtectedRoute, RoleProtectedRoute, PublicOnlyRoute } from './components/layout/ProtectedRoutes';
import Layout from './components/Layout';


import DocumentsPage from './modules/patient/DocumentsPage';

export default function App() {
  
  
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        
        <Route element={<PublicOnlyRoute />}>
           <Route path="/auth" element={<Auth />} />
        </Route>
        
        <Route element={<ProtectedRoute />}>
           <Route element={<Layout />}>
              <Route element={<RoleProtectedRoute allowedRoles={['ROLE_PATIENT']} />}>
                  <Route path="/patient/dashboard" element={<PatientDashboard />} />
                  <Route path="/patient/book" element={<BookAppointment />} />
                  <Route path="/patient/pre-consultation" element={<PreConsultation />} />
                  <Route path="/patient/documents" element={<DocumentsPage />} />
              </Route>
              <Route element={<RoleProtectedRoute allowedRoles={['ROLE_DOCTOR']} />}>
                  <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                  <Route path="/doctor/upcoming" element={<DoctorUpcomingAppointments />} />
                  <Route path="/doctor/consultations" element={<PastConsultations />} />
                  <Route path="/doctor/settings" element={<DoctorSettings />} />
                  <Route path="/doctor/consultation/:id" element={<ConsultationMode />} />
              </Route>
              <Route element={<RoleProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/staff" element={<StaffManagement />} />
                  <Route path="/admin/logs" element={<SystemLogs />} />
              </Route>
              <Route element={<RoleProtectedRoute allowedRoles={['ROLE_RECEPTIONIST']} />}>
                  <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
              </Route>
              <Route element={<RoleProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_RECEPTIONIST']} />}>
                  <Route path="/admin/reassignments" element={<ReassignmentManager />} />
              </Route>
           </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}




