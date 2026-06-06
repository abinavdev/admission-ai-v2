export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    profile: '/auth/profile',
  },
  leads: {
    list: '/leads',
    detail: (id: string) => `/leads/${id}`,
  },
  chat: {
    ask: '/chat/ask',
    sessions: '/chat/sessions',
    session: (id: string) => `/chat/sessions/${id}`,
    messages: (id: string) => `/chat/sessions/${id}/messages`,
  },
  documents: {
    list: '/documents',
    stats: '/documents/stats',
    detail: (id: string) => `/documents/${id}`,
  },
  calls: {
    list: '/calls',
    detail: (id: string) => `/calls/${id}`,
  },
  analytics: {
    summary: '/analytics',
    overview: '/analytics/overview',
  },
  dashboard: {
    stats: '/dashboard/stats',
  },
};
