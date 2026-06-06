import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { CallLog } from '../types';

interface UseCallsReturn {
  calls: CallLog[];
  loading: boolean;
  error: string | null;
  fetchCalls: (params?: Record<string, string>) => Promise<void>;
  createCall: (data: Partial<CallLog>) => Promise<CallLog>;
  updateCall: (id: string, data: Partial<CallLog>) => Promise<CallLog>;
  deleteCall: (id: string) => Promise<void>;
}

export function useCalls(): UseCallsReturn {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCalls = useCallback(async (params: Record<string, string> = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ data: CallLog[] }>(API_ENDPOINTS.calls.list, { params });
      setCalls(res.data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch calls';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCall = useCallback(async (data: Partial<CallLog>): Promise<CallLog> => {
    const res = await apiClient.post<{ data: CallLog }>(API_ENDPOINTS.calls.list, data);
    const newCall = res.data.data;
    setCalls((prev) => [newCall, ...prev]);
    return newCall;
  }, []);

  const updateCall = useCallback(async (id: string, data: Partial<CallLog>): Promise<CallLog> => {
    const res = await apiClient.patch<{ data: CallLog }>(API_ENDPOINTS.calls.detail(id), data);
    const updated = res.data.data;
    setCalls((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const deleteCall = useCallback(async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.calls.detail(id));
    setCalls((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { calls, loading, error, fetchCalls, createCall, updateCall, deleteCall };
}
