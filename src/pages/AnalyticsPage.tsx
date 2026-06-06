import { useEffect } from 'react';
import {
  Phone, MessageSquare, Users, TrendingUp,
} from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { StatCardSkeleton, Skeleton } from '../components/ui/Skeleton';
import { dailyCallsData, dailyChatsData, leadsTimelineData } from '../data/chartData';

function BarChart({ data, dataKey, color, label }: { data: Record<string, unknown>[]; dataKey: string; color: string; label: string }) {
  const max = Math.max(...data.map((d) => Number(d[dataKey])));
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 text-sm">{label}</h3>
      </div>
      <div className="flex items-end gap-2 h-36">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-xs text-slate-500">{Number(d[dataKey])}</span>
            <div
              className="w-full rounded-t-md transition-all duration-500 cursor-pointer hover:opacity-80"
              style={{ height: `${Math.max((Number(d[dataKey]) / max) * 100, 8)}%`, backgroundColor: color }}
            />
            <span className="text-xs text-slate-400 truncate w-full text-center">{String(d.day || d.month)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HorizontalBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">{count.toLocaleString()}</span>
          <span className="text-slate-400">({pct}%)</span>
        </div>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

const courseColors = ['#003B7A', '#F4B400', '#0ea5e9', '#22c55e', '#f59e0b', '#8b5cf6', '#94a3b8'];

export function AnalyticsPage() {
  const { analytics, loading, fetchAnalytics, fetchOverview } = useAnalytics();

  useEffect(() => {
    fetchAnalytics().catch(() => {});
    fetchOverview().catch(() => {});
  }, [fetchAnalytics, fetchOverview]);

  const overview = analytics?.overview;
  const leadsByStatus = analytics?.leadsByStatus ?? [];
  const leadsByCourse = analytics?.leadsByCourse ?? [];

  const totalEnquiries = leadsByStatus.reduce((sum, s) => sum + s._count._all, 0);
  const contactedCount = leadsByStatus.find((s) => s.status === 'CONTACTED')?._count._all ?? 0;
  const interestedCount = leadsByStatus.find((s) => s.status === 'INTERESTED')?._count._all ?? 0;
  const followUpCount = leadsByStatus.find((s) => s.status === 'FOLLOW_UP')?._count._all ?? 0;
  const convertedCount = leadsByStatus.find((s) => s.status === 'CONVERTED')?._count._all ?? 0;

  const conversionRate = overview?.conversionRate ?? 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {loading && !overview ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Calls', value: (overview?.totalCalls ?? 0).toLocaleString(), change: '+12.4%', icon: <Phone className="w-5 h-5 text-[#003B7A]" />, bg: 'bg-blue-50' },
            { label: 'Total Chats', value: (overview?.totalChats ?? 0).toLocaleString(), change: '+8.1%', icon: <MessageSquare className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50' },
            { label: 'Leads Generated', value: (overview?.totalLeads ?? 0).toLocaleString(), change: '+15.3%', icon: <Users className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50' },
            { label: 'Conversion Rate', value: `${conversionRate}%`, change: '+2.1%', icon: <TrendingUp className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' },
          ].map((stat) => (
            <div key={stat.label} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  <p className="text-xs font-medium mt-1 text-emerald-600">{stat.change} vs last month</p>
                </div>
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bar Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <BarChart data={dailyCallsData} dataKey="calls" color="#003B7A" label="Daily AI Calls (This Week)" />
        <BarChart data={dailyChatsData} dataKey="chats" color="#10b981" label="Daily AI Chats (This Week)" />
      </div>

      {/* Leads trend + funnel */}
      <div className="grid lg:grid-cols-2 gap-4">
        <BarChart data={leadsTimelineData} dataKey="leads" color="#F4B400" label="Lead Generation (Last 6 Months)" />

        {/* Conversion Funnel from API */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-5">Lead Conversion Funnel</h3>
          {loading && totalEnquiries === 0 ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <HorizontalBar label="Total Enquiries" count={totalEnquiries} total={totalEnquiries || 1} color="#003B7A" />
                <HorizontalBar label="Contacted" count={contactedCount} total={totalEnquiries || 1} color="#0369a1" />
                <HorizontalBar label="Interested" count={interestedCount} total={totalEnquiries || 1} color="#0ea5e9" />
                <HorizontalBar label="Follow-Up" count={followUpCount} total={totalEnquiries || 1} color="#F4B400" />
                <HorizontalBar label="Converted" count={convertedCount} total={totalEnquiries || 1} color="#22c55e" />
              </div>
              <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-xs text-emerald-700 font-medium">
                  Overall conversion rate: <span className="text-base font-bold">{conversionRate}%</span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Course Interest from API + trends */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-5">Popular Courses by Interest</h3>
          {loading && leadsByCourse.length === 0 ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
            </div>
          ) : leadsByCourse.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No leads data yet</p>
          ) : (
            <div className="space-y-3">
              {leadsByCourse.map((item, idx) => {
                const total = leadsByCourse.reduce((a, b) => a + b._count._all, 0);
                return (
                  <div key={item.course} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: courseColors[idx % courseColors.length] }} />
                    <span className="text-xs text-slate-600 flex-1 truncate">{item.course}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(item._count._all / total) * 100}%`, backgroundColor: courseColors[idx % courseColors.length] }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-8 text-right">{item._count._all}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Student Interest Trends - static context */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-5">Student Interest Trends</h3>
          <div className="space-y-3">
            {[
              { label: 'MCA (Master of Computer Applications)', trend: '+31%', value: '26%', color: '#003B7A' },
              { label: 'MBA (Management Studies)', trend: '+18%', value: '17%', color: '#F4B400' },
              { label: 'B.Tech Programs', trend: '+14%', value: '14%', color: '#0ea5e9' },
              { label: 'M.Tech (AI, VLSI, Marine)', trend: '+28%', value: '11%', color: '#22c55e' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-medium text-slate-700">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-900">{item.value}</span>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{item.trend}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-lg font-bold text-[#003B7A]">Tue-Thu</p>
              <p className="text-xs text-slate-500">Peak enquiry days</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-xl">
              <p className="text-lg font-bold text-amber-700">10–11 AM</p>
              <p className="text-xs text-slate-500">Peak enquiry hour</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
