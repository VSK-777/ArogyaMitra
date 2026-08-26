import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot } from 'lucide-react';

export default function PreConsultation() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
         <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
            <Bot className="w-8 h-8" />
         </div>
         <h2 className="text-2xl font-bold text-slate-900 mb-2">AI Summary Generated</h2>
         <p className="text-slate-600 mb-8">Your pre-consultation details have been analyzed by our AI and securely sent to your doctor.</p>
         <button onClick={() => navigate('/patient/dashboard')} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Return to Dashboard</button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
         <div className="bg-blue-100 p-3 rounded-xl"><Bot className="h-8 w-8 text-blue-600" /></div>
         <div>
             <h1 className="text-2xl font-bold text-slate-900">AI Pre-Consultation</h1>
             <p className="text-slate-500">Please answer a few questions to help your doctor prepare for your visit.</p>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div>
           <label className="block text-sm font-medium text-slate-700 mb-2">What is the main reason for your visit today? (Chief Complaint)</label>
           <textarea rows={3} className="w-full border-gray-300 rounded-md shadow-sm border p-3 focus:ring-blue-500 focus:border-blue-500" placeholder="E.g. I have been having chest pain when walking up stairs..."></textarea>
        </div>
        <div>
           <label className="block text-sm font-medium text-slate-700 mb-2">Are you experiencing any other symptoms?</label>
           <textarea rows={2} className="w-full border-gray-300 rounded-md shadow-sm border p-3 focus:ring-blue-500 focus:border-blue-500" placeholder="E.g. Mild shortness of breath, dizziness"></textarea>
        </div>
        <div>
           <label className="block text-sm font-medium text-slate-700 mb-2">Are you currently taking any medications?</label>
           <input type="text" className="w-full border-gray-300 rounded-md shadow-sm border p-3 focus:ring-blue-500 focus:border-blue-500" placeholder="Aspirin, Lipitor..." />
        </div>
        <div className="pt-4 border-t border-slate-100 flex justify-end">
           <button onClick={() => setSubmitted(true)} className="bg-blue-600 text-white px-8 py-2.5 rounded-md hover:bg-blue-700 font-medium shadow-sm">Submit to AI Assistant</button>
        </div>
      </div>
    </div>
  );
}
