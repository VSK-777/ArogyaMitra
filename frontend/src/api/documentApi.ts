import axios from 'axios';


const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface DocumentDTO {
  id: number;
  appointmentId: number;
  fileName: string;
  documentType: string;
  contentType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  downloadUrl?: string;
}

export const documentApi = {
  uploadDocument: async (file: File, appointmentId: number, documentType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('appointmentId', appointmentId.toString());
    formData.append('documentType', documentType);

    const response = await axios.post(`${API_URL}/api/documents/upload`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  getDocuments: async (appointmentId: number) => {
    const response = await axios.get(`${API_URL}/api/documents/appointment/${appointmentId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data.data as DocumentDTO[];
  },

  getDownloadUrl: async (documentId: number) => {
    const response = await axios.get(`${API_URL}/api/documents/${documentId}/download-url`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data.data;
  },

  deleteDocument: async (documentId: number) => {
    const response = await axios.delete(`${API_URL}/api/documents/${documentId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.data.data;
  },
};
