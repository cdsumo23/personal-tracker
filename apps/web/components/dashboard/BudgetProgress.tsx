'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { useBudgets, useBudgetUsage } from '@/hooks/useBudgets';
import { useCurrency } from '@/hooks/useCurrency';
import { Skeleton } from '@/components/ui/Skeleton';
import { getStatusColor, calculatePercentage } from '@/lib/utils';
import { PiggyBank, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function BudgetProgress() {
 const [mounted, setMounted] = React.useState(false);
 const { format } = useCurrency();
 
 // 1. Fetch budgets
 const { budgets, isLoading: isBudgetsLoading } = useBudgets();

 // Find active or first budget
 const activeBudget = React.useMemo(() => {
 return budgets.find((b) => b.isActive) || budgets[0];
 }, [budgets]);

 // 2. Fetch usage for active budget
 const { usage, isLoading: isUsageLoading } = useBudgetUsage(activeBudget?.id || '');

 React.useEffect(() => {
 setMounted(true);
 }, []);

 if (!mounted || isBudgetsLoading || (activeBudget && isUsageLoading)) {
 return (
 <Card className="h-[380px] flex flex-col justify-between">
 <div className="space-y-2">
 <Skeleton className="h-4 w-1/3" />
 <Skeleton className="h-3 w-1/2" />
 </div>
 <div className="space-y-4 my-4">
 <Skeleton className="h-6 w-full" />
 <Skeleton className="h-6 w-full" />
 <Skeleton className="h-6 w-full" />
 </div>
 </Card>
 );
 }

 if (!activeBudget || !usage) {
 return (
 <Card className="flex flex-col justify-between h-[380px] hover:border-slate-300 dark:border-slate-700/60 transition-all duration-300">
 <div>
 <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
 Budget Progress
 </h3>
 <p className="text-xs text-slate-500 mt-0.5">Track your limits by category</p>
 </div>

 <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
 <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-3 text-slate-500">
 <PiggyBank className="w-6 h-6 text-slate-500 dark:text-slate-400" />
 </div>
 <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No active budgets found</p>
 <p className="text-[10px] text-slate-500 max-w-[220px] mt-1 mb-4">
 Set spending targets for your categories to prevent overspending.
 </p>
 <Link
 href="/budgets"
 className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
 >
 Create a Budget <ArrowUpRight className="w-3.5 h-3.5" />
 </Link>
 </div>
 </Card>
 );
 }

 const { allocated, spent, percentage, categories } = usage;
 const status = getStatusColor(percentage);

 return (
 <Card className="hover:border-slate-300 dark:border-slate-700/60 transition-all duration-300 flex flex-col justify-between h-[380px]">
 <div>
 <div className="flex justify-between items-start">
 <div>
 <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
 Budget Progress
 </h3>
 <p className="text-xs text-slate-500 mt-0.5">
 Active: <span className="text-slate-600 dark:text-slate-300 font-semibold">{activeBudget.name}</span>
 </p>
 </div>
 <Link
 href="/budgets"
 className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
 >
 Manage
 </Link>
 </div>

 {/* Overall Progress Gauge */}
 <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/60 flex items-center justify-between">
 <div className="space-y-1">
 <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Overall Limit</p>
 <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
 <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{format(spent)}</span> of {format(allocated)}
 </p>
 </div>
 <span className={`text-sm font-black px-2.5 py-1 rounded-xl ${status.bg} ${status.text}`}>
 {percentage.toFixed(0)}%
 </span>
 </div>
 </div>

 {/* Category Progress Bars */}
 <div className="flex-1 overflow-y-auto max-h-[190px] mt-4 space-y-4 pr-1 custom-scrollbar">
 {categories.length === 0 ? (
 <p className="text-xs text-slate-500 text-center py-4">No categories configured in budget.</p>
 ) : (
 categories.map((cat, idx) => {
 const catStatus = getStatusColor(cat.percentage);
 return (
 <div key={cat.categoryId + idx} className="space-y-1.5">
 <div className="flex justify-between text-xs">
 <div className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-300">
 <span
 className="w-2.5 h-2.5 rounded-full flex-shrink-0"
 style={{ backgroundColor: cat.color }}
 />
 <span>{cat.name}</span>
 </div>
 <div className="text-slate-500 dark:text-slate-400 font-medium">
 <span className="font-extrabold text-slate-800 dark:text-slate-200">{format(cat.spent)}</span>
 <span className="text-slate-500 text-[10px] font-bold"> / {format(cat.allocated)}</span>
 </div>
 </div>

 {/* Progress Bar Track */}
 <div className="h-2 w-full bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden relative">
 <div
 className={`h-full rounded-full transition-all duration-500`}
 style={{
 width: `${Math.min(cat.percentage, 100)}%`,
 backgroundColor: cat.color,
 }}
 />
 </div>
 </div>
 );
 })
 )}
 </div>
 </Card>
 );
}
