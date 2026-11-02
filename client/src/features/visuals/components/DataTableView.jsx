'use client';

/**
 * DataTableView — sortable, searchable, paginated table.
 * Built with @tanstack/react-table v8.
 * Supports cell types: string, number, currency_inr, date, badge.
 * "Download CSV" uses browser Blob API (no extra dep needed).
 */
import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatValue } from '@/lib/visuals/formatters';
import { getBadgeClasses } from '@/lib/visuals/colors';

function CellBadge({ value }) {
  const { bg, text, border } = getBadgeClasses(String(value));
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black border ${bg} ${text} ${border}`}>
      {value}
    </span>
  );
}

function renderCell(value, dataType) {
  if (value === null || value === undefined) return '—';
  switch (dataType) {
    case 'currency_inr':
      return formatValue(value, 'currency_inr');
    case 'number':
      return formatValue(value, 'number');
    case 'percent':
      return formatValue(value, 'percent');
    case 'date':
      try {
        return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch {
        return String(value);
      }
    case 'badge':
      return <CellBadge value={value} />;
    default:
      return String(value);
  }
}

function downloadCsv(columns, rows, title) {
  const headers = columns.map((c) => c.label).join(',');
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const v = row[c.key];
          return `"${String(v ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    )
    .join('\n');
  const csv = `${headers}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title || 'data'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DataTableView({ spec }) {
  const { title, columns: colDefs, rows, pageSize: initialPageSize = 10 } = spec;

  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo(
    () =>
      colDefs.map((col) => ({
        id: col.key,
        accessorKey: col.key,
        header: col.label,
        enableSorting: col.sortable !== false,
        cell: ({ getValue }) => renderCell(getValue(), col.dataType),
      })),
    [colDefs]
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: initialPageSize } },
  });

  const SortIcon = ({ col }) => {
    if (!col.getCanSort()) return null;
    const sorted = col.getIsSorted();
    if (sorted === 'asc') return <ChevronUp className="h-3 w-3" />;
    if (sorted === 'desc') return <ChevronDown className="h-3 w-3" />;
    return <ChevronsUpDown className="h-3 w-3 text-slate-300" />;
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        {title && (
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 flex-1">{title}</p>
        )}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search…"
              className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-slate-400"
            />
          </div>
          {/* Download CSV */}
          <button
            onClick={() => downloadCsv(colDefs, rows, title)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-sm">
        <table className="w-full text-xs border-collapse">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-slate-50 border-b border-slate-100">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={`px-3 py-2.5 text-left font-black uppercase tracking-widest text-slate-500 whitespace-nowrap select-none ${
                      header.column.getCanSort() ? 'cursor-pointer hover:text-slate-800' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <SortIcon col={header.column} />
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={colDefs.length} className="text-center py-8 text-slate-400 font-bold">
                  No data found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={`border-b border-slate-50 transition-colors ${
                    i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  } hover:bg-blue-50/40`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 text-slate-700 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-bold">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} &nbsp;·&nbsp;{' '}
            {table.getFilteredRowModel().rows.length} rows
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

