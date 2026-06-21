'use client';

import * as React from 'react';
import { useDebts } from '@/hooks/useDebts';
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
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Trash2, Edit2, Calendar, ShieldAlert, Award, Calculator, TrendingDown, DollarSign } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const debtSchema = z.object({
 name: z.string().min(2, 'Name must be at least 2 characters'),
 type: z.enum(['PERSONAL_LOAN', 'BANK_LOAN', 'CREDIT_CARD', 'MORTGAGE', 'OTHER']),
 lender: z.string().min(2, 'Lender name must be at least 2 characters'),
 originalAmount: z.number().min(1, 'Original amount must be greater than 0'),
 currentBalance: z.number().min(0, 'Current balance must be 0 or more'),
 interestRate: z.number().min(0, 'Interest rate must be 0 or more'),
 minimumPayment: z.number().min(1, 'Minimum payment must be greater than 0'),
 dueDate: z.date({ required_error: 'Due date is required' }),
});

const paymentSchema = z.object({
 amount: z.number().min(1, 'Payment must be greater than 0'),
 accountId: z.string().min(1, 'Source account is required'),
 note: z.string().optional(),
 date: z.date().default(() => new Date()),
});

export default function DebtsPage() {
 const { debts, isLoading, createDebt, updateDebt, deleteDebt, addPayment, getPayoffPlan } = useDebts();
 const { accounts } = useAccounts();
 const user = useAuthStore((state) => state.user);
 const currency = user?.currency || 'USD';

 const [isDebtModalOpen, setIsDebtModalOpen] = React.useState(false);
 const [selectedDebt, setSelectedDebt] = React.useState<any | null>(null);
 const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
 const [activeDebtForPayment, setActiveDebtForPayment] = React.useState<any | null>(null);
 const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
 const [activeDebtDetails, setActiveDebtDetails] = React.useState<any | null>(null);

 // Payoff Plan calculation parameters
 const [strategy, setStrategy] = React.useState<'snowball' | 'avalanche'>('avalanche');
 const [extraPayment, setExtraPayment] = React.useState<number>(0);
 const [payoffPlanData, setPayoffPlanData] = React.useState<any>(null);
 const [isCalculating, setIsCalculating] = React.useState(false);

 // Form for Debt CRUD
 const {
 register,
 handleSubmit,
 control,
 reset,
 formState: { errors, isSubmitting },
 } = useForm({
 resolver: zodResolver(debtSchema),
 defaultValues: {
 name: '',
 type: 'CREDIT_CARD' as const,
 lender: '',
 originalAmount: 0,
 currentBalance: 0,
 interestRate: 0,
 minimumPayment: 0,
 dueDate: new Date(),
 },
 });

 // Form for Payment
 const payForm = useForm({
 resolver: zodResolver(paymentSchema),
 defaultValues: {
 amount: 0,
 accountId: '',
 note: '',
 date: new Date(),
 },
 });

 // Fetch payoff plan when debts, strategy, or extra payment changes
 React.useEffect(() => {
 if (debts.length > 0) {
 const fetchPlan = async () => {
 setIsCalculating(true);
 try {
 const plan = await getPayoffPlan(strategy, extraPayment);
 setPayoffPlanData(plan);
 } catch {
 // Fallback static calculation if API has issues
 calculateFallbackPlan();
 } finally {
 setIsCalculating(false);
 }
 };
 fetchPlan();
 } else {
 setPayoffPlanData(null);
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [debts, strategy, extraPayment]);

 // Fallback simple payoff simulator in frontend
 const calculateFallbackPlan = () => {
 let totalBal = debts.reduce((sum, d) => sum + Number(d.currentBalance), 0);
 const monthlyMin = debts.reduce((sum, d) => sum + Number(d.minimumPayment), 0);
 const totalPayment = monthlyMin + extraPayment;
 
 if (totalPayment <= 0 || totalBal <= 0) return;

 const dataPoints = [];
 let monthCount = 0;
 let balance = totalBal;

 // Add starting point
 dataPoints.push({
 month: 'Start',
 balance: Math.round(balance),
 });

 while (balance > 0 && monthCount < 120) { // Limit to 10 years max
 monthCount++;
 // Apply monthly payments
 balance = balance - totalPayment;
 // Simple interest approximation
 balance = balance * (1 + 0.08 / 12); // Average 8% interest rate
 
 if (balance < 0) balance = 0;

 dataPoints.push({
 month: `Month ${monthCount}`,
 balance: Math.round(balance),
 });
 }

 setPayoffPlanData({
 months: monthCount,
 totalInterest: Math.round(totalBal * 0.15), // Approximation
 schedule: dataPoints,
 });
 };

 // Stats
 const totalBalance = debts.reduce((sum, d) => sum + Number(d.currentBalance), 0);
 const totalOriginal = debts.reduce((sum, d) => sum + Number(d.originalAmount), 0);
 const totalMinPayments = debts.reduce((sum, d) => sum + Number(d.minimumPayment), 0);
 const highestInterestDebt = debts.length > 0 
 ? [...debts].sort((a, b) => Number(b.interestRate) - Number(a.interestRate))[0]
 : null;

 // Handle Create Open
 const handleCreateOpen = () => {
 setSelectedDebt(null);
 reset({
 name: '',
 type: 'CREDIT_CARD',
 lender: '',
 originalAmount: 0,
 currentBalance: 0,
 interestRate: 0,
 minimumPayment: 0,
 dueDate: new Date(),
 });
 setIsDebtModalOpen(true);
 };

 // Handle Edit Open
 const handleEditOpen = (debt: any, e: React.MouseEvent) => {
 e.stopPropagation();
 setSelectedDebt(debt);
 reset({
 name: debt.name,
 type: debt.type.toUpperCase() as any,
 lender: debt.lender || '',
 originalAmount: Number(debt.originalAmount),
 currentBalance: Number(debt.currentBalance),
 interestRate: Number(debt.interestRate),
 minimumPayment: Number(debt.minimumPayment),
 dueDate: new Date(debt.dueDate),
 });
 setIsDebtModalOpen(true);
 };

 // Submit Debt CRUD
 const onDebtSubmit = async (data: any) => {
 try {
 const payload = {
 ...data,
 dueDate: data.dueDate.toISOString(),
 };
 if (selectedDebt) {
 await updateDebt({ id: selectedDebt.id, data: payload });
 } else {
 await createDebt(payload);
 }
 setIsDebtModalOpen(false);
 } catch {
 // Handled in hooks
 }
 };

 // Handle Payment Open
 const handlePaymentOpen = (debt: any, e: React.MouseEvent) => {
 e.stopPropagation();
 setActiveDebtForPayment(debt);
 payForm.reset({
 amount: Number(debt.minimumPayment),
 accountId: accounts[0]?.id || '',
 note: '',
 date: new Date(),
 });
 setIsPaymentModalOpen(true);
 };

 // Submit Payment
 const onPaymentSubmit = async (data: any) => {
 if (!activeDebtForPayment) return;
 try {
 await addPayment({
 id: activeDebtForPayment.id,
 data: {
 amount: data.amount,
 date: data.date.toISOString(),
 note: data.note || `Paid minimum of ${formatCurrency(data.amount, currency)} from ${accounts.find((a) => a.id === data.accountId)?.name || 'Account'}`,
 },
 });
 setIsPaymentModalOpen(false);
 } catch {
 // Handled in hooks
 }
 };

 // Handle Delete
 const handleDelete = async (id: string, e: React.MouseEvent) => {
 e.stopPropagation();
 if (confirm('Are you sure you want to delete this debt? This will also delete payment history.')) {
 await deleteDebt(id);
 setIsDetailModalOpen(false);
 }
 };

 // Details
 const handleDetailsOpen = (debt: any) => {
 setActiveDebtDetails(debt);
 setIsDetailModalOpen(true);
 };

 return (
 <div className="space-y-6 pb-20">
 <PageHeader
 title="Debt Tracker"
 description="Track loans and credit cards. Run payoffs using Snowball or Avalanche strategies."
 action={
 <Button onClick={handleCreateOpen}>
 <Plus className="w-4 h-4 mr-2" /> Add Debt
 </Button>
 }
 />

 {isLoading ? (
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 {[1, 2, 3, 4].map((n) => (
 <Card key={n} className="h-28 animate-pulse bg-slate-50 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700" />
 ))}
 </div>
 ) : debts.length === 0 ? (
 <Card className="flex flex-col items-center justify-center p-12 text-center">
 <div className="p-4 rounded-full bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 mb-4">
 <ShieldAlert className="w-10 h-10" />
 </div>
 <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No debts recorded yet</h3>
 <p className="text-sm text-slate-500 max-w-sm mt-1">
 Keep all your credit cards, loans, and other debts in one place to build an optimized payoff strategy.
 </p>
 <Button onClick={handleCreateOpen} className="mt-5">
 <Plus className="w-4 h-4 mr-2" /> Add Your First Debt
 </Button>
 </Card>
 ) : (
 <>
 {/* Summary Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <Card className="p-5 flex items-center space-x-4">
 <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
 <TrendingDown className="w-5 h-5" />
 </div>
 <div>
 <p className="text-xs font-semibold text-slate-500">Total Debt Owed</p>
 <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
 {formatCurrency(totalBalance, currency)}
 </p>
 </div>
 </Card>

 <Card className="p-5 flex items-center space-x-4">
 <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
 <DollarSign className="w-5 h-5" />
 </div>
 <div>
 <p className="text-xs font-semibold text-slate-500">Monthly Min Payments</p>
 <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
 {formatCurrency(totalMinPayments, currency)}
 </p>
 </div>
 </Card>

 <Card className="p-5 flex items-center space-x-4">
 <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
 <Calculator className="w-5 h-5" />
 </div>
 <div>
 <p className="text-xs font-semibold text-slate-500">Paid Progress</p>
 <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
 {totalOriginal > 0
 ? `${Math.round(((totalOriginal - totalBalance) / totalOriginal) * 100)}%`
 : '0%'}
 </p>
 </div>
 </Card>

 <Card className="p-5 flex items-center space-x-4">
 <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
 <ShieldAlert className="w-5 h-5" />
 </div>
 <div>
 <p className="text-xs font-semibold text-slate-500">Highest Interest</p>
 <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
 {highestInterestDebt ? `${highestInterestDebt.interestRate}%` : '0%'}
 </p>
 </div>
 </Card>
 </div>

 {/* Payoff strategy section */}
 <Card className="p-6">
 <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
 <Calculator className="w-5 h-5 mr-2 text-primary-400" />
 <span>Debt Payoff Strategy Planner</span>
 </h3>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
 <div>
 <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">
 Select Strategy
 </label>
 <div className="grid grid-cols-2 gap-2">
 <button
 onClick={() => setStrategy('avalanche')}
 className={cn(
 'py-2 px-3 rounded-xl border text-xs font-bold transition-all',
 strategy === 'avalanche'
 ? 'bg-primary-500 border-transparent text-white'
 : 'bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
 )}
 >
 Avalanche (Highest Rate)
 </button>
 <button
 onClick={() => setStrategy('snowball')}
 className={cn(
 'py-2 px-3 rounded-xl border text-xs font-bold transition-all',
 strategy === 'snowball'
 ? 'bg-primary-500 border-transparent text-white'
 : 'bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
 )}
 >
 Snowball (Lowest Bal)
 </button>
 </div>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">
 Extra Monthly Payment
 </label>
 <CurrencyInput
 placeholder="e.g. 200"
 value={extraPayment || ''}
 onValueChange={(val) => setExtraPayment(val ? Number(val) : 0)}
 />
 </div>

 <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center justify-between text-sm">
 <div>
 <p className="text-xs text-slate-500">Estimated Payoff Time</p>
 <p className="text-lg font-extrabold text-slate-800 dark:text-slate-200">
 {payoffPlanData?.months || '...'} Months
 </p>
 </div>
 <div>
 <p className="text-xs text-slate-500">Total Interest Paid</p>
 <p className="text-lg font-extrabold text-slate-800 dark:text-slate-200 text-amber-400">
 {payoffPlanData?.totalInterest
 ? formatCurrency(payoffPlanData.totalInterest, currency)
 : '...'}
 </p>
 </div>
 </div>
 </div>

 {/* Payoff plan chart */}
 {payoffPlanData?.schedule && payoffPlanData.schedule.length > 0 && (
 <div className="h-64 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={payoffPlanData.schedule}>
 <defs>
 <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
 <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
 </linearGradient>
 </defs>
 <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} />
 <YAxis
 stroke="#475569"
 fontSize={10}
 tickLine={false}
 axisLine={false}
 tickFormatter={(val) => `$${val}`}
 />
 <Tooltip
 contentStyle={{
 backgroundColor: '#0f172a',
 borderColor: '#334155',
 borderRadius: '12px',
 color: '#f8fafc',
 fontSize: '12px',
 }}
 formatter={(val) => [formatCurrency(Number(val), currency), 'Balance']}
 />
 <Area
 type="monotone"
 dataKey="balance"
 stroke="#ef4444"
 strokeWidth={2}
 fillOpacity={1}
 fill="url(#colorBal)"
 />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 )}
 </Card>

 {/* Debts Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {debts.map((debt: any) => {
 const paidAmount = Math.max(Number(debt.originalAmount) - Number(debt.currentBalance), 0);
 const progressPct = Number(debt.originalAmount) > 0
 ? Math.round((paidAmount / Number(debt.originalAmount)) * 100)
 : 0;

 return (
 <Card
 key={debt.id}
 onClick={() => handleDetailsOpen(debt)}
 className="p-6 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700/80 bg-slate-900/60 backdrop-blur-md cursor-pointer hover:translate-y-[-2px] transition-all duration-200 flex flex-col group"
 >
 <div className="flex justify-between items-start mb-3">
 <div>
 <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-400 transition-colors">
 {debt.name}
 </h3>
 <p className="text-xs text-slate-500">{debt.lender}</p>
 </div>
 <Badge variant={debt.currentBalance === 0 ? 'success' : 'outline'}>
 {debt.interestRate}% APR
 </Badge>
 </div>

 <div className="space-y-3 flex-1 flex flex-col justify-end">
 <div>
 <div className="flex justify-between text-xs mb-1">
 <span className="text-slate-500 dark:text-slate-400">Current Balance</span>
 <span className="font-semibold text-slate-600 dark:text-slate-300">
 {formatCurrency(debt.currentBalance, currency)}
 </span>
 </div>
 {/* Progress Bar */}
 <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
 <div
 className="bg-red-500 h-full rounded-full transition-all duration-300"
 style={{ width: `${100 - progressPct}%` }}
 />
 </div>
 <div className="flex justify-between text-[10px] text-slate-500 mt-1">
 <span>{progressPct}% Paid Off</span>
 <span>Original: {formatCurrency(debt.originalAmount, currency)}</span>
 </div>
 </div>

 <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-850">
 <div>
 <span className="text-slate-500">Min Payment: </span>
 <span className="font-bold text-slate-600 dark:text-slate-300">
 {formatCurrency(debt.minimumPayment, currency)}
 </span>
 </div>
 <div className="flex space-x-2">
 <button
 onClick={(e) => handleEditOpen(debt, e)}
 className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 transition-colors"
 >
 <Edit2 className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={(e) => handleDelete(debt.id, e)}
 className="p-1 text-slate-500 dark:text-slate-400 hover:text-red-400 transition-colors"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 </div>

 {debt.currentBalance > 0 && (
 <Button
 onClick={(e) => handlePaymentOpen(debt, e)}
 size="sm"
 className="mt-4 w-full"
 >
 <DollarSign className="w-4 h-4 mr-1.5" /> Make Payment
 </Button>
 )}
 </Card>
 );
 })}
 {/* Add Another Debt card */}
 <button
 onClick={handleCreateOpen}
 className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-500/60 rounded-2xl bg-transparent hover:bg-primary-500/5 transition-all duration-200 flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-primary-400 cursor-pointer group min-h-[160px]"
 >
 <div className="p-3 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 group-hover:border-primary-500/60 transition-colors">
 <Plus className="w-5 h-5" />
 </div>
 <span className="text-sm font-semibold">Add Another Debt</span>
 </button>
 </div>
 </>
 )}

 {/* CREATE & EDIT DEBT MODAL */}
 {isDebtModalOpen && (
 <Modal
 isOpen={isDebtModalOpen}
 onClose={() => setIsDebtModalOpen(false)}
 title={selectedDebt ? 'Edit Debt Details' : 'Add New Debt'}
 >
 <form onSubmit={handleSubmit(onDebtSubmit)} className="space-y-4 pt-2">
 <Input
 label="Debt Name"
 placeholder="e.g. Chase Credit Card, Toyota Car Loan"
 error={errors.name?.message}
 {...register('name')}
 />

 <div className="grid grid-cols-2 gap-4">
 <Select
 label="Debt Type"
 options={[
 { value: 'CREDIT_CARD', label: 'Credit Card' },
 { value: 'PERSONAL_LOAN', label: 'Personal Loan' },
 { value: 'BANK_LOAN', label: 'Bank Loan' },
 { value: 'MORTGAGE', label: 'Mortgage' },
 { value: 'OTHER', label: 'Other Debt' },
 ]}
 error={errors.type?.message}
 {...register('type')}
 />

 <Input
 label="Lender / Institution"
 placeholder="e.g. Chase Bank, Toyota Financial"
 error={errors.lender?.message}
 {...register('lender')}
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <Controller
 name="originalAmount"
 control={control}
 render={({ field }) => (
 <CurrencyInput
 label="Original Amount"
 value={field.value}
 onValueChange={(val) => field.onChange(val ? Number(val) : 0)}
 error={errors.originalAmount?.message}
 />
 )}
 />

 <Controller
 name="currentBalance"
 control={control}
 render={({ field }) => (
 <CurrencyInput
 label="Current Balance"
 value={field.value}
 onValueChange={(val) => field.onChange(val ? Number(val) : 0)}
 error={errors.currentBalance?.message}
 />
 )}
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <Input
 label="Interest Rate (% APR)"
 type="number"
 step="0.01"
 placeholder="e.g. 18.99"
 error={errors.interestRate?.message}
 {...register('interestRate', { valueAsNumber: true })}
 />

 <Controller
 name="minimumPayment"
 control={control}
 render={({ field }) => (
 <CurrencyInput
 label="Minimum Monthly Payment"
 value={field.value}
 onValueChange={(val) => field.onChange(val ? Number(val) : 0)}
 error={errors.minimumPayment?.message}
 />
 )}
 />
 </div>

 <Controller
 name="dueDate"
 control={control}
 render={({ field }) => (
 <DatePicker
 label="Next Payment Due Date"
 date={field.value}
 onDateChange={(d) => field.onChange(d || new Date())}
 error={errors.dueDate?.message}
 />
 )}
 />

 <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
 <Button type="button" variant="outline" onClick={() => setIsDebtModalOpen(false)}>
 Cancel
 </Button>
 <Button type="submit" isLoading={isSubmitting}>
 {selectedDebt ? 'Save Changes' : 'Add Debt'}
 </Button>
 </div>
 </form>
 </Modal>
 )}

 {/* RECORD PAYMENT MODAL */}
 {isPaymentModalOpen && (
 <Modal
 isOpen={isPaymentModalOpen}
 onClose={() => setIsPaymentModalOpen(false)}
 title={`Record Payment for: ${activeDebtForPayment?.name}`}
 >
 <form onSubmit={payForm.handleSubmit(onPaymentSubmit)} className="space-y-4 pt-2">
 <Controller
 name="amount"
 control={payForm.control}
 render={({ field }) => (
 <CurrencyInput
 label="Payment Amount"
 value={field.value}
 onValueChange={(val) => field.onChange(val ? Number(val) : 0)}
 error={payForm.formState.errors.amount?.message}
 />
 )}
 />

 <Select
 label="Source Account"
 options={accounts.map((a) => ({
 value: a.id,
 label: `${a.name} (${formatCurrency(a.balance, a.currency)})`,
 }))}
 error={payForm.formState.errors.accountId?.message}
 {...payForm.register('accountId')}
 />

 <Input
 label="Note (Optional)"
 placeholder="e.g. Regular monthly min pay"
 error={payForm.formState.errors.note?.message}
 {...payForm.register('note')}
 />

 <Controller
 name="date"
 control={payForm.control}
 render={({ field }) => (
 <DatePicker
 label="Payment Date"
 date={field.value}
 onDateChange={(d) => field.onChange(d || new Date())}
 />
 )}
 />

 <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
 <Button type="button" variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
 Cancel
 </Button>
 <Button type="submit" isLoading={payForm.formState.isSubmitting}>
 Record Payment
 </Button>
 </div>
 </form>
 </Modal>
 )}

 {/* DEBT DETAILS & PAYMENTS LOGS MODAL */}
 {isDetailModalOpen && activeDebtDetails && (
 <Modal
 isOpen={isDetailModalOpen}
 onClose={() => setIsDetailModalOpen(false)}
 title={`Debt Details: ${activeDebtDetails.name}`}
 >
 <div className="space-y-6 pt-2">
 <div className="grid grid-cols-2 gap-4 text-xs">
 <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
 <span className="text-slate-500 block">Lender</span>
 <span className="font-semibold text-slate-800 dark:text-slate-200">{activeDebtDetails.lender}</span>
 </div>
 <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
 <span className="text-slate-500 block">Interest Rate</span>
 <span className="font-semibold text-slate-800 dark:text-slate-200">{activeDebtDetails.interestRate}% APR</span>
 </div>
 <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
 <span className="text-slate-500 block">Current Balance</span>
 <span className="font-bold text-red-400">
 {formatCurrency(activeDebtDetails.currentBalance, currency)}
 </span>
 </div>
 <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
 <span className="text-slate-500 block">Min Payment</span>
 <span className="font-semibold text-slate-800 dark:text-slate-200">
 {formatCurrency(activeDebtDetails.minimumPayment, currency)}/mo
 </span>
 </div>
 </div>

 {/* Payments History log */}
 <div className="space-y-3">
 <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Payment History</h4>
 <div className="max-h-48 overflow-y-auto space-y-2 divide-y divide-slate-850 scrollbar-thin scrollbar-thumb-slate-800">
 {!activeDebtDetails.payments || activeDebtDetails.payments.length === 0 ? (
 <p className="text-xs text-slate-500 text-center py-4">No payments recorded yet.</p>
 ) : (
 activeDebtDetails.payments.map((p: any) => (
 <div key={p.id} className="flex justify-between py-2 items-center text-xs">
 <div>
 <p className="font-semibold text-slate-800 dark:text-slate-200">{p.note || 'Payment'}</p>
 <p className="text-slate-500 text-[10px]">{formatDate(p.date, 'MMM dd, yyyy')}</p>
 </div>
 <span className="font-bold text-emerald-400">
 -{formatCurrency(Number(p.amount), currency)}
 </span>
 </div>
 ))
 )}
 </div>
 </div>

 <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
 <button
 onClick={(e) => handleDelete(activeDebtDetails.id, e)}
 className="flex items-center text-red-400 hover:text-red-300 font-semibold transition-colors"
 >
 <Trash2 className="w-4 h-4 mr-1" /> Delete Debt
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
