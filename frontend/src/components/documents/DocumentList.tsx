import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { documentApi, type DocumentDTO } from '../../api/documentApi';

const CleanSummaryRenderer = ({ data }: { data: any }) => {
  if (data === null || data === undefined || data === '') return null;

  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return <span className="text-slate-700">{String(data)}</span>;
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
      <div className="space-y-2 my-2">
        {entries.map(([k, v]) => {
          const formattedKey = k.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim();
          return (
            <div key={k} className="flex flex-col sm:flex-row sm:gap-4 items-start border-b border-slate-100 pb-2 last:border-0 last:pb-0">
              <span className="font-semibold text-slate-900 min-w-[140px] text-sm uppercase tracking-wider">{formattedKey}:</span>
              <div className="flex-1 text-sm"><CleanSummaryRenderer data={v} /></div>
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
  const [activeDoc, setActiveDoc] = useState<DocumentDTO | null>(null);
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

  if (loading && documents.length === 0) return <div className="text-sm text-gray-500">{t('documentsPage.loading_documents', 'Loading documents...')}</div>;
  if (documents.length === 0) return <div className="text-sm text-gray-500 italic">No documents uploaded for this appointment.</div>;

  return (
    <>
      <div className="space-y-3">
        {documents.map((doc) => (
          <div key={doc.id} className="flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex flex-col gap-2 p-3">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate" title={doc.fileName}>{doc.fileName}</p>
                  <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                    {doc.documentType} • {(() => {
                      const d = new Date(doc.uploadedAt);
                      return `${d.getDate().toString().padStart(2, '0')} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
                    })()}
                  </p>
                </div>
                {doc.processingStatus && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider whitespace-nowrap shrink-0 ${
                    doc.processingStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    doc.processingStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {doc.processingStatus === 'SUMMARIZING' ? 'Processing' : 
                     doc.processingStatus === 'EXTRACTING' ? 'Processing' : 
                     doc.processingStatus}
                  </span>
                )}
              </div>
              
              {/* Optional key finding preview if it exists */}
              {doc.aiSummary && doc.processingStatus === 'COMPLETED' && (
                  <p className="text-xs text-slate-600 line-clamp-1 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                    <span className="font-semibold text-slate-700 not-italic mr-1">AI Extracted:</span>
                    {(doc.aiSummary as any)?.summary || 'Clinical data available'}
                  </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDownload(doc.id, doc)}
                    className="text-slate-600 hover:text-blue-700 hover:bg-slate-100 px-2.5 py-1 rounded text-xs font-semibold transition-colors border border-transparent hover:border-slate-200"
                  >
                    View PDF
                  </button>
                  {doc.aiSummary && (
                    <button 
                      onClick={() => setActiveDoc(doc)}
                      className="text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded text-xs font-semibold transition-colors border border-blue-100"
                    >
                      AI Summary
                    </button>
                  )}
                </div>
                <button 
                  onClick={async () => {
                    if(window.confirm('Are you sure you want to remove this document?')) {
                      try {
                        await documentApi.deleteDocument(doc.id);
                        toast.success('Document deleted');
                        fetchDocuments();
                      } catch(e) {
                        toast.error('Failed to delete document');
                      }
                    }
                  }}
                  className="text-slate-400 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-xs font-medium transition-colors"
                  title="Delete Document"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Side Drawer for AI Summary */}
      {activeDoc && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setActiveDoc(null)} />
          <div className="fixed inset-y-0 right-0 max-w-lg w-full flex">
            <div className="w-full h-full bg-white shadow-2xl flex flex-col transform transition-transform">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Document Summary</h2>
                  <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">{activeDoc.fileName}</p>
                </div>
                <button 
                  onClick={() => setActiveDoc(null)}
                  className="p-2 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-white">
                <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    AI-Extracted Information
                  </h3>
                  <p className="text-sm text-blue-900/80 leading-relaxed">
                    This summary is automatically generated from the document text. Always verify critical values with the original PDF.
                  </p>
                </div>
                
                {Object.entries(activeDoc.aiSummary as Record<string, any>).map(([key, value]) => {
                  if (key === 'sourceEvidence' || key === 'otherDetails') return null;
                  if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0)) return null;
                  
                  const sectionTitle = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim();
                  
                  return (
                    <div key={key} className="mb-6 last:mb-0">
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-3">
                        {sectionTitle}
                      </h4>
                      <CleanSummaryRenderer data={value} />
                    </div>
                  );
                })}
              </div>
              
              <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0 flex justify-end gap-3">
                <button 
                  onClick={() => setActiveDoc(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => handleDownload(activeDoc.id, activeDoc)}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 border border-blue-800 rounded hover:bg-blue-800 shadow-sm transition-colors"
                >
                  View Original PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
