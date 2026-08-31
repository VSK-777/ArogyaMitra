import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorApi } from '../../api/doctorApi';
import toast from 'react-hot-toast';
import { Loader2, FileText } from 'lucide-react';

import { DocumentList } from '../../components/documents/DocumentList';

export default function ConsultationMode() {
  const parseAiSummary = (text: string) => {
    if (!text) return { isParsed: false, raw: '' };
    
    // Clean up Pegasus tokens
    const cleanedText = text.replace(/<n>/g, '\n').replace(/<s>/g, '');
    
    // Check if it's our bulleted format
    if (cleanedText.includes('• Summary:')) {
        const extract = (label: string) => {
            const regex = new RegExp(•  + label + :\\s*([\\s\\S]*?)(?=• |$));
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

  const parsedAi = parseAiSummary(aiSummary);
  const { id } = useParams(); // this is appointmentId
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

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
          setMedicinesList([...medicinesList, { name: medicine, dosage, frequency: 'Daily', duration: '5 days', instructions: '' }]);
          setMedicine('');
          setDosage('');
      }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
        // Save Complete Consultation (Atomically includes prescription)
        const conRes = await doctorApi.completeConsultation({
            appointmentId: id,
            observations,
            diagnosis,
            treatmentPlan: plan,
            assessment: '',
            doctorNotes: '',
            generalInstructions: "Follow up in 1 week.",
            medicines: medicinesList
        });

        if (!conRes.success) {
            toast.error(conRes.message || "We couldn't complete the consultation right now. Please try again.");
            setLoading(false);
            return;
        }
        
        toast.success("Consultation Completed!");
        navigate('/doctor/dashboard');
    } catch (e: any) {
        toast.error("We couldn't complete the consultation right now. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Clinical Workspace</h1>
        <p className="text-slate-500 font-medium">Apt ID: {id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 space-y-6">
            {/* Patient Context Sidebar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 border-b pb-2 mb-4">Patient Information</h3>
                <p className="text-sm text-slate-600 mb-2"><strong>AI Summary:</strong> This information is pulled from the pre-consultation workflow.</p>
                <div className="bg-slate-50 p-3 rounded border text-sm text-slate-700 h-64 overflow-y-auto mb-6">
                                        {aiSummary ? (
                        parsedAi.isParsed ? (
                            <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                    <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-1">Clinical Summary</h4>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{parsedAi.summary}</p>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
                                        <h4 className="font-bold text-orange-900 text-xs uppercase tracking-wider mb-1">Symptoms</h4>
                                        <p className="text-sm text-slate-700">{parsedAi.symptoms}</p>
                                    </div>
                                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                                        <h4 className="font-bold text-purple-900 text-xs uppercase tracking-wider mb-1">Diagnosis / Impression</h4>
                                        <p className="text-sm text-slate-700">{parsedAi.diagnosis}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                                        <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wider mb-1">Medications</h4>
                                        <p className="text-sm text-slate-700">{parsedAi.medications}</p>
                                    </div>
                                    <div className="bg-rose-50 border border-rose-100 rounded-lg p-3">
                                        <h4 className="font-bold text-rose-900 text-xs uppercase tracking-wider mb-1">Lab Values</h4>
                                        <p className="text-sm text-slate-700">{parsedAi.labValues}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="whitespace-pre-wrap text-sm text-slate-700">{parsedAi.raw}</p>
                        )
                    ) : "No pre-consultation summary available."}
                </div>
                
                <h3 className="font-bold text-slate-900 border-b pb-2 mb-4 flex items-center gap-2">
                   <FileText className="h-5 w-5" /> Patient Documents
                </h3>
                {id ? <DocumentList appointmentId={id} /> : <p>No ID available.</p>}
            </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
            {/* Doctor Input Workspace */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 border-b pb-2 mb-4">Doctor Consultation</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Clinical Observations</label>
                        <textarea value={observations} onChange={e=>setObservations(e.target.value)} rows={3} className="w-full border-gray-300 rounded-md shadow-sm border p-2"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label>
                        <input value={diagnosis} onChange={e=>setDiagnosis(e.target.value)} type="text" className="w-full border-gray-300 rounded-md shadow-sm border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Treatment Plan</label>
                        <textarea value={plan} onChange={e=>setPlan(e.target.value)} rows={2} className="w-full border-gray-300 rounded-md shadow-sm border p-2"></textarea>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 border-b pb-2 mb-4">Prescription</h3>
                
                <div className="flex gap-2 mb-4">
                    <input value={medicine} onChange={e=>setMedicine(e.target.value)} placeholder="Medicine Name" className="flex-1 border p-2 rounded" />
                    <input value={dosage} onChange={e=>setDosage(e.target.value)} placeholder="Dosage (e.g. 1-0-1)" className="w-32 border p-2 rounded" />
                    <button onClick={addMedicine} className="bg-slate-800 text-white px-4 rounded hover:bg-slate-900">Add</button>
                </div>

                {medicinesList.length > 0 && (
                    <ul className="space-y-2 mb-6">
                        {medicinesList.map((m, idx) => (
                            <li key={idx} className="bg-slate-50 p-2 rounded border text-sm flex justify-between">
                                <span className="font-bold">{m.name}</span>
                                <span>{m.dosage}</span>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button disabled={loading} onClick={handleComplete} className="bg-green-600 flex gap-2 items-center text-white px-8 py-3 rounded-md font-bold shadow-sm hover:bg-green-700">
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        Complete Consultation
                    </button>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}







