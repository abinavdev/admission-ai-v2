import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { Lead } from '../types';

interface LeadsResponse {
  data: Lead[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

interface UseLeadsReturn {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  total: number;
  fetchLeads: (params?: Record<string, string>) => Promise<void>;
  createLead: (data: Omit<Lead, 'id' | 'date'>) => Promise<Lead>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<Lead>;
  deleteLead: (id: string) => Promise<void>;
}

export function useLeads(): UseLeadsReturn {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchLeads = useCallback(async (params: Record<string, string> = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<LeadsResponse>(API_ENDPOINTS.leads.list, { params });
      setLeads(res.data.data);
      setTotal(res.data.pagination.total);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch leads';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createLead = useCallback(async (data: Omit<Lead, 'id' | 'date'>) => {
    const res = await apiClient.post<{ data: Lead }>(API_ENDPOINTS.leads.list, data);
    setLeads((prev) => [res.data.data, ...prev]);
    return res.data.data;
  }, []);

  const updateLead = useCallback(async (id: string, data: Partial<Lead>) => {
    const res = await apiClient.patch<{ data: Lead }>(API_ENDPOINTS.leads.detail(id), data);
    setLeads((prev) => prev.map((l) => (l.id === id ? res.data.data : l)));
    return res.data.data;
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    await apiClient.delete(API_ENDPOINTS.leads.detail(id));
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setTotal((t) => t - 1);
  }, []);

  return { leads, loading, error, total, fetchLeads, createLead, updateLead, deleteLead };
}
