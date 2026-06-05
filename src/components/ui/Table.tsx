import React from 'react';
import { Search, Download } from 'lucide-react';

interface TableWrapperProps {
  title?: string;
  children: React.ReactNode;
  onSearch?: (q: string) => void;
  searchPlaceholder?: string;
  onExport?: () => void;
  actions?: React.ReactNode;
  count?: number;
}

export function TableWrapper({ title, children, onSearch, searchPlaceholder = 'Search...', onExport, actions, count }: TableWrapperProps) {
  return (
    <div className="card overflow-hidden">
      {(title || onSearch || actions) && (
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {title && <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>}
            {count !== undefined && (
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  onChange={(e) => onSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#003B7A] focus:border-transparent w-52"
                />
              </div>
            )}
            {onExport && (
              <button onClick={onExport} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            )}
            {actions}
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({ columns, data, emptyMessage = 'No data found' }: DataTableProps<T>) {
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-slate-50">
          {columns.map((col) => (
            <th key={col.key} className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.className || ''}`}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-slate-400">{emptyMessage}</td>
          </tr>
        ) : (
          data.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3.5 text-sm text-slate-700 ${col.className || ''}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
