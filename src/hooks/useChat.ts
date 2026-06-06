import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { ChatSession } from '../types';

interface UseChatsReturn {
  sessions: ChatSession[];
  loading: boolean;
  error: string | null;
  fetchSessions: () => Promise<void>;
  fetchSession: (id: string) => Promise<Record<string, unknown>>;
  createSession: (studentName: string, courseInterest?: string) => Promise<ChatSession>;
}

export function useChats(): UseChatsReturn {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ data: ChatSession[] }>(API_ENDPOINTS.chat.sessions);
      setSessions(res.data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch chat sessions';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSession = useCallback(async (id: string): Promise<Record<string, unknown>> => {
    const res = await apiClient.get<{ data: Record<string, unknown> }>(API_ENDPOINTS.chat.session(id));
    return res.data.data;
  }, []);

  const createSession = useCallback(async (studentName: string, courseInterest?: string) => {
    const res = await apiClient.post<{ data: ChatSession }>(API_ENDPOINTS.chat.sessions, {
      studentName,
      courseInterest,
    });
    setSessions((prev) => [res.data.data, ...prev]);
    return res.data.data;
  }, []);

  return { sessions, loading, error, fetchSessions, fetchSession, createSession };
}
