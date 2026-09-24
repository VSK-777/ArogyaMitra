import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi } from '../../api/patientApi';
import { Loader2, CheckCircle2, Ticket } from 'lucide-react';
import { getUserFriendlyMessage } from '../../utils/errorUtils';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation, Trans } from 'react-i18next';
import { loadRazorpay } from '../../utils/loadRazorpay';

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDisplayTime = (timeStr: string) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12;
  return `${hour.toString().padStart(2, '0')}:${m} ${ampm}`;
};

export default function BookAppointment() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { name } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data from APIs
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(true);
  const [hospitalSearchQuery, setHospitalSearchQuery] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  
  // Selections
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [confirmedData, setConfirmedData] = useState<any>(null);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);

  useEffect(() => {
    generateTimeSlots();
  }, [selectedDate]);

  useEffect(() => {
    patientApi.getHospitals()
      .then(res => setHospitals(res.data || []))
      .catch(e => setError(getUserFriendlyMessage(e)))
      .finally(() => setIsLoadingHospitals(false));
  }, []);

  const handleNext = () => setStep(step + 1);

  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
    const isToday = selectedDate === localISOTime || selectedDate === now.toISOString().split('T')[0];
    const currentHour = now.getHours();

    for (let i = 0; i <= 23; i++) {
      if (isToday && i <= currentHour) continue;
      slots.push(`${i.toString().padStart(2, '0')}:00`);
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

  const handleDepartmentSelect = (e: any) => {
    const deptId = e.target.value;
    if (!deptId) return;
    const dept = departments.find(d => d.id == deptId);
    setSelectedDepartment(dept);
    handleNext(); // Move to Date & Time step
  };

  const fetchAvailableDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Get all doctors in dept
      const docsRes = await patientApi.getDoctors(selectedDepartment.id);
      const deptDoctors = docsRes.data || [];
      
      // 2. Filter them
      const available = [];
      const hour = parseInt(selectedSlot.split(':')[0]);
      
      for (const doc of deptDoctors) {
        // Check lunch break mapping
        const docIdHash = doc.id ? String(doc.id).charCodeAt(String(doc.id).length - 1) : 0;
        const lunchHour = (docIdHash % 2 === 0) ? 12 : 13;
        if (hour === lunchHour) continue; // Doctor is on lunch
        
        // Check booked slots
        const slotsRes = await patientApi.getBookedSlots(doc.id, selectedDate);
        const booked = slotsRes.data || [];
        if (!booked.includes(selectedSlot)) {
            available.push(doc);
        }
      }
      
      setAvailableDoctors(available);
      handleNext();
    } catch (err) {
      setError(getUserFriendlyMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    setError('');
    try {
        const RZP_KEY: string | undefined = import.meta.env.VITE_RAZORPAY_KEY_ID;
        
        if (!RZP_KEY || RZP_KEY.trim() === '') {
            const payload = {
                hospitalId: selectedHospital.id,
                departmentId: selectedDepartment.id,
                doctorId: selectedDoctor.id,
                appointmentDate: selectedDate,
                slotStart: selectedSlot,
                razorpayPaymentId: "mock_payment_" + Math.random().toString(36).substring(7),
                razorpayOrderId: "mock_order_" + Math.random().toString(36).substring(7),
                razorpaySignature: "mock_signature"
            };
            const res = await patientApi.bookAppointment(payload);
            if(res.success) {
                setConfirmedData(res.data);
                setStep(6);
            } else {
                setError(res.message || 'Unable to book the appointment.');
            }
            setLoading(false);
            return;
        }

        const { paymentApi } = await import('../../api/paymentApi');
        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
            setError('Failed to load payment gateway.');
            setLoading(false);
            return;
        }

        const orderRes = await paymentApi.createOrder(50000); // 500 INR
        if (!orderRes.success) {
            setError('Failed to initialize payment.');
            setLoading(false);
            return;
        }

        const options = {
            key: RZP_KEY,
            amount: orderRes.data.amount,
            currency: orderRes.data.currency,
            name: 'Hospital System',
            description: 'Appointment Registration Fee',
            order_id: orderRes.data.order_id,
            handler: async function (response: any) {
                try {
                    const verifyRes = await paymentApi.verifyPayment({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature
                    });

                    if (verifyRes.success) {
                        const payload = {
                            hospitalId: selectedHospital.id,
                            departmentId: selectedDepartment.id,
                            doctorId: selectedDoctor.id,
                            appointmentDate: selectedDate,
                            slotStart: selectedSlot,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature
                        };
                        const res = await patientApi.bookAppointment(payload);
                        if(res.success) {
                            setConfirmedData(res.data);
                            setStep(6);
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
        console.error("Booking error:", e);
        setError(e.response?.data?.message || e.message || "Unable to process booking. Please try again.");
        setLoading(false);
    }
  };

  const getMinDate = () => {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {step < 6 && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('bookAppointment.title')}</h1>
          <p className="text-slate-500 mt-1">{t('bookAppointment.subtitle')}</p>
        </div>
      )}

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>}

      {step < 6 && (
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-500'}`}>{s}</div>
              {s !== 5 && <div className={`h-1 flex-1 mx-2 rounded-full ${step > s ? 'bg-blue-700' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-semibold">{t('bookAppointment.select_hospital')}</h2>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder={t('bookAppointment.search_hospitals')}
                value={hospitalSearchQuery}
                onChange={(e) => setHospitalSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hospitals.filter(h => h.name.toLowerCase().includes(hospitalSearchQuery.toLowerCase()) || h.address.toLowerCase().includes(hospitalSearchQuery.toLowerCase())).map(h => (
                <div key={h.id} onClick={() => fetchDepartments(h)} className="border border-slate-200 hover:border-blue-700 hover:bg-blue-50 rounded-lg p-4 cursor-pointer">
                  <h3 className="font-bold text-slate-900">{h.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{h.address}</p>
                </div>
              ))}
              {isLoadingHospitals && <p className="text-slate-500 col-span-2">{t('bookAppointment.loading_hospitals')}</p>}
              {!isLoadingHospitals && hospitals.length === 0 && <p className="text-slate-500 col-span-2">{t('bookAppointment.no_hospitals')}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-semibold">{t('bookAppointment.select_department')}</h2>
            
            <select onChange={handleDepartmentSelect} className="w-full border-gray-300 rounded-md shadow-sm border p-2 mb-4 bg-white focus:ring-blue-500 focus:border-blue-500">
              <option value="">{t('bookAppointment.select_department')}</option>
              {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            
            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(step - 1)} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-md hover:bg-slate-200">{t('bookAppointment.back')}</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-semibold">{t('bookAppointment.select_date_time')}</h2>
            <input type="date" min={getMinDate()} value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(''); }} className="w-full border-gray-300 rounded-md shadow-sm border p-2 mb-4 focus:ring-blue-500 focus:border-blue-500" />
            
            {selectedDate && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {timeSlots.map(slot => {
                        const hour = parseInt(slot.split(':')[0]);
                        return (
                          <button 
                            key={slot} 
                            onClick={() => setSelectedSlot(slot)} 
                            className={`border rounded p-2 text-sm ${selectedSlot === slot ? 'border-blue-700 bg-blue-700 text-white font-bold' : 'border-slate-300 hover:bg-blue-50 hover:border-blue-300 text-slate-700'}`}>
                              {slot} - {(hour + 1).toString().padStart(2, '0')}:00
                          </button>
                        );
                    })}
                </div>
            )}
            
            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(step - 1)} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-md hover:bg-slate-200">{t('bookAppointment.back')}</button>
              <button disabled={!selectedSlot || loading} onClick={fetchAvailableDoctors} className="bg-blue-700 text-white px-6 py-2 rounded-md hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2">
                  {loading && <Loader2 className="animate-spin h-4 w-4" />}
                  Find Doctors
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-semibold">Available Doctors at {selectedSlot}</h2>
            <div className="grid grid-cols-1 gap-4">
                {availableDoctors.map(doc => (
                    <div key={doc.id} onClick={() => { setSelectedDoctor(doc); handleNext(); }} className="border border-slate-200 hover:border-blue-700 hover:bg-blue-50 rounded-lg p-4 cursor-pointer">
                        <h3 className="font-bold text-slate-900">{doc.name}</h3>
                        <p className="text-sm text-slate-500 mt-1">{doc.specialization} • {doc.qualification}</p>
                    </div>
                ))}
                {availableDoctors.length === 0 && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 text-sm">
                        No doctors are available at {selectedSlot}. They might be on a lunch break, fully booked, or off-shift. Please go back and select a different time slot.
                    </div>
                )}
            </div>
            
            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(step - 1)} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-md hover:bg-slate-200">{t('bookAppointment.back')}</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 text-center">
            <h2 className="text-xl font-bold text-green-600 mb-2">{t('bookAppointment.confirm_pay')}</h2>
            <p className="text-slate-600"><Trans
                i18nKey="bookAppointment.about_to_book"
                values={{ doctor: `${selectedDoctor?.name} (${selectedDoctor?.specialization})`, hospital: selectedHospital?.name, date: formatDisplayDate(selectedDate), time: formatDisplayTime(selectedSlot) }}
                components={{ bold: <strong /> }}
              /></p>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-4 max-w-sm mx-auto text-left">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600">{t('bookAppointment.reg_fee')}</span>
                <span className="font-bold text-slate-900">₹500.00</span>
              </div>
              <p className="text-xs text-slate-500">{t('bookAppointment.fee_required')}</p>
            </div>
            <div className="flex justify-center gap-4 mt-8">
              <button disabled={loading} onClick={() => setStep(step - 1)} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-md hover:bg-slate-200">{t('bookAppointment.go_back')}</button>
              <button disabled={loading} onClick={handleFinish} className="bg-green-600 text-white px-8 py-2 rounded-md hover:bg-green-700 font-bold shadow-sm flex items-center gap-2">
                {loading && <Loader2 className="animate-spin h-4 w-4" />}
                {t('bookAppointment.pay_confirm')}
              </button>
            </div>
          </div>
        )}

        {step === 6 && confirmedData && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900">{t('bookAppointment.apt_confirmed')}</h2>
              <p className="text-slate-500 mt-2">{t('bookAppointment.apt_scheduled')}</p>
            </div>
            
            <div className="bg-slate-50 rounded-md p-6 border border-slate-200 grid gap-4 sm:grid-cols-2">
                <div>
                    <p className="text-sm text-slate-500">{t('bookAppointment.patient')}</p>
                    <p className="font-semibold text-slate-900">{name || 'Patient'}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500">{t('bookAppointment.hospital')}</p>
                    <p className="font-semibold text-slate-900">{confirmedData.hospitalName}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500">{t('bookAppointment.department')}</p>
                    <p className="font-semibold text-slate-900">{confirmedData.departmentName}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500">{t('bookAppointment.doctor')}</p>
                    <p className="font-semibold text-slate-900">{confirmedData.doctorName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedDoctor?.specialization} • {selectedDoctor?.qualification}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500">{t('bookAppointment.date_time')}</p>
                    <p className="font-semibold text-slate-900">{formatDisplayDate(confirmedData.appointmentDate)} {t('bookAppointment.at')} {formatDisplayTime(confirmedData.slotStart)}</p>
                </div>
                
                <div className="col-span-1 sm:col-span-2 border-t border-slate-200 pt-4 mt-2"></div>
                
                <div>
                    <p className="text-sm text-slate-500">{t('bookAppointment.appointment_id')}</p>
                    <p className="font-bold text-slate-900">{confirmedData.appointmentId}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500 flex items-center gap-1 font-bold"><Ticket className="w-4 h-4" /> {t('bookAppointment.token_number')}</p>
                    <p className="text-2xl font-black text-blue-700">{confirmedData.tokenId}</p>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button onClick={() => navigate('/patient/pre-consultation')} className="flex-1 bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 font-bold shadow-sm text-center">{t('bookAppointment.start_ai')}</button>
              <button onClick={() => navigate('/patient/documents')} className="flex-1 bg-white text-blue-700 border border-blue-200 px-6 py-3 rounded-lg hover:bg-blue-50 font-bold shadow-sm text-center">{t('bookAppointment.upload_reports')}</button>
            </div>
            
            <div className="text-center mt-4">
              <button onClick={() => navigate('/patient/dashboard')} className="text-slate-500 hover:text-slate-700 text-sm font-medium underline">{t('bookAppointment.return_dashboard')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
