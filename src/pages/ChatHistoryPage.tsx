import { useState, useEffect } from 'react';
import { MessageSquare, Eye, Bot, User } from 'lucide-react';
import { ChatSession } from '../types';
import { useChats } from '../hooks/useChat';
import { useToast } from '../contexts/ToastContext';
import { TableWrapper, DataTable } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { TableRowSkeleton, Skeleton } from '../components/ui/Skeleton';

function normalizeSession(s: Record<string, unknown>): ChatSession {
  const messages = Array.isArray(s.messages) ? s.messages : [];
  return {
    id: String(s.id),
    studentName: String(s.studentName ?? s.student_name ?? ''),
    date: s.createdAt ? new Date(String(s.createdAt)).toLocaleDateString() : String(s.date ?? ''),
    messageCount: (s as { _count?: { messages?: number } })._count?.messages ?? messages.length ?? Number(s.messageCount ?? 0),
    courseInterest: String(s.courseInterest ?? s.course_interest ?? ''),
    messages: messages as { role: 'user' | 'assistant'; content: string }[],
  };
}

export function ChatHistoryPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ChatSession | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const { sessions: rawSessions, loading, error, fetchSessions } = useChats();
  const toast = useToast();

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  useEffect(() => {
    if (error) toast(error, 'error');
  }, [error]);

  const chatSessions = (rawSessions as unknown as Record<string, unknown>[]).map(normalizeSession);

  const filtered = chatSessions.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.studentName.toLowerCase().includes(q) || c.courseInterest.toLowerCase().includes(q);
  });

  const avgMessages = chatSessions.length > 0
    ? Math.round(chatSessions.reduce((a, b) => a + b.messageCount, 0) / chatSessions.length)
    : 0;

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
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
          {row.courseInterest || '—'}
        </span>
      ),
    },
    {
      key: 'action', header: 'Conversation',
      render: (row: ChatSession) => (
        <button onClick={() => { setSelected(row); setSelectedMessages(row.messages); }} className="flex items-center gap-1 text-xs text-[#003B7A] hover:underline font-medium">
          <Eye className="w-3 h-3" />
          View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {loading && chatSessions.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
        ) : (
          [
            { label: 'Total Sessions', value: chatSessions.length, color: 'text-[#003B7A] bg-blue-50' },
            { label: 'Avg Messages', value: avgMessages, color: 'text-emerald-700 bg-emerald-50' },
            { label: 'This Week', value: chatSessions.filter((c) => new Date(c.date) >= new Date(Date.now() - 7 * 864e5)).length, color: 'text-amber-600 bg-amber-50' },
          ].map((stat) => (
            <div key={stat.label} className={`card p-4 text-center ${stat.color}`}>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs font-medium mt-1">{stat.label}</div>
            </div>
          ))
        )}
      </div>

      <TableWrapper
        title="Chat Sessions"
        count={filtered.length}
        onSearch={(q) => setSearch(q)}
        searchPlaceholder="Search by name or course..."
        onExport={() => {}}
      >
        {loading && chatSessions.length === 0 ? (
          <table className="w-full">
            <tbody>{Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)}</tbody>
          </table>
        ) : (
          <DataTable columns={columns} data={filtered} emptyMessage="No chat sessions found" />
        )}
      </TableWrapper>

      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setSelectedMessages([]); }} title={`Conversation — ${selected?.studentName}`} size="lg">
        {selected && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <span className="text-xs text-slate-500">Course Interest:</span>
              <span className="text-xs font-medium text-[#003B7A] bg-blue-50 px-2 py-0.5 rounded-full">{selected.courseInterest || '—'}</span>
              <span className="text-xs text-slate-400 ml-auto">{selected.date}</span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedMessages.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No messages recorded</p>
              ) : (
                selectedMessages.map((msg, i) => (
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
                ))
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
