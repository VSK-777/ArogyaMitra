import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentList } from '../../components/documents/DocumentList';
import { DocumentUploader } from '../../components/documents/DocumentUploader';
import { patientApi } from '../../api/patientApi';

export default function DocumentsPage() {
  const { t } = useTranslation();
    const navigate = useNavigate();

    const [patientId, setPatientId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        patientApi.getDashboard().then(res => {
            if(res.success && res.data.patientInfo?.id) {
                setPatientId(res.data.patientInfo.id);
            }
            // fallback: check if patient details are elsewhere in response
            else if (res.success && res.data.id) {
                setPatientId(res.data.id);
            }
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, []);

    const handleUploadSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading your profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Medical Documents</h1>
                <button onClick={() => navigate('/patient/dashboard')} className="text-blue-700 font-medium">Back to Dashboard</button>
            </div>

            <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm">
                <p className="text-sm text-slate-500 mb-6">
                    View your past medical documents, radiology reports, and lab results. Our AI will automatically process them for clinical summaries.
                </p>

                {patientId ? (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Upload New Document</h2>
                            <DocumentUploader patientId={patientId} onUploadSuccess={handleUploadSuccess} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Historical Records</h2>
                            <DocumentList patientId={patientId} key={refreshKey} />
                        </div>
                    </div>
                ) : (
                    <div className="p-4 text-red-600 bg-red-50 border border-red-100 rounded-md">
                        Unable to load patient profile.
                    </div>
                )}
            </div>
        </div>
    );
}
