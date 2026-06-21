'use client';

import * as React from 'react';
import { useGoals } from '@/hooks/useGoals';
import { useAccounts } from '@/hooks/useAccounts';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { DatePicker } from '@/components/ui/DatePicker';
import { useAuthStore } from '@/store/auth.store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Target, PiggyBank, Calendar, Trash2, Award, History, Edit2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Schema for Goal CRUD
const goalSchema = z.object({
 name: z.string().min(2, 'Name must be at least 2 characters'),
 targetAmount: z.number().min(1, 'Target amount must be greater than 0'),
 currentAmount: z.number().min(0, 'Current amount must be 0 or more'),
 deadline: z.date({ required_error: 'Deadline is required' }),
 priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
 autoContribute: z.boolean().default(false),
 monthlyContribution: z.number().optional().default(0),
 color: z.string().optional().default('#6366f1'),
 icon: z.string().optional().default('target'),
 categoryId: z.string().optional().nullable().transform((val) => val === '' ? null : val ?? null),
});

// Schema for Quick Contribution
const contributionSchema = z.object({
 amount: z.number().min(1, 'Contribution must be greater than 0'),
 accountId: z.string().min(1, 'Source account is required'),
 note: z.string().optional(),
 date: z.date().default(() => new Date()),
});

export default function GoalsPage() {
 const { goals, isLoading, createGoal, updateGoal, deleteGoal, addContribution } = useGoals();
 const { accounts } = useAccounts();
 const user = useAuthStore((state) => state.user);
 const currency = user?.currency || 'USD';

 const { data: categoriesData } = useQuery({
 queryKey: ['categories'],
 queryFn: async () => {
 const r = await categoriesApi.getAll();
 return r.data.data as any[];
 },
 });

 const [isGoalModalOpen, setIsGoalModalOpen] = React.useState(false);
 const [selectedGoal, setSelectedGoal] = React.useState<any | null>(null);
 const [isContributionModalOpen, setIsContributionModalOpen] = React.useState(false);
 const [activeGoalForContribution, setActiveGoalForContribution] = React.useState<any | null>(null);
 const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
 const [activeGoalDetails, setActiveGoalDetails] = React.useState<any | null>(null);

 // Form for Goal CRUD
 const {
 register,
 handleSubmit,
 control,
 reset,
 setValue,
 formState: { errors, isSubmitting },
 } = useForm({
 resolver: zodResolver(goalSchema),
 defaultValues: {
 name: '',
 targetAmount: 0,
 currentAmount: 0,
 deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)), // 6 months default
 priority: 'MEDIUM' as const,
 autoContribute: false,
 monthlyContribution: 0,
 color: '#6366f1',
 icon: 'target',
 categoryId: '',
 },
 });

 // Form for Contribution
 const contribForm = useForm({
 resolver: zodResolver(contributionSchema),
 defaultValues: {
 amount: 0,
 accountId: '',
 note: '',
 date: new Date(),
 },
 });

 // Handle open modal for Create
 const handleCreateOpen = () => {
 setSelectedGoal(null);
 reset({
 name: '',
 targetAmount: 0,
 currentAmount: 0,
 deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)),
 priority: 'MEDIUM',
 autoContribute: false,
 monthlyContribution: 0,
 color: '#6366f1',
 icon: 'target',
 categoryId: '',
 });
 setIsGoalModalOpen(true);
 };

 // Handle open modal for Edit
 const handleEditOpen = (goal: any, e: React.MouseEvent) => {
 e.stopPropagation();
 setSelectedGoal(goal);
 reset({
 name: goal.name,
 targetAmount: Number(goal.targetAmount),
 currentAmount: Number(goal.currentAmount),
 deadline: new Date(goal.deadline),
 priority: goal.priority.toUpperCase() as any,
 autoContribute: goal.autoContribute || false,
 monthlyContribution: Number(goal.monthlyContribution || 0),
 color: goal.color || '#6366f1',
 icon: goal.icon || 'target',
 categoryId: goal.categoryId || '',
 });
 setIsGoalModalOpen(true);
 };

 // Submit Goal CRUD
 const onGoalSubmit = async (data: any) => {
 try {
 const payload = {
 ...data,
 deadline: data.deadline.toISOString(),
 };
 if (selectedGoal) {
 await updateGoal({ id: selectedGoal.id, data: payload });
 } else {
 await createGoal(payload);
 }
 setIsGoalModalOpen(false);
 } catch {
 // Handled in hooks
 }
 };

 // Handle open Contribution
 const handleContributionOpen = (goal: any, e: React.MouseEvent) => {
 e.stopPropagation();
 setActiveGoalForContribution(goal);
 contribForm.reset({
 amount: 0,
 accountId: accounts[0]?.id || '',
 note: '',
 date: new Date(),
 });
 setIsContributionModalOpen(true);
 };

 // Submit Contribution
 const onContributionSubmit = async (data: any) => {
 if (!activeGoalForContribution) return;
 try {
 await addContribution({
 id: activeGoalForContribution.id,
 data: {
 amount: data.amount,
 note: data.note || `Contributed from ${accounts.find((a) => a.id === data.accountId)?.name || 'Account'}`,
 date: data.date.toISOString(),
 },
 });
 setIsContributionModalOpen(false);
 // If details modal is open, refresh it
 if (isDetailModalOpen && activeGoalDetails?.id === activeGoalForContribution.id) {
 const updated = goals.find((g) => g.id === activeGoalForContribution.id);
 if (updated) {
 // Add contribution locally for details modal presentation
 setActiveGoalDetails({
 ...updated,
 contributions: [
 ...(updated.contributions || []),
 {
 id: Math.random().toString(),
 amount: data.amount,
 note: data.note,
 date: data.date.toISOString(),
 createdAt: new Date().toISOString(),
 },
 ],
 });
 }
 }
 } catch {
 // Handled in hooks
 }
 };

 // Handle Delete
 const handleDelete = async (id: string, e: React.MouseEvent) => {
 e.stopPropagation();
 if (confirm('Are you sure you want to delete this savings goal?')) {
 await deleteGoal(id);
 setIsDetailModalOpen(false);
 }
 };

 // Details Open
 const handleDetailsOpen = (goal: any) => {
 setActiveGoalDetails(goal);
 setIsDetailModalOpen(true);
 };

 // Priority color
 const getPriorityBadge = (priority: string) => {
 const p = priority.toUpperCase();
 if (p === 'CRITICAL' || p === 'HIGH') return <Badge variant="danger">{p}</Badge>;
 if (p === 'MEDIUM') return <Badge variant="warning">{p}</Badge>;
 return <Badge variant="success">{p}</Badge>;
 };

 return (
 <div className="space-y-6 pb-20">
 <PageHeader
 title="Savings Goals"
 description="Save up for what matters most. Track milestones and progress."
 action={
 <Button onClick={handleCreateOpen}>
 <Plus className="w-4 h-4 mr-2" /> Add Goal
 </Button>
 }
 />

 {isLoading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {[1, 2, 3].map((n) => (
 <Card key={n} className="h-64 animate-pulse bg-slate-50 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700" />
 ))}
 </div>
 ) : goals.length === 0 ? (
 <Card className="flex flex-col items-center justify-center p-12 text-center">
 <div className="p-4 rounded-full bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 mb-4">
 <PiggyBank className="w-10 h-10" />
 </div>
 <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No savings goals created yet</h3>
 <p className="text-sm text-slate-500 max-w-sm mt-1">
 Setting savings goals keeps your budget aligned. Create your first goal to get started!
 </p>
 <Button onClick={handleCreateOpen} className="mt-5">
 <Plus className="w-4 h-4 mr-2" /> Create First Goal
 </Button>
 </Card>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {goals.map((goal: any) => {
 const pct = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
 return (
 <Card
 key={goal.id}
 onClick={() => handleDetailsOpen(goal)}
 className="relative flex flex-col p-6 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700/80 bg-slate-900/60 backdrop-blur-md cursor-pointer hover:translate-y-[-2px] transition-all duration-200 group"
 >
 {/* Header */}
 <div className="flex items-start justify-between mb-4">
 <div className="space-y-1 pr-4">
 <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-400 transition-colors font-sans">
 {goal.name}
 </h3>
 {goal.category && (
 <p className="text-xs text-slate-500 font-semibold font-sans">
 Category: {goal.category.name}
 </p>
 )}
 <div className="flex items-center space-x-1.5">
 {getPriorityBadge(goal.priority)}
 {goal.isCompleted && (
 <Badge variant="success">
 <Award className="w-3 h-3 mr-0.5" /> Completed
 </Badge>
 )}
 </div>
 </div>
 <div className="w-14 h-14 shrink-0">
 <CircularProgressbar
 value={pct}
 text={`${pct}%`}
 styles={buildStyles({
 textSize: '24px',
 pathColor: goal.color || '#6366f1',
 textColor: '#e2e8f0',
 trailColor: '#1e293b',
 backgroundColor: '#0f172a',
 })}
 />
 </div>
 </div>

 {/* Progress amounts */}
 <div className="space-y-1.5 flex-1 justify-end flex flex-col">
 <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
 <span>Current Saved</span>
 <span>Target Goal</span>
 </div>
 <div className="flex justify-between items-baseline">
 <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
 {formatCurrency(goal.currentAmount, currency)}
 </span>
 <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
 {formatCurrency(goal.targetAmount, currency)}
 </span>
 </div>
 </div>

 {/* Deadline */}
 {goal.deadline && (
 <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs text-slate-500">
 <div className="flex items-center space-x-1">
 <Calendar className="w-3..5 h-3.5" />
 <span>Target: {formatDate(goal.deadline, 'MMM dd, yyyy')}</span>
 </div>
 {/* Actions */}
 <div className="flex space-x-2">
 <button
 onClick={(e) => handleEditOpen(goal, e)}
 className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 transition-colors"
 >
 <Edit2 className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={(e) => handleDelete(goal.id, e)}
 className="p-1 text-slate-500 dark:text-slate-400 hover:text-red-400 transition-colors"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 )}

 {/* Quick contribute button */}
 {!goal.isCompleted && (
 <Button
 onClick={(e) => handleContributionOpen(goal, e)}
 size="sm"
 className="mt-4 w-full"
 >
 <PiggyBank className="w-4 h-4 mr-2" /> Add Savings
 </Button>
 )}
 </Card>
 );
 })}
 </div>
 )}

 {/* CREATE & EDIT GOAL MODAL */}
 {isGoalModalOpen && (
 <Modal
 isOpen={isGoalModalOpen}
 onClose={() => setIsGoalModalOpen(false)}
 title={selectedGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
 >
 <form onSubmit={handleSubmit(onGoalSubmit)} className="space-y-4 pt-2">
 <Input
 label="Goal Name"
 placeholder="e.g. Vacation Fund, New Car, Emergency Fund"
 error={errors.name?.message}
 {...register('name')}
 />

 <div className="grid grid-cols-2 gap-4">
 <Controller
 name="targetAmount"
 control={control}
 render={({ field }) => (
 <CurrencyInput
 label="Target Goal"
 value={field.value}
 onValueChange={(val) => field.onChange(val ? Number(val) : 0)}
 error={errors.targetAmount?.message}
 />
 )}
 />

 <Controller
 name="currentAmount"
 control={control}
 render={({ field }) => (
 <CurrencyInput
 label="Starting Balance"
 value={field.value}
 onValueChange={(val) => field.onChange(val ? Number(val) : 0)}
 error={errors.currentAmount?.message}
 disabled={!!selectedGoal} // Lock starting balance on edit
 />
 )}
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <Controller
 name="deadline"
 control={control}
 render={({ field }) => (
 <DatePicker
 label="Target Date"
 date={field.value}
 onDateChange={(d) => field.onChange(d)}
 error={errors.deadline?.message}
 />
 )}
 />

 <Select
 label="Priority"
 options={[
 { value: 'LOW', label: 'Low' },
 { value: 'MEDIUM', label: 'Medium' },
 { value: 'HIGH', label: 'High' },
 ]}
 error={errors.priority?.message}
 {...register('priority')}
 />
 </div>

 <Controller
 name="categoryId"
 control={control}
 render={({ field }) => (
 <Select
 label="Associated Category (Auto-Contribute)"
 options={[
 { value: '', label: 'None (Manual Contributions Only)' },
 ...(categoriesData || [])
 .filter((c: any) => c.type === 'EXPENSE')
 .map((c: any) => ({
 value: c.id,
 label: c.name,
 })),
 ]}
 value={field.value ?? ''}
 onChange={(e) => field.onChange(e.target.value)}
 error={(errors as any).categoryId?.message}
 />
 )}
 />

 <div className="flex items-center space-x-3 pt-2">
 <input
 id="autoContribute"
 type="checkbox"
 className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-slate-800 text-primary-500 focus:ring-primary-500"
 {...register('autoContribute')}
 />
 <label htmlFor="autoContribute" className="text-sm text-slate-600 dark:text-slate-300">
 Enable auto-contribution (requires background processing)
 </label>
 </div>

 <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
 <Button type="button" variant="outline" onClick={() => setIsGoalModalOpen(false)}>
 Cancel
 </Button>
 <Button type="submit" isLoading={isSubmitting}>
 {selectedGoal ? 'Save Changes' : 'Create Goal'}
 </Button>
 </div>
 </form>
 </Modal>
 )}

 {/* QUICK CONTRIBUTION MODAL */}
 {isContributionModalOpen && (
 <Modal
 isOpen={isContributionModalOpen}
 onClose={() => setIsContributionModalOpen(false)}
 title={`Save towards: ${activeGoalForContribution?.name}`}
 >
 <form onSubmit={contribForm.handleSubmit(onContributionSubmit)} className="space-y-4 pt-2">
 <Controller
 name="amount"
 control={contribForm.control}
 render={({ field }) => (
 <CurrencyInput
 label="Amount to Save"
 value={field.value}
 onValueChange={(val) => field.onChange(val ? Number(val) : 0)}
 error={contribForm.formState.errors.amount?.message}
 />
 )}
 />

 <Select
 label="Source Account"
 options={accounts.map((a) => ({
 value: a.id,
 label: `${a.name} (${formatCurrency(a.balance, a.currency)})`,
 }))}
 error={contribForm.formState.errors.accountId?.message}
 {...contribForm.register('accountId')}
 />

 <Input
 label="Note (Optional)"
 placeholder="e.g. Monthly transfer, spare change"
 error={contribForm.formState.errors.note?.message}
 {...contribForm.register('note')}
 />

 <Controller
 name="date"
 control={contribForm.control}
 render={({ field }) => (
 <DatePicker
 label="Date"
 date={field.value}
 onDateChange={(d) => field.onChange(d || new Date())}
 />
 )}
 />

 <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
 <Button type="button" variant="outline" onClick={() => setIsContributionModalOpen(false)}>
 Cancel
 </Button>
 <Button type="submit" isLoading={contribForm.formState.isSubmitting}>
 Add Contribution
 </Button>
 </div>
 </form>
 </Modal>
 )}

 {/* GOAL DETAILS MODAL */}
 {isDetailModalOpen && activeGoalDetails && (
 <Modal
 isOpen={isDetailModalOpen}
 onClose={() => setIsDetailModalOpen(false)}
 title={`Goal Details: ${activeGoalDetails.name}`}
 >
 <div className="space-y-6 pt-2">
 <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-300 dark:border-slate-700">
 <div className="space-y-1">
 <p className="text-xs text-slate-500 dark:text-slate-400">Total Saved Progress</p>
 <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
 {formatCurrency(activeGoalDetails.currentAmount, currency)} /{' '}
 <span className="text-slate-500 dark:text-slate-400 font-normal">
 {formatCurrency(activeGoalDetails.targetAmount, currency)}
 </span>
 </p>
 </div>
 <div className="w-12 h-12">
 <CircularProgressbar
 value={Math.min(
 Math.round((activeGoalDetails.currentAmount / activeGoalDetails.targetAmount) * 100),
 100
 )}
 text={`${Math.min(
 Math.round((activeGoalDetails.currentAmount / activeGoalDetails.targetAmount) * 100),
 100
 )}%`}
 styles={buildStyles({
 textSize: '24px',
 pathColor: activeGoalDetails.color || '#6366f1',
 textColor: '#e2e8f0',
 trailColor: '#1e293b',
 })}
 />
 </div>
 </div>

 {activeGoalDetails.category && (
 <div className="text-xs text-slate-500 dark:text-slate-400 px-1 font-sans">
 Linked Category:{' '}
 <span className="text-slate-800 dark:text-slate-200 font-semibold">
 {activeGoalDetails.category.name}
 </span>
 </div>
 )}

 {/* Contribution logs */}
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center">
 <History className="w-4 h-4 mr-1.5 text-primary-400" />
 <span>Contribution History</span>
 </h4>
 {!activeGoalDetails.isCompleted && (
 <Button size="sm" variant="ghost" onClick={(e) => handleContributionOpen(activeGoalDetails, e)}>
 <Plus className="w-3.5 h-3.5 mr-1" /> Add
 </Button>
 )}
 </div>

 <div className="max-h-48 overflow-y-auto space-y-2 divide-y divide-slate-850 scrollbar-thin scrollbar-thumb-slate-800">
 {!activeGoalDetails.contributions || activeGoalDetails.contributions.length === 0 ? (
 <p className="text-xs text-slate-500 text-center py-4">No contributions logged yet.</p>
 ) : (
 activeGoalDetails.contributions.map((c: any) => (
 <div key={c.id} className="flex justify-between py-2 items-center text-xs">
 <div>
 <p className="font-semibold text-slate-800 dark:text-slate-200">{c.note || 'Contribution'}</p>
 <p className="text-slate-500 text-[10px]">{formatDate(c.date, 'MMM dd, yyyy')}</p>
 </div>
 <span className="font-bold text-emerald-400">
 +{formatCurrency(Number(c.amount), currency)}
 </span>
 </div>
 ))
 )}
 </div>
 </div>

 <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
 <button
 onClick={(e) => handleDelete(activeGoalDetails.id, e)}
 className="flex items-center text-red-400 hover:text-red-300 font-semibold transition-colors"
 >
 <Trash2 className="w-4 h-4 mr-1" /> Delete Goal
 </button>
 <Button size="sm" onClick={() => setIsDetailModalOpen(false)}>
 Close
 </Button>
 </div>
 </div>
 </Modal>
 )}
 </div>
 );
}
