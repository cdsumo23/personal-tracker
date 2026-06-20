'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { useReports } from '@/hooks/useReports';
import { useCurrency } from '@/hooks/useCurrency';
import { Skeleton } from '@/components/ui/Skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function IncomeExpenseChart() {
  const [mounted, setMounted] = React.useState(false);
  const { format } = useCurrency();
  const { cashFlow, isCashFlowLoading } = useReports({ months: 6 });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isCashFlowLoading) {
    return (
      <Card className="h-[350px] flex flex-col justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-[220px] w-full" />
      </Card>
    );
  }

  const data = cashFlow || [];

  // Calculate totals for summary
  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = data.reduce((sum, item) => sum + item.expense, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-xs font-bold text-slate-400 mb-2">{payload[0].payload.month}</p>
          <div className="space-y-1 text-xs">
            <p className="flex justify-between items-center gap-4">
              <span className="text-emerald-400 font-medium">Income:</span>
              <span className="font-extrabold text-slate-100">{format(payload[0].value)}</span>
            </p>
            <p className="flex justify-between items-center gap-4">
              <span className="text-rose-400 font-medium">Expenses:</span>
              <span className="font-extrabold text-slate-100">{format(payload[1].value)}</span>
            </p>
            <p className="flex justify-between items-center gap-4 border-t border-slate-800 pt-1 mt-1">
              <span className="text-slate-400 font-medium">Net:</span>
              <span className={`font-extrabold ${payload[0].payload.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {format(payload[0].payload.netCashFlow)}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="hover:border-slate-700/60 transition-all duration-300 flex flex-col justify-between h-[380px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            Cash Flow Trends
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Last 6 months cash flow activity</p>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Income</p>
              <p className="text-xs font-extrabold text-slate-200">{format(totalIncome)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Expenses</p>
              <p className="text-xs font-extrabold text-slate-200">{format(totalExpense)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.15 }} />
            <Bar
              dataKey="income"
              name="Income"
              fill="url(#incomeGrad)"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="expense"
              name="Expenses"
              fill="url(#expenseGrad)"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
