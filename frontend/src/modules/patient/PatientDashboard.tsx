import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientApi } from '../../api/patientApi';
import { getUserFriendlyMessage } from '../../utils/errorUtils';
import { useAuth } from '../../contexts/AuthContext';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { name } = useAuth();
  const [activeTab, setActiveTab] = useState<"upcoming" | "visited" | "notVisited">("upcoming");
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
      .catch((e) => setError(e.response?.data?.message || e.message || getUserFriendlyMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-700" /></div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const handleCheckIn = async (appointmentId: string) => {
      try {
          setLoading(true);
          const res = await patientApi.checkIn(appointmentId);
          if (res.success) {
              toast.success('Successfully checked in!');
              patientApi.getDashboard().then(r => setData(r.data)).finally(() => setLoading(false));
          }
      } catch (e: any) {
          toast.error(getUserFriendlyMessage(e));
          setLoading(false);
      }
  };

  const { upcomingAppointmentsCount, completedAppointmentsCount, prescriptionCount, upcomingAppointments, patient } = data || {};

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Good morning, {name || 'Patient'}</h1>
            <p className="text-slate-500 text-sm mt-1">Here is your healthcare summary.</p>
          </div>
          {patient?.aadhaarNumber && (
            <div className="bg-white px-6 py-4 rounded-md border border-slate-200 shadow-sm flex flex-col sm:items-end min-w-[280px]">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Aadhaar Number</span>
              <div className="flex gap-5 text-2xl font-bold text-slate-800 tracking-wider font-mono">
                {patient.aadhaarNumber.match(/.{1,4}/g)?.map((part: string, idx: number) => (
                  <span key={idx}>{part}</span>
                ))}
              </div>
            </div>
          )}
        </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-blue-100"><Calendar className="h-6 w-6 text-blue-700" /></div><div><p className="text-sm font-medium text-slate-500">Upcoming</p><p className="text-2xl font-bold text-slate-900">{upcomingAppointmentsCount}</p></div></div>
          <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-orange-100"><Clock className="h-6 w-6 text-orange-600" /></div><div><p className="text-sm font-medium text-slate-500">Not Visited</p><p className="text-2xl font-bold text-slate-900">{data.notVisitedCount}</p></div></div>
          <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-green-100"><CheckCircle2 className="h-6 w-6 text-green-600" /></div><div><p className="text-sm font-medium text-slate-500">Completed</p><p className="text-2xl font-bold text-slate-900">{completedAppointmentsCount}</p></div></div>
          <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-purple-100"><FileText className="h-6 w-6 text-purple-600" /></div><div><p className="text-sm font-medium text-slate-500">Prescriptions</p><p className="text-2xl font-bold text-slate-900">{prescriptionCount}</p></div></div>
        </div>

        {data.notifications && data.notifications.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><AlertCircle className="h-5 w-5" /> Notifications</h3>
            <div className="space-y-2">
              {data.notifications.map((n: any) => (
                <div key={n.id} className="bg-white p-3 rounded shadow-sm border border-blue-100 text-sm text-blue-800">
                  <span className="font-semibold">{n.type === 'REASSIGNMENT_PENDING' ? 'Action Required' : 'Update'}: </span>
                  {n.message}
                </div>
              ))}
            </div>
          </div>
        )}


      {upcomingAppointmentsCount > 0 && (
        <div className="rounded-md border border-orange-200 bg-orange-50 shadow-sm overflow-hidden mb-6 p-4 flex items-start gap-4">
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

      <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 flex gap-4">
          <button onClick={() => setActiveTab('upcoming')} className={`text-sm font-semibold pb-4 -mb-4 border-b-2 ${activeTab === 'upcoming' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            Upcoming ({data.upcomingAppointmentsCount})
          </button>
          <button onClick={() => setActiveTab('visited')} className={`text-sm font-semibold pb-4 -mb-4 border-b-2 ${activeTab === 'visited' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            Visited ({data.completedAppointmentsCount})
          </button>
          <button onClick={() => setActiveTab('notVisited')} className={`text-sm font-semibold pb-4 -mb-4 border-b-2 ${activeTab === 'notVisited' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            Not Visited ({data.notVisitedCount})
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {activeTab === 'upcoming' && (
            data.upcomingAppointments?.length === 0 ? (
                <div className="p-6 text-slate-500 text-center">No upcoming appointments.</div>
            ) : (
              data.upcomingAppointments?.map((apt: any) => (
                <div key={apt.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-slate-900">{apt.doctor?.name} - {apt.department?.name}</p>
                        <p className="text-sm text-slate-500 mt-1">{apt.appointmentDate} at {apt.slotStart?.substring(0,5)} @ {apt.hospital?.name || 'Main Hospital'}</p>
                        <p className="text-xs text-slate-400 mt-1">ID: {apt.appointmentId}</p>
                        {apt.status === 'REASSIGNED' && apt.originalDoctor && (
                            <p className="text-xs text-orange-600 font-medium mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Reassigned (Originally: {apt.originalDoctor.name})
                            </p>
                        )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                        {apt.status === 'REASSIGNMENT_PENDING' && (
                            <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">Reassignment Pending</span>
                        )}
                        {(apt.status === 'BOOKED' || apt.status === 'REASSIGNED') && apt.checkInStatus === 'NOT_CHECKED_IN' && (
                            <>
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">Upcoming</span>
                                <button onClick={() => handleCheckIn(apt.appointmentId)} className="bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-blue-800 shadow-sm transition-colors">
                                    Check In
                                </button>
                            </>
                        )}
                        {(apt.status === 'BOOKED' || apt.status === 'REASSIGNED') && apt.checkInStatus === 'CHECKED_IN' && (
                            <>
                                <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">✓ Checked In</span>
                                <p className="text-sm text-green-700 font-medium">Queue: {apt.tokenId || 'Pending'}</p>
                                <p className="text-xs text-green-600">Waiting for Doctor</p>
                            </>
                        )}
                        {apt.checkInStatus === 'IN_CONSULTATION' && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 ring-1 ring-inset ring-blue-600/20">In Consultation</span>
                        )}
                    </div>
                  </div>
                </div>
              ))
            )
          )}
          {activeTab === 'visited' && (
            data.visitedAppointments?.length === 0 ? (
                <div className="p-6 text-slate-500 text-center">No visited appointments.</div>
            ) : (
              data.visitedAppointments?.map((apt: any) => (
                <div key={apt.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-slate-900">{apt.doctor?.name} - {apt.department?.name}</p>
                        <p className="text-sm text-slate-500 mt-1">{apt.appointmentDate} @ {apt.hospital?.name || 'Main Hospital'}</p>
                        <p className="text-xs text-slate-400 mt-1">ID: {apt.appointmentId}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Visited</span>
                  </div>
                </div>
              ))
            )
          )}
          {activeTab === 'notVisited' && (
            data.notVisitedAppointments?.length === 0 ? (
                <div className="p-6 text-slate-500 text-center">No unvisited appointments.</div>
            ) : (
              data.notVisitedAppointments?.map((apt: any) => (
                <div key={apt.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-slate-900">{apt.doctor?.name} - {apt.department?.name}</p>
                        <p className="text-sm text-slate-500 mt-1">{apt.appointmentDate} @ {apt.hospital?.name || 'Main Hospital'}</p>
                        <p className="text-xs text-slate-400 mt-1">ID: {apt.appointmentId}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">Not Visited</span>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}



