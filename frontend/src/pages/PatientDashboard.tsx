import { Calendar, Clock, FileText, CheckCircle2 } from 'lucide-react';

export default function PatientDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Patient Dashboard</h1>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors">
          Book Appointment
        </button>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Upcoming', value: '1', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
          { title: 'Pending Triage', value: '0', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
          { title: 'Past Visits', value: '3', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
          { title: 'Prescriptions', value: '2', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-3 ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming Appointment</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
             <div>
                <p className="font-semibold text-slate-900">Dr. Sarah Jenkins - Cardiology</p>
                <p className="text-sm text-slate-500 mt-1">Tomorrow, 10:00 AM</p>
             </div>
             <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Confirmed</span>
          </div>
          
          <div className="mt-6 border-t border-slate-200 pt-6">
             <h3 className="font-medium text-slate-900 mb-3">AI Pre-Consultation Summary</h3>
             <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-slate-700 leading-relaxed">
                <p><strong>Chief Complaint:</strong> Mild chest pain during exercise.</p>
                <p className="mt-2"><strong>AI Assessment:</strong> Patient reports episodic mild chest discomfort correlated with physical exertion. No shortness of breath. Recommend standard ECG and consultation.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
