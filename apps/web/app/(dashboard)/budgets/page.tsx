'use client';

import * as React from 'react';
import { useBudgets, useBudgetUsage } from '@/hooks/useBudgets';
import { useCurrency } from '@/hooks/useCurrency';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api';
import {
 Plus, Trash2, Pencil, PieChart, Calendar,
 AlertTriangle, CheckCircle2, TrendingDown, MoreVertical, X,
} from 'lucide-react';
import { cn, formatDate, calculatePercentage, getStatusColor } from '@/lib/utils';
import type { Budget } from '@/types';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'LRD', 'NGN', 'GHS'] as const;

const budgetSchema = z.object({
 name: z.string().min(2, 'Name is required'),
 period: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL'] as const),
 startDate: z.string().min(1, 'Start date is required'),
 endDate: z.string().min(1, 'End date is required'),
 categories: z.array(z.object({
 categoryId: z.string().min(1, 'Category required'),
 amount: z.coerce.number().positive('Amount must be positive'),
 currency: z.string().default('USD'),
 })).min(1, 'At least one category is required'),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

function BudgetCard({
 budget, format, onEdit, onDelete,
}: {
 budget: Budget; format: (n: number) => string;
 onEdit: (b: Budget) => void; onDelete: (id: string, name: string) => void;
}) {
 const [showMenu, setShowMenu] = React.useState(false);
 const { usage } = useBudgetUsage(budget.id);

 const statusInfo = budget.isActive
 ? usage && usage.percentage > 100
 ? { label: 'Over Budget', variant: 'danger' as const, icon: <AlertTriangle className="w-3 h-3" /> }
 : usage && usage.percentage > 80
 ? { label: 'Warning', variant: 'warning' as const, icon: <TrendingDown className="w-3 h-3" /> }
 : { label: 'Active', variant: 'success' as const, icon: <CheckCircle2 className="w-3 h-3" /> }
 : { label: 'Inactive', variant: 'default' as const, icon: null };

 const pct = usage?.percentage || 0;
 const status = getStatusColor(pct);

 return (
 <Card className="hover:border-slate-300 dark:border-slate-700/60 transition-all duration-300 relative group">
 <div className="flex items-start justify-between mb-4">
 <div>
 <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{budget.name}</h3>
 <p className="text-[11px] text-slate-500 mt-0.5">
 {budget.period} · {formatDate(budget.startDate, 'MMM d')} — {formatDate(budget.endDate, 'MMM d, yyyy')}
 </p>
 </div>
 <div className="flex items-center gap-2">
 <Badge variant={statusInfo.variant} className="flex items-center gap-1 text-[10px]">
 {statusInfo.icon}
 {statusInfo.label}
 </Badge>
 <div className="relative">
 <button
 onClick={() => setShowMenu(!showMenu)}
 className="p-1.5 rounded-lg text-slate-500 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 opacity-0 group-hover:opacity-100 transition-all"
 >
 <MoreVertical className="w-4 h-4" />
 </button>
 {showMenu && (
 <div className="absolute right-0 top-8 z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1 w-32">
 <button onClick={() => { setShowMenu(false); onEdit(budget); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
 <Pencil className="w-3.5 h-3.5" /> Edit
 </button>
 <button onClick={() => { setShowMenu(false); onDelete(budget.id, budget.name); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10">
 <Trash2 className="w-3.5 h-3.5" /> Delete
 </button>
 </div>
 )}
 </div>
 </div>
 </div>

 {usage ? (
 <>
 <div className="flex justify-between items-end mb-2">
 <div>
 <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Spent</p>
 <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{format(usage.spent)}</p>
 <p className="text-[11px] text-slate-500">of {format(usage.allocated)} budget</p>
 </div>
 <div className="text-right">
 <p className={cn('text-2xl font-black', status.text)}>{pct.toFixed(0)}%</p>
 <p className={cn('text-[10px] font-bold', status.text)}>{status.label}</p>
 </div>
 </div>
 <div className="h-2 bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden">
 <div
 className={cn('h-full rounded-full transition-all duration-700', status.fill)}
 style={{ width: `${Math.min(pct, 100)}%` }}
 />
 </div>
 {/* Category breakdown mini-list */}
 {usage.categories && usage.categories.length > 0 && (
 <div className="mt-4 space-y-2.5">
 {usage.categories.map((cat: any) => {
 const catFmt = (n: number) => new Intl.NumberFormat('en-US', {
 style: 'currency', currency: cat.currency || 'USD', maximumFractionDigits: 0
 }).format(n);
 return (
 <div key={cat.categoryId}>
 <div className="flex justify-between text-[10px] text-slate-500 mb-1">
 <span className="font-semibold text-slate-600 dark:text-slate-300">{cat.name}</span>
 <span className="flex items-center gap-1">
 {catFmt(cat.spent)} / {catFmt(cat.allocated)}
 {cat.currency && cat.currency !== 'USD' && (
 <span className="bg-slate-200 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 rounded px-1 py-0.5 text-[9px] font-bold">{cat.currency}</span>
 )}
 </span>
 </div>
 <div className="h-1.5 bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden">
 <div
 className="h-full rounded-full"
 style={{ width: `${Math.min(cat.percentage, 100)}%`, backgroundColor: cat.color }}
 />
 </div>
 </div>
 );
 })}
 </div>
 )}
 </>
 ) : (
 <div className="space-y-2">
 <Skeleton className="h-4 w-full" />
 <Skeleton className="h-2 w-full" />
 </div>
 )}
 </Card>
 );
}

export default function BudgetsPage() {
 const { format } = useCurrency();
 const {
 budgets, isLoading,
 createBudget, isCreating,
 updateBudget, isUpdating,
 deleteBudget, isDeleting,
 } = useBudgets();

 const { data: categoriesData } = useQuery({
 queryKey: ['categories'],
 queryFn: async () => {
 const r = await categoriesApi.getAll();
 return r.data.data as any[];
 },
 });

 const [isModalOpen, setIsModalOpen] = React.useState(false);
 const [editingBudget, setEditingBudget] = React.useState<Budget | null>(null);
 const [deleteConfirm, setDeleteConfirm] = React.useState<{ id: string; name: string } | null>(null);

 const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<BudgetFormData>({
 resolver: zodResolver(budgetSchema),
 defaultValues: {
 period: 'MONTHLY',
 categories: [{ categoryId: '', amount: 0 }],
 },
 });

 const { fields, append, remove } = useFieldArray({ control, name: 'categories' });

 const openCreate = () => {
 reset({
 period: 'MONTHLY',
 startDate: new Date().toISOString().split('T')[0],
 endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
 categories: [{ categoryId: '', amount: 0, currency: 'USD' }],
 });
 setEditingBudget(null);
 setIsModalOpen(true);
 };

 const openEdit = (budget: Budget) => {
 setEditingBudget(budget);
 reset({
 name: budget.name,
 period: budget.period,
 startDate: budget.startDate.split('T')[0],
 endDate: budget.endDate.split('T')[0],
 categories: budget.budgetCategories?.map((bc) => ({
 categoryId: bc.categoryId,
 amount: bc.allocatedAmount,
 currency: (bc as any).currency || 'USD',
 })) || [{ categoryId: '', amount: 0, currency: 'USD' }],
 });
 setIsModalOpen(true);
 };

 const onSubmit = async (data: BudgetFormData) => {
 if (editingBudget) {
 await updateBudget({ id: editingBudget.id, data });
 } else {
 await createBudget(data);
 }
 setIsModalOpen(false);
 reset();
 };

 const totalAllocated = budgets.filter((b) => b.isActive).reduce((sum, b) => sum + b.totalAmount, 0);

 return (
 <div className="space-y-6">
 <PageHeader
 title="Budgets"
 subtitle={`${budgets.length} budget${budgets.length !== 1 ? 's' : ''} · ${budgets.filter((b) => b.isActive).length} active`}
 action={
 <Button onClick={openCreate} size="sm" className="flex items-center gap-2">
 <Plus className="w-4 h-4" /> Create Budget
 </Button>
 }
 />

 {budgets.filter((b) => b.isActive).length > 0 && (
 <Card className="flex items-center gap-4 py-4">
 <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex-shrink-0">
 <PieChart className="w-5 h-5" />
 </div>
 <div>
 <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Budgeted This Period</p>
 <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{format(totalAllocated)}</p>
 </div>
 </Card>
 )}

 {isLoading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {[1, 2, 3].map((i) => (
 <Card key={i} className="space-y-4">
 <div className="space-y-2">
 <Skeleton className="h-4 w-3/4" />
 <Skeleton className="h-3 w-1/2" />
 </div>
 <Skeleton className="h-6 w-full" />
 <Skeleton className="h-2 w-full" />
 </Card>
 ))}
 </div>
 ) : budgets.length === 0 ? (
 <EmptyState
 icon={<Calendar className="w-6 h-6" />}
 title="No budgets created"
 description="Set up monthly or periodic spending budgets to keep your finances in check."
 actionLabel="Create Budget"
 onAction={openCreate}
 />
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {budgets.map((b: Budget) => (
 <BudgetCard
 key={b.id} budget={b} format={format}
 onEdit={openEdit}
 onDelete={(id, name) => setDeleteConfirm({ id, name })}
 />
 ))}
 </div>
 )}

 {/* Budget Form Modal */}
 <Modal
 isOpen={isModalOpen}
 onClose={() => { setIsModalOpen(false); reset(); }}
 title={editingBudget ? 'Edit Budget' : 'Create Budget'}
 >
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
 <Input label="Budget Name" placeholder="e.g. Monthly Household Budget" {...register('name')} error={errors.name?.message} />

 <div className="grid grid-cols-3 gap-2">
 {(['MONTHLY', 'QUARTERLY', 'ANNUAL'] as const).map((p) => (
 <button key={p} type="button" onClick={() => { reset({ ...watch(), period: p }); }}
 className={cn('py-2 rounded-xl border text-xs font-bold transition-all',
 watch('period') === p
 ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400'
 : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700')}>
 {p.charAt(0) + p.slice(1).toLowerCase()}
 </button>
 ))}
 </div>

 <div className="grid grid-cols-2 gap-4">
 <Input label="Start Date" type="date" {...register('startDate')} error={errors.startDate?.message} />
 <Input label="End Date" type="date" {...register('endDate')} error={errors.endDate?.message} />
 </div>

 {/* Category Allocations */}
 <div>
 <div className="flex items-center justify-between mb-3">
 <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category Allocations</label>
 <button type="button" onClick={() => append({ categoryId: '', amount: 0, currency: 'USD' })}
 className="flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
 <Plus className="w-3.5 h-3.5" /> Add Category
 </button>
 </div>
 <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
 {fields.map((field, index) => (
 <div key={field.id} className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-300 dark:border-slate-700/40 rounded-xl">
 {/* Category select — full width */}
 <select
 {...register(`categories.${index}.categoryId`)}
 className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
 >
 <option value="">Select category</option>
 {(categoriesData || []).filter((c: any) => c.type === 'EXPENSE').map((c: any) => (
 <option key={c.id} value={c.id}>{c.name}</option>
 ))}
 </select>
 {/* Amount + Currency + Remove on second row */}
 <div className="flex items-center gap-2">
 <Input
 type="number" placeholder="Amount" step="0.01" min="0"
 className="flex-1"
 {...register(`categories.${index}.amount`)}
 />
 <select
 {...register(`categories.${index}.currency`)}
 className="w-20 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl px-2 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
 >
 {CURRENCIES.map((cur) => (
 <option key={cur} value={cur}>{cur}</option>
 ))}
 </select>
 {fields.length > 1 && (
 <button type="button" onClick={() => remove(index)}
 className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
 <X className="w-4 h-4" />
 </button>
 )}
 </div>
 </div>
 ))}
 </div>
 {errors.categories && (
 <p className="text-xs text-red-400 mt-1">{(errors.categories as any)?.message || 'Please fill all category fields'}</p>
 )}
 </div>

 <div className="flex gap-3 pt-2">
 <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
 <Button type="submit" className="flex-1" disabled={isCreating || isUpdating}>
 {isCreating || isUpdating ? 'Saving…' : editingBudget ? 'Save Changes' : 'Create Budget'}
 </Button>
 </div>
 </form>
 </Modal>

 <ConfirmDialog
 isOpen={!!deleteConfirm}
 onClose={() => setDeleteConfirm(null)}
 onConfirm={async () => { if (deleteConfirm) { await deleteBudget(deleteConfirm.id); setDeleteConfirm(null); } }}
 title="Delete Budget"
 message={`Delete budget"${deleteConfirm?.name}"?`}
 confirmLabel="Delete"
 isDestructive={true}
 />
 </div>
 );
}
