import React from 'react';
import {
  Phone, MessageSquare, Users, FileText, TrendingUp, Bot,
  PhoneCall, MessageCircle, UserCheck, Clock, Activity,
  CheckCircle, AlertCircle, Info,
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import {
  dashboardStats, dailyCallsData, dailyChatsData, courseInterestData,
  recentActivity, leadsTimelineData, leads,
} from '../data/mockData';

function MiniBarChart({ data, dataKey, color }: { data: any[]; dataKey: string; color: string }) {
  const max = Math.max(...data.map((d) => d[dataKey]));
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-sm transition-all duration-500"
            style={{ height: `${(d[dataKey] / max) * 100}%`, backgroundColor: color, opacity: 0.85 }}
          />
          <span className="text-[9px] text-slate-400">{d.day || d.month}</span>
        </div>
      ))}
    </div>
  );
}

function ConversionBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = Math.round((count / total) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="text-slate-500">{count} <span className="text-slate-400">({pct}%)</span></span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

const activityIcons: Record<string, React.ReactNode> = {
  user: <UserCheck className="w-3.5 h-3.5" />,
  phone: <Phone className="w-3.5 h-3.5" />,
  message: <MessageSquare className="w-3.5 h-3.5" />,
  file: <FileText className="w-3.5 h-3.5" />,
  check: <CheckCircle className="w-3.5 h-3.5" />,
  'phone-missed': <PhoneCall className="w-3.5 h-3.5" />,
};

const activityColors: Record<string, string> = {
  lead: 'bg-blue-100 text-[#003B7A]',
  call: 'bg-emerald-100 text-emerald-700',
  chat: 'bg-amber-100 text-amber-700',
  doc: 'bg-purple-100 text-purple-700',
};

export function DashboardPage() {
  const recentLeads = leads.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Greeting banner */}
      <div className="bg-gradient-to-r from-[#003B7A] to-[#0059b3] rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white font-semibold text-lg">Good morning, Dr. Suresh!</h2>
          <p className="text-blue-200 text-sm mt-0.5">Your AI agents handled 87 enquiries overnight. Here's your overview.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-white text-sm font-medium">All AI Agents Active</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Calls" value={dashboardStats.totalCalls} icon={<Phone className="w-5 h-5 text-[#003B7A]" />} change={12.4} iconBg="bg-blue-50" />
        <StatCard title="Total Chats" value={dashboardStats.totalChats} icon={<MessageSquare className="w-5 h-5 text-emerald-600" />} change={8.1} iconBg="bg-emerald-50" />
        <StatCard title="Total Leads" value={dashboardStats.totalLeads} icon={<Users className="w-5 h-5 text-amber-600" />} change={15.3} iconBg="bg-amber-50" />
        <StatCard title="Documents" value={dashboardStats.documentsUploaded} icon={<FileText className="w-5 h-5 text-purple-600" />} iconBg="bg-purple-50" />
        <StatCard title="Conversion" value={`${dashboardStats.conversionRate}%`} icon={<TrendingUp className="w-5 h-5 text-rose-600" />} change={2.8} iconBg="bg-rose-50" />
        <StatCard title="Active Agents" value={dashboardStats.activeAgents} icon={<Bot className="w-5 h-5 text-indigo-600" />} iconBg="bg-indigo-50" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Daily Calls */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Daily Calls</h3>
              <p className="text-xs text-slate-400 mt-0.5">This week</p>
            </div>
            <span className="text-xl font-bold text-[#003B7A]">349</span>
          </div>
          <MiniBarChart data={dailyCallsData} dataKey="calls" color="#003B7A" />
        </div>

        {/* Daily Chats */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Daily Chats</h3>
              <p className="text-xs text-slate-400 mt-0.5">This week</p>
            </div>
            <span className="text-xl font-bold text-emerald-600">947</span>
          </div>
          <MiniBarChart data={dailyChatsData} dataKey="chats" color="#10b981" />
        </div>

        {/* Lead Trend */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Leads Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Last 6 months</p>
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+45%</span>
          </div>
          <MiniBarChart data={leadsTimelineData} dataKey="leads" color="#F4B400" />
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Course Interest */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Course Interest Distribution</h3>
          <div className="space-y-2.5">
            {courseInterestData.map((item) => {
              const total = courseInterestData.reduce((a, b) => a + b.count, 0);
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.course} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{item.course}</span>
                    <span className="font-medium text-slate-700">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Lead Conversion Funnel</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Enquiries', count: 542, color: '#003B7A' },
              { label: 'Contacted', count: 398, color: '#0369a1' },
              { label: 'Interested', count: 267, color: '#0ea5e9' },
              { label: 'Applied', count: 185, color: '#F4B400' },
              { label: 'Converted', count: 124, color: '#22c55e' },
            ].map((item) => (
              <ConversionBar key={item.label} label={item.label} count={item.count} total={542} color={item.color} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${activityColors[item.type]}`}>
                  {activityIcons[item.icon]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 leading-relaxed">{item.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Enquiries */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 text-sm">Recent Enquiries</h3>
          <span className="text-xs text-[#003B7A] font-medium cursor-pointer hover:underline">View all leads</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                {['Student', 'Course', 'Source', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#003B7A] text-white text-xs font-bold flex items-center justify-center">
                        {lead.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-900">{lead.name}</p>
                        <p className="text-xs text-slate-400">{lead.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600">{lead.course}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${lead.source === 'Chat' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {lead.source === 'Chat' ? <MessageCircle className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                      {lead.source}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      lead.status === 'Converted' ? 'bg-emerald-50 text-emerald-700' :
                      lead.status === 'Interested' ? 'bg-amber-50 text-amber-700' :
                      lead.status === 'New' ? 'bg-blue-50 text-blue-700' :
                      lead.status === 'Follow-Up' ? 'bg-purple-50 text-purple-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-400">{lead.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
