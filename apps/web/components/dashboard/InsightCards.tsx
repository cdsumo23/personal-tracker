'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { useDashboard } from '@/hooks/useDashboard';
import { useCurrency } from '@/hooks/useCurrency';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  TrendingDown, TrendingUp, AlertTriangle, Target,
  CreditCard, Lightbulb, PiggyBank, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightItem {
  id: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function InsightCards() {
  const { format } = useCurrency();
  const { stats, isLoading } = useDashboard();

  const insights: InsightItem[] = React.useMemo(() => {
    if (!stats) return [];
    const items: InsightItem[] = [];

    // 1. Savings rate
    if (stats.monthlyIncome > 0) {
      const savingsRate = ((stats.monthlyIncome - stats.monthlyExpenses) / stats.monthlyIncome) * 100;
      if (savingsRate >= 20) {
        items.push({
          id: 'savings-rate',
          type: 'success',
          icon: <PiggyBank className="w-4 h-4" />,
          title: `${savingsRate.toFixed(0)}% Savings Rate`,
          description: 'Great job! You are saving more than 20% of your income this month.',
        });
      } else if (savingsRate < 0) {
        items.push({
          id: 'overspending',
          type: 'danger',
          icon: <TrendingDown className="w-4 h-4" />,
          title: 'Overspending Alert',
          description: `You spent ${format(Math.abs(stats.monthlyExpenses - stats.monthlyIncome))} more than you earned this month.`,
        });
      } else {
        items.push({
          id: 'savings-low',
          type: 'warning',
          icon: <TrendingUp className="w-4 h-4" />,
          title: 'Savings Below Target',
          description: `Aim to save at least 20% of your income. Currently at ${savingsRate.toFixed(0)}%.`,
        });
      }
    }

    // 2. Budget status
    const budgetUsage = (stats as any).budgetUsage;
    if (budgetUsage && budgetUsage.percentage > 0) {
      if (budgetUsage.percentage > 100) {
        items.push({
          id: 'budget-over',
          type: 'danger',
          icon: <AlertTriangle className="w-4 h-4" />,
          title: 'Budget Exceeded',
          description: `You have exceeded your budget by ${(budgetUsage.percentage - 100).toFixed(0)}%. Consider adjusting your spending.`,
        });
      } else if (budgetUsage.percentage > 80) {
        items.push({
          id: 'budget-warning',
          type: 'warning',
          icon: <CreditCard className="w-4 h-4" />,
          title: 'Budget 80% Used',
          description: `${format(budgetUsage.spent)} of ${format(budgetUsage.allocated)} spent. Be cautious with remaining days.`,
        });
      }
    }

    // 3. Net worth
    if (stats.netWorth > 0) {
      items.push({
        id: 'net-worth',
        type: 'success',
        icon: <CheckCircle2 className="w-4 h-4" />,
        title: 'Positive Net Worth',
        description: `Your assets exceed liabilities by ${format(stats.netWorth)}. Keep building your wealth.`,
      });
    } else if (stats.netWorth < 0) {
      items.push({
        id: 'net-worth-neg',
        type: 'danger',
        icon: <AlertTriangle className="w-4 h-4" />,
        title: 'Negative Net Worth',
        description: `Your liabilities exceed assets by ${format(Math.abs(stats.netWorth))}. Prioritize debt reduction.`,
      });
    }

    // 4. Savings goals progress
    const savingsProgress = (stats as any).savingsProgress;
    if (savingsProgress && savingsProgress.percentage > 0) {
      items.push({
        id: 'goals-progress',
        type: 'info',
        icon: <Target className="w-4 h-4" />,
        title: `${savingsProgress.percentage.toFixed(0)}% to Savings Goal`,
        description: `${format(savingsProgress.current)} saved of ${format(savingsProgress.target)} target across all goals.`,
      });
    }

    // 5. Upcoming bills
    const billsCount = (stats as any).upcomingBillsCount;
    if (billsCount > 0) {
      items.push({
        id: 'bills-upcoming',
        type: 'warning',
        icon: <AlertTriangle className="w-4 h-4" />,
        title: `${billsCount} Bill${billsCount !== 1 ? 's' : ''} Due Soon`,
        description: `You have ${billsCount} bill${billsCount !== 1 ? 's' : ''} due in the next 7 days. Review and pay on time.`,
      });
    }

    // If nothing, show a generic tip
    if (items.length === 0) {
      items.push({
        id: 'tip-1',
        type: 'info',
        icon: <Lightbulb className="w-4 h-4" />,
        title: 'Start Tracking',
        description: 'Add your accounts and transactions to unlock personalized financial insights.',
      });
    }

    return items.slice(0, 4);
  }, [stats, format]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="flex gap-3 p-4">
            <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-2/3" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const typeConfig = {
    success: {
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-500/10',
      icon: 'text-emerald-400',
      badge: 'text-emerald-400',
      dot: 'bg-emerald-400',
    },
    warning: {
      border: 'border-amber-500/20',
      bg: 'bg-amber-500/10',
      icon: 'text-amber-400',
      badge: 'text-amber-400',
      dot: 'bg-amber-400',
    },
    danger: {
      border: 'border-red-500/20',
      bg: 'bg-red-500/10',
      icon: 'text-red-400',
      badge: 'text-red-400',
      dot: 'bg-red-400',
    },
    info: {
      border: 'border-primary-500/20',
      bg: 'bg-primary-500/10',
      icon: 'text-primary-400',
      badge: 'text-primary-400',
      dot: 'bg-primary-400',
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {insights.map((insight) => {
        const cfg = typeConfig[insight.type];
        return (
          <Card
            key={insight.id}
            className={cn('flex gap-3 p-4 hover:border-slate-700/60 transition-all duration-300', cfg.border)}
          >
            <div className={cn('p-2 rounded-xl flex-shrink-0 self-start', cfg.bg, cfg.icon)}>
              {insight.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot)} />
                <p className={cn('text-xs font-extrabold', cfg.badge)}>{insight.title}</p>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{insight.description}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
