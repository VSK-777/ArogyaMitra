import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorApi } from '../../api/doctorApi';
import toast from 'react-hot-toast';
import { Loader2, FileText, User, Activity, Save } from 'lucide-react';
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
            diagnosis: extract('Potential Diagnosis/Impression'),
            medications: extract('Current Medications'),
            labValues: extract('Lab Values Mentioned')
        };
    }
    return { isParsed: false, raw: cleanedText };
};

export default function ConsultationMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [activeTab, setActiveTab] = useState('notes');

  useEffect(() => {
    if(id) {
      doctorApi.getPreConsultation(id).then(res => {
        if(res.success && res.data) setAiSummary(res.data.aiSummary || '');
      }).catch(e => console.error(e));
    }
  }, [id]);
  
  const [observations, setObservations] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [plan, setPlan] = useState('');
  
  // Prescription state
  const [medicine, setMedicine] = useState('');
  const [dosage, setDosage] = useState('');
  const [medicinesList, setMedicinesList] = useState<any[]>([]);

  const addMedicine = () => {
      if (medicine && dosage) {
          setMedicinesList([...medicinesList, { medicineName: medicine, dosage, frequency: 'Daily', duration: '5 days', instructions: '' }]);
          setMedicine('');
          setDosage('');
      }
  };

  const removeMedicine = (index: number) => {
      setMedicinesList(medicinesList.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
        const conRes = await doctorApi.completeConsultation({
            appointmentId: id,
            observations,
            diagnosis,
            treatmentPlan: plan,
            assessment: '',
            doctorNotes: '',
            generalInstructions: "Follow up as needed.",
            medicines: medicinesList
        });

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

  const parsedAi = parseAiSummary(aiSummary);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-100 -m-4 lg:-m-8">
      {/* Top Header - EMR Style */}
      <div className="bg-white border-b border-slate-300 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3">
             <div className="bg-slate-100 p-2 rounded border border-slate-200">
               <User className="h-6 w-6 text-slate-600" />
             </div>
             <div>
               <h1 className="text-xl font-bold text-slate-900 leading-tight">Patient Consultation</h1>
               <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ID: {id?.substring(0,8)}</p>
             </div>
           </div>
           <div className="h-8 w-px bg-slate-200"></div>
           <div className="flex gap-4 text-sm text-slate-600 hidden sm:flex">
             <div><span className="text-slate-400">Allergies:</span> <span className="font-semibold text-red-600">NKA</span></div>
             <div><span className="text-slate-400">Code:</span> <span className="font-semibold text-emerald-600">Full Code</span></div>
           </div>
        </div>
        <div className="flex gap-3">
           <button onClick={() => navigate('/doctor/dashboard')} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 shadow-sm transition-colors">Save Draft</button>
           <button onClick={handleComplete} disabled={loading} className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 border border-blue-800 rounded hover:bg-blue-800 shadow-sm transition-colors flex items-center gap-2">
             {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Sign Encounter
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Clinical Context */}
        <div className="w-1/3 min-w-[320px] max-w-[400px] bg-white border-r border-slate-300 flex flex-col overflow-y-auto">
           {/* AI Summary Section */}
           <div className="p-5 border-b border-slate-200">
             <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
               <Activity className="h-4 w-4 text-blue-700" /> AI Intake Summary
             </h3>
             {aiSummary ? (
                parsedAi.isParsed ? (
                    <div className="space-y-3">
                        <div className="bg-slate-50 border border-slate-200 rounded p-3">
                            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-1">Chief Complaint</h4>
                            <p className="text-sm text-slate-900 whitespace-pre-wrap">{parsedAi.summary}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <div className="bg-white border border-slate-200 rounded p-2.5">
                                <h4 className="font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">Reported Symptoms</h4>
                                <p className="text-sm text-slate-800">{parsedAi.symptoms}</p>
                            </div>
                            <div className="bg-white border border-slate-200 rounded p-2.5">
                                <h4 className="font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">Current Meds</h4>
                                <p className="text-sm text-slate-800">{parsedAi.medications}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">{parsedAi.raw}</p>
                )
             ) : (
                 <div className="bg-slate-50 border border-slate-200 rounded p-4 text-center text-slate-500 text-sm">
                   No AI intake data available for this encounter.
                 </div>
             )}
           </div>

           {/* Documents Section */}
           <div className="p-5 border-b border-slate-200">
             <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
               <FileText className="h-4 w-4 text-blue-700" /> Chart Documents
             </h3>
             <div className="bg-slate-50 border border-slate-200 rounded p-3">
                {id ? <DocumentList appointmentId={id} /> : <p className="text-sm text-slate-500">No documents found.</p>}
             </div>
           </div>
        </div>

        {/* Main Area - Doctor Input */}
        <div className="flex-1 flex flex-col bg-slate-50">
           {/* Tab Navigation */}
           <div className="bg-white border-b border-slate-200 px-6 flex gap-6 shrink-0 pt-2">
             <button onClick={() => setActiveTab('notes')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'notes' ? 'border-blue-700 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Clinical Notes</button>
             <button onClick={() => setActiveTab('rx')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'rx' ? 'border-blue-700 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Prescriptions ({medicinesList.length})</button>
           </div>

           {/* Tab Content */}
           <div className="flex-1 overflow-y-auto p-6">
             {activeTab === 'notes' && (
                 <div className="max-w-3xl space-y-6">
                    <div className="bg-white border border-slate-300 shadow-sm rounded">
                        <div className="bg-slate-100 border-b border-slate-300 px-4 py-2">
                           <h4 className="font-bold text-slate-800 text-sm">Subjective / Objective</h4>
                        </div>
                        <div className="p-4">
                            <textarea 
                              value={observations} 
                              onChange={e=>setObservations(e.target.value)} 
                              rows={5} 
                              placeholder="Enter clinical observations, vitals, and examination notes..."
                              className="w-full text-sm border-0 focus:ring-0 p-0 resize-y"
                            ></textarea>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-300 shadow-sm rounded">
                        <div className="bg-slate-100 border-b border-slate-300 px-4 py-2">
                           <h4 className="font-bold text-slate-800 text-sm">Assessment / Diagnosis</h4>
                        </div>
                        <div className="p-4">
                            <input 
                              value={diagnosis} 
                              onChange={e=>setDiagnosis(e.target.value)} 
                              type="text" 
                              placeholder="Primary diagnosis (ICD-10 or descriptive)..."
                              className="w-full text-sm border-0 focus:ring-0 p-0" 
                            />
                        </div>
                    </div>

                    <div className="bg-white border border-slate-300 shadow-sm rounded">
                        <div className="bg-slate-100 border-b border-slate-300 px-4 py-2">
                           <h4 className="font-bold text-slate-800 text-sm">Plan</h4>
                        </div>
                        <div className="p-4">
                            <textarea 
                              value={plan} 
                              onChange={e=>setPlan(e.target.value)} 
                              rows={4} 
                              placeholder="Treatment plan, follow-up instructions, and orders..."
                              className="w-full text-sm border-0 focus:ring-0 p-0 resize-y"
                            ></textarea>
                        </div>
                    </div>
                 </div>
             )}

             {activeTab === 'rx' && (
                 <div className="max-w-4xl space-y-6">
                    <div className="bg-white border border-slate-300 shadow-sm rounded p-5">
                       <h4 className="font-bold text-slate-900 mb-4 text-sm">Add New Medication</h4>
                       <div className="flex gap-3">
                           <div className="flex-1">
                               <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Medication Name</label>
                               <input value={medicine} onChange={e=>setMedicine(e.target.value)} placeholder="e.g. Amoxicillin 500mg" className="w-full border border-slate-300 p-2 text-sm rounded shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                           </div>
                           <div className="w-32">
                               <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Sig (Dosage)</label>
                               <input value={dosage} onChange={e=>setDosage(e.target.value)} placeholder="e.g. 1-0-1" className="w-full border border-slate-300 p-2 text-sm rounded shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                           </div>
                           <div className="flex items-end">
                               <button onClick={addMedicine} className="bg-slate-800 text-white px-5 py-2 text-sm font-semibold rounded shadow-sm hover:bg-slate-900 h-[38px]">Add Rx</button>
                           </div>
                       </div>
                    </div>

                    <div className="bg-white border border-slate-300 shadow-sm rounded overflow-hidden">
                       <div className="bg-slate-100 border-b border-slate-300 px-4 py-3">
                           <h4 className="font-bold text-slate-800 text-sm">Current Order Set ({medicinesList.length})</h4>
                       </div>
                       
                       {medicinesList.length === 0 ? (
                           <div className="p-8 text-center text-slate-500 text-sm">No medications added yet.</div>
                       ) : (
                           <table className="w-full text-left text-sm">
                               <thead className="bg-slate-50 border-b border-slate-200">
                                   <tr>
                                       <th className="px-4 py-2 font-semibold text-slate-600">Medication</th>
                                       <th className="px-4 py-2 font-semibold text-slate-600 w-32">Sig</th>
                                       <th className="px-4 py-2 font-semibold text-slate-600 w-24">Freq</th>
                                       <th className="px-4 py-2 font-semibold text-slate-600 w-24">Action</th>
                                   </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-100">
                                   {medicinesList.map((m, idx) => (
                                       <tr key={idx} className="hover:bg-slate-50">
                                           <td className="px-4 py-3 font-semibold text-slate-900">{m.medicineName}</td>
                                           <td className="px-4 py-3 text-slate-700">{m.dosage}</td>
                                           <td className="px-4 py-3 text-slate-700">{m.frequency}</td>
                                           <td className="px-4 py-3">
                                               <button onClick={() => removeMedicine(idx)} className="text-red-600 hover:text-red-800 font-semibold text-xs uppercase tracking-wider">Remove</button>
                                           </td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                       )}
                    </div>
                 </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
