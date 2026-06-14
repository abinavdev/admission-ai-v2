import { useState, useEffect, useCallback } from 'react';
import { Clock, Play, Bot } from 'lucide-react';
import { CallLog } from '../types';
import { useCalls } from '../hooks/useCalls';
import { useAnalytics } from '../hooks/useAnalytics';
import { useToast } from '../contexts/ToastContext';
import { TableWrapper, DataTable } from '../components/ui/Table';
import { CallStatusBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { TableRowSkeleton, Skeleton } from '../components/ui/Skeleton';

const statusOptions = ['All', 'Completed', 'Missed', 'Voicemail'];

function normalizeCall(c: Record<string, unknown>): CallLog {
  const status = String(c.status ?? '');
  return {
    id: String(c.id),
    studentName: String(c.studentName ?? c.student_name ?? ''),
    phone: String(c.phone ?? ''),
    duration: String(c.duration ?? '0:00'),
    status: (status === 'COMPLETED' ? 'Completed' : status === 'MISSED' ? 'Missed' : status === 'VOICEMAIL' ? 'Voicemail' : status) as CallLog['status'],
    date: c.calledAt ? new Date(String(c.calledAt)).toLocaleString() : String(c.date ?? ''),
    transcript: String(c.transcript ?? ''),
  };
}

export function CallLogsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CallLog | null>(null);
  const { calls: rawCalls, loading, error, total, fetchCalls } = useCalls();
  const { analytics, fetchAnalytics } = useAnalytics();
  const toast = useToast();

  const ITEMS_PER_PAGE = 8;

  const getActiveParams = useCallback(() => {
    const params: Record<string, string> = {
      page: String(page),
      limit: String(ITEMS_PER_PAGE),
    };
    if (statusFilter !== 'All') {
      params.status = statusFilter.toUpperCase();
    }
    if (search) {
      params.search = search;
    }
    return params;
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchCalls(getActiveParams()).catch(() => {});
  }, [fetchCalls, getActiveParams]);

  useEffect(() => {
    fetchAnalytics().catch(() => {});
  }, [fetchAnalytics]);

  useEffect(() => {
    if (error) toast(error, 'error');
  }, [error]);

  const callLogs = (rawCalls as unknown as Record<string, unknown>[]).map(normalizeCall);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const completedCount = (analytics?.callsByStatus ?? []).find((s) => s.status === 'COMPLETED')?._count._all ?? 0;
  const missedCount = (analytics?.callsByStatus ?? []).find((s) => s.status === 'MISSED')?._count._all ?? 0;
  const voicemailCount = (analytics?.callsByStatus ?? []).find((s) => s.status === 'VOICEMAIL')?._count._all ?? 0;
  const totalCallsCount = analytics?.overview?.totalCalls ?? total;

  const columns = [
    { key: 'id', header: 'Call ID', render: (row: CallLog) => <span className="text-xs font-mono text-slate-400">{row.id.slice(0, 8)}...</span> },
    {
      key: 'student', header: 'Student',
      render: (row: CallLog) => (
        <div>
          <p className="text-xs font-medium text-slate-900">{row.studentName}</p>
          <p className="text-xs text-slate-400">{row.phone}</p>
        </div>
      ),
    },
    {
      key: 'duration', header: 'Duration',
      render: (row: CallLog) => (
        <div className="flex items-center gap-1 text-xs text-slate-600">
          <Clock className="w-3 h-3 text-slate-400" />
          {row.duration}
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (row: CallLog) => <CallStatusBadge status={row.status} /> },
    { key: 'date', header: 'Date & Time', render: (row: CallLog) => <span className="text-xs text-slate-400">{row.date}</span> },
    {
      key: 'transcript', header: 'Transcript',
      render: (row: CallLog) => (
        <button onClick={() => setSelected(row)} className="flex items-center gap-1 text-xs text-[#003B7A] hover:underline font-medium">
          <Play className="w-3 h-3" />
          View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {loading && callLogs.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
        ) : (
          [
            { label: 'Total Calls', value: totalCallsCount, color: 'text-[#003B7A] bg-blue-50' },
            { label: 'Completed', value: completedCount, color: 'text-emerald-700 bg-emerald-50' },
            { label: 'Missed / VM', value: missedCount + voicemailCount, color: 'text-red-600 bg-red-50' },
          ].map((stat) => (
            <div key={stat.label} className={`card p-4 text-center ${stat.color}`}>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs font-medium mt-1">{stat.label}</div>
            </div>
          ))
        )}
      </div>

      <TableWrapper
        title="Call Logs"
        count={total}
        onSearch={(q) => { setSearch(q); setPage(1); }}
        searchPlaceholder="Search by name or phone..."
        onExport={() => {}}
        actions={
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-xs border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#003B7A] bg-white"
          >
            {statusOptions.map((s) => <option key={s}>{s}</option>)}
          </select>
        }
      >
        {loading && callLogs.length === 0 ? (
          <table className="w-full">
            <tbody>{Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)}</tbody>
          </table>
        ) : (
          <DataTable columns={columns} data={callLogs} emptyMessage="No call logs found" />
        )}

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, total)} of {total}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">Previous</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 text-xs rounded-lg transition-colors ${page === i + 1 ? 'bg-[#003B7A] text-white' : 'hover:bg-slate-50 border border-slate-200'}`}>{i + 1}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">Next</button>
            </div>
          </div>
        )}
      </TableWrapper>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Transcript — ${selected?.studentName}`} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Duration', value: selected.duration },
                { label: 'Status', value: selected.status },
                { label: 'Date', value: selected.date },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Transcript</h4>
              {selected.transcript ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {selected.transcript.split('\n').filter(Boolean).map((line, i) => {
                    const isAI = line.startsWith('AI:');
                    const isStudent = line.startsWith('Student:');
                    const content = line.replace(/^(AI:|Student:)\s*/, '');
                    return (
                      <div key={i} className={`flex gap-2 ${isStudent ? 'justify-end' : ''}`}>
                        {isAI && (
                          <div className="w-5 h-5 rounded-full bg-[#003B7A] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bot className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        <div className={`max-w-[80%] rounded-lg px-3 py-2 text-xs leading-relaxed ${isAI ? 'bg-white border border-slate-200 text-slate-700' : isStudent ? 'bg-[#003B7A] text-white' : 'text-slate-500 italic'}`}>
                          {isAI || isStudent ? content : line}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No transcript available</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
