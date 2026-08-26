import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi } from '../../api/patientApi';
import { Loader2 } from 'lucide-react';
import { getUserFriendlyMessage } from '../../utils/errorUtils';

export default function BookAppointment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data from APIs
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  
  // Selections
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  useEffect(() => {
    patientApi.getHospitals()
      .then(res => setHospitals(res.data || []))
      .catch(e => setError(getUserFriendlyMessage(e)));
  }, []);

  const handleNext = () => setStep(step + 1);

  const fetchDepartments = (hospital: any) => {
    setSelectedHospital(hospital);
    setLoading(true);
    setError('');
    patientApi.getDepartments(hospital.id)
      .then(res => {
        setDepartments(res.data || []);
        setLoading(false);
        handleNext();
      })
      .catch(e => {
        setError(getUserFriendlyMessage(e));
        setLoading(false);
      });
  };

  const fetchDoctors = (e: any) => {
    const deptId = e.target.value;
    const dept = departments.find(d => d.id == deptId);
    setSelectedDepartment(dept);
    setLoading(true);
    setError('');
    patientApi.getDoctors(deptId)
      .then(res => {
        setDoctors(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(getUserFriendlyMessage(err));
        setLoading(false);
      });
  };

  const handleFinish = async () => {
    setLoading(true);
    setError('');
    try {
        const payload = {
            hospitalId: selectedHospital.id,
            departmentId: selectedDepartment.id,
            doctorId: selectedDoctor.id,
            appointmentDate: selectedDate,
            slotStart: selectedSlot
        };
        const res = await patientApi.bookAppointment(payload);
        if(res.success) {
            alert(`Appointment booked successfully!\n\nAppointment ID: ${res.data.appointmentId}\nDoctor: ${res.data.doctorName}\nDate: ${res.data.appointmentDate}\nToken: ${res.data.tokenId}`);
            navigate('/patient/dashboard');
        } else {
            setError(res.message || 'Unable to book the appointment. Please try again.');
        }
    } catch (e: any) {
        setError(getUserFriendlyMessage(e));
    } finally {
        setLoading(false);
    }
  };

  // Get tomorrow's date as minimum selectable date
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Book New Appointment</h1>
        <p className="text-slate-500 mt-1">Follow the steps to secure your slot.</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>}

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
              {hospitals.map(h => (
                <div key={h.id} onClick={() => fetchDepartments(h)} className="border border-slate-200 hover:border-blue-600 hover:bg-blue-50 rounded-lg p-4 cursor-pointer">
                  <h3 className="font-bold text-slate-900">{h.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{h.address}</p>
                </div>
              ))}
              {hospitals.length === 0 && <p className="text-slate-500">Loading hospitals...</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-semibold">Select Department & Doctor</h2>
            
            <select onChange={fetchDoctors} className="w-full border-gray-300 rounded-md shadow-sm border p-2 mb-4">
              <option value="">Select a Department</option>
              {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            
            {loading ? <Loader2 className="animate-spin h-6 w-6 text-blue-600" /> : (
                <div className="grid grid-cols-1 gap-4">
                    {doctors.map(doc => (
                        <div key={doc.id} onClick={() => { setSelectedDoctor(doc); handleNext(); }} className="border border-slate-200 hover:border-blue-600 hover:bg-blue-50 rounded-lg p-4 cursor-pointer">
                            <h3 className="font-bold text-slate-900">{doc.name}</h3>
                            <p className="text-sm text-slate-500 mt-1">{doc.specialization} • {doc.qualification}</p>
                        </div>
                    ))}
                    {selectedDepartment && doctors.length === 0 && <p className="text-slate-500">No doctors available in this department.</p>}
                </div>
            )}
            
            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(step - 1)} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-md hover:bg-slate-200">Back</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-semibold">Select Date & Time</h2>
            <input type="date" min={getMinDate()} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm border p-2 mb-4" />
            
            {selectedDate && (
                <div className="grid grid-cols-3 gap-3">
                    {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map(slot => (
                        <button key={slot} onClick={() => setSelectedSlot(slot)} className={`border rounded p-2 text-sm ${selectedSlot === slot ? 'border-blue-600 bg-blue-50 font-bold' : 'border-slate-200 hover:bg-blue-50 hover:border-blue-300'}`}>
                            {slot}
                        </button>
                    ))}
                </div>
            )}
            
            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(step - 1)} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-md hover:bg-slate-200">Back</button>
              <button disabled={!selectedSlot} onClick={handleNext} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">Next Step</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 text-center">
            <h2 className="text-xl font-bold text-green-600 mb-2">Confirm Your Booking</h2>
            <p className="text-slate-600">You are about to book an appointment with <strong>{selectedDoctor?.name}</strong> at <strong>{selectedHospital?.name}</strong> on <strong>{selectedDate} at {selectedSlot}</strong>.</p>
            <div className="flex justify-center gap-4 mt-8">
              <button disabled={loading} onClick={() => setStep(step - 1)} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-md hover:bg-slate-200">Go Back</button>
              <button disabled={loading} onClick={handleFinish} className="bg-green-600 text-white px-8 py-2 rounded-md hover:bg-green-700 font-bold shadow-sm flex items-center gap-2">
                {loading && <Loader2 className="animate-spin h-4 w-4" />}
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
