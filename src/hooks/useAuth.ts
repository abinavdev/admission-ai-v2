import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post<{ data: { token: string; user: AuthUser } }>(
        API_ENDPOINTS.auth.login,
        { email, password }
      );
      const { token: t, user: u } = res.data.data;
      localStorage.setItem('auth_token', t);
      localStorage.setItem('auth_user', JSON.stringify(u));
      setToken(t);
      setUser(u);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  }, []);

  return { user, token, loading, error, login, logout, isAuthenticated: !!token };
}
