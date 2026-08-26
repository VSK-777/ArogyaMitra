import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle2, Activity, Loader2 } from 'lucide-react';
import { doctorApi } from '../../api/doctorApi';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQueue();
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = () => {
    doctorApi.getQueueToday()
      .then(res => {
          if (res.success) {
              setQueue(res.data || []);
          } else {
              setError(res.message);
          }
      })
      .catch(() => setError("Failed to load today's queue"))
      .finally(() => setLoading(false));
  };

  const total = queue.length;
  const waiting = queue.filter(q => q.status === 'WAITING' || q.status === 'READY').length;
  const completed = queue.filter(q => q.status === 'COMPLETED').length;

  if (loading && queue.length === 0) {
      return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Doctor Queue Monitor</h1>
      </div>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>}

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-blue-100"><Users className="h-6 w-6 text-blue-600" /></div><div><p className="text-sm font-medium text-slate-500">Total Today</p><p className="text-2xl font-bold text-slate-900">{total}</p></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-orange-100"><Activity className="h-6 w-6 text-orange-600" /></div><div><p className="text-sm font-medium text-slate-500">Waiting</p><p className="text-2xl font-bold text-slate-900">{waiting}</p></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-green-100"><CheckCircle2 className="h-6 w-6 text-green-600" /></div><div><p className="text-sm font-medium text-slate-500">Completed</p><p className="text-2xl font-bold text-slate-900">{completed}</p></div></div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Queue</h2>
          <span className="text-sm text-slate-500 font-medium">Auto-refreshing</span>
        </div>
        <div className="divide-y divide-slate-200">
            {queue.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No patients in the queue today.</div>
            ) : (
                queue.map((q: any) => (
                    <div key={q.id} className="p-4 hover:bg-blue-50/50 flex items-center justify-between transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center font-bold text-slate-500 text-lg">{q.tokenNumber}</div>
                            <div>
                                <p className="font-bold text-slate-900 text-lg">{q.appointment?.patient?.fullName || 'Patient'}</p>
                                <p className="text-sm text-slate-500 font-medium">Status: {q.status} • ID: {q.appointment?.appointmentId}</p>
                            </div>
                        </div>
                        {q.status !== 'COMPLETED' ? (
                            <button onClick={() => navigate(`/doctor/consultation/${q.appointment?.appointmentId}`)} className="bg-blue-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-blue-700 shadow-sm">
                                Start Consultation
                            </button>
                        ) : (
                            <span className="text-green-600 font-bold px-6 py-2.5">Completed</span>
                        )}
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}
