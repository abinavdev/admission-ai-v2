import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Filter, Download } from 'lucide-react';
import { leads as mockLeads } from '../data/mockData';
import { Lead } from '../types';
import { useLeads } from '../hooks/useLeads';
import { TableWrapper, DataTable } from '../components/ui/Table';
import { LeadStatusBadge } from '../components/ui/Badge';

const statusOptions = ['All', 'New', 'Contacted', 'Interested', 'Follow-Up', 'Converted'];
const sourceOptions = ['All', 'Chat', 'Voice'];

const ITEMS_PER_PAGE = 8;

export function LeadsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [page, setPage] = useState(1);
  const { leads: apiLeads, fetchLeads } = useLeads();

  useEffect(() => { fetchLeads().catch(() => {}); }, [fetchLeads]);

  const leads = apiLeads.length > 0 ? apiLeads : mockLeads;

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.course.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || l.status === statusFilter;
    const matchSource = sourceFilter === 'All' || l.source === sourceFilter;
    return matchSearch && matchStatus && matchSource;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const columns = [
    {
      key: 'name', header: 'Student',
      render: (row: Lead) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#003B7A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {row.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone', header: 'Phone',
      render: (row: Lead) => <span className="text-xs font-mono">{row.phone}</span>,
    },
    {
      key: 'course', header: 'Course',
      render: (row: Lead) => <span className="text-xs">{row.course}</span>,
    },
    {
      key: 'status', header: 'Status',
      render: (row: Lead) => <LeadStatusBadge status={row.status} />,
    },
    {
      key: 'source', header: 'Source',
      render: (row: Lead) => (
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${row.source === 'Chat' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {row.source === 'Chat' ? <MessageCircle className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
          {row.source}
        </span>
      ),
    },
    {
      key: 'date', header: 'Date',
      render: (row: Lead) => <span className="text-xs text-slate-400">{row.date}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {statusOptions.filter((s) => s !== 'All').map((status) => {
          const count = leads.filter((l) => l.status === status).length;
          const colors: Record<string, string> = {
            New: 'text-blue-600 bg-blue-50 border-blue-100',
            Contacted: 'text-amber-600 bg-amber-50 border-amber-100',
            Interested: 'text-yellow-600 bg-yellow-50 border-yellow-100',
            'Follow-Up': 'text-purple-600 bg-purple-50 border-purple-100',
            Converted: 'text-emerald-600 bg-emerald-50 border-emerald-100',
          };
          return (
            <button
              key={status}
              onClick={() => { setStatusFilter(status === statusFilter ? 'All' : status); setPage(1); }}
              className={`text-center p-3 rounded-xl border font-medium transition-all ${colors[status]} ${statusFilter === status ? 'ring-2 ring-offset-1 ring-current' : ''}`}
            >
              <div className="text-xl font-bold">{count}</div>
              <div className="text-xs mt-0.5">{status}</div>
            </button>
          );
        })}
      </div>

      <TableWrapper
        title="All Leads"
        count={filtered.length}
        onSearch={(q) => { setSearch(q); setPage(1); }}
        searchPlaceholder="Search by name, email, course..."
        onExport={() => {}}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="text-xs border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#003B7A] bg-white"
            >
              {statusOptions.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
              className="text-xs border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#003B7A] bg-white"
            >
              {sourceOptions.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        }
      >
        <DataTable columns={columns} data={paginated} emptyMessage="No leads found matching your filters" />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 text-xs rounded-lg transition-colors ${page === i + 1 ? 'bg-[#003B7A] text-white' : 'hover:bg-slate-50 border border-slate-200'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </TableWrapper>
    </div>
  );
}
