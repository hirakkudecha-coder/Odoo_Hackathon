import React, { useState, useMemo } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import { Fuel, Search, Plus, Filter, DollarSign, Receipt, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const FuelExpenses = () => {
  const [data, setData] = useState([
    { id: '1', date: 'Today, 08:30 AM', vehicle: 'NY-1029', driver: 'John Doe', type: 'Fuel', quantity: '120 L', cost: '$180', receipt: true },
    { id: '2', date: 'Yesterday, 14:15 PM', vehicle: 'CA-4432', driver: 'Sarah Smith', type: 'Tolls', quantity: '-', cost: '$25', receipt: true },
    { id: '3', date: 'Oct 20, 2023', vehicle: 'TX-9981', driver: 'Michael Johnson', type: 'Fuel', quantity: '80 L', cost: '$120', receipt: false },
    { id: '4', date: 'Oct 19, 2023', vehicle: 'FL-2210', driver: 'Jane Adams', type: 'Maintenance', quantity: '-', cost: '$450', receipt: true },
  ]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  
  const columnHelper = createColumnHelper();

  const columns = useMemo(() => [
    columnHelper.accessor('date', {
      header: 'Date & Time',
      cell: info => <span className="text-slate-600 font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor('type', {
      header: 'Expense Type',
      cell: info => {
        const type = info.getValue();
        let colorClass = 'bg-slate-100 text-slate-700';
        if (type === 'Fuel') colorClass = 'bg-blue-100 text-blue-700';
        if (type === 'Tolls') colorClass = 'bg-amber-100 text-amber-700';
        if (type === 'Maintenance') colorClass = 'bg-emerald-100 text-emerald-700';
        
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {type}
          </span>
        );
      },
    }),
    columnHelper.accessor('vehicle', {
      header: 'Vehicle',
      cell: info => <span className="text-slate-900 font-mono text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor('driver', {
      header: 'Driver',
      cell: info => <span className="text-slate-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor('quantity', {
      header: 'Quantity (Fuel)',
      cell: info => <span className="text-slate-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor('cost', {
      header: 'Total Cost',
      cell: info => <span className="text-slate-900 font-semibold">{info.getValue()}</span>,
    }),
    columnHelper.accessor('receipt', {
      header: 'Receipt',
      cell: info => (
        info.getValue() ? (
          <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium transition-colors">
            <Receipt className="h-4 w-4" /> View
          </button>
        ) : (
          <span className="text-slate-400 text-sm">No receipt</span>
        )
      ),
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
          <h1 className="text-2xl font-bold text-slate-900">Fuel & Expenses</h1>
          <p className="text-slate-500 mt-1">Track fuel logs, toll charges, and miscellaneous fleet expenses.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm">
            <DollarSign className="h-5 w-5 text-slate-500" />
            Add Expense
          </button>
          <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm shadow-blue-600/20 transition-all active:scale-95">
            <Fuel className="h-5 w-5" />
            Log Fuel
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Fuel Cost (This Month)</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">$4,250</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Fuel className="h-6 w-6 text-blue-600" />
            </div>
         </div>
         <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Other Expenses (This Month)</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">$1,840</h3>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
         </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses..."
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

export default FuelExpenses;
