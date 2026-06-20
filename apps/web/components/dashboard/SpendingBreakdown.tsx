'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { useReports } from '@/hooks/useReports';
import { useCurrency } from '@/hooks/useCurrency';
import { Skeleton } from '@/components/ui/Skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { startOfMonth, endOfMonth } from 'date-fns';

export function SpendingBreakdown() {
  const [mounted, setMounted] = React.useState(false);
  const { format } = useCurrency();

  // Get current month date range
  const dateRange = React.useMemo(() => {
    const now = new Date();
    return {
      startDate: startOfMonth(now).toISOString(),
      endDate: endOfMonth(now).toISOString(),
    };
  }, []);

  const { expenseReport, isExpenseLoading } = useReports(dateRange);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isExpenseLoading) {
    return (
      <Card className="h-[380px] flex flex-col justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="flex justify-center items-center h-[240px]">
          <Skeleton className="rounded-full w-40 h-40" />
        </div>
      </Card>
    );
  }

  const report = expenseReport as any;
  const total = report?.total || 0;
  const data = report?.breakdown || [];

  // Sort descending by amount
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, amount, color } = payload[0].payload;
      const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : '0';
      return (
        <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl shadow-xl backdrop-blur-md text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-bold text-slate-200">{name}</span>
          </div>
          <p className="flex justify-between items-center gap-4">
            <span className="text-slate-400 font-medium">Spent:</span>
            <span className="font-extrabold text-slate-100">{format(amount)}</span>
          </p>
          <p className="flex justify-between items-center gap-4">
            <span className="text-slate-400 font-medium">Share:</span>
            <span className="font-extrabold text-slate-300">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="hover:border-slate-700/60 transition-all duration-300 flex flex-col justify-between h-[380px]">
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          Spending Breakdown
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">Categorized expenses this month</p>
      </div>

      {sortedData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-16 h-16 rounded-full bg-slate-800/40 border border-slate-800 flex items-center justify-center mb-3 text-slate-500">
            📊
          </div>
          <p className="text-xs font-semibold text-slate-400">No expenses recorded yet</p>
          <p className="text-[10px] text-slate-500 max-w-[200px] mt-1">
            Log your transactions to see a visual breakdown of your spending habits.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 mt-2">
          {/* Donut Chart */}
          <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sortedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="amount"
                >
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</span>
              <span className="text-base font-black text-slate-100 tracking-tight mt-0.5">
                {format(total)}
              </span>
            </div>
          </div>

          {/* Custom Scrollable Legend */}
          <div className="flex-1 overflow-y-auto max-h-[180px] w-full px-2 space-y-2.5 custom-scrollbar">
            {sortedData.map((item, index) => {
              const pct = total > 0 ? (item.amount / total) * 100 : 0;
              return (
                <div key={item.name + index} className="flex items-center justify-between text-xs group">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-300 font-semibold truncate group-hover:text-slate-100 transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="font-bold text-slate-200">{format(item.amount)}</span>
                    <span className="text-slate-500 text-[10px] font-bold ml-1.5">{pct.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
