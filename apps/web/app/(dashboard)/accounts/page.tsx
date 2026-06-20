'use client';

import * as React from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import { useCurrency } from '@/hooks/useCurrency';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus, Pencil, Trash2, Wallet, CreditCard, PiggyBank,
  Building2, Smartphone, TrendingUp, MoreVertical, ArrowLeftRight,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import type { Account, AccountType } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { currencyApi, type ExchangeRate } from '@/lib/api';

const ACCOUNT_TYPES: { value: AccountType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'CASH', label: 'Cash', icon: <Wallet className="w-4 h-4" />, color: '#10b981' },
  { value: 'CHECKING', label: 'Checking', icon: <Building2 className="w-4 h-4" />, color: '#6366f1' },
  { value: 'SAVINGS', label: 'Savings', icon: <PiggyBank className="w-4 h-4" />, color: '#f59e0b' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money', icon: <Smartphone className="w-4 h-4" />, color: '#0ea5e9' },
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: <CreditCard className="w-4 h-4" />, color: '#ef4444' },
  { value: 'INVESTMENT', label: 'Investment', icon: <TrendingUp className="w-4 h-4" />, color: '#a78bfa' },
];

const accountSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['CASH', 'CHECKING', 'SAVINGS', 'MOBILE_MONEY', 'CREDIT_CARD', 'INVESTMENT'] as const),
  balance: z.coerce.number().min(-1000000).max(100000000),
  currency: z.string().default('USD'),
  color: z.string().optional(),
  icon: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
  notes: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9',
  '#a78bfa', '#f97316', '#ec4899', '#14b8a6', '#84cc16',
];

function AccountCard({
  account,
  onEdit,
  onDelete,
}: {
  account: Account;
  onEdit: (a: Account) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const [showMenu, setShowMenu] = React.useState(false);
  const typeInfo = ACCOUNT_TYPES.find((t) => t.value === account.type);
  const isNegative = account.balance < 0;

  return (
    <Card className={cn('group relative hover:border-slate-700/60 transition-all duration-300 overflow-hidden')}>
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ backgroundColor: account.color || typeInfo?.color || '#6366f1' }}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
            style={{ backgroundColor: `${account.color || typeInfo?.color || '#6366f1'}25` }}
          >
            <span style={{ color: account.color || typeInfo?.color || '#6366f1' }}>
              {typeInfo?.icon}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">{account.name}</h3>
              {account.isDefault && (
                <Badge variant="default" className="text-[10px] py-0 px-1.5">Default</Badge>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{typeInfo?.label} · {account.currency}</p>
          </div>
        </div>

        {/* Three-dot menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-all opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 z-10 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1 w-36">
              <button
                onClick={() => { setShowMenu(false); onEdit(account); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => { setShowMenu(false); onDelete(account.id, account.name); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800/60">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Balance</p>
        <p className={cn('text-2xl font-black tracking-tight', isNegative ? 'text-red-400' : 'text-slate-100')}>
          {formatCurrency(account.balance, account.currency)}
        </p>
      </div>
    </Card>
  );
}

export default function AccountsPage() {
  const { format, currency } = useCurrency();
  const {
    accounts, isLoading,
    createAccount, isCreating,
    updateAccount, isUpdating,
    deleteAccount, isDeleting,
  } = useAccounts();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState<Account | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ id: string; name: string } | null>(null);
  const [selectedColor, setSelectedColor] = React.useState(COLORS[0]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: { type: 'CASH', currency: 'USD', balance: 0, isDefault: false },
  });

  const openCreate = () => {
    reset({ type: 'CASH', currency: 'USD', balance: 0, isDefault: false });
    setSelectedColor(COLORS[0]);
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const openEdit = (account: Account) => {
    setEditingAccount(account);
    setSelectedColor(account.color || COLORS[0]);
    reset({
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      color: account.color,
      isDefault: account.isDefault,
      notes: account.notes,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: AccountFormData) => {
    const payload = { ...data, color: selectedColor };
    if (editingAccount) {
      await updateAccount({ id: editingAccount.id, data: payload });
    } else {
      await createAccount(payload);
    }
    setIsModalOpen(false);
    reset();
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteAccount(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const { data: ratesData } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      const res = await currencyApi.getRates();
      return res.data.data as ExchangeRate[];
    },
  });

  const convertAmount = React.useCallback((amount: number, from: string, to: string): number => {
    const amt = Number(amount); // guard: ensure it's a real number
    if (from === to || isNaN(amt)) return amt;
    if (!ratesData || ratesData.length === 0) return amt;

    // All rates stored as USD-based: rate = how many {target} per 1 USD
    // To convert `from` → `to`: first convert `from` → USD, then USD → `to`
    // fromRate: how many `from` units per 1 USD
    const fromRate = from === 'USD' ? 1 : (ratesData.find(r => r.targetCurrency === from && r.baseCurrency === 'USD')?.rate ?? null);
    // toRate: how many `to` units per 1 USD
    const toRate   = to   === 'USD' ? 1 : (ratesData.find(r => r.targetCurrency === to   && r.baseCurrency === 'USD')?.rate ?? null);

    if (fromRate === null || toRate === null) return amt; // rate missing, return as-is

    const amountInUSD = amt / Number(fromRate);
    return amountInUSD * Number(toRate);
  }, [ratesData]);

  const totalBalance = accounts.reduce((sum, a) => sum + convertAmount(a.balance, a.currency, currency), 0);
  const totalAssets = accounts
    .filter((a) => a.balance > 0 && a.type !== 'CREDIT_CARD')
    .reduce((sum, a) => sum + convertAmount(a.balance, a.currency, currency), 0);
  const totalLiabilities = accounts
    .filter((a) => a.type === 'CREDIT_CARD' && a.balance > 0)
    .reduce((sum, a) => sum + convertAmount(a.balance, a.currency, currency), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Accounts"
        subtitle={`${accounts.length} account${accounts.length !== 1 ? 's' : ''} · Net balance ${format(totalBalance)}`}
        action={
          <Button onClick={openCreate} size="sm" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Account
          </Button>
        }
      />

      {/* Summary Stats */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center py-4">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Net Balance</p>
            <p className={cn('text-xl font-extrabold mt-1', totalBalance >= 0 ? 'text-slate-100' : 'text-red-400')}>
              {format(totalBalance)}
            </p>
          </Card>
          <Card className="text-center py-4">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Assets</p>
            <p className="text-xl font-extrabold text-emerald-400 mt-1">{format(totalAssets)}</p>
          </Card>
          <Card className="text-center py-4">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Credit Debt</p>
            <p className="text-xl font-extrabold text-red-400 mt-1">{format(totalLiabilities)}</p>
          </Card>
        </div>
      )}

      {/* Accounts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="space-y-4">
              <div className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-8 w-full" />
            </Card>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={<Wallet className="w-8 h-8" />}
          title="No accounts yet"
          description="Add your bank accounts, wallets, and credit cards to start tracking your finances."
          actionLabel="Add Your First Account"
          onAction={openCreate}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {accounts.map((account: Account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={openEdit}
              onDelete={(id, name) => setDeleteConfirm({ id, name })}
            />
          ))}
        </div>
      )}

      {/* Account Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); reset(); }}
        title={editingAccount ? 'Edit Account' : 'Add New Account'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Account Name"
            placeholder="e.g. Chase Checking"
            {...register('name')}
            error={errors.name?.message}
          />

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account Type</label>
            <div className="grid grid-cols-3 gap-2">
              {ACCOUNT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setValue('type', t.value)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all duration-200',
                    watch('type') === t.value
                      ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                      : 'border-slate-800 bg-slate-800/30 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  )}
                >
                  <span style={{ color: t.color }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Opening Balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('balance')}
              error={errors.balance?.message}
            />
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Currency
              </label>
              <select
                {...register('currency')}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer"
              >
                <option value="USD">🇺🇸 USD – US Dollar</option>
                <option value="EUR">🇪🇺 EUR – Euro</option>
                <option value="GBP">🇬🇧 GBP – British Pound</option>
                <option value="NGN">🇳🇬 NGN – Nigerian Naira</option>
                <option value="GHS">🇬🇭 GHS – Ghanaian Cedi</option>
                <option value="LRD">🇱🇷 LRD – Liberian Dollar</option>
                {/* Additional currencies from exchange rates not already listed */}
                {ratesData
                  ?.filter((r) => !['USD','EUR','GBP','NGN','GHS','LRD'].includes(r.targetCurrency))
                  .filter((r, i, self) => self.findIndex(x => x.targetCurrency === r.targetCurrency) === i)
                  .map((r) => (
                    <option key={r.targetCurrency} value={r.targetCurrency}>
                      {r.targetCurrency}
                    </option>
                  ))}
              </select>
              {errors.currency && (
                <p className="mt-1 text-xs text-red-400">{errors.currency.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={cn(
                    'w-7 h-7 rounded-full transition-all duration-200 border-2',
                    selectedColor === c ? 'border-white scale-110' : 'border-transparent scale-100'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <Input
            label="Notes (optional)"
            placeholder="Any notes about this account..."
            {...register('notes')}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              {...register('isDefault')}
              className="w-4 h-4 accent-indigo-500"
            />
            <label htmlFor="isDefault" className="text-xs font-semibold text-slate-300">
              Set as default account
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? 'Saving…' : editingAccount ? 'Save Changes' : 'Add Account'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Account"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This will soft-delete the account and hide it from your list.`}
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
}
