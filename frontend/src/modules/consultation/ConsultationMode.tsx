import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorApi } from '../../api/doctorApi';
import toast from 'react-hot-toast';
import { Loader2, FileText, User, Activity, Save, ChevronRight, Stethoscope, FileClock, Pill } from 'lucide-react';
import { DocumentList } from '../../components/documents/DocumentList';

const parseAiSummary = (text: string) => {
    if (!text) return { isParsed: false, raw: '' };
    const cleanedText = text.replace(/<n>/g, '\n').replace(/<s>/g, '');
    if (cleanedText.includes('• Summary:')) {
        const extract = (label: string) => {
            const regex = new RegExp('• ' + label + ':\\s*([\\s\\S]*?)(?=• |$)');
            const match = cleanedText.match(regex);
            return match ? match[1].trim() : 'Not specified';
        };
        return {
            isParsed: true,
            summary: extract('Summary'),
            symptoms: extract('Symptoms'),
            diagnosis: extract('Diagnosis'),
            medications: extract('Medications'),
            labValues: extract('Lab Values')
        };
    }
    
    if (cleanedText.includes('--- MEDICAL DOCUMENTS SUMMARY ---')) {
         return {
             isParsed: true,
             summary: cleanedText,
             symptoms: 'Aggregated from documents',
             diagnosis: 'N/A',
             medications: 'See document text',
             labValues: 'See document text'
         }
    }
    
    return { isParsed: false, raw: cleanedText };
};

export default function ConsultationMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [aiSummary, setAiSummary] = useState('');
  const [patientId, setPatientId] = useState<number | undefined>();
  const [patientName, setPatientName] = useState<string>('');
  const [activeTab, setActiveTab] = useState('notes');
  const [showDocs, setShowDocs] = useState(true);

  useEffect(() => {
    if(id) {
      setIsFetching(true);
      doctorApi.getPreConsultation(id).then(res => {
        if(res.success && res.data) {
            setAiSummary(res.data.aiSummary || '');
            if (res.data.appointment?.patient) {
                setPatientId(res.data.appointment.patient.id);
                const p = res.data.appointment.patient;
                setPatientName(p.name || p.firstName || [p.firstName, p.lastName].filter(Boolean).join(' ') || '');
            }
        }
      }).catch(e => console.error(e))
        .finally(() => setIsFetching(false));
    } else {
      setIsFetching(false);
    }
  }, [id]);
  
  const [observations, setObservations] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [plan, setPlan] = useState('');
  
  const [medicine, setMedicine] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once a day');
  const [duration, setDuration] = useState('');
  const [medicinesList, setMedicinesList] = useState<any[]>([]);

  const addMedicine = () => {
      if (medicine && dosage) {
          setMedicinesList([...medicinesList, { name: medicine, dosage, frequency, duration, instructions: '' }]);
          setMedicine('');
          setDosage('');
          setFrequency('Once a day');
          setDuration('');
      }
  };

  const removeMedicine = (index: number) => {
      setMedicinesList(medicinesList.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    if (!window.confirm('Signing this encounter will finalize the clinical documentation. Proceed?')) return;
    setLoading(true);
    try {
      const payload = {
        appointmentId: id,
        diagnosis: diagnosis || 'Not specified',
        observations: observations || 'Not specified',
        assessment: 'N/A',
        treatmentPlan: plan || 'Not specified',
        medicines: medicinesList
      };
      const conRes = await doctorApi.completeConsultation(payload);
      if (!conRes.success) {
          toast.error(conRes.message || "Error completing consultation");
          setLoading(false);
          return;
      }
      toast.success('Consultation Completed & Signed!');
      navigate('/doctor/dashboard');
    } catch (e: any) {
        toast.error(e.response?.data?.message || 'Error saving consultation');
    } finally {
        setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    toast.success('Draft saved');
  };

  const parsedAi = parseAiSummary(aiSummary);

  // ──────────────────────────────────────────────────────────────
  // RENDER
  // The parent (Layout.tsx) gives us a flex-1 overflow-hidden box.
  // We use h-full + flex-col to fill it exactly — no calc, no
  // negative margins, no competing viewport heights.
  // ──────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col bg-slate-100">

      {/* ── CONSULTATION HEADER ────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
            <User className="h-5 w-5 text-blue-700" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Patient Consultation</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {patientName && (
                <>
                  <p className="text-sm font-semibold text-slate-700">{patientName}</p>
                  <span className="text-slate-300">·</span>
                </>
              )}
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ID: {id?.substring(0,8)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowDocs(!showDocs)} 
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            {showDocs ? 'Hide Docs' : 'Show Docs'}
          </button>
          <div className="w-px h-7 bg-slate-200 hidden sm:block" />
          <button onClick={handleSaveDraft} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
            Save Draft
          </button>
          <button onClick={handleComplete} disabled={loading} className="px-5 py-2 text-sm font-bold text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors flex items-center gap-2 shadow-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Sign Encounter
          </button>
        </div>
      </div>

      {/* ── THREE-COLUMN WORKSPACE ─────────────────────────── */}
      {/* flex-1 + overflow-hidden makes this fill the remaining
          viewport height exactly. Each column scrolls internally. */}
      <div className="flex-1 flex min-h-0">

        {/* ─── LEFT: AI Context ─────────────────────────────── */}
        <aside className="hidden md:flex w-72 xl:w-80 shrink-0 flex-col border-r border-slate-200 bg-slate-50 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-blue-700" />
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">AI Intake Summary</h3>
            </div>
            
            {isFetching ? (
              <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600 mb-2" />
                <p className="text-xs font-medium">Synthesizing clinical context…</p>
              </div>
            ) : aiSummary ? (
              parsedAi.isParsed ? (
                <div className="space-y-3">
                  {/* Chief Complaint */}
                  <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-amber-50/60 border-b border-amber-100/60 px-3 py-2">
                      <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        Chief Complaint
                      </h4>
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="text-[13px] text-slate-900 whitespace-pre-wrap leading-snug">{parsedAi.summary}</p>
                    </div>
                  </section>

                  {/* Document Summary / Labs */}
                  {parsedAi.labValues && parsedAi.labValues !== 'Not specified' && parsedAi.labValues !== 'See document text' && (
                    <section className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                      <div className="bg-blue-50/80 border-b border-blue-100 px-3 py-2">
                        <h4 className="font-bold text-blue-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="h-3 w-3 text-blue-600" />
                          Document Summary
                        </h4>
                      </div>
                      <div className="px-3 py-2.5 bg-blue-50/10">
                        <p className="text-[13px] text-slate-800 whitespace-pre-wrap leading-snug">{parsedAi.labValues}</p>
                      </div>
                    </section>
                  )}

                  {/* Diagnosis / Medical History */}
                  {parsedAi.diagnosis && parsedAi.diagnosis !== 'Not specified' && parsedAi.diagnosis !== 'N/A' && (
                    <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 border-b border-slate-100 px-3 py-2">
                        <h4 className="font-bold text-slate-600 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                          <Activity className="h-3 w-3 text-slate-400" />
                          Existing Diagnosis
                        </h4>
                      </div>
                      <div className="px-3 py-2.5">
                        <p className="text-[13px] text-slate-800 leading-snug">{parsedAi.diagnosis}</p>
                      </div>
                    </section>
                  )}

                  {/* Reported Symptoms */}
                  <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-100 px-3 py-2">
                      <h4 className="font-bold text-slate-600 text-[11px] uppercase tracking-wider">Reported Symptoms</h4>
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="text-[13px] text-slate-800">{parsedAi.symptoms}</p>
                    </div>
                  </section>

                  {/* Current Medications */}
                  <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-100 px-3 py-2">
                      <h4 className="font-bold text-slate-600 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <Pill className="h-3 w-3 text-slate-400" /> Medications & Allergies
                      </h4>
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="text-[13px] text-slate-800">{parsedAi.medications}</p>
                    </div>
                  </section>

                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide text-center pt-1">
                    AI-extracted · Verify with patient
                  </p>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-[13px] text-slate-700 bg-white p-3 rounded-lg border border-slate-200">{parsedAi.raw}</p>
              )
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg p-5 text-center">
                <p className="text-slate-500 text-sm">No AI intake data available.</p>
              </div>
            )}
          </div>

          {/* Mobile doc toggle */}
          <div className="p-4 pt-0 lg:hidden mt-auto">
            <button 
              onClick={() => setShowDocs(!showDocs)} 
              className="w-full py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <FileText className="h-4 w-4 text-blue-600" />
              {showDocs ? 'Hide Documents' : 'View Documents'}
            </button>
          </div>
        </aside>

        {/* ─── CENTER: Clinical Workspace (DOMINANT) ────────── */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Tab bar */}
          <div className="border-b border-slate-200 px-6 flex gap-6 shrink-0">
            <button 
              onClick={() => setActiveTab('notes')} 
              className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'notes' ? 'border-blue-700 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Stethoscope className="h-4 w-4" /> Clinical Notes
            </button>
            <button 
              onClick={() => setActiveTab('rx')} 
              className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'rx' ? 'border-blue-700 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Pill className="h-4 w-4" /> Prescriptions
              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-[11px] font-bold">{medicinesList.length}</span>
            </button>
          </div>

          {/* Tab content — this is the ONE primary scroll area */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'notes' && (
              <div className="max-w-3xl space-y-6 mx-auto">
                {/* Subjective / Objective */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800 text-sm uppercase tracking-wider">Subjective / Objective</label>
                  <div className="border border-slate-300 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-shadow">
                    <textarea 
                      value={observations} 
                      onChange={e => setObservations(e.target.value)} 
                      rows={5} 
                      placeholder="Enter clinical observations, vitals, examination findings, and patient-reported information…"
                      className="w-full text-sm border-0 focus:ring-0 p-3 resize-y bg-transparent outline-none rounded-lg"
                    />
                  </div>
                </div>

                {/* Assessment / Diagnosis */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800 text-sm uppercase tracking-wider">Assessment / Diagnosis</label>
                  <div className="border border-slate-300 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-shadow">
                    <input 
                      value={diagnosis} 
                      onChange={e => setDiagnosis(e.target.value)} 
                      type="text" 
                      placeholder="Enter diagnosis or clinical assessment (ICD-10 or descriptive)…"
                      className="w-full text-sm border-0 focus:ring-0 p-3 bg-transparent font-medium text-slate-900 outline-none rounded-lg" 
                    />
                  </div>
                </div>

                {/* Treatment Plan */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800 text-sm uppercase tracking-wider">Treatment Plan</label>
                  <div className="border border-slate-300 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-shadow">
                    <textarea 
                      value={plan} 
                      onChange={e => setPlan(e.target.value)} 
                      rows={5} 
                      placeholder="Treatment plan, follow-up instructions, investigations, and orders…"
                      className="w-full text-sm border-0 focus:ring-0 p-3 resize-y bg-transparent outline-none rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rx' && (
              <div className="max-w-4xl space-y-6 mx-auto">
                {/* Add medication form */}
                <div className="bg-white border border-slate-200 rounded-lg p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
                  <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Add Medication</h4>
                  <div className="flex gap-3 flex-wrap items-end">
                    <div className="flex-1 min-w-[180px]">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Medicine</label>
                      <input value={medicine} onChange={e => setMedicine(e.target.value)} placeholder="e.g. Amoxicillin 500mg" className="w-full border border-slate-300 p-2 text-sm rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="w-24">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Dosage</label>
                      <input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="1-0-1" className="w-full border border-slate-300 p-2 text-sm rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="w-36">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Frequency</label>
                      <select value={frequency} onChange={e => setFrequency(e.target.value)} className="w-full border border-slate-300 p-2 text-sm rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                        <option>Once a day</option>
                        <option>Twice a day</option>
                        <option>Thrice a day</option>
                        <option>Every 6 hours</option>
                        <option>Every 8 hours</option>
                        <option>Every 12 hours</option>
                        <option>Once a week</option>
                        <option>Twice a week</option>
                        <option>As needed (SOS)</option>
                        <option>Before meals</option>
                        <option>After meals</option>
                        <option>At bedtime</option>
                      </select>
                    </div>
                    <div className="w-28">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Duration</label>
                      <input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder="5 days" className="w-full border border-slate-300 p-2 text-sm rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white" />
                    </div>
                    <button onClick={addMedicine} className="bg-slate-900 text-white px-5 py-2 text-sm font-bold rounded-md shadow hover:bg-slate-800 transition-colors h-[38px] flex items-center gap-1.5 shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                      Add
                    </button>
                  </div>
                </div>

                {/* Order set table */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Current Order Set</h4>
                    <span className="bg-white border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-bold">{medicinesList.length} items</span>
                  </div>
                  {medicinesList.length === 0 ? (
                    <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                      <Pill className="h-8 w-8 mb-2 text-slate-300" />
                      <p className="text-sm font-medium">No medications added yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                          <tr>
                            <th className="px-5 py-2.5 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Medication</th>
                            <th className="px-5 py-2.5 font-bold text-slate-500 uppercase tracking-wider text-[11px] w-28">Dosage</th>
                            <th className="px-5 py-2.5 font-bold text-slate-500 uppercase tracking-wider text-[11px] w-36">Frequency</th>
                            <th className="px-5 py-2.5 font-bold text-slate-500 uppercase tracking-wider text-[11px] w-28">Duration</th>
                            <th className="px-5 py-2.5 font-bold text-slate-500 uppercase tracking-wider text-[11px] w-20 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {medicinesList.map((m, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-3 font-semibold text-slate-900">{m.name}</td>
                              <td className="px-5 py-3 text-slate-700">{m.dosage}</td>
                              <td className="px-5 py-3 text-slate-700">{m.frequency}</td>
                              <td className="px-5 py-3 text-slate-700">{m.duration}</td>
                              <td className="px-5 py-3 text-right">
                                <button onClick={() => removeMedicine(idx)} className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded font-bold text-[11px] uppercase tracking-wider transition-colors">Remove</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT: Chart Documents (collapsible) ─────────── */}
        {showDocs && (
          <aside className="hidden lg:flex w-72 xl:w-80 shrink-0 flex-col border-l border-slate-200 bg-slate-50 overflow-y-auto">
            <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileClock className="h-4 w-4 text-blue-700" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Chart Documents</h3>
              </div>
              <button onClick={() => setShowDocs(false)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors" title="Hide documents">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="p-3 flex-1">
              {isFetching ? (
                <div className="py-10 flex flex-col items-center justify-center text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 mb-2" />
                  <p className="text-xs font-medium">Loading documents…</p>
                </div>
              ) : patientId ? (
                <DocumentList patientId={patientId} />
              ) : (
                <div className="bg-white border border-slate-200 rounded-lg p-5 text-center">
                  <p className="text-sm text-slate-500">No documents found.</p>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
