import React from 'react';
import {
  Phone, MessageSquare, Users, TrendingUp, BarChart3,
} from 'lucide-react';
import {
  dailyCallsData, dailyChatsData, courseInterestData,
  leadsTimelineData, conversionFunnelData,
} from '../data/mockData';

function BarChart({ data, dataKey, color, label }: { data: any[]; dataKey: string; color: string; label: string }) {
  const max = Math.max(...data.map((d) => d[dataKey]));
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 text-sm">{label}</h3>
      </div>
      <div className="flex items-end gap-2 h-36">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-xs text-slate-500">{d[dataKey]}</span>
            <div
              className="w-full rounded-t-md transition-all duration-500 cursor-pointer hover:opacity-80"
              style={{ height: `${Math.max((d[dataKey] / max) * 100, 8)}%`, backgroundColor: color }}
            />
            <span className="text-xs text-slate-400 truncate w-full text-center">{d.day || d.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HorizontalBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = Math.round((count / total) * 100);
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

export function AnalyticsPage() {
  const totalEnquiries = conversionFunnelData[0].count;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Calls (Month)', value: '12,847', change: '+12.4%', icon: <Phone className="w-5 h-5 text-[#003B7A]" />, bg: 'bg-blue-50', changeColor: 'text-emerald-600' },
          { label: 'Total Chats (Month)', value: '48,392', change: '+8.1%', icon: <MessageSquare className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50', changeColor: 'text-emerald-600' },
          { label: 'Leads Generated', value: '7,214', change: '+15.3%', icon: <Users className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50', changeColor: 'text-emerald-600' },
          { label: 'Conversion Rate', value: '18.6%', change: '+2.1%', icon: <TrendingUp className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50', changeColor: 'text-emerald-600' },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                <p className={`text-xs font-medium mt-1 ${stat.changeColor}`}>{stat.change} vs last month</p>
              </div>
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <BarChart data={dailyCallsData} dataKey="calls" color="#003B7A" label="Daily AI Calls (This Week)" />
        <BarChart data={dailyChatsData} dataKey="chats" color="#10b981" label="Daily AI Chats (This Week)" />
      </div>

      {/* Leads trend + funnel */}
      <div className="grid lg:grid-cols-2 gap-4">
        <BarChart data={leadsTimelineData} dataKey="leads" color="#F4B400" label="Lead Generation (Last 6 Months)" />

        {/* Conversion Funnel */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-5">Lead Conversion Funnel</h3>
          <div className="space-y-4">
            {conversionFunnelData.map((item) => (
              <HorizontalBar key={item.stage} label={item.stage} count={item.count} total={totalEnquiries} color={item.color} />
            ))}
          </div>
          <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-xs text-emerald-700 font-medium">Overall conversion rate: <span className="text-base font-bold">{Math.round((conversionFunnelData[4].count / totalEnquiries) * 100)}%</span></p>
          </div>
        </div>
      </div>

      {/* Course Interest + Student trends */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Course Interest */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-5">Popular Courses by Interest</h3>
          <div className="space-y-3">
            {courseInterestData.map((item) => {
              const total = courseInterestData.reduce((a, b) => a + b.count, 0);
              return (
                <div key={item.course} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-slate-600 flex-1">{item.course}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(item.count / total) * 100}%`, backgroundColor: item.color }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 w-8 text-right">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Student Interest Trends */}
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
