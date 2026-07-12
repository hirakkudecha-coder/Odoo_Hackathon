import React from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

export default function DataTable({ 
  columns, 
  data, 
  meta, 
  onSearch, 
  onSort, 
  onPageChange, 
  sortField, 
  sortOrder,
  searchValue,
  placeholder = "Search records..." 
}) {
  return (
    <div className="space-y-4">
      {/* Table Header Filter controls */}
      <div className="flex items-center gap-3">
        <div className="relative w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
          />
        </div>
      </div>

      {/* Main Table view */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/60 shadow-glass">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 text-slate-500 font-semibold uppercase tracking-wider sticky top-0 backdrop-blur-md">
              {columns.map((col) => (
                <th 
                  key={col.accessor} 
                  className={`py-3.5 px-4 font-bold select-none ${col.sortable ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50' : ''}`}
                  onClick={() => col.sortable && onSort(col.accessor)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && sortField === col.accessor && (
                      sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/30 font-medium">
            {data.length > 0 ? (
              data.map((row, idx) => (
                <tr key={row._id || idx} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors">
                  {columns.map((col) => (
                    <td key={col.accessor} className="py-3.5 px-4">
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-slate-400">
                  No records matching requirements found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2 text-xs font-semibold text-slate-500">
          <span>
            Showing page {meta.page} of {meta.totalPages} ({meta.total} total items)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={meta.page <= 1}
              onClick={() => onPageChange(meta.page - 1)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPageChange(meta.page + 1)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
