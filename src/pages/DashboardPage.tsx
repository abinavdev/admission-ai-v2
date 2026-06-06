import { useEffect } from 'react';
import {
  Phone, MessageSquare, Users, FileText, TrendingUp, Bot,
  MessageCircle, UserCheck,
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { useAnalytics } from '../hooks/useAnalytics';
import { useDashboard } from '../hooks/useDashboard';
import { StatCardSkeleton, TableRowSkeleton, Skeleton } from '../components/ui/Skeleton';
import {
  dailyCallsData, dailyChatsData, leadsTimelineData,
} from '../data/chartData';

function MiniBarChart({ data, dataKey, color }: { data: Record<string, unknown>[]; dataKey: string; color: string }) {
  const max = Math.max(...data.map((d) => Number(d[dataKey])));
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-sm transition-all duration-500"
            style={{ height: `${(Number(d[dataKey]) / max) * 100}%`, backgroundColor: color, opacity: 0.85 }}
          />
          <span className="text-[9px] text-slate-400">{String(d.day || d.month)}</span>
        </div>
      ))}
    </div>
  );
}

function ConversionBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
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

const courseColors = ['#003B7A', '#F4B400', '#0ea5e9', '#22c55e', '#f59e0b', '#8b5cf6', '#94a3b8'];

export function DashboardPage() {
  const { analytics, loading, fetchAnalytics } = useAnalytics();
  const { stats, fetchStats } = useDashboard();

  useEffect(() => {
    fetchAnalytics().catch(() => {});
    fetchStats().catch(() => {});
  }, [fetchAnalytics, fetchStats]);

  const overview = analytics?.overview;
  const recentLeads = analytics?.recentLeads ?? [];
  const leadsByCourse = analytics?.leadsByCourse ?? [];
  const leadsByStatus = analytics?.leadsByStatus ?? [];

  const totalEnquiries = leadsByStatus.reduce((sum, s) => sum + s._count._all, 0);
  const contactedCount = leadsByStatus.find((s) => s.status === 'CONTACTED')?._count._all ?? 0;
  const interestedCount = leadsByStatus.find((s) => s.status === 'INTERESTED')?._count._all ?? 0;
  const followUpCount = leadsByStatus.find((s) => s.status === 'FOLLOW_UP')?._count._all ?? 0;
  const convertedCount = leadsByStatus.find((s) => s.status === 'CONVERTED')?._count._all ?? 0;

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
      {loading && !overview ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Total Calls" value={stats?.totalCalls ?? overview?.totalCalls ?? 0} icon={<Phone className="w-5 h-5 text-[#003B7A]" />} change={12.4} iconBg="bg-blue-50" />
          <StatCard title="Total Chats" value={stats?.totalChats ?? overview?.totalChats ?? 0} icon={<MessageSquare className="w-5 h-5 text-emerald-600" />} change={8.1} iconBg="bg-emerald-50" />
          <StatCard title="Total Leads" value={stats?.totalLeads ?? overview?.totalLeads ?? 0} icon={<Users className="w-5 h-5 text-amber-600" />} change={15.3} iconBg="bg-amber-50" />
          <StatCard title="Documents" value={stats?.totalDocuments ?? overview?.totalDocuments ?? 0} icon={<FileText className="w-5 h-5 text-purple-600" />} iconBg="bg-purple-50" />
          <StatCard title="Conversion" value={`${overview?.conversionRate ?? 0}%`} icon={<TrendingUp className="w-5 h-5 text-rose-600" />} change={2.8} iconBg="bg-rose-50" />
          <StatCard title="Active Agents" value={2} icon={<Bot className="w-5 h-5 text-indigo-600" />} iconBg="bg-indigo-50" />
        </div>
      )}

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Daily Calls</h3>
              <p className="text-xs text-slate-400 mt-0.5">This week</p>
            </div>
            <span className="text-xl font-bold text-[#003B7A]">{dailyCallsData.reduce((a, b) => a + b.calls, 0)}</span>
          </div>
          <MiniBarChart data={dailyCallsData} dataKey="calls" color="#003B7A" />
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Daily Chats</h3>
              <p className="text-xs text-slate-400 mt-0.5">This week</p>
            </div>
            <span className="text-xl font-bold text-emerald-600">{dailyChatsData.reduce((a, b) => a + b.chats, 0)}</span>
          </div>
          <MiniBarChart data={dailyChatsData} dataKey="chats" color="#10b981" />
        </div>
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
        {/* Course Interest from API */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Course Interest Distribution</h3>
          {loading && leadsByCourse.length === 0 ? (
            <div className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
            </div>
          ) : leadsByCourse.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No data yet</p>
          ) : (
            <div className="space-y-2.5">
              {leadsByCourse.map((item, idx) => {
                const total = leadsByCourse.reduce((a, b) => a + b._count._all, 0);
                const pct = total > 0 ? Math.round((item._count._all / total) * 100) : 0;
                return (
                  <div key={item.course} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 truncate max-w-[140px]">{item.course}</span>
                      <span className="font-medium text-slate-700">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: courseColors[idx % courseColors.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Conversion Funnel from API */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Lead Conversion Funnel</h3>
          {loading && totalEnquiries === 0 ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-7 w-full" />)}
            </div>
          ) : (
            <div className="space-y-3">
              <ConversionBar label="Total Enquiries" count={totalEnquiries} total={totalEnquiries || 1} color="#003B7A" />
              <ConversionBar label="Contacted" count={contactedCount} total={totalEnquiries || 1} color="#0369a1" />
              <ConversionBar label="Interested" count={interestedCount} total={totalEnquiries || 1} color="#0ea5e9" />
              <ConversionBar label="Follow-Up" count={followUpCount} total={totalEnquiries || 1} color="#F4B400" />
              <ConversionBar label="Converted" count={convertedCount} total={totalEnquiries || 1} color="#22c55e" />
            </div>
          )}
        </div>

        {/* Recent Activity static - driven by recent leads */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Recent Activity</h3>
          {loading && recentLeads.length === 0 ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="w-7 h-7 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentLeads.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead: Record<string, unknown>) => (
                <div key={String(lead.id)} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-blue-100 text-[#003B7A]">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 leading-relaxed">New lead: <span className="font-medium">{String(lead.name)}</span> — {String(lead.course)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{String(lead.source)} · {String(lead.status)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Enquiries Table from API */}
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
              {loading && recentLeads.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
              ) : recentLeads.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-400">No leads yet</td></tr>
              ) : (
                recentLeads.map((lead: Record<string, unknown>) => (
                  <tr key={String(lead.id)} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#003B7A] text-white text-xs font-bold flex items-center justify-center">
                          {String(lead.name).split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-900">{String(lead.name)}</p>
                          <p className="text-xs text-slate-400">{String(lead.email)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{String(lead.course)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${String(lead.source) === 'CHAT' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {String(lead.source) === 'CHAT' ? <MessageCircle className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                        {String(lead.source) === 'CHAT' ? 'Chat' : 'Voice'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        String(lead.status) === 'CONVERTED' ? 'bg-emerald-50 text-emerald-700' :
                        String(lead.status) === 'INTERESTED' ? 'bg-amber-50 text-amber-700' :
                        String(lead.status) === 'NEW' ? 'bg-blue-50 text-blue-700' :
                        String(lead.status) === 'FOLLOW_UP' ? 'bg-purple-50 text-purple-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {String(lead.status).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">
                      {new Date(String(lead.createdAt)).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
