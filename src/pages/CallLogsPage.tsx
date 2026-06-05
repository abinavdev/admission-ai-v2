import React, { useState, useEffect } from 'react';
import { Clock, Play, Bot } from 'lucide-react';
import { callLogs as mockCallLogs } from '../data/mockData';
import { TableWrapper, DataTable } from '../components/ui/Table';
import { CallStatusBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { CallLog } from '../types';
import { useCalls } from '../hooks/useCalls';

const statusOptions = ['All', 'Completed', 'Missed', 'Voicemail'];

export function CallLogsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState<CallLog | null>(null);
  const { calls: apiCalls, fetchCalls } = useCalls();

  useEffect(() => { fetchCalls().catch(() => {}); }, [fetchCalls]);

  const callLogs = apiCalls.length > 0 ? apiCalls : mockCallLogs;

  const filtered = callLogs.filter((c) => {
    const matchSearch = !search || c.studentName.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    { key: 'id', header: 'Call ID', render: (row: CallLog) => <span className="text-xs font-mono text-slate-400">{row.id}</span> },
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
        <button
          onClick={() => setSelected(row)}
          className="flex items-center gap-1 text-xs text-[#003B7A] hover:underline font-medium"
        >
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
        {[
          { label: 'Total Calls', value: callLogs.length, color: 'text-[#003B7A] bg-blue-50' },
          { label: 'Completed', value: callLogs.filter((c) => c.status === 'Completed').length, color: 'text-emerald-700 bg-emerald-50' },
          { label: 'Missed', value: callLogs.filter((c) => c.status !== 'Completed').length, color: 'text-red-600 bg-red-50' },
        ].map((stat) => (
          <div key={stat.label} className={`card p-4 text-center ${stat.color}`}>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs font-medium mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <TableWrapper
        title="Call Logs"
        count={filtered.length}
        onSearch={(q) => setSearch(q)}
        searchPlaceholder="Search by name or phone..."
        onExport={() => {}}
        actions={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#003B7A] bg-white"
          >
            {statusOptions.map((s) => <option key={s}>{s}</option>)}
          </select>
        }
      >
        <DataTable columns={columns} data={filtered} />
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
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
