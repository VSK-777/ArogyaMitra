import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi } from '../../api/patientApi';
import { Loader2, CheckCircle2, Ticket } from 'lucide-react';
import { getUserFriendlyMessage } from '../../utils/errorUtils';
import { useAuth } from '../../contexts/AuthContext';

export default function BookAppointment() {
  const navigate = useNavigate();
  const { name } = useAuth();
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
  const [confirmedData, setConfirmedData] = useState<any>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      setLoading(true);
      patientApi.getBookedSlots(selectedDoctor.id, selectedDate)
        .then(res => {
          if(res.success) setBookedSlots(res.data || []);
          generateTimeSlots();
        })
        .catch(() => generateTimeSlots())
        .finally(() => setLoading(false));
    } else {
        generateTimeSlots();
    }
  }, [selectedDate, selectedDoctor]);

  useEffect(() => {
    patientApi.getHospitals()
      .then(res => setHospitals(res.data || []))
      .catch(e => setError(getUserFriendlyMessage(e)));
  }, []);

  const handleNext = () => setStep(step + 1);

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 9; i <= 17; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
      slots.push(`${i.toString().padStart(2, '0')}:30`);
    }
    setTimeSlots(slots);
  };

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
        // 1. Create order
        const { paymentApi } = await import('../../api/paymentApi');
        const orderRes = await paymentApi.createOrder(50000); // 500 INR
        if (!orderRes.success) {
            setError('Failed to initialize payment.');
            setLoading(false);
            return;
        }

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: orderRes.data.amount,
            currency: orderRes.data.currency,
            name: 'Hospital System',
            description: 'Appointment Registration Fee',
            order_id: orderRes.data.order_id,
            handler: async function (response: any) {
                try {
                    // 2. Verify Payment
                    const verifyRes = await paymentApi.verifyPayment({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature
                    });

                    if (verifyRes.success) {
                        // 3. Book Appointment
                        const payload = {
                            hospitalId: selectedHospital.id,
                            departmentId: selectedDepartment.id,
                            doctorId: selectedDoctor.id,
                            appointmentDate: selectedDate,
                            slotStart: selectedSlot
                        };
                        const res = await patientApi.bookAppointment(payload);
                        if(res.success) {
                            setConfirmedData(res.data);
                            setStep(5);
                        } else {
                            setError(res.message || 'Unable to book the appointment after payment.');
                        }
                    } else {
                        setError('Payment verification failed.');
                    }
                } catch (e: any) {
                    setError(getUserFriendlyMessage(e));
                } finally {
                    setLoading(false);
                }
            },
            prefill: {
                name: name || 'Patient',
            },
            theme: {
                color: '#2563eb'
            },
            modal: {
                ondismiss: function() {
                    setLoading(false);
                }
            }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
            setError(`Payment failed: ${response.error.description}`);
            setLoading(false);
        });
        rzp.open();
    } catch (e: any) {
        setError(getUserFriendlyMessage(e));
        setLoading(false);
    }
  };

  // Get tomorrow's date as minimum selectable date
  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {step < 5 && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Book New Appointment</h1>
          <p className="text-slate-500 mt-1">Follow the steps to secure your slot.</p>
        </div>
      )}

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>}

      {step < 5 && (
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{s}</div>
              {s !== 4 && <div className={`h-1 flex-1 mx-2 rounded-full ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
      )}

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
            
            <select onChange={fetchDoctors} className="w-full border-gray-300 rounded-md shadow-sm border p-2 mb-4 bg-white focus:ring-blue-500 focus:border-blue-500">
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
            <input type="date" min={getMinDate()} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm border p-2 mb-4 focus:ring-blue-500 focus:border-blue-500" />
            
            {selectedDate && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {timeSlots.map(slot => {
                        const isBooked = bookedSlots.includes(slot);
                        return (
                          <button 
                            key={slot} 
                            disabled={isBooked}
                            onClick={() => setSelectedSlot(slot)} 
                            className={`border rounded p-2 text-sm ${isBooked ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : selectedSlot === slot ? 'border-blue-600 bg-blue-600 text-white font-bold' : 'border-slate-300 hover:bg-blue-50 hover:border-blue-300 text-slate-700'}`}>
                              {slot} {isBooked && '(Booked)'}
                          </button>
                        );
                    })}
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
            <h2 className="text-xl font-bold text-green-600 mb-2">Confirm Your Booking & Pay Fee</h2>
            <p className="text-slate-600">You are about to book an appointment with <strong>{selectedDoctor?.name}</strong> at <strong>{selectedHospital?.name}</strong> on <strong>{selectedDate} at {selectedSlot}</strong>.</p>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-4 max-w-sm mx-auto text-left">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600">Registration Fee:</span>
                <span className="font-bold text-slate-900">₹500.00</span>
              </div>
              <p className="text-xs text-slate-500">This fee is required to confirm your appointment.</p>
            </div>
            <div className="flex justify-center gap-4 mt-8">
              <button disabled={loading} onClick={() => setStep(step - 1)} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-md hover:bg-slate-200">Go Back</button>
              <button disabled={loading} onClick={handleFinish} className="bg-green-600 text-white px-8 py-2 rounded-md hover:bg-green-700 font-bold shadow-sm flex items-center gap-2">
                {loading && <Loader2 className="animate-spin h-4 w-4" />}
                Pay ₹500 & Confirm Booking
              </button>
            </div>
          </div>
        )}

        {step === 5 && confirmedData && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900">Appointment Confirmed ✓</h2>
              <p className="text-slate-500 mt-2">Your appointment has been successfully scheduled.</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 grid gap-4 sm:grid-cols-2">
                <div>
                    <p className="text-sm text-slate-500">Patient</p>
                    <p className="font-semibold text-slate-900">{name || 'Patient'}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500">Hospital</p>
                    <p className="font-semibold text-slate-900">{confirmedData.hospitalName}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500">Department</p>
                    <p className="font-semibold text-slate-900">{confirmedData.departmentName}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500">Doctor</p>
                    <p className="font-semibold text-slate-900">{confirmedData.doctorName}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500">Date & Time</p>
                    <p className="font-semibold text-slate-900">{confirmedData.appointmentDate} at {confirmedData.slotStart}</p>
                </div>
                
                <div className="col-span-1 sm:col-span-2 border-t border-slate-200 pt-4 mt-2"></div>
                
                <div>
                    <p className="text-sm text-slate-500">Appointment ID</p>
                    <p className="font-bold text-slate-900">{confirmedData.appointmentId}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500 flex items-center gap-1 font-bold"><Ticket className="w-4 h-4" /> TOKEN NUMBER</p>
                    <p className="text-2xl font-black text-blue-600">{confirmedData.tokenId}</p>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button onClick={() => navigate('/patient/pre-consultation')} className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-bold shadow-sm text-center">
                Start AI Pre-Consultation
              </button>
              <button onClick={() => navigate('/patient/documents')} className="flex-1 bg-white text-blue-600 border border-blue-200 px-6 py-3 rounded-lg hover:bg-blue-50 font-bold shadow-sm text-center">
                Upload Medical Reports
              </button>
            </div>
            
            <div className="text-center mt-4">
              <button onClick={() => navigate('/patient/dashboard')} className="text-slate-500 hover:text-slate-700 text-sm font-medium underline">
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
