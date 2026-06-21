'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { currencyApi, type ExchangeRate } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import {
 RefreshCw, Pencil, Check, X, Info, Globe, Plus, DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────
// Supported currencies with metadata
// ─────────────────────────────────────────────
const CURRENCY_META: Record<string, { name: string; symbol: string; flag: string }> = {
 USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
 EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺' },
 GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧' },
 LRD: { name: 'Liberian Dollar', symbol: 'L$', flag: '🇱🇷' },
 NGN: { name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
 GHS: { name: 'Ghanaian Cedi', symbol: 'GH₵', flag: '🇬🇭' },
};

const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_META);

// ─────────────────────────────────────────────
// Single editable rate row
// ─────────────────────────────────────────────
function RateRow({
 rate,
 onSave,
 isSaving,
}: {
 rate: ExchangeRate;
 onSave: (base: string, target: string, newRate: number) => void;
 isSaving: boolean;
}) {
 const [editing, setEditing] = React.useState(false);
 const [value, setValue] = React.useState(rate.rate.toString());
 const meta = CURRENCY_META[rate.targetCurrency];
 const isBase = rate.targetCurrency === rate.baseCurrency;

 const handleSave = () => {
 const parsed = parseFloat(value);
 if (isNaN(parsed) || parsed <= 0) {
 toast.error('Rate must be a positive number');
 return;
 }
 onSave(rate.baseCurrency, rate.targetCurrency, parsed);
 setEditing(false);
 };

 const handleCancel = () => {
 setValue(rate.rate.toString());
 setEditing(false);
 };

 return (
 <div
 className={cn(
 'flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-200',
 editing
 ? 'border-violet-500/50 bg-violet-500/5'
 : 'border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/60'
 )}
 >
 {/* Flag + Currency */}
 <div className="flex items-center gap-3 w-52 flex-shrink-0">
 <span className="text-2xl">{meta?.flag ?? '🌐'}</span>
 <div>
 <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
 {rate.targetCurrency}
 {isBase && (
 <span className="ml-2 text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
 BASE
 </span>
 )}
 </p>
 <p className="text-[11px] text-slate-500">{meta?.name ?? rate.targetCurrency}</p>
 </div>
 </div>

 {/* Rate display / edit */}
 <div className="flex items-center gap-3 flex-1">
 <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap">1 USD =</span>
 {editing ? (
 <input
 type="number"
 value={value}
 onChange={(e) => setValue(e.target.value)}
 step="0.0001"
 min="0.0001"
 autoFocus
 className="w-40 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-violet-500/60 text-slate-900 dark:text-slate-100 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
 />
 ) : (
 <span className="font-mono text-base font-bold text-slate-900 dark:text-slate-100">
 {meta?.symbol ?? ''}{Number(rate.rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
 </span>
 )}
 <span className="text-[11px] text-slate-500">{rate.targetCurrency}</span>
 </div>

 {/* Last updated */}
 <div className="hidden md:block text-right w-36 flex-shrink-0">
 <p className="text-[11px] text-slate-500">
 {new Date(rate.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
 </p>
 </div>

 {/* Actions */}
 <div className="flex items-center gap-2 flex-shrink-0">
 {editing ? (
 <>
 <button
 onClick={handleSave}
 disabled={isSaving}
 className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
 title="Save"
 >
 <Check className="w-4 h-4" />
 </button>
 <button
 onClick={handleCancel}
 className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
 title="Cancel"
 >
 <X className="w-4 h-4" />
 </button>
 </>
 ) : (
 <button
 onClick={() => { setValue(rate.rate.toString()); setEditing(true); }}
 className="p-2 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
 title="Edit rate"
 >
 <Pencil className="w-4 h-4" />
 </button>
 )}
 </div>
 </div>
 );
}

// ─────────────────────────────────────────────
// Add New Rate panel
// ─────────────────────────────────────────────
function AddRatePanel({ existingTargets, onSave, isSaving }: {
 existingTargets: string[];
 onSave: (base: string, target: string, rate: number) => void;
 isSaving: boolean;
}) {
 const [open, setOpen] = React.useState(false);
 const [base, setBase] = React.useState('USD');
 const [target, setTarget] = React.useState('');
 const [rate, setRate] = React.useState('');

 const handleSave = () => {
 if (!target || !rate) { toast.error('Fill in all fields'); return; }
 const parsed = parseFloat(rate);
 if (isNaN(parsed) || parsed <= 0) { toast.error('Rate must be a positive number'); return; }
 if (target.length < 3) { toast.error('Enter a valid 3-letter currency code'); return; }
 onSave(base.toUpperCase(), target.toUpperCase(), parsed);
 setTarget('');
 setRate('');
 setOpen(false);
 };

 if (!open) {
 return (
 <button
 onClick={() => setOpen(true)}
 className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-violet-500 dark:hover:text-violet-400 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all duration-200 text-sm font-medium"
 >
 <Plus className="w-4 h-4" /> Add Custom Rate
 </button>
 );
 }

 return (
 <div className="flex flex-wrap items-end gap-3 px-5 py-4 rounded-xl border border-violet-500/50 bg-violet-500/5">
 <div className="flex flex-col gap-1">
 <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Base</label>
 <input
 type="text"
 value={base}
 maxLength={3}
 onChange={(e) => setBase(e.target.value.toUpperCase())}
 className="w-20 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-sm font-mono uppercase focus:outline-none focus:border-violet-500"
 />
 </div>
 <div className="flex flex-col gap-1">
 <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Target Currency</label>
 <input
 type="text"
 placeholder="e.g. XOF"
 value={target}
 maxLength={3}
 onChange={(e) => setTarget(e.target.value.toUpperCase())}
 className="w-28 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-sm font-mono uppercase focus:outline-none focus:border-violet-500"
 />
 </div>
 <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
 <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Rate (1 {base} =)</label>
 <input
 type="number"
 placeholder="e.g. 195.50"
 value={rate}
 step="0.0001"
 min="0.0001"
 onChange={(e) => setRate(e.target.value)}
 className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-sm font-mono focus:outline-none focus:border-violet-500"
 />
 </div>
 <button
 onClick={handleSave}
 disabled={isSaving}
 className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition-colors disabled:opacity-50"
 >
 {isSaving ? 'Saving…' : 'Save'}
 </button>
 <button
 onClick={() => setOpen(false)}
 className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
 >
 Cancel
 </button>
 </div>
 );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export default function CurrencyPage() {
 const queryClient = useQueryClient();

 const { data: ratesData, isLoading } = useQuery({
 queryKey: ['exchange-rates'],
 queryFn: async () => {
 const res = await currencyApi.getRates();
 return res.data.data as ExchangeRate[];
 },
 });

 const upsertMutation = useMutation({
 mutationFn: (data: { baseCurrency: string; targetCurrency: string; rate: number }) =>
 currencyApi.upsertRate(data),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['exchange-rates'] });
 queryClient.invalidateQueries({ queryKey: ['accounts'] });
 queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
 queryClient.invalidateQueries({ queryKey: ['report-income'] });
 queryClient.invalidateQueries({ queryKey: ['report-expense'] });
 queryClient.invalidateQueries({ queryKey: ['report-cashflow'] });
 toast.success('Exchange rate updated!');
 },
 onError: (err: any) => {
 toast.error(err?.response?.data?.message ?? 'Failed to update rate');
 },
 });

 const handleSave = (base: string, target: string, rate: number) => {
 upsertMutation.mutate({ baseCurrency: base, targetCurrency: target, rate });
 };

 const rates = ratesData ?? [];
 const existingTargets = rates.map((r) => r.targetCurrency);

 // Sort: supported currencies first, then alphabetically
 const sortedRates = [...rates].sort((a, b) => {
 const aSupported = SUPPORTED_CURRENCIES.includes(a.targetCurrency) ? 0 : 1;
 const bSupported = SUPPORTED_CURRENCIES.includes(b.targetCurrency) ? 0 : 1;
 if (aSupported !== bSupported) return aSupported - bSupported;
 return a.targetCurrency.localeCompare(b.targetCurrency);
 });

 // Ensure all supported currencies are seeded in the list (for UI)
 const missingCurrencies = SUPPORTED_CURRENCIES.filter(
 (c) => !existingTargets.includes(c)
 );

 return (
 <div className="space-y-8">
 <PageHeader
 title="Exchange Rates"
 subtitle="Set and update rates used to convert account balances to your base currency"
 action={
 <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg">
 <Globe className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
 Base: <span className="text-violet-600 dark:text-violet-400 font-bold">USD</span>
 </div>
 }
 />

 {/* Info banner */}
 <Card className="flex items-start gap-3 py-4 px-5 border-amber-500/30 bg-amber-500/5">
 <Info className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
 <div className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
 All exchange rates are stored relative to <strong className="text-amber-600 dark:text-amber-400">1 USD</strong>. When
 you have accounts in different currencies (e.g. USD and LRD), the system will automatically convert
 each account's balance into your <strong className="text-slate-800 dark:text-slate-200">profile base currency</strong> before
 computing totals, so your dashboard always shows accurate, unified figures.
 </div>
 </Card>

 {/* Rates List */}
 <Card className="p-0 overflow-hidden">
 {/* Header */}
 <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700/60">
 <div>
 <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Configured Rates</h2>
 <p className="text-[11px] text-slate-500 mt-0.5">{rates.length} rate{rates.length !== 1 ? 's' : ''} stored</p>
 </div>
 <DollarSign className="w-4 h-4 text-slate-600" />
 </div>

 <div className="p-4 space-y-2">
 {isLoading ? (
 Array.from({ length: 6 }).map((_, i) => (
 <Skeleton key={i} className="h-16 rounded-xl" />
 ))
 ) : sortedRates.length === 0 ? (
 <div className="text-center py-12 text-slate-500">
 <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
 <p className="text-sm">No exchange rates configured yet.</p>
 <p className="text-xs mt-1">Add a rate below to get started.</p>
 </div>
 ) : (
 sortedRates.map((rate) => (
 <RateRow
 key={`${rate.baseCurrency}-${rate.targetCurrency}`}
 rate={rate}
 onSave={handleSave}
 isSaving={upsertMutation.isPending}
 />
 ))
 )}

 {/* Missing supported currencies — add stubs */}
 {!isLoading && missingCurrencies.length > 0 && (
 <div className="pt-2">
 <p className="text-[10px] uppercase font-bold text-slate-600 tracking-widest px-1 mb-2">
 Not yet configured
 </p>
 {missingCurrencies.map((code) => {
 const meta = CURRENCY_META[code];
 return (
 <div
 key={code}
 className="flex items-center gap-4 px-5 py-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 opacity-50"
 >
 <span className="text-2xl">{meta.flag}</span>
 <div className="flex-1">
 <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{code}</p>
 <p className="text-[11px] text-slate-600">{meta.name} — no rate set</p>
 </div>
 <button
 onClick={() =>
 upsertMutation.mutate({ baseCurrency: 'USD', targetCurrency: code, rate: 1 })
 }
 className="text-[11px] text-violet-400 hover:text-violet-300 border border-violet-500/30 px-2 py-1 rounded-lg hover:bg-violet-500/10 transition-colors"
 >
 + Add default
 </button>
 </div>
 );
 })}
 </div>
 )}

 {/* Add custom rate */}
 {!isLoading && (
 <div className="pt-2">
 <AddRatePanel
 existingTargets={existingTargets}
 onSave={handleSave}
 isSaving={upsertMutation.isPending}
 />
 </div>
 )}
 </div>
 </Card>

 {/* Converter widget */}
 <QuickConverter rates={rates} />
 </div>
 );
}

// ─────────────────────────────────────────────
// Quick converter widget
// ─────────────────────────────────────────────
function QuickConverter({ rates }: { rates: ExchangeRate[] }) {
 const [amount, setAmount] = React.useState('100');
 const [from, setFrom] = React.useState('LRD');
 const [to, setTo] = React.useState('USD');
 const [result, setResult] = React.useState<number | null>(null);

 const allCodes = Array.from(new Set(rates.flatMap((r) => [r.baseCurrency, r.targetCurrency])));

 const convert = () => {
 const val = parseFloat(amount);
 if (isNaN(val) || from === to) { setResult(val); return; }

 const rateMap: Record<string, number> = {};
 rates.forEach((r) => {
 if (r.baseCurrency === 'USD') rateMap[r.targetCurrency] = Number(r.rate);
 });

 const fromRate = rateMap[from];
 const toRate = rateMap[to];
 if (!fromRate || !toRate) { toast.error(`Rate not configured for ${from} or ${to}`); return; }

 const inUSD = val / fromRate;
 setResult(inUSD * toRate);
 };

 return (
 <Card>
 <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Quick Converter</h3>
 <div className="flex flex-wrap items-end gap-3">
 <div className="flex flex-col gap-1">
 <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Amount</label>
 <input
 type="number"
 value={amount}
 onChange={(e) => setAmount(e.target.value)}
 className="w-32 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-sm font-mono focus:outline-none focus:border-violet-500"
 />
 </div>
 <div className="flex flex-col gap-1">
 <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">From</label>
 <select
 value={from}
 onChange={(e) => setFrom(e.target.value)}
 className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-violet-500"
 >
 {allCodes.map((c) => <option key={c} value={c}>{c}</option>)}
 </select>
 </div>
 <div className="flex flex-col gap-1">
 <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">To</label>
 <select
 value={to}
 onChange={(e) => setTo(e.target.value)}
 className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-violet-500"
 >
 {allCodes.map((c) => <option key={c} value={c}>{c}</option>)}
 </select>
 </div>
 <button
 onClick={convert}
 className="px-5 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition-colors"
 >
 Convert
 </button>
 {result !== null && (
 <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
 <span className="text-[11px] text-slate-500">=</span>
 <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
 {result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {to}
 </span>
 </div>
 )}
 </div>
 </Card>
 );
}
