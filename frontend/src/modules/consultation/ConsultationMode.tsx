import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorApi } from '../../api/doctorApi';
import toast from 'react-hot-toast';
import { Loader2, FileText, Sparkles, ArrowLeft, Pill, Trash2, Plus, AlertCircle, CheckCircle } from 'lucide-react';

import { DocumentList } from '../../components/documents/DocumentList';

export default function ConsultationMode() {
  const { id } = useParams(); // this is appointmentId
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Pre-consultation summary state
  const [preConsultation, setPreConsultation] = useState<any | null>(null);
  const [loadingPreConsultation, setLoadingPreConsultation] = useState(true);

  const [observations, setObservations] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [plan, setPlan] = useState('');
  
  // Prescription state
  const [medicine, setMedicine] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('1-0-1');
  const [duration, setDuration] = useState('5 days');
  const [instructions, setInstructions] = useState('After food');
  const [medicinesList, setMedicinesList] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetchPreConsultation = async () => {
      setLoadingPreConsultation(true);
      try {
        const res = await doctorApi.getPreConsultation(id);
        if (res.success && res.data) {
          setPreConsultation(res.data);
        }
      } catch {
        setPreConsultation(null);
      } finally {
        setLoadingPreConsultation(false);
      }
    };
    fetchPreConsultation();
  }, [id]);

  const addMedicine = () => {
    if (medicine && dosage) {
      setMedicinesList([
        ...medicinesList, 
        { 
          name: medicine.trim(), 
          dosage: dosage.trim(), 
          frequency, 
          duration, 
          instructions 
        }
      ]);
      setMedicine('');
      setDosage('');
    } else {
      toast.error('Please specify both medicine name and dosage');
    }
  };

  const removeMedicine = (index: number) => {
    setMedicinesList(medicinesList.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    if (!diagnosis.trim()) {
      toast.error('Please enter a diagnosis before completing consultation');
      return;
    }

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
        generalInstructions: "Follow up in 1 week if symptoms persist.",
        medicines: medicinesList
      });

      if (!conRes.success) {
        toast.error(conRes.message || "We couldn't complete the consultation right now. Please try again.");
        setLoading(false);
        return;
      }
      
      toast.success("Consultation completed successfully!");
      navigate('/doctor/dashboard');
    } catch (e: any) {
      toast.error("We couldn't complete the consultation right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Back to Doctor Queue"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Consultation Workspace</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Appointment ID: <strong className="text-slate-800">{id}</strong></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Patient AI Context & Documents */}
        <div className="lg:col-span-1 space-y-6">
          {/* Patient AI Pre-Consultation Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-3">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>AI Pre-Consultation Summary</span>
            </h3>

            {loadingPreConsultation ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : preConsultation ? (
              <div className="space-y-3 text-xs">
                {preConsultation.chiefComplaint && (
                  <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 space-y-1">
                    <span className="font-bold text-indigo-900 block uppercase tracking-wider text-[10px]">Chief Complaint</span>
                    <p className="text-indigo-950 font-medium text-sm">{preConsultation.chiefComplaint}</p>
                  </div>
                )}

                {preConsultation.symptoms && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">Reported Symptoms</span>
                    <p className="text-slate-800 mt-0.5">{preConsultation.symptoms}</p>
                  </div>
                )}

                {(preConsultation.severity || preConsultation.duration) && (
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">Severity</span>
                      <span className="font-bold text-slate-800">{preConsultation.severity || 'N/A'}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">Duration</span>
                      <span className="font-bold text-slate-800">{preConsultation.duration || 'N/A'}</span>
                    </div>
                  </div>
                )}

                {preConsultation.aiSummary && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">AI Clinical Notes</span>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{preConsultation.aiSummary}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500 flex flex-col items-center gap-1.5">
                <AlertCircle className="w-5 h-5 text-slate-400" />
                <span>No pre-consultation submitted by patient.</span>
              </div>
            )}

            {/* Documents Section */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Patient Documents</span>
              </h3>
              {id ? <DocumentList appointmentId={id} /> : <p className="text-xs text-slate-400">No appointment ID.</p>}
            </div>
          </div>
        </div>

        {/* Right Column: Doctor Notes, Diagnosis & Prescription */}
        <div className="lg:col-span-2 space-y-6">
          {/* Clinical Findings & Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
            <h3 className="font-bold text-slate-900 text-base border-b pb-3">Clinical Evaluation</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Diagnosis <span className="text-red-500">*</span>
                </label>
                <input
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Upper Respiratory Infection, Viral Fever"
                  type="text"
                  className="w-full border-slate-300 rounded-xl shadow-xs border p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Clinical Observations & Vitals</label>
                <textarea
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                  rows={3}
                  placeholder="e.g. BP 120/80 mmHg, Pulse 76 bpm, Temperature 98.6°F. Throat mildly erythematous..."
                  className="w-full border-slate-300 rounded-xl shadow-xs border p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Treatment Plan & Advice</label>
                <textarea
                  value={plan}
                  onChange={e => setPlan(e.target.value)}
                  rows={2}
                  placeholder="e.g. Hydration, bed rest for 2 days, review if fever persists > 3 days."
                  className="w-full border-slate-300 rounded-xl shadow-xs border p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Prescription Workspace */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
            <h3 className="font-bold text-slate-900 text-base border-b pb-3 flex items-center gap-2">
              <Pill className="w-5 h-5 text-blue-600" />
              <span>Prescription Builder</span>
            </h3>
            
            {/* Input Row */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">Medicine Name</label>
                  <input
                    value={medicine}
                    onChange={e => setMedicine(e.target.value)}
                    placeholder="e.g. Paracetamol 500mg"
                    className="w-full border-slate-300 border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">Dosage</label>
                  <input
                    value={dosage}
                    onChange={e => setDosage(e.target.value)}
                    placeholder="e.g. 1 tablet"
                    className="w-full border-slate-300 border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value)}
                    className="w-full border-slate-300 border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="1-0-1">1-0-1 (Twice daily)</option>
                    <option value="1-1-1">1-1-1 (Thrice daily)</option>
                    <option value="1-0-0">1-0-0 (Morning)</option>
                    <option value="0-0-1">0-0-1 (Night)</option>
                    <option value="SOS">SOS (As needed)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">Duration</label>
                  <input
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    placeholder="e.g. 5 days"
                    className="w-full border-slate-300 border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">Instructions</label>
                  <select
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    className="w-full border-slate-300 border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="After food">After food</option>
                    <option value="Before food">Before food</option>
                    <option value="With water">With water</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={addMedicine}
                  className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Medication</span>
                </button>
              </div>
            </div>

            {/* Added Medications Table */}
            {medicinesList.length > 0 && (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="px-4 py-2 text-left">Medicine</th>
                      <th className="px-4 py-2 text-left">Dosage</th>
                      <th className="px-4 py-2 text-left">Frequency</th>
                      <th className="px-4 py-2 text-left">Duration</th>
                      <th className="px-4 py-2 text-left">Instructions</th>
                      <th className="px-4 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {medicinesList.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 font-bold text-slate-900">{m.name}</td>
                        <td className="px-4 py-2.5 text-slate-600">{m.dosage}</td>
                        <td className="px-4 py-2.5 text-slate-600 font-medium">{m.frequency}</td>
                        <td className="px-4 py-2.5 text-slate-600">{m.duration}</td>
                        <td className="px-4 py-2.5 text-slate-600">{m.instructions}</td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            onClick={() => removeMedicine(idx)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                            title="Remove medication"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Complete Consultation Button */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                Finalizing will commit the clinical record and update the appointment to Completed.
              </p>
              <button
                disabled={loading}
                onClick={handleComplete}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                <span>Complete Consultation</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}







