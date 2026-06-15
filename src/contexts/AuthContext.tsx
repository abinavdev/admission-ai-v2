import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiClient, registerAuthErrorCallback } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    return !!localStorage.getItem('auth_token');
  });

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await apiClient.post<{ data: { token: string; user: AuthUser } }>(
        API_ENDPOINTS.auth.login,
        { email, password }
      );
      const { token, user: u } = res.data.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(u));
      setUser(u);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('current_page');
    setUser(null);
  }, []);

  useEffect(() => {
    registerAuthErrorCallback(() => {
      setUser(null);
    });

    const validateToken = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await apiClient.get<{ data: AuthUser }>(API_ENDPOINTS.auth.profile);
        setUser(res.data.data);
        localStorage.setItem('auth_user', JSON.stringify(res.data.data));
      } catch (err) {
        console.error('Session validation failed:', err);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('current_page');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
