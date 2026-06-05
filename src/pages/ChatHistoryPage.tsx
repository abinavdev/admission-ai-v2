import React, { useState, useEffect } from 'react';
import { MessageSquare, Eye, Bot, User } from 'lucide-react';
import { chatSessions as mockSessions } from '../data/mockData';
import { TableWrapper, DataTable } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { ChatSession } from '../types';
import { useChats } from '../hooks/useChat';

export function ChatHistoryPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ChatSession | null>(null);
  const { sessions: apiSessions, fetchSessions } = useChats();

  useEffect(() => { fetchSessions().catch(() => {}); }, [fetchSessions]);

  const chatSessions = apiSessions.length > 0 ? apiSessions : mockSessions;

  const filtered = chatSessions.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.studentName.toLowerCase().includes(q) || c.courseInterest.toLowerCase().includes(q);
  });

  const columns = [
    {
      key: 'name', header: 'Student',
      render: (row: ChatSession) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#003B7A] text-white text-xs font-bold flex items-center justify-center">
            {row.studentName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <span className="text-xs font-medium text-slate-900">{row.studentName}</span>
        </div>
      ),
    },
    { key: 'date', header: 'Date', render: (row: ChatSession) => <span className="text-xs text-slate-500">{row.date}</span> },
    {
      key: 'messages', header: 'Messages',
      render: (row: ChatSession) => (
        <div className="flex items-center gap-1 text-xs text-slate-600">
          <MessageSquare className="w-3 h-3 text-slate-400" />
          {row.messageCount}
        </div>
      ),
    },
    {
      key: 'course', header: 'Course Interest',
      render: (row: ChatSession) => (
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">{row.courseInterest}</span>
      ),
    },
    {
      key: 'action', header: 'Conversation',
      render: (row: ChatSession) => (
        <button onClick={() => setSelected(row)} className="flex items-center gap-1 text-xs text-[#003B7A] hover:underline font-medium">
          <Eye className="w-3 h-3" />
          View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Sessions', value: chatSessions.length, color: 'text-[#003B7A] bg-blue-50' },
          { label: 'Avg Messages', value: Math.round(chatSessions.reduce((a, b) => a + b.messageCount, 0) / chatSessions.length), color: 'text-emerald-700 bg-emerald-50' },
          { label: 'This Week', value: chatSessions.filter((c) => c.date >= '2024-01-19').length, color: 'text-amber-600 bg-amber-50' },
        ].map((stat) => (
          <div key={stat.label} className={`card p-4 text-center ${stat.color}`}>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs font-medium mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <TableWrapper
        title="Chat Sessions"
        count={filtered.length}
        onSearch={(q) => setSearch(q)}
        searchPlaceholder="Search by name or course..."
        onExport={() => {}}
      >
        <DataTable columns={columns} data={filtered} />
      </TableWrapper>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Conversation — ${selected?.studentName}`} size="lg">
        {selected && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <span className="text-xs text-slate-500">Course Interest:</span>
              <span className="text-xs font-medium text-[#003B7A] bg-blue-50 px-2 py-0.5 rounded-full">{selected.courseInterest}</span>
              <span className="text-xs text-slate-400 ml-auto">{selected.date}</span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selected.messages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg bg-[#003B7A] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-xs leading-relaxed ${msg.role === 'user' ? 'bg-[#003B7A] text-white rounded-tr-sm' : 'bg-slate-100 text-slate-700 rounded-tl-sm'}`}>
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-3 h-3 text-slate-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
