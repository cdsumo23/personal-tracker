'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTransactions } from '@/hooks/useTransactions';
import { useCurrency } from '@/hooks/useCurrency';
import { formatRelativeDate } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, ReceiptText } from 'lucide-react';
import Link from 'next/link';
import type { Transaction } from '@/types';
import { cn } from '@/lib/utils';

function TransactionRow({ tx, format }: { tx: Transaction; format: (n: number) => string }) {
 const isIncome = tx.type === 'INCOME';
 const isTransfer = tx.type === 'TRANSFER';

 const icon = isTransfer
 ? <ArrowLeftRight className="w-4 h-4" />
 : isIncome
 ? <ArrowUpRight className="w-4 h-4" />
 : <ArrowDownRight className="w-4 h-4" />;

 const iconBg = isTransfer
 ? 'bg-blue-500/10 text-blue-400'
 : isIncome
 ? 'bg-emerald-500/10 text-emerald-400'
 : 'bg-rose-500/10 text-rose-400';

 const amountColor = isIncome
 ? 'text-emerald-400'
 : isTransfer
 ? 'text-blue-400'
 : 'text-rose-400';

 const amountPrefix = isIncome ? '+' : isTransfer ? '↔' : '-';

 return (
 <div className="flex items-center gap-3 py-2.5 border-b border-slate-200 dark:border-slate-800/50 last:border-b-0 hover:bg-slate-100 dark:hover:bg-slate-800/20 px-1 rounded-xl transition-colors">
 <div className={cn('p-2 rounded-xl flex-shrink-0', iconBg)}>
 {icon}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{tx.description}</p>
 <p className="text-[10px] text-slate-500 mt-0.5">
 {tx.category?.name && <span className="text-slate-500 dark:text-slate-400 font-medium">{tx.category.name} · </span>}
 {formatRelativeDate(tx.date)}
 </p>
 </div>
 <div className="text-right flex-shrink-0">
 <p className={cn('text-xs font-extrabold tracking-tight', amountColor)}>
 {amountPrefix}{format(tx.amount)}
 </p>
 {tx.account?.name && (
 <p className="text-[10px] text-slate-500 truncate max-w-[80px] text-right">{tx.account.name}</p>
 )}
 </div>
 </div>
 );
}

export function RecentTransactions() {
 const { format } = useCurrency();
 const { transactions, isLoading } = useTransactions({ limit: 8, sortBy: 'date', sortOrder: 'desc' });

 if (isLoading) {
 return (
 <Card className="flex flex-col gap-3">
 <Skeleton className="h-4 w-1/3" />
 {Array.from({ length: 5 }).map((_, i) => (
 <div key={i} className="flex items-center gap-3 py-2">
 <Skeleton className="w-8 h-8 rounded-xl" />
 <div className="flex-1 space-y-1.5">
 <Skeleton className="h-3 w-3/4" />
 <Skeleton className="h-2 w-1/2" />
 </div>
 <Skeleton className="h-4 w-16" />
 </div>
 ))}
 </Card>
 );
 }

 return (
 <Card className="hover:border-slate-300 dark:border-slate-700/60 transition-all duration-300">
 <div className="flex items-center justify-between mb-4">
 <div>
 <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
 <ReceiptText className="w-4 h-4" />
 Recent Transactions
 </h3>
 <p className="text-xs text-slate-500 mt-0.5">Latest financial activity</p>
 </div>
 <Link
 href="/transactions"
 className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
 >
 View All
 </Link>
 </div>

 {transactions.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-10 text-center">
 <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-3">
 <ReceiptText className="w-5 h-5 text-slate-500" />
 </div>
 <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No transactions yet</p>
 <p className="text-[10px] text-slate-500 mt-1">Record your first transaction to get started.</p>
 <Link href="/transactions" className="mt-3 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
 Add Transaction
 </Link>
 </div>
 ) : (
 <div className="divide-y divide-slate-800/0">
 {transactions.map((tx: Transaction) => (
 <TransactionRow key={tx.id} tx={tx} format={format} />
 ))}
 </div>
 )}
 </Card>
 );
}
