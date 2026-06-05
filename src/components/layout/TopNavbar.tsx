import { Menu, Bell, Search, ChevronRight } from 'lucide-react';
import { Page } from '../../types';

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
  const info = pageTitles[currentPage] || { title: 'AdmissionAI', description: '' };

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

      {/* Search */}
      <div className="hidden md:flex relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search..."
          className="pl-8 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#003B7A] focus:bg-white transition-all w-48"
        />
      </div>

      {/* Notifications */}
      <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
        <Bell className="w-5 h-5 text-slate-600" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-[#F4B400] rounded-full" />
      </button>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-[#003B7A] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 cursor-pointer">
        SK
      </div>
    </header>
  );
}
