import { Menu, ChevronRight } from 'lucide-react';
import { Page } from '../../types';
import { useAuthContext } from '../../contexts/AuthContext';

const pageTitles: Partial<Record<Page, { title: string; description: string }>> = {
  dashboard: { title: 'Dashboard', description: 'CUSAT Demo — AI admission platform overview' },
  chat: { title: 'AI Chat Assistant', description: 'CUSAT Admission Assistant powered by Knowledge Base' },
  voice: { title: 'AI Voice Agent', description: 'Automated voice call handling with CUSAT information' },
  leads: { title: 'Lead Management', description: 'Track and manage student enquiries' },
  'call-logs': { title: 'Call Logs', description: 'Review all voice call records and transcripts' },
  'chat-history': { title: 'Chat History', description: 'Browse all CUSAT admission chat conversations' },
  'knowledge-base': { title: 'Knowledge Base', description: 'CUSAT documents uploaded for AI training' },
  analytics: { title: 'Analytics', description: 'Insights into your CUSAT admission pipeline' },
  settings: { title: 'Settings', description: 'Configure your AI agents and platform' },
  'ai-agent': { title: 'AI Agent Overview', description: 'Monitor AI agent workflows and performance' },
  team: { title: 'Team Management', description: 'Manage users, roles, and permissions' },
  'student-portal': { title: 'Student Portal', description: 'CUSAT Admission Assistant — public portal' },
};

interface TopNavbarProps {
  currentPage: Page;
  onMenuToggle: () => void;
}

export function TopNavbar({ currentPage, onMenuToggle }: TopNavbarProps) {
  const { user } = useAuthContext();
  const info = pageTitles[currentPage] || { title: 'AdmissionAI', description: '' };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30">
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Menu className="w-5 h-5 text-slate-600" />
      </button>

      {/* Breadcrumb + Title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
          <span>AdmissionAI</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600 font-medium">{info.title}</span>
        </div>
        <h1 className="text-sm font-semibold text-slate-900 truncate">{info.description}</h1>
      </div>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-[#003B7A] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 cursor-pointer">
        {initials}
      </div>
    </header>
  );
}
