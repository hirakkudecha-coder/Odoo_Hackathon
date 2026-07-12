import React, { useState, useMemo } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import { Users, Search, Plus, Edit2, Trash2, Filter, ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const Drivers = () => {
  const [data, setData] = useState([
    { id: '1', firstName: 'John', lastName: 'Doe', licenseNumber: 'DL-847392', licenseCategory: 'Class A', safetyScore: 98, status: 'Available' },
    { id: '2', firstName: 'Sarah', lastName: 'Smith', licenseNumber: 'DL-938201', licenseCategory: 'Class B', safetyScore: 85, status: 'On Trip' },
    { id: '3', firstName: 'Michael', lastName: 'Johnson', licenseNumber: 'DL-102934', licenseCategory: 'Class A', safetyScore: 92, status: 'Available' },
    { id: '4', firstName: 'Emily', lastName: 'Brown', licenseNumber: 'DL-482019', licenseCategory: 'Class C', safetyScore: 65, status: 'Suspended' },
  ]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  
  const columnHelper = createColumnHelper();

  const columns = useMemo(() => [
    columnHelper.accessor(row => `${row.firstName} ${row.lastName}`, {
      id: 'name',
      header: 'Driver Name',
      cell: info => <span className="font-semibold text-slate-900">{info.getValue()}</span>,
    }),
    columnHelper.accessor('licenseNumber', {
      header: 'License No.',
      cell: info => <span className="text-slate-600 font-mono text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor('licenseCategory', {
      header: 'Class',
      cell: info => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('safetyScore', {
      header: 'Safety Score',
      cell: info => {
        const score = info.getValue();
        let color = 'text-emerald-600';
        let Icon = ShieldCheck;
        
        if (score < 80) { color = 'text-amber-500'; }
        if (score < 70) { color = 'text-red-500'; Icon = ShieldAlert; }
        
        return (
          <div className={`flex items-center gap-1.5 font-medium ${color}`}>
            <Icon className="h-4 w-4" />
            <span>{score}/100</span>
          </div>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const status = info.getValue();
        let colorClass = 'bg-slate-100 text-slate-800';
        if (status === 'Available') colorClass = 'bg-emerald-100 text-emerald-700';
        if (status === 'On Trip') colorClass = 'bg-blue-100 text-blue-700';
        if (status === 'Suspended') colorClass = 'bg-red-100 text-red-700';
        if (status === 'Inactive') colorClass = 'bg-slate-100 text-slate-500';
        
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {status}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: props => (
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Edit2 className="h-4 w-4" />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    })
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Driver Management</h1>
          <p className="text-slate-500 mt-1">Manage driver profiles, licenses, and safety scores.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm shadow-blue-600/20 transition-all active:scale-95">
          <Plus className="h-5 w-5" />
          Add Driver
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search drivers..."
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
          <button className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm w-full sm:w-auto justify-center">
            <Filter className="h-4 w-4 text-slate-500" />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-slate-200 bg-slate-50">
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      className="px-6 py-4 text-sm font-semibold text-slate-600 tracking-wide uppercase cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <span className="text-blue-600">↑</span>,
                          desc: <span className="text-blue-600">↓</span>,
                        }[header.column.getIsSorted()] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 text-sm text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
          <span className="text-sm text-slate-500">
            Showing {table.getRowModel().rows.length} of {data.length} drivers
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Drivers;
