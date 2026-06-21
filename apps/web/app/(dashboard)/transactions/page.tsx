'use client';

import * as React from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { useCurrency } from '@/hooks/useCurrency';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api';
import {
 Plus, Search, Filter, ArrowUpRight, ArrowDownRight,
 ArrowLeftRight, Trash2, Pencil, Copy, Calendar,
 ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { formatDate, formatRelativeDate, cn } from '@/lib/utils';
import type { Transaction, TransactionType } from '@/types';

const transactionSchema = z.object({
 description: z.string().min(2, 'Description is required'),
 amount: z.coerce.number().positive('Amount must be positive'),
 type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER'] as const),
 accountId: z.string().min(1, 'Account is required'),
 categoryId: z.string().optional(),
 date: z.string().min(1, 'Date is required'),
 notes: z.string().optional(),
 tags: z.string().optional(),
 isRecurring: z.boolean().optional().default(false),
 recurringInterval: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

const TYPE_STYLES: Record<TransactionType, { label: string; color: string; icon: React.ReactNode; badge: string }> = {
 INCOME: { label: 'Income', color: 'text-emerald-400', icon: <ArrowUpRight className="w-3.5 h-3.5" />, badge: 'success' },
 EXPENSE: { label: 'Expense', color: 'text-rose-400', icon: <ArrowDownRight className="w-3.5 h-3.5" />, badge: 'danger' },
 TRANSFER: { label: 'Transfer', color: 'text-blue-400', icon: <ArrowLeftRight className="w-3.5 h-3.5" />, badge: 'info' },
};

function TransactionRow({
 tx, format, onEdit, onDelete, onDuplicate,
}: {
 tx: Transaction;
 format: (n: number) => string;
 onEdit: (t: Transaction) => void;
 onDelete: (id: string, desc: string) => void;
 onDuplicate: (id: string) => void;
}) {
 const { color, icon, badge } = TYPE_STYLES[tx.type] || TYPE_STYLES.EXPENSE;

 return (
 <div className="flex items-center gap-4 py-3.5 border-b border-slate-200 dark:border-slate-800/50 last:border-0 hover:bg-slate-800/20 px-2 rounded-xl transition-colors group">
 <div className={cn('p-2 rounded-xl flex-shrink-0 bg-slate-800/60', color)}>{icon}</div>

 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{tx.description}</p>
 <div className="flex items-center gap-2 flex-wrap mt-0.5">
 <span className="text-[10px] text-slate-500 font-medium">{formatDate(tx.date)}</span>
 {tx.category && (
 <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{tx.category.name}</span>
 )}
 {tx.account && (
 <span className="text-[10px] text-slate-500">{tx.account.name}</span>
 )}
 {tx.isRecurring && (
 <span className="text-[10px] text-primary-400 font-bold">↻ Recurring</span>
 )}
 {tx.tags && tx.tags.length > 0 && tx.tags.map((tag) => (
 <span key={tag} className="text-[10px] bg-slate-800/80 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full">{tag}</span>
 ))}
 </div>
 </div>

 <div className="text-right flex-shrink-0 mr-2">
 <p className={cn('text-sm font-extrabold tracking-tight', color)}>
 {tx.type === 'INCOME' ? '+' : tx.type === 'TRANSFER' ? '↔' : '-'}{format(tx.amount)}
 </p>
 </div>

 {/* Row Actions - shown on hover */}
 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
 <button
 onClick={() => onDuplicate(tx.id)}
 className="p-1.5 rounded-lg text-slate-500 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-800/60 transition-colors"
 title="Duplicate"
 >
 <Copy className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={() => onEdit(tx)}
 className="p-1.5 rounded-lg text-slate-500 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-800/60 transition-colors"
 title="Edit"
 >
 <Pencil className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={() => onDelete(tx.id, tx.description)}
 className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
 title="Delete"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 );
}

export default function TransactionsPage() {
 const { format } = useCurrency();
 const { accounts } = useAccounts();

 // Filters state
 const [page, setPage] = React.useState(1);
 const [search, setSearch] = React.useState('');
 const [debouncedSearch, setDebouncedSearch] = React.useState('');
 const [typeFilter, setTypeFilter] = React.useState<string>('');
 const [showFilters, setShowFilters] = React.useState(false);
 const [accountFilter, setAccountFilter] = React.useState('');
 const [startDate, setStartDate] = React.useState('');
 const [endDate, setEndDate] = React.useState('');

 // Debounce search
 React.useEffect(() => {
 const t = setTimeout(() => setDebouncedSearch(search), 400);
 return () => clearTimeout(t);
 }, [search]);

 const filters = {
 page,
 limit: 20,
 search: debouncedSearch || undefined,
 type: typeFilter as any || undefined,
 accountId: accountFilter || undefined,
 startDate: startDate || undefined,
 endDate: endDate || undefined,
 sortBy: 'date',
 sortOrder: 'desc' as const,
 };

 const {
 transactions, pagination, isLoading,
 createTransaction, isCreating,
 updateTransaction, isUpdating,
 deleteTransaction, isDeleting,
 duplicateTransaction,
 } = useTransactions(filters);

 // Categories
 const { data: categoriesData } = useQuery({
 queryKey: ['categories'],
 queryFn: async () => {
 const r = await categoriesApi.getAll();
 return r.data.data as any[];
 },
 });

 // Modal state
 const [isModalOpen, setIsModalOpen] = React.useState(false);
 const [editingTx, setEditingTx] = React.useState<Transaction | null>(null);
 const [deleteConfirm, setDeleteConfirm] = React.useState<{ id: string; desc: string } | null>(null);

 const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TransactionFormData>({
 resolver: zodResolver(transactionSchema),
 defaultValues: {
 type: 'EXPENSE',
 date: new Date().toISOString().split('T')[0],
 isRecurring: false,
 },
 });

 const openCreate = () => {
 reset({ type: 'EXPENSE', date: new Date().toISOString().split('T')[0], isRecurring: false });
 setEditingTx(null);
 setIsModalOpen(true);
 };

 const openEdit = (tx: Transaction) => {
 setEditingTx(tx);
 reset({
 description: tx.description,
 amount: tx.amount,
 type: tx.type,
 accountId: tx.accountId,
 categoryId: tx.categoryId,
 date: tx.date.split('T')[0],
 notes: tx.notes,
 tags: tx.tags?.join(', '),
 isRecurring: tx.isRecurring,
 recurringInterval: tx.recurringInterval,
 });
 setIsModalOpen(true);
 };

 const onSubmit = async (data: TransactionFormData) => {
 const payload = {
 ...data,
 tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
 categoryId: data.categoryId || null,
 recurringInterval: data.recurringInterval || null,
 notes: data.notes || null,
 };
 if (editingTx) {
 await updateTransaction({ id: editingTx.id, data: payload });
 } else {
 await createTransaction(payload);
 }
 setIsModalOpen(false);
 reset();
 };

 const clearFilters = () => {
 setTypeFilter('');
 setAccountFilter('');
 setStartDate('');
 setEndDate('');
 setSearch('');
 setPage(1);
 };

 const hasActiveFilters = !!(typeFilter || accountFilter || startDate || endDate || debouncedSearch);

 return (
 <div className="space-y-6">
 <PageHeader
 title="Transactions"
 subtitle={`${pagination.total} transaction${pagination.total !== 1 ? 's' : ''} total`}
 action={
 <Button onClick={openCreate} size="sm" className="flex items-center gap-2">
 <Plus className="w-4 h-4" />
 Add Transaction
 </Button>
 }
 />

 {/* Search + Filter Bar */}
 <Card className="flex flex-col sm:flex-row gap-4">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
 <input
 type="text"
 placeholder="Search transactions..."
 value={search}
 onChange={(e) => { setSearch(e.target.value); setPage(1); }}
 className="w-full pl-9 pr-3 py-2.5 bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
 />
 {search && (
 <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600 dark:text-slate-300">
 <X className="w-3.5 h-3.5" />
 </button>
 )}
 </div>

 <div className="flex gap-2">
 {(['', 'INCOME', 'EXPENSE', 'TRANSFER'] as const).map((t) => (
 <button
 key={t}
 onClick={() => { setTypeFilter(t); setPage(1); }}
 className={cn(
 'px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200',
 typeFilter === t
 ? 'bg-primary-600 text-white'
 : 'bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-800'
 )}
 >
 {t === '' ? 'All' : t === 'INCOME' ? 'Income' : t === 'EXPENSE' ? 'Expense' : 'Transfer'}
 </button>
 ))}
 </div>

 <button
 onClick={() => setShowFilters(!showFilters)}
 className={cn(
 'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all',
 showFilters || hasActiveFilters
 ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
 : 'bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-800'
 )}
 >
 <Filter className="w-3.5 h-3.5" />
 Filters
 {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />}
 </button>
 </Card>

 {/* Advanced Filters Panel */}
 {showFilters && (
 <Card className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Account</label>
 <select
 value={accountFilter}
 onChange={(e) => { setAccountFilter(e.target.value); setPage(1); }}
 className="w-full bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
 >
 <option value="">All Accounts</option>
 {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
 </select>
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Start Date</label>
 <input
 type="date"
 value={startDate}
 onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
 className="w-full bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">End Date</label>
 <input
 type="date"
 value={endDate}
 onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
 className="w-full bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
 />
 </div>
 <div className="flex items-end">
 {hasActiveFilters && (
 <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 transition-colors">
 <X className="w-3.5 h-3.5" /> Clear Filters
 </button>
 )}
 </div>
 </Card>
 )}

 {/* Transactions List */}
 <Card>
 {isLoading ? (
 <div className="space-y-1">
 {Array.from({ length: 8 }).map((_, i) => (
 <div key={i} className="flex items-center gap-4 py-4">
 <Skeleton className="w-8 h-8 rounded-xl" />
 <div className="flex-1 space-y-2">
 <Skeleton className="h-3 w-1/2" />
 <Skeleton className="h-2 w-1/3" />
 </div>
 <Skeleton className="h-4 w-24" />
 </div>
 ))}
 </div>
 ) : transactions.length === 0 ? (
 <EmptyState
 icon={<Calendar className="w-6 h-6" />}
 title="No transactions found"
 description={hasActiveFilters ? 'Try adjusting your search filters.' : 'Record your first transaction to start tracking.'}
 actionLabel={hasActiveFilters ? 'Clear Filters' : 'Add Transaction'}
 onAction={hasActiveFilters ? clearFilters : openCreate}
 />
 ) : (
 <div>
 {transactions.map((tx: Transaction) => (
 <TransactionRow
 key={tx.id}
 tx={tx}
 format={format}
 onEdit={openEdit}
 onDelete={(id, desc) => setDeleteConfirm({ id, desc })}
 onDuplicate={duplicateTransaction}
 />
 ))}
 </div>
 )}

 {/* Pagination */}
 {pagination.totalPages > 1 && (
 <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/50">
 <p className="text-xs text-slate-500">
 Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, pagination.total)} of {pagination.total}
 </p>
 <div className="flex items-center gap-2">
 <button
 disabled={page === 1}
 onClick={() => setPage(page - 1)}
 className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
 >
 <ChevronLeft className="w-4 h-4" />
 </button>
 <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
 {page} / {pagination.totalPages}
 </span>
 <button
 disabled={page === pagination.totalPages}
 onClick={() => setPage(page + 1)}
 className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
 >
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </div>
 )}
 </Card>

 {/* Transaction Form Modal */}
 <Modal
 isOpen={isModalOpen}
 onClose={() => { setIsModalOpen(false); reset(); }}
 title={editingTx ? 'Edit Transaction' : 'Add Transaction'}
 >
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
 {/* Type Selector */}
 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Type</label>
 <div className="grid grid-cols-3 gap-2">
 {(['INCOME', 'EXPENSE', 'TRANSFER'] as const).map((t) => (
 <button
 key={t}
 type="button"
 onClick={() => setValue('type', t)}
 className={cn(
 'py-2 rounded-xl border text-xs font-bold transition-all duration-200',
 watch('type') === t
 ? t === 'INCOME'
 ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
 : t === 'EXPENSE'
 ? 'border-rose-500 bg-rose-500/10 text-rose-400'
 : 'border-blue-500 bg-blue-500/10 text-blue-400'
 : 'border-slate-200 dark:border-slate-800 bg-slate-800/30 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:border-slate-700'
 )}
 >
 {t === 'INCOME' ? '↑ Income' : t === 'EXPENSE' ? '↓ Expense' : '↔ Transfer'}
 </button>
 ))}
 </div>
 </div>

 <Input
 label="Description"
 placeholder="e.g. Coffee at Starbucks"
 {...register('description')}
 error={errors.description?.message}
 />

 <div className="grid grid-cols-2 gap-4">
 <Input
 label="Amount"
 type="number"
 step="0.01"
 min="0"
 placeholder="0.00"
 {...register('amount')}
 error={errors.amount?.message}
 />
 <Input
 label="Date"
 type="date"
 {...register('date')}
 error={errors.date?.message}
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Account</label>
 <select
 {...register('accountId')}
 className="w-full bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
 >
 <option value="">Select account</option>
 {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
 </select>
 {errors.accountId && <p className="text-xs text-red-400 mt-1">{errors.accountId.message}</p>}
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
 <select
 {...register('categoryId')}
 className="w-full bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
 >
 <option value="">Select category</option>
 {(categoriesData || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
 </select>
 </div>
 </div>

 <Input
 label="Notes (optional)"
 placeholder="Additional details..."
 {...register('notes')}
 />

 <Input
 label="Tags (comma-separated)"
 placeholder="e.g. food, dining, date-night"
 {...register('tags')}
 />

 <div className="flex items-center gap-2">
 <input type="checkbox" id="isRecurring" {...register('isRecurring')} className="w-4 h-4 accent-indigo-500" />
 <label htmlFor="isRecurring" className="text-xs font-semibold text-slate-600 dark:text-slate-300">Recurring transaction</label>
 </div>

 {watch('isRecurring') && (
 <div>
 <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Interval</label>
 <select {...register('recurringInterval')} className="w-full bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500">
 <option value="">Select interval</option>
 <option value="DAILY">Daily</option>
 <option value="WEEKLY">Weekly</option>
 <option value="MONTHLY">Monthly</option>
 <option value="QUARTERLY">Quarterly</option>
 <option value="YEARLY">Yearly</option>
 </select>
 </div>
 )}

 <div className="flex gap-3 pt-2">
 <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
 <Button type="submit" className="flex-1" disabled={isCreating || isUpdating}>
 {isCreating || isUpdating ? 'Saving…' : editingTx ? 'Save Changes' : 'Add Transaction'}
 </Button>
 </div>
 </form>
 </Modal>

 {/* Delete Confirm */}
 <ConfirmDialog
 isOpen={!!deleteConfirm}
 onClose={() => setDeleteConfirm(null)}
 onConfirm={async () => {
 if (deleteConfirm) { await deleteTransaction(deleteConfirm.id); setDeleteConfirm(null); }
 }}
 title="Delete Transaction"
 message={`Delete"${deleteConfirm?.desc}"? This action cannot be undone.`}
 confirmLabel="Delete"
 isDestructive={true}
 />
 </div>
 );
}
