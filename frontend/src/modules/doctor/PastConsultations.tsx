import { useEffect, useState, useMemo } from 'react';
import { doctorApi } from '../../api/doctorApi';
import { getUserFriendlyMessage } from '../../utils/errorUtils';
import { 
  FileText, 
  Loader2, 
  ClipboardList, 
  Search, 
  X, 
  Calendar, 
  Stethoscope, 
  Phone
} from 'lucide-react';
import { DocumentList } from '../../components/documents/DocumentList';

export default function PastConsultations() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedConsultation, setSelectedConsultation] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await doctorApi.getPastConsultations(); 
        if (res.success) {
          const list = res.data || [];
          setConsultations(list);
          if (list.length > 0) {
            setSelectedConsultation(list[0]);
          }
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError(getUserFriendlyMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredConsultations = useMemo(() => {
    if (!searchQuery.trim()) return consultations;
    const q = searchQuery.toLowerCase().trim();
    return consultations.filter(c => {
      const name = c.patient?.fullName?.toLowerCase() || '';
      const mobile = c.patient?.mobile || '';
      const aptId = c.appointment?.appointmentId?.toLowerCase() || '';
      const diag = c.diagnosis?.toLowerCase() || '';
      const conId = c.consultationId?.toLowerCase() || '';
      return name.includes(q) || mobile.includes(q) || aptId.includes(q) || diag.includes(q) || conId.includes(q);
    });
  }, [consultations, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">Loading consultation records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Past Consultations & Clinical History</h1>
          <p className="text-sm text-slate-500 mt-1">Review finalized clinical documentation, patient diagnoses, and medical records.</p>
        </div>
        <div className="text-sm font-semibold text-slate-600 bg-slate-100 px-4 py-2 rounded-xl">
          Total Records: {consultations.length}
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">{error}</div>}

      {consultations.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-2xl border border-slate-200 space-y-3">
          <ClipboardList className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="font-bold text-slate-800 text-lg">No past consultations recorded</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Completed consultations and prescriptions will appear here once you finish patient visits from the queue.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column: List & Search (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient, diagnosis, Apt ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xs"
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

            {/* List */}
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {filteredConsultations.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
                  No records match "{searchQuery}".
                </div>
              ) : (
                filteredConsultations.map((c, idx) => {
                  const isSelected = selectedConsultation?.consultationId === c.consultationId;
                  const aptId = c.appointment?.appointmentId;
                  const patient = c.patient;

                  return (
                    <div
                      key={c.id || idx}
                      onClick={() => setSelectedConsultation(c)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/70 shadow-sm ring-1 ring-blue-500'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className="font-bold text-base text-slate-900">{patient?.fullName || 'Patient'}</h3>
                        <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      </div>

                      {c.diagnosis && (
                        <p className="text-xs font-semibold text-indigo-900 mb-2 flex items-center gap-1">
                          <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{c.diagnosis}</span>
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                        {patient?.mobile && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {patient.mobile}
                          </span>
                        )}
                        <span className="text-slate-400 font-mono text-[10px]">Apt: {aptId}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Selected Consultation Details (7 cols) */}
          <div className="lg:col-span-7">
            {selectedConsultation ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                {/* Patient Summary Header */}
                <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {selectedConsultation.patient?.fullName || 'Patient'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>Appointment ID: <strong className="text-slate-800">{selectedConsultation.appointment?.appointmentId}</strong></span>
                      <span>•</span>
                      <span>Consultation ID: <strong className="text-slate-800">{selectedConsultation.consultationId}</strong></span>
                    </p>
                  </div>
                  <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-700">Date:</span> {selectedConsultation.createdAt ? new Date(selectedConsultation.createdAt).toLocaleString() : 'N/A'}
                  </div>
                </div>

                {/* Clinical Notes Card */}
                <div className="space-y-4">
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-1">
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">Diagnosis</span>
                    <p className="text-base font-bold text-blue-950">{selectedConsultation.diagnosis || 'None recorded'}</p>
                  </div>

                  {selectedConsultation.observations && (
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Clinical Observations & Vitals</span>
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap">
                        {selectedConsultation.observations}
                      </div>
                    </div>
                  )}

                  {selectedConsultation.treatmentPlan && (
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Treatment Plan & Advice</span>
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap">
                        {selectedConsultation.treatmentPlan}
                      </div>
                    </div>
                  )}

                  {selectedConsultation.doctorNotes && (
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Internal Doctor Notes</span>
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap">
                        {selectedConsultation.doctorNotes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Attached Documents */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>Attached Medical Documents & Prescriptions</span>
                  </h3>
                  {selectedConsultation.appointment?.appointmentId ? (
                    <DocumentList appointmentId={selectedConsultation.appointment.appointmentId} />
                  ) : (
                    <p className="text-xs text-slate-500">No appointment ID available.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-500">
                Select a consultation from the left list to view detailed clinical records.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
