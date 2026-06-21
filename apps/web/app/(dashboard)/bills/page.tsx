'use client';

import * as React from 'react';
import { useBills } from '@/hooks/useBills';
import { useAccounts } from '@/hooks/useAccounts';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { useAuthStore } from '@/store/auth.store';
import { formatCurrency } from '@/lib/utils';
import { Plus, Trash2, Edit2, Calendar, AlertCircle, CheckCircle2, RefreshCw, Clock } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'LRD', 'NGN', 'GHS'] as const;

const billSchema = z.object({
 name: z.string().min(2, 'Name must be at least 2 characters'),
 amount: z.number().min(1, 'Amount must be greater than 0'),
 currency: z.string().default('USD'),
 dueDay: z.number().min(1, 'Due day must be between 1 and 31').max(31, 'Due day must be between 1 and 31'),
 category: z.string().min(1, 'Category is required'),
 isRecurring: z.boolean().default(true),
 frequency: z.enum(['MONTHLY', 'WEEKLY', 'YEARLY', 'QUARTERLY']),
 reminderDays: z.number().min(0, 'Reminder days cannot be negative'),
 notes: z.string().optional(),
});

export default function BillsPage() {
 const { bills, isLoading, createBill, updateBill, deleteBill, markBillPaid } = useBills();
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

 const [isBillModalOpen, setIsBillModalOpen] = React.useState(false);
 const [selectedBill, setSelectedBill] = React.useState<any | null>(null);
 const [isPayModalOpen, setIsPayModalOpen] = React.useState(false);
 const [activeBillForPay, setActiveBillForPay] = React.useState<any | null>(null);

 // Form for Bill CRUD
 const {
 register,
 handleSubmit,
 control,
 reset,
 formState: { errors, isSubmitting },
 } = useForm({
 resolver: zodResolver(billSchema),
 defaultValues: {
 name: '',
 amount: 0,
 currency: 'USD',
 dueDay: 1,
 category: '',
 isRecurring: true,
 frequency: 'MONTHLY' as const,
 reminderDays: 3,
 notes: '',
 },
 });

 // Form for paying bill
 const payForm = useForm({
 defaultValues: {
 accountId: '',
 },
 });

 React.useEffect(() => {
 if (accounts.length > 0) {
 payForm.reset({
 accountId: accounts[0].id,
 });
 }
 }, [accounts, payForm]);

 // Stats
 const totalUnpaid = bills.filter((b) => !b.isPaid).reduce((sum, b) => sum + Number(b.amountInBase || b.amount), 0);
 const totalPaid = bills.filter((b) => b.isPaid).reduce((sum, b) => sum + Number(b.amountInBase || b.amount), 0);
 const unpaidCount = bills.filter((b) => !b.isPaid).length;

 // Handle Create Open
 const handleCreateOpen = () => {
 setSelectedBill(null);
 reset({
 name: '',
 amount: 0,
 currency: 'USD',
 dueDay: 1,
 category: '',
 isRecurring: true,
 frequency: 'MONTHLY',
 reminderDays: 3,
 notes: '',
 });
 setIsBillModalOpen(true);
 };

 // Handle Edit Open
 const handleEditOpen = (bill: any, e: React.MouseEvent) => {
 e.stopPropagation();
 setSelectedBill(bill);
 reset({
 name: bill.name,
 amount: Number(bill.amount),
 currency: bill.currency || 'USD',
 dueDay: Number(bill.dueDay),
 category: bill.category || '',
 isRecurring: bill.isRecurring,
 frequency: (bill.frequency || 'MONTHLY').toUpperCase() as any,
 reminderDays: Number(bill.reminderDays || 3),
 notes: bill.notes || '',
 });
 setIsBillModalOpen(true);
 };

 // Submit Bill CRUD
 const onBillSubmit = async (data: any) => {
 try {
 if (selectedBill) {
 await updateBill({ id: selectedBill.id, data });
 } else {
 await createBill(data);
 }
 setIsBillModalOpen(false);
 } catch {
 // Handled in hooks
 }
 };

 // Handle Pay Open
 const handlePayOpen = (bill: any, e: React.MouseEvent) => {
 e.stopPropagation();
 setActiveBillForPay(bill);
 setIsPayModalOpen(true);
 };

 // Submit Pay
 const onPaySubmit = async (data: any) => {
 if (!activeBillForPay) return;
 try {
 await markBillPaid({
 id: activeBillForPay.id,
 data: {
 paidDate: new Date().toISOString(),
 paidAmount: Number(activeBillForPay.amount),
 accountId: data.accountId, // API will handle transferring money out
 },
 });
 setIsPayModalOpen(false);
 } catch {
 // Handled in hooks
 }
 };

 // Handle Delete
 const handleDelete = async (id: string, e: React.MouseEvent) => {
 e.stopPropagation();
 if (confirm('Are you sure you want to delete this bill?')) {
 await deleteBill(id);
 }
 };

 // Helper: check overdue status based on current day of month
 const isOverdue = (bill: any) => {
 if (bill.isPaid) return false;
 const currentDay = new Date().getDate();
 return currentDay > bill.dueDay;
 };

 return (
 <div className="space-y-6 pb-20">
 <PageHeader
 title="Bills & Subscriptions"
 description="Monitor utility bills, subscription commitments, and schedule payment alerts."
 action={
 <Button onClick={handleCreateOpen}>
 <Plus className="w-4 h-4 mr-2" /> Add Bill
 </Button>
 }
 />

  {isLoading ? (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((n) => (
        <Card key={n} className="h-44 animate-pulse bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700" />
      ))}
    </div>
  ) : bills.length === 0 ? (
    <Card className="flex flex-col items-center justify-center p-12 text-center">
      <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 mb-4">
        <Calendar className="w-10 h-10" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No bills or subscriptions tracked yet</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-1">
        Stay on top of repeating commitments like rent, streaming services, electricity, and gym memberships.
      </p>
      <Button onClick={handleCreateOpen} className="mt-5">
        <Plus className="w-4 h-4 mr-2" /> Add Your First Bill
      </Button>
    </Card>
 ) : (
 <>
  {/* Summary Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <Card className="p-5 flex items-center space-x-4">
      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500">Unpaid Bills Owed</p>
        <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
          {formatCurrency(totalUnpaid, currency)}
        </p>
      </div>
    </Card>

    <Card className="p-5 flex items-center space-x-4">
      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500">Paid Bills This Month</p>
        <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
          {formatCurrency(totalPaid, currency)}
        </p>
      </div>
    </Card>

    <Card className="p-5 flex items-center space-x-4">
      <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400">
        <Clock className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500">Pending Actions</p>
        <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
          {unpaidCount} Bills Left
        </p>
      </div>
    </Card>
  </div>

 {/* Bills List */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {bills.map((bill: any) => {
 const overdue = isOverdue(bill);
 
 return (
 <Card
 key={bill.id}
 className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 backdrop-blur-md flex flex-col hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200 group"
 >
 <div className="flex justify-between items-start mb-3">
 <div>
 <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
 {bill.name}
 </h3>
 <p className="text-xs text-slate-500 capitalize">
 {(categoriesData || []).find((c: any) => c.id === bill.category)?.name || 'Utilities'}
 </p>
 </div>
 {bill.isPaid ? (
 <Badge variant="success">Paid</Badge>
 ) : overdue ? (
 <Badge variant="danger">Overdue</Badge>
 ) : (
 <Badge variant="warning">Upcoming</Badge>
 )}
 </div>

      <div className="space-y-4 flex-1 flex flex-col justify-end">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-slate-500 dark:text-slate-400">Monthly Amount</span>
          <span className="text-lg font-extrabold text-slate-800 dark:text-slate-200">
            {formatCurrency(bill.amount, bill.currency || 'USD')}
          </span>
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Due Day: {bill.dueDay} of month</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 font-semibold">
            <RefreshCw className="w-3 h-3" />
            <span className="capitalize text-[10px]">{bill.frequency?.toLowerCase()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-2">
            <button
              onClick={(e) => handleEditOpen(bill, e)}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => handleDelete(bill.id, e)}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

 {!bill.isPaid && (
 <Button
 onClick={(e) => handlePayOpen(bill, e)}
 size="sm"
 variant={overdue ? 'destructive' : 'default'}
 >
 Mark Paid
 </Button>
 )}
 </div>
 </div>
 </Card>
 );
 })}
 {/* Add Another Bill card */}
 <button
 onClick={handleCreateOpen}
 className="p-5 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-500/60 rounded-2xl bg-transparent hover:bg-primary-500/5 transition-all duration-200 flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer group min-h-[160px]"
 >
 <div className="p-3 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 group-hover:border-primary-500/60 transition-colors">
 <Plus className="w-5 h-5" />
 </div>
 <span className="text-sm font-semibold">Add Another Bill</span>
 </button>
 </div>
 </>
 )}

 {/* CREATE & EDIT BILL MODAL */}
 {isBillModalOpen && (
 <Modal
 isOpen={isBillModalOpen}
 onClose={() => setIsBillModalOpen(false)}
 title={selectedBill ? 'Edit Bill Details' : 'Add New Repeating Bill'}
 >
 <form onSubmit={handleSubmit(onBillSubmit)} className="space-y-4 pt-2">
 <Input
 label="Bill Name"
 placeholder="e.g. Rent, Netflix subscription, Electric bill"
 error={errors.name?.message}
 {...register('name')}
 />

 <div className="grid grid-cols-3 gap-3">
 <div className="col-span-2">
 <Controller
 name="amount"
 control={control}
 render={({ field }) => (
 <CurrencyInput
 label="Bill Amount"
 value={field.value}
 onValueChange={(val) => field.onChange(val ? Number(val) : 0)}
 error={errors.amount?.message}
 />
 )}
 />
 </div>

 <div className="col-span-1">
 <Select
 label="Currency"
 options={CURRENCIES.map((cur) => ({ value: cur, label: cur }))}
 error={(errors as any).currency?.message}
 {...register('currency')}
 />
 </div>
 </div>

 <Input
 label="Due Day of Month"
 type="number"
 min="1"
 max="31"
 placeholder="e.g. 5"
 error={errors.dueDay?.message}
 {...register('dueDay', { valueAsNumber: true })}
 />

 <div className="grid grid-cols-2 gap-4">
 <Select
 label="Billing Frequency"
 options={[
 { value: 'MONTHLY', label: 'Monthly' },
 { value: 'WEEKLY', label: 'Weekly' },
 { value: 'QUARTERLY', label: 'Quarterly' },
 { value: 'YEARLY', label: 'Yearly' },
 ]}
 error={errors.frequency?.message}
 {...register('frequency')}
 />

 <Input
 label="Reminder Alerts (Days Before)"
 type="number"
 placeholder="e.g. 3"
 error={errors.reminderDays?.message}
 {...register('reminderDays', { valueAsNumber: true })}
 />
 </div>

 <Select
 label="Category"
 options={(categoriesData || []).filter((c: any) => c.type === 'EXPENSE').map((c: any) => ({
 value: c.id,
 label: c.name,
 }))}
 error={errors.category?.message}
 {...register('category')}
 />

 <Input
 label="Notes (Optional)"
 placeholder="e.g. Autopay enabled"
 error={errors.notes?.message}
 {...register('notes')}
 />

 <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
 <Button type="button" variant="outline" onClick={() => setIsBillModalOpen(false)}>
 Cancel
 </Button>
 <Button type="submit" isLoading={isSubmitting}>
 {selectedBill ? 'Save Changes' : 'Create Bill'}
 </Button>
 </div>
 </form>
 </Modal>
 )}

  {/* BILL PAYMENT CONFIRMATION MODAL */}
  {isPayModalOpen && (
    <Modal
      isOpen={isPayModalOpen}
      onClose={() => setIsPayModalOpen(false)}
      title={`Confirm Bill Payment: ${activeBillForPay?.name}`}
    >
      <form onSubmit={payForm.handleSubmit(onPaySubmit)} className="space-y-4 pt-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          You are about to mark <span className="font-semibold text-slate-800 dark:text-slate-200">{activeBillForPay?.name}</span>{' '}
          ({formatCurrency(activeBillForPay?.amount || 0, activeBillForPay?.currency || 'USD')}) as paid. This will automatically deduct funds
          and create a corresponding expense transaction.
        </p>

        <Select
          label="Deduct from Account"
          options={accounts.map((a) => ({
            value: a.id,
            label: `${a.name} (${formatCurrency(a.balance, a.currency)})`,
          }))}
          {...payForm.register('accountId', { required: true })}
        />

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={() => setIsPayModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit">Confirm Payment</Button>
        </div>
      </form>
    </Modal>
  )}
 </div>
 );
}
