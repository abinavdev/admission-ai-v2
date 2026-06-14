import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { CallLog } from '../types';

interface CallsResponse {
  data: CallLog[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

interface UseCallsReturn {
  calls: CallLog[];
  loading: boolean;
  error: string | null;
  total: number;
  fetchCalls: (params?: Record<string, string>) => Promise<void>;
  createCall: (data: Partial<CallLog>) => Promise<CallLog>;
  updateCall: (id: string, data: Partial<CallLog>) => Promise<CallLog>;
  deleteCall: (id: string) => Promise<void>;
}

export function useCalls(): UseCallsReturn {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchCalls = useCallback(async (params: Record<string, string> = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<CallsResponse>(API_ENDPOINTS.calls.list, { params });
      setCalls(res.data.data);
      setTotal(res.data.pagination.total);
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

  return { calls, loading, error, total, fetchCalls, createCall, updateCall, deleteCall };
}
