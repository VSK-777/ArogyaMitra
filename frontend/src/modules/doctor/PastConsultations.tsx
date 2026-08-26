import { useEffect, useState } from 'react';
import { doctorApi } from '../../api/doctorApi';
import { getUserFriendlyMessage } from '../../utils/errorUtils';
import { FileText, Loader2, ClipboardList } from 'lucide-react';
import { DocumentList } from '../../components/documents/DocumentList';

export default function PastConsultations() {
    const [consultations, setConsultations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedAptId, setSelectedAptId] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await doctorApi.getPastConsultations(); 
                if (res.success) {
                    setConsultations(res.data || []);
                } else {
                    setError(res.message);
                }
            } catch (err) {
                setError(getUserFriendlyMessage(err));
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Past Consultations</h1>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>}

            {consultations.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
                    <ClipboardList className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No past consultations found.</p>
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        {consultations.map((q, idx) => (
                            <div key={idx} 
                                onClick={() => setSelectedAptId(q.appointment?.appointmentId)}
                                className={`p-4 rounded-xl border cursor-pointer transition-colors ${selectedAptId === q.appointment?.appointmentId ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-slate-900">{q.patient?.fullName || 'Patient'}</h3>
                                    <span className="text-sm font-medium bg-green-100 text-green-700 px-2 py-1 rounded">Token: {q.appointment?.tokenId || 'N/A'}</span>
                                </div>
                                <p className="text-sm text-slate-600">Appointment ID: {q.appointment?.appointmentId}</p>
                                <p className="text-sm text-slate-600">Date: {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
                        {selectedAptId ? (
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2 border-b pb-2">
                                    <FileText className="h-5 w-5 text-blue-600" /> Medical Records
                                </h3>
                                <DocumentList appointmentId={selectedAptId} />
                            </div>
                        ) : (
                            <div className="text-center p-8 text-slate-500">
                                Select a consultation to view attached documents and records.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
