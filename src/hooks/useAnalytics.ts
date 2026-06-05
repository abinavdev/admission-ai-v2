import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

interface AnalyticsData {
  overview: {
    totalLeads: number;
    totalChats: number;
    totalCalls: number;
    totalDocuments: number;
    conversionRate: number;
  };
  leadsByStatus: { status: string; _count: { _all: number } }[];
  leadsBySource: { source: string; _count: { _all: number } }[];
  leadsByCourse: { course: string; _count: { _all: number } }[];
  callsByStatus: { status: string; _count: { _all: number } }[];
}

interface UseAnalyticsReturn {
  analytics: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  fetchAnalytics: () => Promise<void>;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ data: AnalyticsData }>(API_ENDPOINTS.analytics.summary);
      setAnalytics(res.data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { analytics, loading, error, fetchAnalytics };
}
