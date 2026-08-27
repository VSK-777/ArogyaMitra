import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { patientApi } from '../../api/patientApi';
import { getUserFriendlyMessage } from '../../utils/errorUtils';
import { useAuth } from '../../contexts/AuthContext';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    patientApi.getDashboard()
      .then((res) => {
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message || 'Unable to load dashboard data.');
        }
      })
      .catch((e) => setError(getUserFriendlyMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const { upcomingAppointmentsCount, completedAppointmentsCount, prescriptionCount, upcomingAppointments } = data;
  const { name } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good morning, {name || 'Patient'}</h1>
          <p className="text-slate-500 text-sm mt-1">Here is your healthcare summary.</p>
        </div>
        <button onClick={() => navigate('/patient/book')} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors">
          Book New Appointment
        </button>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-blue-100"><Calendar className="h-6 w-6 text-blue-600" /></div><div><p className="text-sm font-medium text-slate-500">Upcoming</p><p className="text-2xl font-bold text-slate-900">{upcomingAppointmentsCount}</p></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-orange-100"><Clock className="h-6 w-6 text-orange-600" /></div><div><p className="text-sm font-medium text-slate-500">Action Needed</p><p className="text-2xl font-bold text-slate-900">{upcomingAppointmentsCount > 0 ? 1 : 0}</p></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-green-100"><CheckCircle2 className="h-6 w-6 text-green-600" /></div><div><p className="text-sm font-medium text-slate-500">Completed</p><p className="text-2xl font-bold text-slate-900">{completedAppointmentsCount}</p></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-purple-100"><FileText className="h-6 w-6 text-purple-600" /></div><div><p className="text-sm font-medium text-slate-500">Prescriptions</p><p className="text-2xl font-bold text-slate-900">{prescriptionCount}</p></div></div>
      </div>

      {upcomingAppointmentsCount > 0 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 shadow-sm overflow-hidden mb-6 p-4 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-orange-600 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900">Pre-Consultation Required</h3>
            <p className="text-sm text-orange-800 mt-1">You have upcoming appointments. Please complete the AI-assisted pre-consultation form to save time during your visit.</p>
          </div>
          <button onClick={() => {
            if (upcomingAppointments && upcomingAppointments.length > 0) {
              navigate(`/patient/pre-consultation?appointmentId=${upcomingAppointments[0].appointmentId}`);
            }
          }} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Start Pre-Consultation
          </button>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming Appointments</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {upcomingAppointments?.length === 0 ? (
              <div className="p-6 text-slate-500 text-center">No upcoming appointments.</div>
          ) : (
            upcomingAppointments?.map((apt: any) => (
              <div key={apt.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                      <p className="font-semibold text-slate-900">{apt.doctor?.name} - {apt.department?.name}</p>
                      <p className="text-sm text-slate-500 mt-1">{apt.appointmentDate} @ {apt.hospital?.name || 'Main Hospital'}</p>
                      <p className="text-xs text-slate-400 mt-1">Token: {apt.queueToken?.tokenNumber || 'Pending'} | ID: {apt.appointmentId}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">{apt.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

