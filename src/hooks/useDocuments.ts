import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { Document } from '../types';

interface UseDocumentsReturn {
  documents: Document[];
  loading: boolean;
  error: string | null;
  fetchDocuments: () => Promise<void>;
  uploadDocument: (file: File) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
}

export function useDocuments(): UseDocumentsReturn {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ data: Document[] }>(API_ENDPOINTS.documents.list);
      setDocuments(res.data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch documents';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<{ data: Document }>(API_ENDPOINTS.documents.list, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setDocuments((prev) => [res.data.data, ...prev]);
    return res.data.data;
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    await apiClient.delete(API_ENDPOINTS.documents.detail(id));
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return { documents, loading, error, fetchDocuments, uploadDocument, deleteDocument };
}
