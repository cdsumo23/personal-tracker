import * as React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  
  // Pagination
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;

  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string, order: 'asc' | 'desc') => void;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  isLoading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no items to display.',
  emptyIcon,
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  sortBy,
  sortOrder,
  onSort,
}: DataTableProps<T>) {
  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;
    const isCurrent = sortBy === column.key;
    const nextOrder = isCurrent && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(column.key, nextOrder);
  };

  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable || !onSort) return null;
    if (sortBy !== column.key) {
      return <ChevronsUpDown className="w-4 h-4 ml-1.5 opacity-40 hover:opacity-80" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1.5 text-primary-400" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1.5 text-primary-400" />
    );
  };

  return (
    <div className="w-full space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-900/40">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col)}
                  className={cn(
                    'py-4 px-6 select-none',
                    col.sortable && onSort ? 'cursor-pointer hover:text-slate-200 transition-colors' : '',
                    col.className
                  )}
                >
                  <div className="flex items-center">
                    {col.header}
                    {renderSortIcon(col)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {isLoading ? (
              Array.from({ length: limit || 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/10">
                  {columns.map((col) => (
                    <td key={col.key} className="py-4 px-6">
                      <Skeleton className="h-5 w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    icon={emptyIcon}
                  />
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="hover:bg-slate-800/20 transition-colors text-sm text-slate-300"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('py-4 px-6', col.className)}>
                      {col.render ? col.render(item, index) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {!isLoading && onPageChange && page && totalPages && totalPages > 1 && (
        <div className="flex items-center justify-between py-2 px-1 text-slate-400 text-sm">
          <div>
            Showing <span className="font-semibold text-slate-200">{(page - 1) * (limit || 10) + 1}</span> to{' '}
            <span className="font-semibold text-slate-200">
              {Math.min(page * (limit || 10), total || 0)}
            </span>{' '}
            of <span className="font-semibold text-slate-200">{total}</span> entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-300">
              Page <span className="font-semibold text-slate-100">{page}</span> of{' '}
              <span className="font-semibold text-slate-100">{totalPages}</span>
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
