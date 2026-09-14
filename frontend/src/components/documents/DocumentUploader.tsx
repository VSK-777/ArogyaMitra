import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { documentApi } from '../../api/documentApi';
import { getUserFriendlyMessage } from '../../utils/errorUtils';

interface DocumentUploaderProps {
  patientId: number;
  onUploadSuccess: () => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ patientId, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('LAB_REPORT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    
    try {
      await documentApi.uploadPatientDocument(file, patientId, docType);
      setFile(null);
      onUploadSuccess(); // Refresh the list
    } catch (err: any) {
      setError(getUserFriendlyMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-800 mb-4">{t('documentsPage.upload_doc')}</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('documentsPage.document_type')}</label>
          <select 
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="LAB_REPORT">{t('documentsPage.lab_report')}</option>
            <option value="RADIOLOGY">{t('documentsPage.radiology')}</option>
            <option value="PRESCRIPTION">{t('documentsPage.prescription')}</option>
            <option value="OTHER">{t('documentsPage.other_doc')}</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('documentsPage.select_file')}</label>
          <input 
            type="file" 
            accept="application/pdf,image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            required
          />
          <p className="text-xs text-gray-500 mt-1">{t('documentsPage.max_size')}</p>
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '{t('documentsPage.uploading')}' : t('documentsPage.upload_doc')}
        </button>
      </form>
    </div>
  );
};
