import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CheckCircle2, 
  Activity, 
  Loader2, 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  Clock, 
  Phone, 
  FileText, 
  X, 
  Sparkles, 
  Stethoscope, 
  UserCheck, 
  UserX, 
  Calendar, 
  Filter, 
  ArrowRight,
  ChevronRight,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorApi } from '../../api/doctorApi';
import { getUserFriendlyMessage } from '../../utils/errorUtils';
import { DocumentList } from '../../components/documents/DocumentList';

type FilterTab = 'ALL' | 'WAITING' | 'IN_CONSULTATION' | 'EMERGENCY' | 'WALK_IN' | 'COMPLETED' | 'NO_SHOW';

interface PatientPreviewData {
  appointmentId: string;
  tokenNumber: number | string;
  patientName: string;
  mobile: string;
  appointmentType: string;
  slotTime: string;
  gender?: string;
  bloodGroup?: string;
  allergies?: string;
  existingConditions?: string;
  reason?: string;
}

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  // Preview Modal State
  const [previewPatient, setPreviewPatient] = useState<PatientPreviewData | null>(null);
  const [preConsultationData, setPreConsultationData] = useState<any | null>(null);
  const [loadingPreConsultation, setLoadingPreConsultation] = useState(false);

  // No-Show Confirmation Modal State
  const [noShowModalAppointment, setNoShowModalAppointment] = useState<{ id: string; patientName: string; tokenNumber: number | string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQueue = (isManual = false) => {
    if (isManual) setRefreshing(true);
    doctorApi.getQueueToday()
      .then(res => {
        if (res.success) {
          setQueue(res.data || []);
          setError('');
          setLastUpdated(new Date());
          if (isManual) {
            toast.success('Queue refreshed');
          }
        } else {
          setError(res.message || 'Failed to fetch queue');
        }
      })
      .catch((e) => {
        const msg = getUserFriendlyMessage(e);
        setError(msg);
        if (isManual) toast.error(msg);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchQueue();
    // Auto-refresh every 15 seconds
    const interval = setInterval(() => fetchQueue(false), 15000);
    return () => clearInterval(interval);
  }, []);

  const handleStartConsultation = async (appointmentId: string) => {
    setActionLoading(true);
    try {
      await doctorApi.startConsultation(appointmentId);
      toast.success('Consultation started');
      navigate(`/doctor/consultation/${appointmentId}`);
    } catch (e) {
      console.error(e);
      // Navigate even if already started
      navigate(`/doctor/consultation/${appointmentId}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenNoShowModal = (appointmentId: string, patientName: string, tokenNumber: number | string) => {
    setNoShowModalAppointment({ id: appointmentId, patientName, tokenNumber });
  };

  const handleConfirmNoShow = async () => {
    if (!noShowModalAppointment) return;
    setActionLoading(true);
    try {
      const res = await doctorApi.markNoShow(noShowModalAppointment.id);
      if (res.success) {
        toast.success(`Appointment for ${noShowModalAppointment.patientName} marked as No Show`);
        setNoShowModalAppointment(null);
        fetchQueue(false);
      } else {
        toast.error(res.message || 'Failed to mark as No Show');
      }
    } catch (e) {
      toast.error(getUserFriendlyMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPatientPreview = async (item: any) => {
    const aptId = item.appointment?.appointmentId || item.tokenId;
    const patientData: PatientPreviewData = {
      appointmentId: aptId,
      tokenNumber: item.tokenNumber || 'N/A',
      patientName: item.appointment?.patient?.fullName || 'Patient',
      mobile: item.appointment?.patient?.mobile || 'N/A',
      appointmentType: item.appointment?.appointmentType || 'OPD',
      slotTime: item.appointment?.slotStart?.substring(0, 5) || 'N/A',
      gender: item.appointment?.patient?.gender,
      bloodGroup: item.appointment?.patient?.bloodGroup,
      allergies: item.appointment?.patient?.allergies,
      existingConditions: item.appointment?.patient?.existingConditions,
      reason: item.appointment?.reason,
    };

    setPreviewPatient(patientData);
    setPreConsultationData(null);
    setLoadingPreConsultation(true);

    try {
      const res = await doctorApi.getPreConsultation(aptId);
      if (res.success && res.data) {
        setPreConsultationData(res.data);
      }
    } catch {
      // Pre-consultation may not exist yet, which is expected for some patients
      setPreConsultationData(null);
    } finally {
      setLoadingPreConsultation(false);
    }
  };

  // KPI Statistics
  const total = queue.length;
  const waiting = queue.filter(q => q.status === 'WAITING' || q.status === 'READY').length;
  const inConsultation = queue.filter(q => q.status === 'IN_CONSULTATION').length;
  const emergency = queue.filter(q => q.appointment?.appointmentType === 'EMERGENCY' && q.status !== 'COMPLETED' && q.status !== 'NO_SHOW').length;
  const walkIns = queue.filter(q => q.appointment?.appointmentType === 'WALK_IN' && q.status === 'WAITING').length;
  const completed = queue.filter(q => q.status === 'COMPLETED').length;
  const noShow = queue.filter(q => q.status === 'NO_SHOW').length;

  // Filtered Queue
  const filteredQueue = useMemo(() => {
    return queue.filter(q => {
      // Search matching
      const name = q.appointment?.patient?.fullName?.toLowerCase() || '';
      const mobile = q.appointment?.patient?.mobile || '';
      const aptId = q.appointment?.appointmentId?.toLowerCase() || '';
      const tokenNum = String(q.tokenNumber || '');
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch = !query || name.includes(query) || mobile.includes(query) || aptId.includes(query) || tokenNum.includes(query);
      if (!matchesSearch) return false;

      // Tab filtering
      switch (activeTab) {
        case 'WAITING':
          return q.status === 'WAITING' || q.status === 'READY';
        case 'IN_CONSULTATION':
          return q.status === 'IN_CONSULTATION';
        case 'EMERGENCY':
          return q.appointment?.appointmentType === 'EMERGENCY';
        case 'WALK_IN':
          return q.appointment?.appointmentType === 'WALK_IN';
        case 'COMPLETED':
          return q.status === 'COMPLETED';
        case 'NO_SHOW':
          return q.status === 'NO_SHOW';
        case 'ALL':
        default:
          return true;
      }
    });
  }, [queue, searchQuery, activeTab]);

  const activeConsultationItems = queue.filter(q => q.status === 'IN_CONSULTATION');
  const emergencyWaitingItems = queue.filter(q => q.appointment?.appointmentType === 'EMERGENCY' && q.status === 'WAITING');

  if (loading && queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">Loading doctor queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Doctor Clinical Queue</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span>Manage today's appointments, queue tokens, and patient consultations.</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-400">Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchQueue(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            title="Refresh queue"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => fetchQueue(true)} className="text-xs font-semibold underline text-red-800 hover:text-red-900">
            Try Again
          </button>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`p-4 rounded-xl border transition-all text-left flex items-center justify-between ${
            activeTab === 'ALL'
              ? 'bg-blue-50 border-blue-400 shadow-sm ring-1 ring-blue-400'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Today</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{total}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-100 text-blue-600">
            <Users className="w-5 h-5" />
          </div>
        </button>

        <button
          onClick={() => setActiveTab('WAITING')}
          className={`p-4 rounded-xl border transition-all text-left flex items-center justify-between ${
            activeTab === 'WAITING'
              ? 'bg-amber-50 border-amber-400 shadow-sm ring-1 ring-amber-400'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Waiting</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{waiting}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-100 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </button>

        <button
          onClick={() => setActiveTab('IN_CONSULTATION')}
          className={`p-4 rounded-xl border transition-all text-left flex items-center justify-between ${
            activeTab === 'IN_CONSULTATION'
              ? 'bg-indigo-50 border-indigo-400 shadow-sm ring-1 ring-indigo-400'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">In Room</p>
            <p className="text-2xl font-black text-indigo-600 mt-1">{inConsultation}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-600">
            <Activity className="w-5 h-5" />
          </div>
        </button>

        <button
          onClick={() => setActiveTab('EMERGENCY')}
          className={`p-4 rounded-xl border transition-all text-left flex items-center justify-between ${
            activeTab === 'EMERGENCY'
              ? 'bg-rose-50 border-rose-400 shadow-sm ring-1 ring-rose-400'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Emergency</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{emergency}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-100 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`p-4 rounded-xl border transition-all text-left flex items-center justify-between ${
            activeTab === 'COMPLETED'
              ? 'bg-emerald-50 border-emerald-400 shadow-sm ring-1 ring-emerald-400'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{completed}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Active Consultation Spotlight Banner */}
      {activeConsultationItems.length > 0 && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md border border-blue-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-blue-500/30 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm border border-blue-400/30">
                <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></span>
                ACTIVE CONSULTATION IN PROGRESS
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-2">
                {activeConsultationItems[0].appointment?.patient?.fullName || 'Patient'}
              </h2>
              <p className="text-sm text-blue-200 flex items-center gap-3">
                <span>Token: <strong className="text-white">#{activeConsultationItems[0].tokenNumber}</strong></span>
                <span>•</span>
                <span>Type: <strong className="text-white">{activeConsultationItems[0].appointment?.appointmentType || 'OPD'}</strong></span>
                <span>•</span>
                <span>Apt ID: <strong className="text-white">{activeConsultationItems[0].appointment?.appointmentId}</strong></span>
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => handleOpenPatientPreview(activeConsultationItems[0])}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors backdrop-blur-sm"
              >
                View Patient Info
              </button>
              <button
                onClick={() => navigate(`/doctor/consultation/${activeConsultationItems[0].appointment?.appointmentId}`)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-500 hover:bg-blue-400 text-white shadow-lg transition-all"
              >
                <span>Resume Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Alert Banner */}
      {emergencyWaitingItems.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-600 text-white rounded-xl mt-0.5 animate-bounce">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-rose-900 text-base sm:text-lg flex items-center gap-2">
                  Emergency Patient Waiting ({emergencyWaitingItems.length})
                </h3>
                <p className="text-sm text-rose-700 mt-0.5">
                  High priority attention required for {emergencyWaitingItems[0].appointment?.patient?.fullName} (Token #{emergencyWaitingItems[0].tokenNumber}).
                </p>
              </div>
            </div>
            <button
              onClick={() => handleStartConsultation(emergencyWaitingItems[0].appointment?.appointmentId)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors"
            >
              <span>Start Emergency Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Tab Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient name, phone, token, or Apt ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Status Stats Summary */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Showing {filteredQueue.length} of {total} patients</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Patients', count: total },
              { id: 'WAITING', label: 'Waiting / Checked In', count: waiting },
              { id: 'IN_CONSULTATION', label: 'In Consultation', count: inConsultation },
              { id: 'EMERGENCY', label: 'Emergency', count: emergency },
              { id: 'WALK_IN', label: 'Walk-In', count: walkIns },
              { id: 'COMPLETED', label: 'Completed', count: completed },
              { id: 'NO_SHOW', label: 'No Show', count: noShow },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FilterTab)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === tab.id ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Patient Queue List */}
        <div className="divide-y divide-slate-100">
          {filteredQueue.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">No patients found</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? `No appointments match your search query "${searchQuery}".`
                  : `No appointments are currently categorized under "${activeTab}".`}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : (
            filteredQueue.map((item) => {
              const apt = item.appointment;
              const patient = apt?.patient;
              const isWaiting = item.status === 'WAITING' || item.status === 'READY';
              const isInRoom = item.status === 'IN_CONSULTATION';
              const isCompleted = item.status === 'COMPLETED';
              const isNoShow = item.status === 'NO_SHOW';
              const isEmergency = apt?.appointmentType === 'EMERGENCY';
              const isWalkIn = apt?.appointmentType === 'WALK_IN';

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    isEmergency
                      ? 'bg-rose-50/40 hover:bg-rose-50/70'
                      : isInRoom
                      ? 'bg-blue-50/40 hover:bg-blue-50/70'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Left: Token Badge & Patient Summary */}
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Token Circle */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 font-black shadow-xs ${
                        isEmergency
                          ? 'bg-rose-600 text-white'
                          : isInRoom
                          ? 'bg-blue-600 text-white ring-2 ring-blue-400/50'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-[10px] leading-none uppercase font-bold opacity-80">Token</span>
                      <span className="text-base leading-none font-extrabold mt-0.5">{item.tokenNumber || '—'}</span>
                    </div>

                    {/* Patient Core Info */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base">{patient?.fullName || 'Patient'}</h4>
                        
                        {/* Type Badge */}
                        {isEmergency && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" /> Emergency
                          </span>
                        )}
                        {isWalkIn && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                            <UserCheck className="w-3 h-3" /> Walk-In
                          </span>
                        )}
                        {!isEmergency && !isWalkIn && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            <Calendar className="w-3 h-3" /> {apt?.appointmentType || 'Scheduled'}
                          </span>
                        )}

                        {/* Status Badge */}
                        {isWaiting && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            ✓ Waiting in Clinic
                          </span>
                        )}
                        {isInRoom && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 animate-pulse">
                            ● In Consultation
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            ✓ Completed
                          </span>
                        )}
                        {isNoShow && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            No Show
                          </span>
                        )}
                      </div>

                      {/* Subtitle Details */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                        {apt?.slotStart && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Slot: {apt.slotStart.substring(0, 5)}
                          </span>
                        )}
                        {patient?.mobile && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {patient.mobile}
                          </span>
                        )}
                        {patient?.gender && (
                          <span>Gender: <strong>{patient.gender}</strong></span>
                        )}
                        {patient?.bloodGroup && (
                          <span>Blood Group: <strong>{patient.bloodGroup}</strong></span>
                        )}
                        <span className="text-slate-400">ID: {apt?.appointmentId || item.tokenId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                    {/* Quick Preview Modal Trigger */}
                    <button
                      onClick={() => handleOpenPatientPreview(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                      title="View AI pre-consultation and medical records"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>AI Notes & Records</span>
                    </button>

                    {/* Primary Actions based on status */}
                    {isWaiting && (
                      <>
                        <button
                          onClick={() => handleStartConsultation(apt?.appointmentId)}
                          disabled={actionLoading}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all ${
                            isEmergency
                              ? 'bg-rose-600 hover:bg-rose-700'
                              : isWalkIn
                              ? 'bg-purple-600 hover:bg-purple-700'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Start Consultation</span>
                        </button>
                        <button
                          onClick={() => handleOpenNoShowModal(apt?.appointmentId, patient?.fullName || 'Patient', item.tokenNumber)}
                          className="px-2.5 py-2 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Mark as No Show"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {isInRoom && (
                      <button
                        onClick={() => navigate(`/doctor/consultation/${apt?.appointmentId}`)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
                      >
                        <span>Resume Consultation</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {item.status === 'BOOKED' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">Check-in Pending</span>
                        <button
                          onClick={() => handleOpenNoShowModal(apt?.appointmentId, patient?.fullName || 'Patient', item.tokenNumber)}
                          className="text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Mark No Show
                        </button>
                      </div>
                    )}

                    {isCompleted && (
                      <button
                        onClick={() => navigate(`/doctor/consultations`)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Past Summary</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Patient Pre-Consultation & Info Drawer Modal */}
      {previewPatient && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center font-bold text-blue-300">
                  #{previewPatient.tokenNumber}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{previewPatient.patientName}</h3>
                  <p className="text-xs text-slate-300 flex items-center gap-2">
                    <span>{previewPatient.appointmentType}</span>
                    <span>•</span>
                    <span>Apt ID: {previewPatient.appointmentId}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewPatient(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Patient Core Summary Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Contact</span>
                  <span className="font-semibold text-slate-900">{previewPatient.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Gender</span>
                  <span className="font-semibold text-slate-900">{previewPatient.gender || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Blood Group</span>
                  <span className="font-semibold text-slate-900">{previewPatient.bloodGroup || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Slot Time</span>
                  <span className="font-semibold text-slate-900">{previewPatient.slotTime}</span>
                </div>
              </div>

              {/* Pre-Consultation AI Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>AI Pre-Consultation Summary</span>
                </div>

                {loadingPreConsultation ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                    <p className="text-xs text-slate-500">Retrieving pre-consultation insights...</p>
                  </div>
                ) : preConsultationData ? (
                  <div className="space-y-3">
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-2 text-sm text-slate-700">
                      <p className="font-semibold text-indigo-950 flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-indigo-600" />
                        Chief Complaint & Symptoms:
                      </p>
                      <p className="font-medium text-slate-900 pl-5">
                        {preConsultationData.chiefComplaint || 'No chief complaint recorded'}
                      </p>
                      {preConsultationData.symptoms && (
                        <p className="text-xs text-slate-600 pl-5">
                          <strong>Symptoms:</strong> {preConsultationData.symptoms}
                        </p>
                      )}
                      {preConsultationData.severity && (
                        <p className="text-xs text-slate-600 pl-5">
                          <strong>Severity:</strong> {preConsultationData.severity} • <strong>Duration:</strong> {preConsultationData.duration || 'N/A'}
                        </p>
                      )}
                    </div>

                    {preConsultationData.aiSummary && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Structured Clinical Notes</p>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {preConsultationData.aiSummary}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                    No pre-consultation survey submitted by patient for this appointment.
                  </div>
                )}
              </div>

              {/* Uploaded Documents */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Attached Medical Documents</span>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <DocumentList appointmentId={previewPatient.appointmentId} />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setPreviewPatient(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setPreviewPatient(null);
                  handleStartConsultation(previewPatient.appointmentId);
                }}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Open Clinical Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Show Confirmation Modal */}
      {noShowModalAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <UserX className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Mark Patient as No Show?</h3>
              <p className="text-sm text-slate-500">
                Are you sure you want to mark token <strong>#{noShowModalAppointment.tokenNumber}</strong> for{' '}
                <strong>{noShowModalAppointment.patientName}</strong> as No Show?
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
              This will update the appointment status and free up doctor schedule capacity.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setNoShowModalAppointment(null)}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmNoShow}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Confirm No Show</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


