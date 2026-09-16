import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle2, Activity, Loader2, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorApi } from '../../api/doctorApi';
import { getUserFriendlyMessage } from '../../utils/errorUtils';

function SummaryModal({ aptId, onClose }: { aptId: string; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    doctorApi.getConsultationSummary(aptId).then(res => {
      if(res.success) {
        setData(res.data);
      } else {
        toast.error("Could not load summary");
      }
    }).catch(() => toast.error("Failed to load summary"))
      .finally(() => setLoading(false));
  }, [aptId]);

  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex flex-col items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col print:shadow-none print:max-w-none print:h-auto print:max-h-none print:overflow-visible" onClick={e => e.stopPropagation()}>
        <div className="bg-blue-700 px-6 py-4 flex items-center justify-between print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-white" />
            <h3 className="text-lg font-bold text-white">Consultation Summary</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 print:bg-white print:p-0 print:block">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-12 text-slate-500">
               <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
               <p>Loading consultation records...</p>
             </div>
          ) : data && data.consultation ? (
                <div className="print-content space-y-6">
                  <div className="hidden print:block mb-8 border-b-2 border-slate-900 pb-4">
                     <h1 className="text-3xl font-bold text-slate-900">ArogyaMitra Clinic</h1>
                     <p className="text-slate-600 mt-1">Patient Consultation Record</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm print:border-none print:shadow-none print:p-0 flex justify-between items-start">
                     <div>
                        <h4 className="font-bold text-slate-900 text-lg">{data.consultation.doctor?.name || "Doctor"}</h4>
                        <p className="text-sm text-slate-600">{data.consultation.doctor?.specialization || "Specialist"}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">Date: {data.consultation.appointment?.appointmentDate}</p>
                        <p className="text-sm text-slate-600">
                          Time: {(() => {
                             const t = data.consultation.appointment?.slotStart;
                             if (!t) return 'N/A';
                             if (Array.isArray(t)) return t.slice(0,2).map(n => String(n).padStart(2, '0')).join(':');
                             if (typeof t === 'string') return t.substring(0, 5);
                             return 'N/A';
                          })()}
                        </p>
                     </div>
                  </div>

                  <div className="bg-white border border-blue-200 rounded-lg p-5 shadow-sm print:border-none print:shadow-none print:p-0">
                   <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">AI Patient Summary</h4>
                   <p className="text-sm text-slate-800 leading-relaxed bg-blue-50/50 p-4 rounded print:bg-transparent print:p-0">
                     {data.summary || "No summary available."}
                   </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm print:border-none print:shadow-none print:p-0">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Clinical Details</h4>
                   <div className="space-y-4">
                      <div>
                        <strong className="block text-sm text-slate-700 mb-1">Diagnosis</strong>
                        <p className="text-sm text-slate-900">{data.consultation.diagnosis || "Not specified"}</p>
                      </div>
                      <div>
                        <strong className="block text-sm text-slate-700 mb-1">Observations</strong>
                        <p className="text-sm text-slate-900">{data.consultation.observations || "Not specified"}</p>
                      </div>
                      <div>
                        <strong className="block text-sm text-slate-700 mb-1">Treatment Plan</strong>
                        <p className="text-sm text-slate-900 whitespace-pre-wrap">{data.consultation.treatmentPlan || "Not specified"}</p>
                      </div>
                   </div>
                </div>

                {data.prescription && data.prescription.medicines && data.prescription.medicines.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm print:border-none print:shadow-none print:p-0">
                     <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Prescribed Medicines</h4>
                     <div className="divide-y divide-slate-100 border border-slate-100 rounded">
                        {data.prescription.medicines.map((med: any, idx: number) => (
                           <div key={idx} className="p-3">
                              <p className="font-semibold text-slate-900 text-sm">{med.name}</p>
                              <p className="text-sm text-slate-600 mt-0.5">{med.dosage} — {med.frequency} for {med.duration}</p>
                              {med.instructions && <p className="text-xs text-slate-500 mt-1 italic">Note: {med.instructions}</p>}
                           </div>
                        ))}
                     </div>
                  </div>
                )}
             </div>
          ) : (
             <div className="text-center text-slate-500 py-8">No records found.</div>
          )}
        </div>

        <div className="bg-white px-6 py-4 border-t border-slate-200 flex justify-end gap-3 print:hidden shrink-0">
           <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded text-slate-700 text-sm font-semibold hover:bg-slate-50">Close</button>
           <button onClick={handlePrint} disabled={loading || !data} className="px-4 py-2 bg-blue-700 text-white rounded text-sm font-semibold hover:bg-blue-800 disabled:opacity-50">Download PDF</button>
        </div>
      </div>
    </div>
  );
}

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
        if (!confirm('Mark this patient as Absent?')) return;
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
  const [summaryAptId, setSummaryAptId] = useState<string | null>(null);

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
      {summaryAptId && <SummaryModal aptId={summaryAptId} onClose={() => setSummaryAptId(null)} />}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
      </div>
      
      {error && <div className="bg-white text-red-600 p-3 rounded-md">{error}</div>}

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-md p-2 bg-blue-100"><Users className="h-6 w-6 text-blue-600" /></div><div><p className="text-sm font-medium text-slate-500">Total Today</p><p className="text-2xl font-bold text-slate-900">{total}</p></div></div>
        <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-md p-2 bg-orange-100"><Activity className="h-6 w-6 text-orange-600" /></div><div><p className="text-sm font-medium text-slate-500">Waiting</p><p className="text-2xl font-bold text-slate-900">{waiting}</p></div></div>
        <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-md p-2 bg-green-100"><CheckCircle2 className="h-6 w-6 text-green-600" /></div><div><p className="text-sm font-medium text-slate-500">Completed</p><p className="text-2xl font-bold text-slate-900">{completed}</p></div></div>
      </div>

      {queue.filter(q => q.status === 'IN_CONSULTATION').length > 0 && (
          <div className="rounded-md border border-blue-200 bg-blue-50 shadow-sm overflow-hidden">
              <div className="px-6 py-4 flex justify-between items-center bg-slate-50">
                  <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-700 animate-pulse" /> Current Consultation</h2>
              </div>
              <div className="divide-y divide-blue-200">
                  {queue.filter(q => q.status === 'IN_CONSULTATION').map(q => (
                      <div key={q.id} className="p-4 flex items-center justify-between">
                          <div>
                              <p className="font-bold text-slate-900 text-xl">
                                {q.appointment?.patient?.fullName}
                                {q.appointment?.patient?.aadhaarNumber && <span className="text-sm font-normal text-slate-500 ml-2">Aadhaar: {q.appointment.patient.aadhaarNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}</span>}
                              </p>
                              <p className="text-sm font-medium text-slate-700">Type: {q.appointment?.appointmentType} • Queue: T-{q.tokenNumber}</p>
                          </div>
                          <button onClick={() => navigate(`/doctor/consultation/${q.appointment?.appointmentId}`)} className="bg-blue-700 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-blue-800">Resume / Complete</button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {queue.filter(q => q.appointment?.appointmentType === 'EMERGENCY' && q.status !== 'COMPLETED' && q.status !== 'NO_SHOW' && q.status !== 'IN_CONSULTATION').length > 0 && (
          <div className="rounded-md border border-red-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-red-200 px-6 py-4 flex justify-between items-center bg-white">
                  <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">🚨 Emergency Queue</h2>
              </div>
              <div className="divide-y divide-red-100">
                  {queue.filter(q => q.appointment?.appointmentType === 'EMERGENCY' && q.status !== 'COMPLETED' && q.status !== 'NO_SHOW' && q.status !== 'IN_CONSULTATION').map(q => (
                      <div key={q.id} className="p-4 flex items-center justify-between">
                          <div>
                                <p className="font-bold text-slate-900 text-lg">
                                  {q.appointment?.patient?.fullName}
                                  {q.appointment?.patient?.aadhaarNumber && <span className="text-sm font-normal text-slate-500 ml-2">Aadhaar: {q.appointment.patient.aadhaarNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}</span>}
                                </p>
                              <p className="text-sm font-medium text-red-600">Priority: HIGH • Status: {q.status}</p>
                          </div>
                          <button onClick={() => handleStartConsultation(q.appointment?.appointmentId)} className="bg-red-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-red-700">Start Emergency</button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {queue.filter(q => q.appointment?.appointmentType === 'WALK_IN' && q.status === 'WAITING').length > 0 && (
          <div className="rounded-md border border-purple-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-purple-200 px-6 py-4 flex justify-between items-center bg-purple-50">
                  <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">Walk-In Patients</h2>
              </div>
              <div className="divide-y divide-purple-100">
                  {queue.filter(q => q.appointment?.appointmentType === 'WALK_IN' && q.status === 'WAITING').map(q => (
                      <div key={q.id} className="p-4 flex items-center justify-between">
                          <div>
                                <p className="font-bold text-slate-900 text-lg">
                                  {q.appointment?.patient?.fullName}
                                  {q.appointment?.patient?.aadhaarNumber && <span className="text-sm font-normal text-slate-500 ml-2">Aadhaar: {q.appointment.patient.aadhaarNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}</span>}
                                </p>
                              <p className="text-sm font-medium text-slate-500">Status: {q.status} • Queue: T-{q.tokenNumber}</p>
                          </div>
                          <button onClick={() => handleStartConsultation(q.appointment?.appointmentId)} className="bg-purple-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-purple-700">Start Walk-In</button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
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
                                  <p className="font-bold text-slate-900 text-lg">
                                  {q.appointment?.patient?.fullName}
                                  {q.appointment?.patient?.aadhaarNumber && <span className="text-sm font-normal text-slate-500 ml-2">Aadhaar: {q.appointment.patient.aadhaarNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}</span>}
                                </p>
                                <p className="text-sm text-slate-500 font-medium">Time: {q.appointment?.slotStart?.substring(0,5)} • ✓ Checked In</p>
                            </div>
                        </div>
                        <button onClick={() => handleStartConsultation(q.appointment?.appointmentId)} className="bg-blue-700 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-blue-800 shadow-sm">
                            Start Consultation
                        </button>
                    </div>
                ))
            )}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
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
                                  <p className="font-bold text-slate-900 text-lg">
                                  {q.appointment?.patient?.fullName}
                                  {q.appointment?.patient?.aadhaarNumber && <span className="text-sm font-normal text-slate-500 ml-2">Aadhaar: {q.appointment.patient.aadhaarNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}</span>}
                                </p>
                                <p className="text-sm text-slate-500 font-medium">Time: {q.appointment?.slotStart?.substring(0,5) || 'N/A'} • Type: {q.appointment?.appointmentType}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            {q.status === 'BOOKED' && <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded text-sm font-semibold">Not Checked In</span>}
                            {q.status === 'WAITING' && <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-semibold">✓ Checked In (Waiting)</span>}
                            {q.status === 'IN_CONSULTATION' && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-semibold">In Consultation</span>}
                            {q.status === 'COMPLETED' && (
                                <div className="flex items-center gap-2">
                                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded text-sm font-semibold">Completed</span>
                                    <button onClick={() => setSummaryAptId(q.appointment?.appointmentId)} className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm font-semibold hover:bg-purple-200 flex items-center gap-1.5">
                                        <FileText className="h-3.5 w-3.5" /> View Summary
                                    </button>
                                </div>
                            )}
                            {q.status === 'NO_SHOW' && <span className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm font-semibold">Absent</span>}
                            
                            {q.status === 'BOOKED' && (
                              <button onClick={() => handleNoShow(q.appointment?.appointmentId)} className="bg-orange-100 text-orange-700 px-3 py-1 rounded text-sm font-semibold hover:bg-orange-200">Mark as Absent</button>
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





