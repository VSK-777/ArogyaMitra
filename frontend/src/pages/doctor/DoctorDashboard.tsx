import { Users, CheckCircle2, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Doctor Queue Monitor</h1>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-blue-100"><Users className="h-6 w-6 text-blue-600" /></div><div><p className="text-sm font-medium text-slate-500">Total Today</p><p className="text-2xl font-bold text-slate-900">12</p></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-orange-100"><Activity className="h-6 w-6 text-orange-600" /></div><div><p className="text-sm font-medium text-slate-500">Waiting</p><p className="text-2xl font-bold text-slate-900">4</p></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-green-100"><CheckCircle2 className="h-6 w-6 text-green-600" /></div><div><p className="text-sm font-medium text-slate-500">Completed</p><p className="text-2xl font-bold text-slate-900">8</p></div></div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Queue</h2>
          <span className="text-sm text-slate-500 font-medium">Auto-refreshing</span>
        </div>
        <div className="divide-y divide-slate-200">
            <div className="p-4 hover:bg-blue-50/50 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-4">
                    <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center font-bold text-slate-500 text-lg">14</div>
                    <div>
                        <p className="font-bold text-slate-900 text-lg">John Doe</p>
                        <p className="text-sm text-slate-500 font-medium">Status: Ready (Waiting 10 mins) • AI Triage: <span className="text-orange-600">Moderate</span></p>
                    </div>
                </div>
                <button onClick={() => navigate('/doctor/consultation/1')} className="bg-blue-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-blue-700 shadow-sm">
                    Start Consultation
                </button>
            </div>
            <div className="p-4 flex items-center justify-between opacity-60">
                <div className="flex items-center gap-4">
                    <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center font-bold text-slate-500 text-lg">15</div>
                    <div>
                        <p className="font-bold text-slate-900 text-lg">Alice Smith</p>
                        <p className="text-sm text-slate-500 font-medium">Status: AI Pre-Consultation Pending...</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
