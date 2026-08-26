import { useState,  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorApi } from '../../api/doctorApi';
import { Loader2 } from 'lucide-react';

export default function ConsultationMode() {
  const { id } = useParams(); // this is appointmentId
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
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
        // 1. Save Consultation
        const conRes = await doctorApi.saveConsultation({
            appointmentId: id,
            observations,
            diagnosis,
            treatmentPlan: plan,
            assessment: '',
            doctorNotes: ''
        });

        if (!conRes.success) {
            alert("Error saving consultation: " + conRes.message);
            setLoading(false);
            return;
        }

        // 2. Save Prescription
        if (medicinesList.length > 0) {
            const presRes = await doctorApi.savePrescription({
                consultationId: conRes.data.consultationId,
                generalInstructions: "Follow up in 1 week.",
                medicines: medicinesList
            });
            if (!presRes.success) {
                alert("Error saving prescription: " + presRes.message);
            }
        }
        
        alert("Consultation Completed!");
        navigate('/doctor/dashboard');
    } catch (e: any) {
        alert("Server Error: " + (e.response?.data?.message || e.message));
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
                <div className="bg-slate-50 p-3 rounded border text-sm text-slate-700 h-64 overflow-y-auto">
                    Chief Complaint, Symptoms, and AI Notes will appear here if the patient completed the pre-consultation step.
                </div>
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
