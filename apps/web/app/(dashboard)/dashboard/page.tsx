'use client';

import * as React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useCurrency } from '@/hooks/useCurrency';
import { StatCard } from '@/components/dashboard/StatCard';
import { FinancialHealthScore } from '@/components/dashboard/FinancialHealthScore';
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart';
import { SpendingBreakdown } from '@/components/dashboard/SpendingBreakdown';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { UpcomingBills } from '@/components/dashboard/UpcomingBills';
import { InsightCards } from '@/components/dashboard/InsightCards';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import {
 Wallet, TrendingUp, TrendingDown,
 BarChart3, Target, Bell, Sparkles
} from 'lucide-react';


function StatsSkeleton() {
 return (
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {Array.from({ length: 4 }).map((_, i) => (
 <Card key={i} className="flex flex-col gap-4">
 <div className="flex justify-between items-start">
 <div className="space-y-2">
 <Skeleton className="h-3 w-20" />
 <Skeleton className="h-6 w-28" />
 </div>
 <Skeleton className="w-10 h-10 rounded-2xl" />
 </div>
 <Skeleton className="h-4 w-full" />
 </Card>
 ))}
 </div>
 );
}

export default function DashboardPage() {
 const { stats, isLoading } = useDashboard();
 const { format } = useCurrency();

 const greeting = React.useMemo(() => {
 const hour = new Date().getHours();
 if (hour < 12) return 'Good morning';
 if (hour < 17) return 'Good afternoon';
 return 'Good evening';
 }, []);

 return (
 <div className="space-y-8">
 {/* Page Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
 {greeting} 👋
 </h1>
 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
 Here&apos;s your financial overview for today.
 </p>
 </div>
 <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl">
 <Sparkles className="w-3.5 h-3.5 text-primary-400" />
 <span>Live data · {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
 </div>
 </div>

 {/* Stats Row */}
 {isLoading ? (
 <StatsSkeleton />
 ) : (
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <StatCard
 title="Net Worth"
 value={format(stats?.netWorth ?? 0)}
 icon={<BarChart3 className="w-5 h-5" />}
 trend={stats?.netWorth !== undefined ? {
 value: 0,
 isPositive: stats.netWorth >= 0,
 } : undefined}
 description="Assets minus liabilities"
 />
 <StatCard
 title="Monthly Income"
 value={format(stats?.monthlyIncome ?? 0)}
 icon={<TrendingUp className="w-5 h-5" />}
 description="Current month earnings"
 />
 <StatCard
 title="Monthly Expenses"
 value={format(stats?.monthlyExpenses ?? 0)}
 icon={<TrendingDown className="w-5 h-5" />}
 description="Current month spending"
 />
 <StatCard
 title="Total Balance"
 value={format(stats?.totalAssets ?? 0)}
 icon={<Wallet className="w-5 h-5" />}
 description="Across all accounts"
 />
 </div>
 )}

 {/* Financial Health Score */}
 <FinancialHealthScore score={stats?.financialHealthScore ?? 75} />

 {/* Insights Row */}
 <div>
 <div className="flex items-center gap-2 mb-4">
 <Sparkles className="w-4 h-4 text-primary-400" />
 <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Financial Insights</h2>
 </div>
 <InsightCards />
 </div>

 {/* Charts Row: Cash Flow + Spending */}
 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
 <IncomeExpenseChart />
 <SpendingBreakdown />
 </div>

 {/* Budget + Recent Transactions Row */}
 <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
 <div className="xl:col-span-1">
 <BudgetProgress />
 </div>
 <div className="xl:col-span-2">
 <RecentTransactions />
 </div>
 </div>

 {/* Upcoming Bills */}
 <UpcomingBills />
 </div>
 );
}
