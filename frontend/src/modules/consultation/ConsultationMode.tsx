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
    
    // Fallback parser if the AI uses different bullet points
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
  const [patientName, setPatientName] = useState<string>('Unknown Patient');
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
                setPatientName(res.data.appointment.patient.name || 'Unknown Patient');
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
  
  // Prescription state
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

  const handleSaveDraft = async () => {
    // In a real app, this would hit a draft API. For now we simulate it.
    toast.success('Draft saved securely');
  };

  const parsedAi = parseAiSummary(aiSummary);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-100 -m-4 lg:-m-8 font-sans">
      {/* Top Header - EMR Style */}
      <div className="bg-white border-b border-slate-300 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10 sticky top-0">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3">
             <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
               <User className="h-6 w-6 text-blue-700" />
             </div>
             <div>
               <h1 className="text-xl font-bold text-slate-900 leading-tight">Patient Consultation</h1>
               <div className="flex items-center gap-3 mt-0.5">
                   <p className="text-sm font-semibold text-slate-700">{patientName}</p>
                   <span className="text-slate-300">•</span>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ID: {id?.substring(0,8)}</p>
               </div>
             </div>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setShowDocs(!showDocs)} 
             className="hidden xl:flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 transition-colors"
           >
             <FileText className="h-4 w-4" /> {showDocs ? 'Hide Documents' : 'Show Documents'}
           </button>
           <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block"></div>
           <button onClick={handleSaveDraft} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 shadow-sm transition-colors">Save Draft</button>
           <button onClick={handleComplete} disabled={loading} className="px-6 py-2 text-sm font-bold text-white bg-blue-700 border border-blue-800 rounded hover:bg-blue-800 shadow-sm transition-colors flex items-center gap-2">
             {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Sign Encounter
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT COLUMN: Patient Context & AI Intake */}
        <div className="w-full md:w-1/3 xl:w-[28%] min-w-[300px] max-w-[400px] bg-slate-50 border-r border-slate-200 flex flex-col overflow-y-auto">
           <div className="p-5">
             <div className="flex items-center gap-2 mb-4">
               <Activity className="h-5 w-5 text-blue-700" />
               <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">AI Intake Summary</h3>
             </div>
             
             {isFetching ? (
                 <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 shadow-sm">
                     <Loader2 className="h-6 w-6 animate-spin text-blue-600 mb-3" />
                     <p className="text-sm font-medium">Synthesizing clinical context...</p>
                 </div>
             ) : aiSummary ? (
                parsedAi.isParsed ? (
                    <div className="space-y-4">
                        {/* Chief Complaint Card */}
                        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-amber-50/50 border-b border-slate-100 px-4 py-2.5">
                                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    Chief Complaint
                                </h4>
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">{parsedAi.summary}</p>
                            </div>
                        </div>

                        {/* Reported Symptoms */}
                        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5">
                                <h4 className="font-bold text-slate-600 text-[11px] uppercase tracking-wider">Reported Symptoms</h4>
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-slate-800 font-medium">{parsedAi.symptoms}</p>
                            </div>
                        </div>

                        {/* Current Medications */}
                        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5">
                                <h4 className="font-bold text-slate-600 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                    <Pill className="h-3 w-3" /> Current Meds & Allergies
                                </h4>
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-slate-800">{parsedAi.medications}</p>
                            </div>
                        </div>
                        
                        {/* AI Disclaimer */}
                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide text-center pt-2">
                           Information extracted by AI. Verify with patient.
                        </div>
                    </div>
                ) : (
                    <p className="whitespace-pre-wrap text-sm text-slate-700 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">{parsedAi.raw}</p>
                )
             ) : (
                 <div className="bg-white border border-slate-200 rounded-lg p-6 text-center shadow-sm">
                   <p className="text-slate-500 text-sm font-medium">No AI intake data available.</p>
                 </div>
             )}
           </div>
           
           {/* Mobile-only Document Toggle */}
           <div className="p-5 pt-0 xl:hidden border-t border-slate-200 mt-auto bg-slate-50">
               <button 
                 onClick={() => setShowDocs(!showDocs)} 
                 className="w-full mt-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
               >
                 <FileText className="h-4 w-4 text-blue-600" /> {showDocs ? 'Hide Documents' : 'View Documents'}
               </button>
           </div>
        </div>

        {/* CENTER COLUMN: Clinical Workspace */}
        <div className="flex-1 flex flex-col bg-white min-w-0">
           {/* Tab Navigation */}
           <div className="bg-white border-b border-slate-200 px-8 flex gap-8 shrink-0 pt-4">
             <button onClick={() => setActiveTab('notes')} className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'notes' ? 'border-blue-700 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                 <Stethoscope className="h-4 w-4" /> Clinical Notes
             </button>
             <button onClick={() => setActiveTab('rx')} className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'rx' ? 'border-blue-700 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                 <Pill className="h-4 w-4" /> Prescriptions 
                 <span className="ml-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{medicinesList.length}</span>
             </button>
           </div>

           {/* Tab Content */}
           <div className="flex-1 overflow-y-auto p-8">
             {activeTab === 'notes' && (
                 <div className="max-w-4xl space-y-8 mx-auto">
                    {/* Subjective/Objective */}
                    <div className="space-y-2">
                        <label className="block font-bold text-slate-900 text-sm uppercase tracking-wider">Subjective / Objective</label>
                        <div className="bg-white border border-slate-300 shadow-sm rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-shadow">
                            <textarea 
                              value={observations} 
                              onChange={e=>setObservations(e.target.value)} 
                              rows={5} 
                              placeholder="Enter clinical observations, vitals, examination findings, and patient-reported information..."
                              className="w-full text-sm border-0 focus:ring-0 p-4 resize-y bg-transparent outline-none"
                            ></textarea>
                        </div>
                    </div>

                    {/* Assessment/Diagnosis */}
                    <div className="space-y-2">
                        <label className="block font-bold text-slate-900 text-sm uppercase tracking-wider">Assessment / Diagnosis</label>
                        <div className="bg-white border border-slate-300 shadow-sm rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-shadow">
                            <input 
                              value={diagnosis} 
                              onChange={e=>setDiagnosis(e.target.value)} 
                              type="text" 
                              placeholder="Enter diagnosis or clinical assessment (ICD-10 or descriptive)..."
                              className="w-full text-sm border-0 focus:ring-0 p-4 bg-transparent font-medium text-slate-900 outline-none" 
                            />
                        </div>
                    </div>

                    {/* Plan */}
                    <div className="space-y-2">
                        <label className="block font-bold text-slate-900 text-sm uppercase tracking-wider">Treatment Plan</label>
                        <div className="bg-white border border-slate-300 shadow-sm rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-shadow">
                            <textarea 
                              value={plan} 
                              onChange={e=>setPlan(e.target.value)} 
                              rows={6} 
                              placeholder="Treatment plan, follow-up instructions, investigations, and orders..."
                              className="w-full text-sm border-0 focus:ring-0 p-4 resize-y bg-transparent outline-none"
                            ></textarea>
                        </div>
                    </div>
                 </div>
             )}

             {activeTab === 'rx' && (
                 <div className="max-w-5xl space-y-8 mx-auto">
                    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                       <h4 className="font-bold text-slate-900 mb-5 text-sm uppercase tracking-wider">Build Prescription</h4>
                       <div className="flex gap-4 flex-wrap items-start">
                           <div className="flex-1 min-w-[220px]">
                               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Medicine Name</label>
                               <input value={medicine} onChange={e=>setMedicine(e.target.value)} placeholder="e.g. Amoxicillin 500mg" className="w-full border border-slate-300 p-2.5 text-sm rounded-lg shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium" />
                           </div>
                           <div className="w-32">
                               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Dosage</label>
                               <input value={dosage} onChange={e=>setDosage(e.target.value)} placeholder="e.g. 1-0-1" className="w-full border border-slate-300 p-2.5 text-sm rounded-lg shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                           </div>
                           <div className="w-44">
                               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Frequency</label>
                               <select value={frequency} onChange={e=>setFrequency(e.target.value)} className="w-full border border-slate-300 p-2.5 text-sm rounded-lg shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
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
                           <div className="w-32">
                               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Duration</label>
                               <input type="text" value={duration} onChange={e=>setDuration(e.target.value)} placeholder="e.g. 5 days" className="w-full border border-slate-300 p-2.5 text-sm rounded-lg shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white" />
                           </div>
                           <div className="flex items-end pt-6">
                               <button onClick={addMedicine} className="bg-slate-900 text-white px-6 py-2.5 text-sm font-bold rounded-lg shadow hover:bg-slate-800 transition-colors h-[42px] flex items-center gap-2">
                                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                                   Add
                               </button>
                           </div>
                       </div>
                    </div>

                    <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                       <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                           <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Current Order Set</h4>
                           <span className="bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm">{medicinesList.length} items</span>
                       </div>
                       
                       {medicinesList.length === 0 ? (
                           <div className="p-12 flex flex-col items-center justify-center text-slate-400">
                               <Pill className="h-10 w-10 mb-3 text-slate-300" />
                               <p className="text-sm font-medium">No medications added to the prescription yet.</p>
                           </div>
                       ) : (
                           <div className="overflow-x-auto">
                               <table className="w-full text-left text-sm">
                                   <thead className="bg-slate-50/50 border-b border-slate-100">
                                       <tr>
                                           <th className="px-6 py-3 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Medication</th>
                                           <th className="px-6 py-3 font-bold text-slate-500 uppercase tracking-wider text-[11px] w-32">Dosage</th>
                                           <th className="px-6 py-3 font-bold text-slate-500 uppercase tracking-wider text-[11px] w-40">Frequency</th>
                                           <th className="px-6 py-3 font-bold text-slate-500 uppercase tracking-wider text-[11px] w-32">Duration</th>
                                           <th className="px-6 py-3 font-bold text-slate-500 uppercase tracking-wider text-[11px] w-24 text-right">Action</th>
                                       </tr>
                                   </thead>
                                   <tbody className="divide-y divide-slate-100">
                                       {medicinesList.map((m, idx) => (
                                           <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                               <td className="px-6 py-4 font-bold text-slate-900">{m.name}</td>
                                               <td className="px-6 py-4 text-slate-700 font-medium">{m.dosage}</td>
                                               <td className="px-6 py-4 text-slate-700">{m.frequency}</td>
                                               <td className="px-6 py-4 text-slate-700">{m.duration}</td>
                                               <td className="px-6 py-4 text-right">
                                                   <button onClick={() => removeMedicine(idx)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-md font-bold text-[11px] uppercase tracking-wider transition-colors">Remove</button>
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

        {/* RIGHT COLUMN: Chart Documents (Collapsible) */}
        {showDocs && (
          <div className="w-full md:w-1/3 xl:w-[26%] min-w-[300px] max-w-[380px] bg-slate-50 border-l border-slate-200 flex flex-col overflow-y-auto absolute xl:relative right-0 h-full z-40 shadow-2xl xl:shadow-none transform transition-transform">
             <div className="p-5 border-b border-slate-200 bg-white sticky top-0 z-10 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <FileClock className="h-5 w-5 text-blue-700" />
                 <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Chart Documents</h3>
               </div>
               <button onClick={() => setShowDocs(false)} className="xl:hidden p-1.5 hover:bg-slate-100 rounded text-slate-500">
                 <ChevronRight className="h-5 w-5" />
               </button>
             </div>
             <div className="p-4 flex-1">
                {isFetching ? (
                     <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                         <Loader2 className="h-6 w-6 animate-spin text-blue-600 mb-3" />
                         <p className="text-sm font-medium">Loading documents...</p>
                     </div>
                ) : patientId ? (
                    <DocumentList patientId={patientId} />
                ) : (
                    <div className="bg-white border border-slate-200 rounded-lg p-6 text-center shadow-sm">
                      <p className="text-sm font-medium text-slate-500">No documents found.</p>
                    </div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
