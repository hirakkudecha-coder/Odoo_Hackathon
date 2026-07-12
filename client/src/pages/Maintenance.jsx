import React, { useState, useMemo } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import { Wrench, Search, Plus, CheckCircle2, Clock, Calendar, Filter, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const Maintenance = () => {
  const [data, setData] = useState([
    { id: '1', vehicle: 'TX-9981', type: 'Repair', garage: 'Joe\'s Auto', cost: '$1,200', dateStarted: 'Oct 12, 2023', status: 'In Progress' },
    { id: '2', vehicle: 'NY-1029', type: 'Oil Change', garage: 'QuickLube', cost: '$85', dateStarted: 'Oct 10, 2023', status: 'Completed' },
    { id: '3', vehicle: 'CA-4432', type: 'Inspection', garage: 'City Garage', cost: '$150', dateStarted: 'Nov 05, 2023', status: 'Scheduled' },
    { id: '4', vehicle: 'FL-2210', type: 'Tire Replacement', garage: 'Firestone', cost: '$800', dateStarted: 'Oct 01, 2023', status: 'Completed' },
  ]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  
  const columnHelper = createColumnHelper();

  const columns = useMemo(() => [
    columnHelper.accessor('vehicle', {
      header: 'Vehicle',
      cell: info => <span className="font-semibold text-slate-900 font-mono text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor('type', {
      header: 'Service Type',
      cell: info => <span className="font-medium text-slate-800">{info.getValue()}</span>,
    }),
    columnHelper.accessor('garage', {
      header: 'Garage',
      cell: info => <span className="text-slate-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor('cost', {
      header: 'Cost',
      cell: info => <span className="text-slate-600 font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor('dateStarted', {
      header: 'Date',
      cell: info => <span className="text-slate-500">{info.getValue()}</span>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const status = info.getValue();
        let colorClass = 'bg-slate-100 text-slate-800';
        let Icon = Wrench;
        
        if (status === 'Scheduled') { colorClass = 'bg-slate-100 text-slate-600'; Icon = Calendar; }
        if (status === 'In Progress') { colorClass = 'bg-amber-100 text-amber-700'; Icon = Clock; }
        if (status === 'Completed') { colorClass = 'bg-emerald-100 text-emerald-700'; Icon = CheckCircle2; }
        
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            <Icon className="h-3 w-3" />
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
           {props.row.original.status !== 'Completed' && (
             <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Mark Completed">
              <CheckCircle2 className="h-4 w-4" />
            </button>
           )}
          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
            <ExternalLink className="h-4 w-4" />
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
          <h1 className="text-2xl font-bold text-slate-900">Maintenance Records</h1>
          <p className="text-slate-500 mt-1">Log services, track repairs, and monitor maintenance costs.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm shadow-blue-600/20 transition-all active:scale-95">
          <Plus className="h-5 w-5" />
          Log Maintenance
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search records..."
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
            Showing {table.getRowModel().rows.length} of {data.length} records
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

export default Maintenance;
