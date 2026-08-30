import { useEffect, useState } from 'react';
import { Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../api/client';
import { getUserFriendlyMessage } from '../../utils/errorUtils';
import { useAuth } from '../../contexts/AuthContext';

export default function DoctorUpcomingAppointments() {
    const { role } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [showUnavailabilityModal, setShowUnavailabilityModal] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('Urgent hospital responsibility');
    const [previewData, setPreviewData] = useState<any[] | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [resultSummary, setResultSummary] = useState<any>(null);

    useEffect(() => {
        if (role === 'ROLE_DOCTOR') {
            fetchUpcoming();
        }
    }, [role]);

    const fetchUpcoming = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/api/doctor/queue/upcoming');
            setAppointments(res.data.data || []);
        } catch (err: any) {
            setError(getUserFriendlyMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async () => {
        if (!startDate || !endDate) return;
        setPreviewLoading(true);
        try {
            // Using backend fix that takes logged in user
            const res = await apiClient.get(`/api/doctor-unavailability/preview?startDate=${startDate}&endDate=${endDate}`);
            setPreviewData(res.data.data || []);
        } catch (e: any) {
            alert(getUserFriendlyMessage(e));
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleAutoReschedule = async () => {
        if (!confirm('This will mark you as unavailable, block new bookings, and attempt to auto-reschedule all affected appointments. Continue?')) return;
        setProcessing(true);
        try {
            // 1. Create unavailability
            await apiClient.post('/api/doctor-unavailability/create', { startDate, endDate, reason });
            // 2. Auto-reschedule
            const res = await apiClient.post('/api/doctor-unavailability/auto-reschedule', { startDate, endDate });
            setResultSummary(res.data.data);
            fetchUpcoming();
        } catch (e: any) {
            alert(getUserFriendlyMessage(e));
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading upcoming appointments...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                        Upcoming Appointments
                    </h1>
                    <p className="text-gray-500 mt-1">Manage your future schedule and availability</p>
                </div>
                <button 
                    onClick={() => setShowUnavailabilityModal(true)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors border border-red-200"
                >
                    Manage Unavailability
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">Date & Time</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">Patient</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">Token</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {appointments.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No upcoming appointments found.
                                </td>
                            </tr>
                        ) : (
                            appointments.map(apt => (
                                <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{apt.appointmentDate}</div>
                                        <div className="text-sm text-gray-500">{apt.slotStart || 'TBD'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 font-medium">
                                        {apt.patient?.fullName || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-sm font-medium">
                                            {apt.tokenId || 'Unassigned'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                                            apt.status === 'BOOKED' ? 'bg-green-50 text-green-700' :
                                            apt.status === 'REASSIGNMENT_PENDING' ? 'bg-orange-50 text-orange-700' :
                                            'bg-gray-50 text-gray-700'
                                        }`}>
                                            {apt.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Unavailability Modal */}
            {showUnavailabilityModal && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-gray-900">Mark Unavailability & Reschedule</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Block new bookings for a date range and bulk-reassign affected appointments.
                            </p>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-6 flex-1">
                            {!resultSummary ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                            <input 
                                                type="date" 
                                                value={startDate}
                                                onChange={e => setStartDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                            <input 
                                                type="date" 
                                                value={endDate}
                                                onChange={e => setEndDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                        <select 
                                            value={reason}
                                            onChange={e => setReason(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="Urgent hospital responsibility">Urgent hospital responsibility</option>
                                            <option value="Medical leave">Medical leave</option>
                                            <option value="Conference/Training">Conference/Training</option>
                                            <option value="Personal absence">Personal absence</option>
                                        </select>
                                    </div>

                                    {!previewData ? (
                                        <button 
                                            onClick={handlePreview}
                                            disabled={!startDate || !endDate || previewLoading}
                                            className="w-full py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 disabled:opacity-50"
                                        >
                                            {previewLoading ? 'Checking...' : 'Check Affected Appointments'}
                                        </button>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                                <h3 className="font-semibold text-orange-800 flex items-center gap-2">
                                                    <AlertCircle className="w-5 h-5" />
                                                    {previewData.length} Affected Appointments
                                                </h3>
                                                <p className="text-sm text-orange-700 mt-1">
                                                    These upcoming appointments fall within your unavailable period. Continuing will block new bookings and attempt to reassign these patients to available doctors.
                                                </p>
                                            </div>
                                            
                                            <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-slate-50 sticky top-0">
                                                        <tr>
                                                            <th className="px-4 py-2 font-medium text-slate-600">Date & Time</th>
                                                            <th className="px-4 py-2 font-medium text-slate-600">Patient</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {previewData.map((apt: any) => (
                                                            <tr key={apt.appointmentId}>
                                                                <td className="px-4 py-2">{apt.date} {apt.slotStart}</td>
                                                                <td className="px-4 py-2">{apt.patientName}</td>
                                                            </tr>
                                                        ))}
                                                        {previewData.length === 0 && (
                                                            <tr><td colSpan={2} className="px-4 py-2 text-center text-gray-500">No appointments affected!</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="flex gap-3 pt-2">
                                                <button 
                                                    onClick={handleAutoReschedule}
                                                    disabled={processing}
                                                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                                                >
                                                    {processing ? 'Processing...' : 'Auto-Reschedule All'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-4 text-center py-6">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Rescheduling Complete</h3>
                                    
                                    <div className="grid grid-cols-3 gap-4 my-6">
                                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                            <div className="text-2xl font-bold text-gray-900">{resultSummary.total}</div>
                                            <div className="text-sm text-gray-500">Total Affected</div>
                                        </div>
                                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                            <div className="text-2xl font-bold text-green-700">{resultSummary.successful}</div>
                                            <div className="text-sm text-green-700">Reassigned</div>
                                        </div>
                                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                            <div className="text-2xl font-bold text-orange-700">{resultSummary.pending}</div>
                                            <div className="text-sm text-orange-700">Pending Manual</div>
                                        </div>
                                    </div>

                                    {resultSummary.allocations?.length > 0 && (
                                        <div className="text-left mt-6">
                                            <h4 className="font-semibold text-gray-900 mb-2">Replacements Assigned:</h4>
                                            <ul className="space-y-2 text-sm text-gray-600">
                                                {resultSummary.allocations.map((alloc: any, i: number) => (
                                                    <li key={i} className="flex justify-between p-2 bg-slate-50 rounded">
                                                        <span>{alloc.doctorName}</span>
                                                        <span className="font-medium">{alloc.count} patients</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
                            <button 
                                onClick={() => {
                                    setShowUnavailabilityModal(false);
                                    setPreviewData(null);
                                    setResultSummary(null);
                                }}
                                disabled={processing}
                                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                {resultSummary ? 'Close' : 'Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
