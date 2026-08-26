import { useNavigate } from 'react-router-dom';
import { Bot, Save, FileSignature } from 'lucide-react';

export default function ConsultationMode() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consultation: John Doe</h1>
          <p className="text-slate-500">Queue #14 • Age 45 • Male</p>
        </div>
        <button onClick={() => navigate('/doctor/dashboard')} className="text-slate-500 hover:text-slate-700">Cancel & Go Back</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Summary & History */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
              <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-3"><Bot className="w-5 h-5" /> AI Pre-Consultation</h3>
              <div className="space-y-4 text-sm text-indigo-900/80">
                 <div>
                    <span className="font-semibold block">Chief Complaint:</span>
                    Patient reports mild chest pain during exercise, onset 2 weeks ago.
                 </div>
                 <div>
                    <span className="font-semibold block">Medications:</span>
                    Aspirin, Lipitor
                 </div>
                 <div className="p-3 bg-white/60 rounded border border-indigo-200/50">
                    <span className="font-semibold block text-indigo-900">AI Assessment:</span>
                    Episodic exertional chest discomfort. Moderate risk factors. Suggest standard 12-lead ECG.
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: Doctor Notes & Prescription */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Clinical Notes</h2>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Observations</label>
                 <textarea rows={3} className="w-full border-gray-300 rounded-md border p-2 focus:ring-blue-500" defaultValue="Patient looks stable. BP 130/85. Heart rate 78 bpm regular."></textarea>
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label>
                 <input type="text" className="w-full border-gray-300 rounded-md border p-2 focus:ring-blue-500" defaultValue="Stable angina pectoris" />
              </div>
           </div>

           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                 Prescription 
                 <button className="text-sm text-blue-600 flex items-center gap-1 hover:text-blue-700"><FileSignature className="w-4 h-4"/> Add Medicine</button>
              </h2>
              <div className="bg-slate-50 border border-slate-200 rounded p-3 flex gap-4">
                 <input className="flex-1 border-gray-300 rounded border p-2 text-sm" placeholder="Medicine Name" defaultValue="Nitroglycerin 0.4mg sublingual" />
                 <input className="w-32 border-gray-300 rounded border p-2 text-sm" placeholder="Frequency" defaultValue="PRN" />
                 <input className="w-24 border-gray-300 rounded border p-2 text-sm" placeholder="Days" defaultValue="30" />
              </div>
           </div>

           <div className="flex justify-end gap-4 pt-4">
              <button className="px-6 py-2 bg-white border border-slate-300 rounded-md text-slate-700 font-medium hover:bg-slate-50">Save Draft</button>
              <button onClick={() => navigate('/doctor/dashboard')} className="px-6 py-2 bg-blue-600 border border-transparent rounded-md text-white font-medium hover:bg-blue-700 flex items-center gap-2"><Save className="w-4 h-4"/> Complete Consultation</button>
           </div>
        </div>
      </div>
    </div>
  );
}
