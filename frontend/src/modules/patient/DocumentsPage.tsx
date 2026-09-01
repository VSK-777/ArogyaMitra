import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DocumentList } from '../../components/documents/DocumentList';
import { DocumentUploader } from '../../components/documents/DocumentUploader';
import { patientApi } from '../../api/patientApi';

export default function DocumentsPage() {
  const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const passedAptId = searchParams.get('appointmentId');

    const [appointments, setAppointments] = useState<any[]>([]);
    const [selectedAptId, setSelectedAptId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        patientApi.getDashboard().then(res => {
            if(res.success && res.data.upcomingAppointments) {
                setAppointments(res.data.upcomingAppointments);
                if (passedAptId) {
                    const found = res.data.upcomingAppointments.find((a: any) => a.appointmentId === passedAptId);
                    if (found) setSelectedAptId(found.appointmentId);
                } else if (res.data.upcomingAppointments.length > 0) {
                    setSelectedAptId(res.data.upcomingAppointments[0].appointmentId);
                }
            }
            setLoading(false);
        });
    }, [passedAptId]);

    const handleUploadSuccess = () => {
        // Trigger a re-render of DocumentList by unsetting and setting the ID quickly, or DocumentList can handle its own refresh
        const current = selectedAptId;
        setSelectedAptId(null);
        setTimeout(() => setSelectedAptId(current), 10);
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading appointments...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">{t('documentsPage.title')}</h1>
                <button onClick={() => navigate('/patient/dashboard')} className="text-blue-700 font-medium">Back to Dashboard</button>
            </div>

            {appointments.length === 0 ? (
                <div className="bg-white p-8 rounded-md border border-slate-200 text-center text-slate-500">
                    You have no upcoming appointments to attach documents to.
                </div>
            ) : (
                <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Appointment</label>
                    <select 
                        className="w-full border border-slate-300 rounded-lg p-3 mb-6 focus:ring-blue-500 focus:border-blue-500"
                        value={selectedAptId || ''}
                        onChange={(e) => setSelectedAptId(e.target.value)}
                    >
                        {appointments.map(apt => (
                            <option key={apt.appointmentId} value={apt.appointmentId}>
                                {apt.appointmentDate} - {apt.doctor?.name} ({apt.appointmentId})
                            </option>
                        ))}
                    </select>

                    {selectedAptId && (
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Upload New Document</h2>
                                <DocumentUploader appointmentId={selectedAptId} onUploadSuccess={handleUploadSuccess} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Attached Documents</h2>
                                <DocumentList appointmentId={selectedAptId} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

