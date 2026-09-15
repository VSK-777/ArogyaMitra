import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { documentApi, type DocumentDTO } from '../../api/documentApi';

interface DocumentListProps {
  patientId?: number;
  appointmentId?: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({ patientId, appointmentId }) => {
  const [documents, setDocuments] = useState<DocumentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const fetchDocuments = async () => {
    try {
      let docs: DocumentDTO[] = [];
      if (patientId) {
        docs = await documentApi.getPatientDocuments(patientId);
      } else if (appointmentId) {
        docs = await documentApi.getDocuments(appointmentId);
      }
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to load documents", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [patientId, appointmentId]);

  useEffect(() => {
    // Poll for status updates if any document is processing
    const hasProcessingDocs = documents.some(d => d.processingStatus && d.processingStatus !== 'COMPLETED' && d.processingStatus !== 'FAILED');
    if (hasProcessingDocs) {
      const intervalId = setInterval(() => {
        fetchDocuments();
      }, 3000);
      return () => clearInterval(intervalId);
    }
  }, [documents, patientId, appointmentId]);

  const handleDownload = async (docId: number) => {
    try {
      const url = await documentApi.getDownloadUrl(docId);
      window.open(url, '_blank');
    } catch (error) {
      toast.error("Failed to securely fetch document. It may have expired or you lack permission.");
    }
  };

  if (loading && documents.length === 0) return <div className="text-sm text-gray-500">{t('documentsPage.loading_documents')}</div>;
  if (documents.length === 0) return <div className="text-sm text-gray-500 italic">No documents uploaded for this appointment.</div>;

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div key={doc.id} className="flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 truncate" title={doc.fileName}>{doc.fileName}</p>
              <p className="text-xs text-slate-500 mt-1">
                {doc.documentType} • {new Date(doc.uploadedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {doc.processingStatus && (
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  doc.processingStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  doc.processingStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {doc.processingStatus === 'SUMMARIZING' ? 'AI Summarizing...' : 
                   doc.processingStatus === 'EXTRACTING' ? 'Processing PDF...' : 
                   doc.processingStatus}
                </span>
              )}
              <button 
                onClick={() => handleDownload(doc.id)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                View PDF
              </button>
              <button 
                onClick={async () => {
                  if(window.confirm('Are you sure you want to delete this document?')) {
                    try {
                      await documentApi.deleteDocument(doc.id);
                      toast.success('Document deleted');
                      fetchDocuments();
                    } catch(e) {
                      toast.error('Failed to delete document');
                    }
                  }
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
          
          {doc.aiSummary && (
            <div className="p-4 bg-white">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">{t('documentsPage.ai_summary')}</h4>
              <div className="text-sm text-gray-600 space-y-2">
                {/* Dynamically render JSON keys that are not empty */}
                {Object.entries(doc.aiSummary as Record<string, any>).map(([key, value]) => {
                  if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0)) return null;
                  return (
                    <div key={key} className="bg-slate-50 p-2 rounded border border-slate-100">
                      <strong className="block text-xs uppercase tracking-wider text-slate-500 mb-1">{key}</strong>
                      <pre className="whitespace-pre-wrap font-sans text-xs">{JSON.stringify(value, null, 2)}</pre>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {doc.processingError && (
             <div className="p-3 bg-red-50 text-red-700 text-xs border-t border-red-100">
                {t('documentsPage.error_failed')}: {doc.processingError}
             </div>
          )}
        </div>
      ))}
    </div>
  );
};
