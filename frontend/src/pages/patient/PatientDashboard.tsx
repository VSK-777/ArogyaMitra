import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PatientDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Patient Dashboard</h1>
        <button onClick={() => navigate('/patient/book')} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors">
          Book New Appointment
        </button>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-blue-100"><Calendar className="h-6 w-6 text-blue-600" /></div><div><p className="text-sm font-medium text-slate-500">Upcoming</p><p className="text-2xl font-bold text-slate-900">1</p></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-orange-100"><Clock className="h-6 w-6 text-orange-600" /></div><div><p className="text-sm font-medium text-slate-500">Action Needed</p><p className="text-2xl font-bold text-slate-900">1</p></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-green-100"><CheckCircle2 className="h-6 w-6 text-green-600" /></div><div><p className="text-sm font-medium text-slate-500">Completed</p><p className="text-2xl font-bold text-slate-900">3</p></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-purple-100"><FileText className="h-6 w-6 text-purple-600" /></div><div><p className="text-sm font-medium text-slate-500">Prescriptions</p><p className="text-2xl font-bold text-slate-900">2</p></div></div>
      </div>

      {/* Action Required Section */}
      <div className="rounded-xl border border-orange-200 bg-orange-50 shadow-sm overflow-hidden mb-6 p-4 flex items-start gap-4">
        <AlertCircle className="h-6 w-6 text-orange-600 mt-1" />
        <div className="flex-1">
          <h3 className="font-semibold text-orange-900">Pre-Consultation Required</h3>
          <p className="text-sm text-orange-800 mt-1">You have an upcoming appointment with Dr. Sarah Jenkins. Please complete the AI-assisted pre-consultation form to save time during your visit.</p>
        </div>
        <button onClick={() => navigate('/patient/pre-consultation')} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium">
          Start Pre-Consultation
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming Appointments</h2>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                  <p className="font-semibold text-slate-900">Dr. Sarah Jenkins - Cardiology</p>
                  <p className="text-sm text-slate-500 mt-1">Tomorrow, 10:00 AM @ Main City Hospital</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Confirmed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
