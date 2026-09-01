import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, FileText, CheckCircle2, AlertCircle, Loader2, Ticket, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientApi } from '../../api/patientApi';
import { getUserFriendlyMessage } from '../../utils/errorUtils';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation, Trans } from 'react-i18next';


function TokenModal({ apt, onClose }: { apt: any; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ticket className="h-6 w-6 text-white" />
            <h3 className="text-lg font-bold text-white">{t('patientDashboard.appointment_token')}</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-6 py-6 text-center border-b border-slate-200 bg-slate-50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{t('patientDashboard.your_token')}</p>
          <p className="text-4xl font-black text-blue-700 tracking-wide">{apt.tokenId || t('patientDashboard.not_assigned')}</p>
        </div>
        <div className="px-6 py-4 space-y-0">
          {[
            [t('patientDashboard.appointment_id'), apt.appointmentId],
            ['Doctor', apt.doctor?.name || '\u2014'],
            ['Department', apt.department?.name || '\u2014'],
            [t('patientDashboard.hospital'), apt.hospital?.name || t('patientDashboard.main_hospital')],
            [t('patientDashboard.date'), apt.appointmentDate],
            [t('patientDashboard.time_slot'), (apt.slotStart?.substring(0,5) || '') + ' \u2013 ' + (apt.slotEnd?.substring(0,5) || '')],
            [t('patientDashboard.status'), apt.status === 'BOOKED' ? t('patientDashboard.booked') : apt.status === 'REASSIGNED' ? t('patientDashboard.reassigned') : apt.status === 'COMPLETED' ? t('patientDashboard.completed') : apt.status === 'NO_SHOW' ? t('patientDashboard.not_visited') : apt.status],
            ['Check-In', apt.checkInStatus === 'CHECKED_IN' ? '\u2713 Checked In' : apt.checkInStatus === 'IN_CONSULTATION' ? 'In Consultation' : 'Not Checked In'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-500">{label}</span>
              <span className="text-sm font-semibold text-slate-900">{value}</span>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button onClick={onClose} className="w-full bg-blue-700 text-white py-2.5 rounded-md font-semibold hover:bg-blue-800 transition-colors">{t('patientDashboard.close')}</button>
        </div>
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { name } = useAuth();
  const [activeTab, setActiveTab] = useState<"upcoming" | "visited" | "notVisited">("upcoming");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tokenApt, setTokenApt] = useState<any>(null);

  useEffect(() => {
    patientApi.getDashboard()
      .then((res) => {
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message || t('patientDashboard.error_load'));
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

  
  const getDoctorName = (engName: string) => {
    if (!engName) return engName;
    if (!i18n.language.startsWith('te')) return engName;
    const teluguDoctorNames: Record<string, string> = {
      "Ramesh Sharma": "రమేష్ శర్మ",
      "Priya Desai": "ప్రియా దేశాయ్",
      "Anil Kumar": "అనిల్ కుమార్",
      "Meena Iyer": "మీనా అయ్యర్",
      "Suresh Patel": "సురేష్ పటేల్",
      "Kavita Singh": "కవితా సింగ్",
      "Rohan Das": "రోహన్ దాస్",
      "Vikram Seth": "విక్రమ్ సేథ్",
      "Anjali Menon": "అంజలి మీనన్",
      "Naveen Kumar": "నవీన్ కుమార్"
    };
    let cleanName = engName.replace("Dr. ", "");
    let translated = teluguDoctorNames[cleanName] || cleanName;
    return engName.includes("Dr. ") ? "డా. " + translated : translated;
  };

  const translateNotificationMessage = (msg: string) => {
    if (!msg) return msg;
    if (msg.includes('We apologize for the inconvenience')) {
      return <span>{t('patientDashboard.apology')}</span>;
    }
    if (msg.includes('Your appointment has been reassigned to Dr.')) {
      const match = msg.match(/Dr\. (.*?)\. New Date: (.*?)\. New Time: (.*?)\. New Token: (.*?)\./);
      if (match) {
        return (
          <Trans
            i18nKey="patientDashboard.reassigned_notice"
            values={{ newDoctor: getDoctorName(match[1]), date: match[2], time: match[3], token: match[4] }}
            components={{ bold: <strong className="font-extrabold text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded shadow-sm mx-1" /> }}
          />
        );
      }
    }
    return <span>{msg}</span>;
  };

  const handleCheckIn = async (appointmentId: string) => {
      try {
          setLoading(true);
          const res = await patientApi.checkIn(appointmentId);
          if (res.success) {
              toast.success(t('patientDashboard.success_check_in'));
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
        {tokenApt && <TokenModal apt={tokenApt} onClose={() => setTokenApt(null)} />}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('patientDashboard.good_morning').replace('{name}', name || 'Patient')}</h1>
            <p className="text-slate-500 text-sm mt-1">{t('patientDashboard.healthcare_summary')}</p>
          </div>
          {patient?.aadhaarNumber && (
            <div className="bg-white px-6 py-4 rounded-md border border-slate-200 shadow-sm flex flex-col sm:items-end min-w-[280px]">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">{t('patientDashboard.aadhaar_number')}</span>
              <div className="flex gap-5 text-2xl font-bold text-slate-800 tracking-wider font-mono">
                {patient.aadhaarNumber.match(/.{1,4}/g)?.map((part: string, idx: number) => (
                  <span key={idx}>{part}</span>
                ))}
              </div>
            </div>
          )}
        </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-blue-100"><Calendar className="h-6 w-6 text-blue-700" /></div><div><p className="text-sm font-medium text-slate-500">{t('patientDashboard.upcoming')}</p><p className="text-2xl font-bold text-slate-900">{upcomingAppointmentsCount}</p></div></div>
          <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-orange-100"><Clock className="h-6 w-6 text-orange-600" /></div><div><p className="text-sm font-medium text-slate-500">{t('patientDashboard.not_visited')}</p><p className="text-2xl font-bold text-slate-900">{data.notVisitedCount}</p></div></div>
          <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-green-100"><CheckCircle2 className="h-6 w-6 text-green-600" /></div><div><p className="text-sm font-medium text-slate-500">{t('patientDashboard.completed')}</p><p className="text-2xl font-bold text-slate-900">{completedAppointmentsCount}</p></div></div>
          <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4"><div className="rounded-lg p-3 bg-purple-100"><FileText className="h-6 w-6 text-purple-600" /></div><div><p className="text-sm font-medium text-slate-500">{t('patientDashboard.prescriptions')}</p><p className="text-2xl font-bold text-slate-900">{prescriptionCount}</p></div></div>
        </div>

        {data.notifications && data.notifications.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><AlertCircle className="h-5 w-5" /> {t('patientDashboard.notifications')}</h3>
            <div className="space-y-2">
              {data.notifications.map((n: any) => (
                <div key={n.id} className="bg-white p-3 rounded shadow-sm border border-blue-100 text-sm text-blue-800">
                  <span className="font-semibold">{n.type === 'REASSIGNMENT_PENDING' ? t('patientDashboard.action_required') : t('patientDashboard.update_label')} </span>
                  {translateNotificationMessage(n.message)}
                </div>
              ))}
            </div>
          </div>
        )}


      {upcomingAppointmentsCount > 0 && (
        <div className="rounded-md border border-orange-200 bg-orange-50 shadow-sm overflow-hidden mb-6 p-4 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-orange-600 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900">{t('patientDashboard.pre_consultation_required')}</h3>
            <p className="text-sm text-orange-800 mt-1">{t('patientDashboard.pre_consultation_desc')}</p>
          </div>
          <button onClick={() => {
            if (upcomingAppointments && upcomingAppointments.length > 0) {
              navigate(`/patient/pre-consultation?appointmentId=${upcomingAppointments[0].appointmentId}`);
            }
          }} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            {t('patientDashboard.start_pre_consultation')}
          </button>
        </div>
      )}

      <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 flex gap-4">
          <button onClick={() => setActiveTab('upcoming')} className={`text-sm font-semibold pb-4 -mb-4 border-b-2 ${activeTab === 'upcoming' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t('patientDashboard.upcoming')} ({data.upcomingAppointmentsCount})
          </button>
          <button onClick={() => setActiveTab('visited')} className={`text-sm font-semibold pb-4 -mb-4 border-b-2 ${activeTab === 'visited' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t('patientDashboard.visited')} ({data.completedAppointmentsCount})
          </button>
          <button onClick={() => setActiveTab('notVisited')} className={`text-sm font-semibold pb-4 -mb-4 border-b-2 ${activeTab === 'notVisited' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t('patientDashboard.not_visited')} ({data.notVisitedCount})
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {activeTab === 'upcoming' && (
            data.upcomingAppointments?.length === 0 ? (
                <div className="p-6 text-slate-500 text-center">{t('patientDashboard.no_upcoming')}</div>
            ) : (
              data.upcomingAppointments?.map((apt: any) => (
                <div key={apt.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-slate-900">{getDoctorName(apt.doctor?.name)} - {apt.department?.name}</p>
                        <p className="text-sm text-slate-500 mt-1">{apt.appointmentDate} {t('patientDashboard.at')} {apt.slotStart?.substring(0,5)} @ {apt.hospital?.name || t('patientDashboard.main_hospital')}</p>
                        <p className="text-xs text-slate-400 mt-1">{t('patientDashboard.id')} {apt.appointmentId}</p>
                        {apt.status === 'REASSIGNED' && apt.originalDoctor && (
                            <p className="text-xs text-orange-600 font-medium mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {apt.originalDoctor.id !== apt.doctor?.id
                                    ? `t('patientDashboard.reassigned_originally', { name: getDoctorName(apt.originalDoctor.name) })`
                                    : t('patientDashboard.rescheduled_new_time')}
                            </p>
                        )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                        {apt.status === 'REASSIGNMENT_PENDING' && (
                            <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">{t('patientDashboard.reassignment_pending')}</span>
                        )}
                        {(apt.status === 'BOOKED' || apt.status === 'REASSIGNED') && apt.checkInStatus === 'NOT_CHECKED_IN' && (
                            <>
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">{t('patientDashboard.upcoming')}</span>
                                <button onClick={() => handleCheckIn(apt.appointmentId)} className="bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-blue-800 shadow-sm transition-colors">{t('patientDashboard.check_in_button')}</button>
                            </>
                        )}
                        {(apt.status === 'BOOKED' || apt.status === 'REASSIGNED') && apt.checkInStatus === 'CHECKED_IN' && (
                            <>
                                <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">{t('patientDashboard.checked_in_button')}</span>
                                <p className="text-sm text-green-700 font-medium">{t('patientDashboard.queue', { token: apt.tokenId || t('patientDashboard.pending') })}</p>
                                <p className="text-xs text-green-600">{t('patientDashboard.waiting_for_doctor')}</p>
                            </>
                        )}
                        {apt.checkInStatus === 'IN_CONSULTATION' && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 ring-1 ring-inset ring-blue-600/20">{t('patientDashboard.in_consultation_badge')}</span>
                        )}
                        <button onClick={() => setTokenApt(apt)} className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-800 text-xs font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors border border-blue-200">
                          <Ticket className="h-3.5 w-3.5" /> {t('patientDashboard.view_token')}
                        </button>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
          {activeTab === 'visited' && (
            data.visitedAppointments?.length === 0 ? (
                <div className="p-6 text-slate-500 text-center">{t('patientDashboard.no_visited')}</div>
            ) : (
              data.visitedAppointments?.map((apt: any) => (
                <div key={apt.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-slate-900">{getDoctorName(apt.doctor?.name)} - {apt.department?.name}</p>
                        <p className="text-sm text-slate-500 mt-1">{apt.appointmentDate} @ {apt.hospital?.name || t('patientDashboard.main_hospital')}</p>
                        <p className="text-xs text-slate-400 mt-1">{t('patientDashboard.id')} {apt.appointmentId}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setTokenApt(apt)} className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-800 text-xs font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors border border-blue-200">
                        <Ticket className="h-3.5 w-3.5" /> {t('patientDashboard.view_token')}
                      </button>
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">{t('patientDashboard.visited')}</span>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
          {activeTab === 'notVisited' && (
            data.notVisitedAppointments?.length === 0 ? (
                <div className="p-6 text-slate-500 text-center">{t('patientDashboard.no_unvisited')}</div>
            ) : (
              data.notVisitedAppointments?.map((apt: any) => (
                <div key={apt.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-slate-900">{getDoctorName(apt.doctor?.name)} - {apt.department?.name}</p>
                        <p className="text-sm text-slate-500 mt-1">{apt.appointmentDate} @ {apt.hospital?.name || t('patientDashboard.main_hospital')}</p>
                        <p className="text-xs text-slate-400 mt-1">{t('patientDashboard.id')} {apt.appointmentId}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setTokenApt(apt)} className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-800 text-xs font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors border border-blue-200">
                        <Ticket className="h-3.5 w-3.5" /> {t('patientDashboard.view_token')}
                      </button>
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">{t('patientDashboard.not_visited')}</span>
                    </div>
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



