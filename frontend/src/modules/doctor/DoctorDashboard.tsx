import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle2, Activity, Loader2 } from 'lucide-react';
import { doctorApi } from '../../api/doctorApi';
import { getUserFriendlyMessage } from '../../utils/errorUtils';

export default function DoctorDashboard() {
  const navigate = useNavigate();

    const handleStartConsultation = async (appointmentId: string) => {
        try {
            await doctorApi.startConsultation(appointmentId);
            navigate(`/doctor/consultation/${appointmentId}`);
        } catch (e) {
            console.error(e);
            // If already in consultation or started, still navigate
            navigate(`/doctor/consultation/${appointmentId}`);
        }
    };

    const handleNoShow = async (appointmentId: string) => {
        if (!confirm('Mark this appointment as No Show?')) return;
        setLoading(true);
        try {
            const res = await doctorApi.markNoShow(appointmentId);
            if (res.success) {
                fetchQueue();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    
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
      .catch((e) => setError(getUserFriendlyMessage(e)))
      .finally(() => setLoading(false));
  };

  const total = queue.length;
  const waiting = queue.filter(q => q.status === 'WAITING' || q.status === 'READY').length;
  const completed = queue.filter(q => q.status === 'COMPLETED').length;

  if (loading && queue.length === 0) {
      return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
      </div>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>}

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-blue-100"><Users className="h-6 w-6 text-blue-600" /></div><div><p className="text-sm font-medium text-slate-500">Total Today</p><p className="text-2xl font-bold text-slate-900">{total}</p></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-orange-100"><Activity className="h-6 w-6 text-orange-600" /></div><div><p className="text-sm font-medium text-slate-500">Waiting</p><p className="text-2xl font-bold text-slate-900">{waiting}</p></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-green-100"><CheckCircle2 className="h-6 w-6 text-green-600" /></div><div><p className="text-sm font-medium text-slate-500">Completed</p><p className="text-2xl font-bold text-slate-900">{completed}</p></div></div>
      </div>

      {queue.filter(q => q.status === 'IN_CONSULTATION').length > 0 && (
          <div className="rounded-xl border-2 border-blue-500 bg-blue-50 shadow-sm overflow-hidden">
              <div className="px-6 py-4 flex justify-between items-center bg-blue-100/50">
                  <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" /> Current Consultation</h2>
              </div>
              <div className="divide-y divide-blue-200">
                  {queue.filter(q => q.status === 'IN_CONSULTATION').map(q => (
                      <div key={q.id} className="p-4 flex items-center justify-between">
                          <div>
                              <p className="font-bold text-slate-900 text-xl">{q.appointment?.patient?.fullName}</p>
                              <p className="text-sm font-medium text-slate-700">Type: {q.appointment?.appointmentType} • Queue: T-{q.tokenNumber}</p>
                          </div>
                          <button onClick={() => navigate(`/doctor/consultation/${q.appointment?.appointmentId}`)} className="bg-blue-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-blue-700">Resume / Complete</button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {queue.filter(q => q.appointment?.appointmentType === 'EMERGENCY' && q.status !== 'COMPLETED' && q.status !== 'NO_SHOW' && q.status !== 'IN_CONSULTATION').length > 0 && (
          <div className="rounded-xl border border-red-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-red-200 px-6 py-4 flex justify-between items-center bg-red-50">
                  <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">🚨 Emergency Queue</h2>
              </div>
              <div className="divide-y divide-red-100">
                  {queue.filter(q => q.appointment?.appointmentType === 'EMERGENCY' && q.status !== 'COMPLETED' && q.status !== 'NO_SHOW' && q.status !== 'IN_CONSULTATION').map(q => (
                      <div key={q.id} className="p-4 flex items-center justify-between">
                          <div>
                              <p className="font-bold text-slate-900 text-lg">{q.appointment?.patient?.fullName}</p>
                              <p className="text-sm font-medium text-red-600">Priority: HIGH • Status: {q.status}</p>
                          </div>
                          <button onClick={() => handleStartConsultation(q.appointment?.appointmentId)} className="bg-red-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-red-700">Start Emergency</button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {queue.filter(q => q.appointment?.appointmentType === 'WALK_IN' && q.status === 'WAITING').length > 0 && (
          <div className="rounded-xl border border-purple-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-purple-200 px-6 py-4 flex justify-between items-center bg-purple-50">
                  <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">Walk-In Patients</h2>
              </div>
              <div className="divide-y divide-purple-100">
                  {queue.filter(q => q.appointment?.appointmentType === 'WALK_IN' && q.status === 'WAITING').map(q => (
                      <div key={q.id} className="p-4 flex items-center justify-between">
                          <div>
                              <p className="font-bold text-slate-900 text-lg">{q.appointment?.patient?.fullName}</p>
                              <p className="text-sm font-medium text-slate-500">Status: {q.status} • Queue: T-{q.tokenNumber}</p>
                          </div>
                          <button onClick={() => handleStartConsultation(q.appointment?.appointmentId)} className="bg-purple-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-purple-700">Start Walk-In</button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Waiting Patients</h2>
        </div>
        <div className="divide-y divide-slate-200">
            {queue.filter(q => q.status === 'WAITING' && q.appointment?.appointmentType !== 'WALK_IN').length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No scheduled patients waiting.</div>
              ) : (
                  queue.filter(q => q.status === 'WAITING' && q.appointment?.appointmentType !== 'WALK_IN').map(q => (
                    <div key={q.id} className="p-4 hover:bg-slate-50/50 flex items-center justify-between transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center font-bold text-slate-500 text-lg">{q.tokenNumber}</div>
                            <div>
                                <p className="font-bold text-slate-900 text-lg">{q.appointment?.patient?.fullName}</p>
                                <p className="text-sm text-slate-500 font-medium">Time: {q.appointment?.slotStart?.substring(0,5)} • ✓ Checked In</p>
                            </div>
                        </div>
                        <button onClick={() => handleStartConsultation(q.appointment?.appointmentId)} className="bg-blue-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-blue-700 shadow-sm">
                            Start Consultation
                        </button>
                    </div>
                ))
            )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">Today's Appointments</h2>
        </div>
        <div className="divide-y divide-slate-200">
            {queue.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No appointments today.</div>
              ) : (
                  queue.map(q => (
                    <div key={q.id} className="p-4 flex items-center justify-between transition-colors">
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="font-bold text-slate-900 text-lg">{q.appointment?.patient?.fullName}</p>
                                <p className="text-sm text-slate-500 font-medium">Time: {q.appointment?.slotStart?.substring(0,5) || 'N/A'} • Type: {q.appointment?.appointmentType}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            {q.status === 'BOOKED' && <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded text-sm font-semibold">Not Checked In</span>}
                            {q.status === 'WAITING' && <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-semibold">✓ Checked In (Waiting)</span>}
                            {q.status === 'IN_CONSULTATION' && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-semibold">In Consultation</span>}
                            {q.status === 'COMPLETED' && <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded text-sm font-semibold">Completed</span>}
                            {q.status === 'NO_SHOW' && <span className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm font-semibold">No Show</span>}
                            
                            {q.status === 'BOOKED' && (
                              <button onClick={() => handleNoShow(q.appointment?.appointmentId)} className="bg-orange-100 text-orange-700 px-3 py-1 rounded text-sm font-semibold hover:bg-orange-200">Mark No Show</button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}


