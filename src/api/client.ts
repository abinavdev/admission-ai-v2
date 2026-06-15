import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

type AuthErrorCallback = () => void;
let authErrorCallback: AuthErrorCallback | null = null;

export const registerAuthErrorCallback = (cb: AuthErrorCallback) => {
  authErrorCallback = cb;
};

apiClient.interceptors.request.use((config) => {
  const isPublic = config.url?.includes('/chat/ask') || config.url?.includes('/leads/public');
  if (!isPublic) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isPublic = url.includes('/chat/ask') || url.includes('/leads/public');
      if (!isPublic) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('current_page');
        if (authErrorCallback) {
          authErrorCallback();
        }
      }
    }
    return Promise.reject(error);
  }
);
