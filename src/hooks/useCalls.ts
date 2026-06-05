import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { CallLog } from '../types';

interface UseCallsReturn {
  calls: CallLog[];
  loading: boolean;
  error: string | null;
  fetchCalls: (params?: Record<string, string>) => Promise<void>;
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

  return { calls, loading, error, fetchCalls };
}
