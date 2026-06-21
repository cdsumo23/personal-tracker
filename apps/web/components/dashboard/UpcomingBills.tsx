'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useBills } from '@/hooks/useBills';
import { useCurrency } from '@/hooks/useCurrency';
import { getDaysUntil, formatDate } from '@/lib/utils';
import { Bell, CalendarClock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Bill } from '@/types';

function BillRow({ bill, format }: { bill: Bill; format: (n: number) => string }) {
 const daysLeft = getDaysUntil(bill.nextDueDate);
 const isOverdue = daysLeft < 0;
 const isUrgent = daysLeft >= 0 && daysLeft <= 3;
 const isUpcoming = daysLeft > 3 && daysLeft <= 7;

 const statusConfig = bill.isPaid
 ? { label: 'Paid', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: <CheckCircle2 className="w-3 h-3" /> }
 : isOverdue
 ? { label: 'Overdue', color: 'text-red-400', bg: 'bg-red-500/10', icon: <AlertCircle className="w-3 h-3" /> }
 : isUrgent
 ? { label: `${daysLeft}d left`, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: <Bell className="w-3 h-3" /> }
 : { label: `${daysLeft}d`, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/60', icon: <CalendarClock className="w-3 h-3" /> };

 return (
 <div className="flex items-center justify-between py-2.5 border-b border-slate-200 dark:border-slate-800/50 last:border-0 hover:bg-slate-100 dark:hover:bg-slate-800/20 px-1 rounded-xl transition-colors">
 <div className="flex items-center gap-3 min-w-0">
 <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center flex-shrink-0 text-slate-500 dark:text-slate-400 text-sm">
 {bill.isPaid ? '✓' : '🧾'}
 </div>
 <div className="min-w-0">
 <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{bill.name}</p>
 <p className="text-[10px] text-slate-500 mt-0.5">Due {formatDate(bill.nextDueDate, 'MMM d')}</p>
 </div>
 </div>
 <div className="flex items-center gap-2 flex-shrink-0 ml-2">
 <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{format(bill.amount)}</span>
 <span className={cn('flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full', statusConfig.bg, statusConfig.color)}>
 {statusConfig.icon}
 {statusConfig.label}
 </span>
 </div>
 </div>
 );
}

export function UpcomingBills() {
 const { format } = useCurrency();
 const { bills, isLoading } = useBills({ status: 'upcoming' });

 if (isLoading) {
 return (
 <Card className="flex flex-col gap-3">
 <Skeleton className="h-4 w-1/3 mb-2" />
 {Array.from({ length: 4 }).map((_, i) => (
 <div key={i} className="flex items-center justify-between py-2">
 <div className="flex items-center gap-3">
 <Skeleton className="w-8 h-8 rounded-xl" />
 <div className="space-y-1">
 <Skeleton className="h-3 w-28" />
 <Skeleton className="h-2 w-16" />
 </div>
 </div>
 <Skeleton className="h-5 w-16" />
 </div>
 ))}
 </Card>
 );
 }

 const upcomingBills = bills
 .filter((b) => !b.isPaid)
 .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
 .slice(0, 6);

 const totalDue = upcomingBills.reduce((sum, b) => sum + b.amount, 0);
 const overdueBills = upcomingBills.filter((b) => getDaysUntil(b.nextDueDate) < 0);

 return (
 <Card className="hover:border-slate-300 dark:border-slate-700/60 transition-all duration-300">
 <div className="flex items-center justify-between mb-4">
 <div>
 <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
 <Bell className="w-4 h-4" />
 Upcoming Bills
 </h3>
 <p className="text-xs text-slate-500 mt-0.5">
 {upcomingBills.length} bill{upcomingBills.length !== 1 ? 's' : ''} · Total{' '}
 <span className="text-slate-600 dark:text-slate-300 font-semibold">{format(totalDue)}</span>
 {overdueBills.length > 0 && (
 <span className="text-red-400 font-bold ml-2">· {overdueBills.length} overdue</span>
 )}
 </p>
 </div>
 <Link href="/bills" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
 Manage
 </Link>
 </div>

 {upcomingBills.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-8 text-center">
 <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-3">
 <Bell className="w-5 h-5 text-slate-500" />
 </div>
 <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No upcoming bills</p>
 <p className="text-[10px] text-slate-500 mt-1">All bills are paid or no bills configured.</p>
 <Link href="/bills" className="mt-3 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
 Add Bills
 </Link>
 </div>
 ) : (
 <div>
 {upcomingBills.map((bill: Bill) => (
 <BillRow key={bill.id} bill={bill} format={format} />
 ))}
 </div>
 )}
 </Card>
 );
}
