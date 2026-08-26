import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BookAppointment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const handleNext = () => setStep(step + 1);
  const handleFinish = () => {
    alert("Appointment Booked successfully!");
    navigate('/patient/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Book New Appointment</h1>
        <p className="text-slate-500 mt-1">Follow the steps to secure your slot.</p>
      </div>

      {/* Stepper UI */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{s}</div>
            {s !== 4 && <div className={`h-1 flex-1 mx-2 rounded-full ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-semibold">Select Hospital</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-blue-600 bg-blue-50 rounded-lg p-4 cursor-pointer">
                <h3 className="font-bold text-blue-900">Main City Hospital</h3>
                <p className="text-sm text-blue-700 mt-1">Downtown Medical Center</p>
              </div>
              <div className="border border-slate-200 hover:border-slate-300 rounded-lg p-4 cursor-pointer text-slate-500">
                <h3 className="font-bold">North Wing Clinic</h3>
                <p className="text-sm mt-1">Suburban Outpost</p>
              </div>
            </div>
            <button onClick={handleNext} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Next Step</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-semibold">Select Department & Doctor</h2>
            <select className="w-full border-gray-300 rounded-md shadow-sm border p-2 mb-4">
              <option>Cardiology</option>
              <option>Neurology</option>
              <option>General Practice</option>
            </select>
            <div className="border-2 border-blue-600 bg-blue-50 rounded-lg p-4 cursor-pointer">
                <h3 className="font-bold text-blue-900">Dr. Sarah Jenkins</h3>
                <p className="text-sm text-blue-700 mt-1">Senior Cardiologist</p>
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(step - 1)} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-md hover:bg-slate-200">Back</button>
              <button onClick={handleNext} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Next Step</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-semibold">Select Date & Time</h2>
            <input type="date" className="w-full border-gray-300 rounded-md shadow-sm border p-2 mb-4" />
            <div className="grid grid-cols-3 gap-3">
               <button className="border border-slate-200 rounded p-2 text-sm hover:bg-blue-50 hover:border-blue-300">09:00 AM</button>
               <button className="border-2 border-blue-600 bg-blue-50 rounded p-2 text-sm font-semibold">10:00 AM</button>
               <button className="border border-slate-200 rounded p-2 text-sm hover:bg-blue-50 hover:border-blue-300">11:00 AM</button>
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(step - 1)} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-md hover:bg-slate-200">Back</button>
              <button onClick={handleNext} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Next Step</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 text-center">
            <h2 className="text-xl font-bold text-green-600 mb-2">Confirm Your Booking</h2>
            <p className="text-slate-600">You are about to book an appointment with <strong>Dr. Sarah Jenkins</strong> at <strong>Main City Hospital</strong> on <strong>Tomorrow at 10:00 AM</strong>.</p>
            <div className="flex justify-center gap-4 mt-8">
              <button onClick={() => setStep(step - 1)} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-md hover:bg-slate-200">Go Back</button>
              <button onClick={handleFinish} className="bg-green-600 text-white px-8 py-2 rounded-md hover:bg-green-700 font-bold shadow-sm">Confirm Booking</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
