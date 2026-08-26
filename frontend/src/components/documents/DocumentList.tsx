import React, { useEffect, useState } from 'react';
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
      alert("Failed to securely fetch document. It may have expired or you lack permission.");
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading documents...</div>;
  if (documents.length === 0) return <div className="text-sm text-gray-500 italic">No documents uploaded for this appointment.</div>;

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-800">{doc.fileName}</p>
            <p className="text-xs text-gray-500">
              {doc.documentType} • {new Date(doc.uploadedAt).toLocaleDateString()} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button 
            onClick={() => handleDownload(doc.id)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View / Download
          </button>
        </div>
      ))}
    </div>
  );
};
