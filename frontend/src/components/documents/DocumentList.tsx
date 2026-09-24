import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { documentApi, type DocumentDTO } from '../../api/documentApi';

const CleanSummaryRenderer = ({ data }: { data: any }) => {
  if (data === null || data === undefined || data === '') return null;

  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return <span className="text-slate-600">{String(data)}</span>;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return null;
    return (
      <ul className="list-disc pl-4 space-y-1 my-1">
        {data.map((item, idx) => (
          <li key={idx}><CleanSummaryRenderer data={item} /></li>
        ))}
      </ul>
    );
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data).filter(([_, v]) => 
      v !== null && 
      v !== undefined && 
      v !== '' && 
      (Array.isArray(v) ? v.length > 0 : true) && 
      (typeof v === 'object' && !Array.isArray(v) ? Object.keys(v).length > 0 : true)
    );
    if (entries.length === 0) return null;
    
    return (
      <div className="space-y-1 my-1">
        {entries.map(([k, v]) => {
          const formattedKey = k.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim();
          return (
            <div key={k} className="flex flex-col sm:flex-row sm:gap-2 items-start">
              <span className="font-semibold text-slate-700 whitespace-nowrap">{formattedKey}:</span>
              <div className="flex-1"><CleanSummaryRenderer data={v} /></div>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

interface DocumentListProps {
  patientId?: number;
  appointmentId?: string;
  onViewSummary?: (appointmentId: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ patientId, appointmentId, onViewSummary }) => {
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

  const handleDownload = async (docId: number, doc: DocumentDTO) => {
    if (doc.documentType === 'CONSULTATION_SUMMARY') {
        if (onViewSummary && doc.appointmentId) {
            onViewSummary(doc.appointmentId);
        } else {
            toast.error("Please view this summary from the dashboard.");
        }
        return;
    }
    
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
          <div className="flex flex-col gap-3 p-3 bg-slate-50 border-b border-slate-100">
            <div className="min-w-0 w-full">
              <p className="text-sm font-medium text-slate-900 truncate" title={doc.fileName}>{doc.fileName}</p>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                <span>{doc.documentType}</span>
                <span>•</span>
                <span>{(() => {
                  const d = new Date(doc.uploadedAt);
                  return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
                })()}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 w-full">
              {doc.processingStatus && (
                <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                  doc.processingStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  doc.processingStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {doc.processingStatus === 'SUMMARIZING' ? 'AI Summarizing...' : 
                   doc.processingStatus === 'EXTRACTING' ? 'Processing PDF...' : 
                   doc.processingStatus}
                </span>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button 
                  onClick={() => handleDownload(doc.id, doc)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
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
                className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
              >
                Delete
              </button>
              </div>
            </div>
          </div>
          
          {doc.aiSummary && (
            <div className="p-4 bg-white">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('documentsPage.ai_summary', 'AI Clinical Summary')}
              </h4>
              <div className="text-sm text-gray-600 space-y-3">
                {Object.entries(doc.aiSummary as Record<string, any>).map(([key, value]) => {
                  if (key === 'sourceEvidence') return null; // Hide verbose source evidence list
                  if (key === 'otherDetails') return null; // Hide administrative bloat from older summaries
                  if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0)) return null;
                  
                  const sectionTitle = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim();
                  
                  return (
                    <div key={key} className="bg-slate-50/50 p-3 rounded border border-slate-100">
                      <strong className="block text-xs uppercase tracking-wider text-slate-500 mb-2">{sectionTitle}</strong>
                      <CleanSummaryRenderer data={value} />
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
