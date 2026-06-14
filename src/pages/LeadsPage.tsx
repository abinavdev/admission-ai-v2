import { useState, useEffect, useCallback } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { Lead } from '../types';
import { useLeads } from '../hooks/useLeads';
import { useAnalytics } from '../hooks/useAnalytics';
import { useToast } from '../contexts/ToastContext';
import { TableWrapper, DataTable } from '../components/ui/Table';
import { TableRowSkeleton, Skeleton } from '../components/ui/Skeleton';

const statusOptions = ['All', 'New', 'Contacted', 'Interested', 'Follow-Up', 'Converted'];
const sourceOptions = ['All', 'Chat', 'Voice'];
const ITEMS_PER_PAGE = 8;

function normalizeStatus(s: string): string {
  return s.replace('_', '-').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
function normalizeSource(s: string): 'Chat' | 'Voice' {
  return s === 'CHAT' ? 'Chat' : 'Voice';
}

export function LeadsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [page, setPage] = useState(1);
  const { leads, loading, error, total, fetchLeads, updateLead } = useLeads();
  const { analytics, fetchAnalytics } = useAnalytics();
  const toast = useToast();

  const getActiveParams = useCallback(() => {
    const params: Record<string, string> = {
      page: String(page),
      limit: String(ITEMS_PER_PAGE),
    };
    if (statusFilter !== 'All') {
      params.status = statusFilter.toUpperCase().replace('-', '_');
    }
    if (sourceFilter !== 'All') {
      params.source = sourceFilter.toUpperCase();
    }
    if (search) {
      params.search = search;
    }
    return params;
  }, [page, statusFilter, sourceFilter, search]);

  useEffect(() => {
    fetchLeads(getActiveParams()).catch(() => {});
  }, [fetchLeads, getActiveParams]);

  useEffect(() => {
    fetchAnalytics().catch(() => {});
  }, [fetchAnalytics]);

  useEffect(() => {
    if (error) toast(error, 'error');
  }, [error]);

  const normalizedLeads: Lead[] = leads.map((l) => ({
    ...l,
    status: normalizeStatus(String(l.status)) as Lead['status'],
    source: normalizeSource(String(l.source)),
    date: (l as unknown as Record<string, unknown>).createdAt
      ? new Date(String((l as unknown as Record<string, unknown>).createdAt)).toLocaleDateString()
      : l.date ?? '',
  }));

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateLead(id, { status: newStatus.toUpperCase().replace('-', '_') as Lead['status'] });
      toast('Lead status updated', 'success');
      fetchLeads(getActiveParams()).catch(() => {});
      fetchAnalytics().catch(() => {});
    } catch {
      toast('Failed to update lead', 'error');
    }
  };

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
      render: (row: Lead) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#003B7A] bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          {statusOptions.filter((s) => s !== 'All').map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      ),
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
        {loading && normalizedLeads.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
        ) : (
          statusOptions.filter((s) => s !== 'All').map((status) => {
            const dbStatus = status.toUpperCase().replace('-', '_');
            const count = (analytics?.leadsByStatus ?? []).find((s) => s.status === dbStatus)?._count._all ?? 0;
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
          })
        )}
      </div>

      <TableWrapper
        title="All Leads"
        count={total}
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
        {loading && normalizedLeads.length === 0 ? (
          <table className="w-full">
            <tbody>{Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)}</tbody>
          </table>
        ) : (
          <DataTable columns={columns} data={normalizedLeads} emptyMessage="No leads found matching your filters" />
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
    </div>
  );
}
