import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { documentApi, type DocumentDTO } from '../../api/documentApi';

interface DocumentListProps {
  appointmentId: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({ appointmentId }) => {
  const [documents, setDocuments] = useState<DocumentDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const docs = await documentApi.getDocuments(appointmentId);
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to load documents", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [appointmentId]);

  const handleDownload = async (docId: number) => {
    try {
      const url = await documentApi.getDownloadUrl(docId);
      // Open presigned URL in new tab to view/download securely
      window.open(url, '_blank');
    } catch (error) {
      toast.error("Failed to securely fetch document. It may have expired or you lack permission.");
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading documents...</div>;
  if (documents.length === 0) return <div className="text-sm text-gray-500 italic">No documents uploaded for this appointment.</div>;

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-900 truncate" title={doc.fileName}>{doc.fileName}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {doc.documentType} • {new Date(doc.uploadedAt).toLocaleDateString()} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button 
            onClick={() => handleDownload(doc.id)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap shrink-0 transition-colors"
          >
            View / Download
          </button>
        </div>
      ))}
    </div>
  );
};


