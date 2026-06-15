import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { apiClient } from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import {
  LayoutDashboard, MessageSquare, Phone, Users, PhoneCall,
  MessageCircle, BookOpen, BarChart3, Settings, Bot, UserCog,
  GraduationCap, ChevronRight, X, Zap, ExternalLink, LogOut,
} from 'lucide-react';
import { Page } from '../../types';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  page: Page;
  badge?: string;
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard', page: 'dashboard' },
  { icon: <Bot className="w-4 h-4" />, label: 'AI Agent Overview', page: 'ai-agent' },
  { icon: <MessageSquare className="w-4 h-4" />, label: 'AI Chat Assistant', page: 'chat' },
  { icon: <Phone className="w-4 h-4" />, label: 'AI Voice Agent', page: 'voice' },
  { icon: <Users className="w-4 h-4" />, label: 'Lead Management', page: 'leads', badge: '12' },
  { icon: <PhoneCall className="w-4 h-4" />, label: 'Call Logs', page: 'call-logs' },
  { icon: <MessageCircle className="w-4 h-4" />, label: 'Chat History', page: 'chat-history' },
  { icon: <BookOpen className="w-4 h-4" />, label: 'Knowledge Base', page: 'knowledge-base' },
  { icon: <BarChart3 className="w-4 h-4" />, label: 'Analytics', page: 'analytics' },
  { icon: <UserCog className="w-4 h-4" />, label: 'Team Management', page: 'team' },
  { icon: <Settings className="w-4 h-4" />, label: 'Settings', page: 'settings' },
  { icon: <ExternalLink className="w-4 h-4" />, label: 'Student Portal', page: 'student-portal' },
];

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ currentPage, onNavigate, isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuthContext();
  const [leadsCount, setLeadsCount] = useState<number | null>(null);

  useEffect(() => {
    apiClient.get<{ data: { totalLeads: number } }>(API_ENDPOINTS.dashboard.stats)
      .then((res) => setLeadsCount(res.data.data.totalLeads))
      .catch(() => {});
  }, [currentPage]);

  const handleNav = (page: Page) => {
    onNavigate(page);
    onClose();
  };

  const dynamicNavItems = navItems.map((item) => {
    if (item.page === 'leads') {
      return { ...item, badge: leadsCount !== null ? String(leadsCount) : undefined };
    }
    return item;
  });

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const formatRole = (role: string) => {
    if (role === 'ADMIN') return 'Administrator';
    if (role === 'ADMISSION_OFFICER') return 'Admission Officer';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-50 w-64 bg-white border-r border-slate-100 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#003B7A] rounded-xl flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">AdmissionAI</span>
              <p className="text-xs text-amber-600 leading-none mt-0.5 font-medium">Demo — CUSAT Data</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* AI Status Badge */}
        <div className="mx-3 mt-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-emerald-700">AI Agents Active</span>
            <Zap className="w-3 h-3 text-emerald-500 ml-auto" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {dynamicNavItems.map((item) => (
            <button
              key={item.page}
              onClick={() => handleNav(item.page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                currentPage === item.page
                  ? 'bg-[#003B7A] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  currentPage === item.page ? 'bg-white/20 text-white' : 'bg-[#F4B400] text-slate-900'
                }`}>
                  {item.badge}
                </span>
              )}
              {currentPage === item.page && (
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#003B7A] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.role ? formatRole(user.role) : 'Staff'}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                onNavigate('login');
              }}
              title="Logout"
              className="p-1.5 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-lg transition-all duration-150 flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
