import React, { useState, useMemo } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import { Map, Search, Plus, CheckCircle2, Navigation, Ban, Filter, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const Trips = () => {
  const [data, setData] = useState([
    { id: 'TRP-9021', vehicle: 'NY-1029', driver: 'John Doe', destination: 'New York, NY', cargoWeight: 18000, status: 'Dispatched', dispatchTime: '2 hrs ago' },
    { id: 'TRP-9022', vehicle: 'CA-4432', driver: 'Sarah Smith', destination: 'Chicago, IL', cargoWeight: 2500, status: 'Completed', dispatchTime: 'Yesterday' },
    { id: 'TRP-9023', vehicle: 'TX-9981', driver: 'Michael Johnson', destination: 'Miami, FL', cargoWeight: 20000, status: 'Pending', dispatchTime: '-' },
    { id: 'TRP-9024', vehicle: 'FL-2210', driver: 'Jane Adams', destination: 'Dallas, TX', cargoWeight: 1500, status: 'Cancelled', dispatchTime: '-' },
  ]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  
  const columnHelper = createColumnHelper();

  const columns = useMemo(() => [
    columnHelper.accessor('id', {
      header: 'Trip ID',
      cell: info => <span className="font-semibold text-slate-900 font-mono text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor('destination', {
      header: 'Destination',
      cell: info => <span className="font-medium text-slate-800">{info.getValue()}</span>,
    }),
    columnHelper.accessor('vehicle', {
      header: 'Vehicle',
      cell: info => <span className="text-slate-600 font-mono text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor('driver', {
      header: 'Driver',
      cell: info => <span className="text-slate-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor('cargoWeight', {
      header: 'Cargo (kg)',
      cell: info => <span className="text-slate-600">{info.getValue().toLocaleString()}</span>,
    }),
    columnHelper.accessor('dispatchTime', {
      header: 'Dispatch Time',
      cell: info => <span className="text-slate-500">{info.getValue()}</span>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const status = info.getValue();
        let colorClass = 'bg-slate-100 text-slate-800';
        let Icon = Navigation;
        
        if (status === 'Pending') { colorClass = 'bg-amber-100 text-amber-700'; Icon = Map; }
        if (status === 'Dispatched') { colorClass = 'bg-blue-100 text-blue-700'; Icon = Navigation; }
        if (status === 'Completed') { colorClass = 'bg-emerald-100 text-emerald-700'; Icon = CheckCircle2; }
        if (status === 'Cancelled') { colorClass = 'bg-red-100 text-red-700'; Icon = Ban; }
        
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
          <h1 className="text-2xl font-bold text-slate-900">Trip Management</h1>
          <p className="text-slate-500 mt-1">Dispatch vehicles, assign drivers, and monitor active routes.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm shadow-blue-600/20 transition-all active:scale-95">
          <Plus className="h-5 w-5" />
          Create Trip
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search trips..."
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
            Showing {table.getRowModel().rows.length} of {data.length} trips
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

export default Trips;
