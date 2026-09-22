import { useState, useEffect } from 'react';
import { Loader2, Ticket, CheckCircle2 } from 'lucide-react';
import { patientApi } from '../../api/patientApi';
import { receptionistApi } from '../../api/receptionistApi';

export default function WalkInBooking({ patient }: { patient: any }) {
    const [step, setStep] = useState(1);
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    
    const [selectedHospital, setSelectedHospital] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successData, setSuccessData] = useState<any>(null);

    useEffect(() => {
        patientApi.getHospitals().then(res => {
            if (res.data) setHospitals(res.data);
        });
    }, []);

    useEffect(() => {
        if (selectedHospital) {
            patientApi.getDepartments(selectedHospital).then(res => {
                if (res.data) setDepartments(res.data);
            });
        }
    }, [selectedHospital]);

    useEffect(() => {
        if (selectedDepartment) {
            patientApi.getDoctors(selectedDepartment).then(res => {
                if (res.data) setDoctors(res.data);
            });
        }
    }, [selectedDepartment]);

    useEffect(() => {
        if (selectedDate && selectedDoctor) {
            const slots = [];
            for (let i = 9; i <= 17; i++) {
                slots.push(`${i.toString().padStart(2, '0')}:00`);
            }
            setTimeSlots(slots);
        }
    }, [selectedDate, selectedDoctor]);

    const handleBook = async () => {
        setLoading(true);
        setError('');
        try {
            const RZP_KEY: string | undefined = import.meta.env.VITE_RAZORPAY_KEY_ID;
            
            // If no Razorpay key is configured, bypass payment and book directly
            if (!RZP_KEY || RZP_KEY.trim() === '') {
                const payload = {
                    hospitalId: selectedHospital,
                    departmentId: selectedDepartment,
                    doctorId: selectedDoctor,
                    appointmentDate: selectedDate,
                    slotStart: selectedSlot,
                    patientMobile: patient.mobile,
                    razorpayPaymentId: "mock_payment_" + Math.random().toString(36).substring(7),
                    razorpayOrderId: "mock_order_" + Math.random().toString(36).substring(7),
                    razorpaySignature: "mock_signature"
                };
                const res = await receptionistApi.bookWalkIn(payload);
                if (res.success) {
                    setSuccessData(res.data);
                    setStep(2);
                } else {
                    setError(res.message || "Failed to book");
                }
                setLoading(false);
                return;
            }

            // Razorpay Payment Flow
            const { paymentApi } = await import('../../api/paymentApi');
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
                name: 'Hospital Walk-In Registration',
                description: 'Consultation Fee',
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
                                hospitalId: selectedHospital,
                                departmentId: selectedDepartment,
                                doctorId: selectedDoctor,
                                appointmentDate: selectedDate,
                                slotStart: selectedSlot,
                                patientMobile: patient.mobile,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpaySignature: response.razorpay_signature
                            };
                            const res = await receptionistApi.bookWalkIn(payload);
                            if(res.success) {
                                setSuccessData(res.data);
                                setStep(2);
                            } else {
                                setError(res.message || 'Unable to book the appointment after payment.');
                            }
                        } else {
                            setError('Payment verification failed.');
                        }
                    } catch (e: any) {
                        setError(e.response?.data?.message || e.message || 'Payment verification error.');
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: patient.fullName,
                    contact: patient.mobile
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
            setError(e.response?.data?.message || e.message || "Failed to book");
            setLoading(false);
        }
    };

    if (step === 2 && successData) {
        return (
            <div className="mt-6 border border-green-200 bg-green-50 p-6 rounded-lg text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <h3 className="font-bold text-xl text-green-900">Appointment Booked!</h3>
                <div className="mt-4 bg-white p-4 rounded border text-left space-y-2">
                    <p><strong>Patient:</strong> {patient.fullName}</p>
                    <p><strong>Doctor:</strong> {successData.doctorName}</p>
                    <p><strong>Date & Time:</strong> {successData.appointmentDate} at {successData.slotStart}</p>
                    <div className="bg-blue-50 border border-blue-200 p-3 mt-4 rounded flex items-center justify-between">
                        <span className="font-bold text-blue-900 flex items-center gap-2"><Ticket className="w-5 h-5"/> Token Number</span>
                        <span className="text-2xl font-black text-blue-700">{successData.tokenId}</span>
                    </div>
                </div>
                <button onClick={() => { setStep(1); setSuccessData(null); }} className="mt-4 text-blue-700 underline">Book another</button>
            </div>
        );
    }

    return (
        <div className="mt-6 border border-blue-200 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-blue-900 border-b border-blue-200 pb-2 mb-4">Book Walk-In Appointment</h3>
            
            {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-blue-900 mb-1">Select Hospital</label>
                    <select className="w-full p-2 border rounded" value={selectedHospital} onChange={e => setSelectedHospital(e.target.value)}>
                        <option value="">-- Choose Hospital --</option>
                        {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                </div>
                {selectedHospital && (
                    <div>
                        <label className="block text-sm font-medium text-blue-900 mb-1">Select Department</label>
                        <select className="w-full p-2 border rounded" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)}>
                            <option value="">-- Choose Department --</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                )}
                {selectedDepartment && (
                    <div>
                        <label className="block text-sm font-medium text-blue-900 mb-1">Select Doctor</label>
                        <select className="w-full p-2 border rounded" value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
                            <option value="">-- Choose Doctor --</option>
                            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                )}
                {selectedDoctor && (
                    <div>
                        <label className="block text-sm font-medium text-blue-900 mb-1">Date</label>
                        <input type="date" className="w-full p-2 border rounded" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                    </div>
                )}
                {selectedDate && timeSlots.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-blue-900 mb-1">Time Slot</label>
                        <select className="w-full p-2 border rounded" value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)}>
                            <option value="">-- Choose Time --</option>
                            {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                )}

                <button 
                    disabled={!selectedSlot || loading} 
                    onClick={handleBook}
                    className="w-full bg-blue-700 text-white p-2 rounded mt-4 font-bold disabled:opacity-50 flex justify-center items-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Book Walk-In Appointment
                </button>
            </div>
        </div>
    );
}
