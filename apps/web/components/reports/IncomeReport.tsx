import * as React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

interface IncomeReportProps {
  data: any;
  isLoading: boolean;
}

export function IncomeReport({ data, isLoading }: IncomeReportProps) {
  const user = useAuthStore((state) => state.user);
  const currency = user?.currency || 'USD';

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        Loading Income Report Chart...
      </div>
    );
  }

  // Backend returns { total, breakdown: Array<{ name, amount, color }>, currency }
  const total: number = data?.total || 0;
  const rawBreakdown: any[] = data?.breakdown || [];
  const chartData = rawBreakdown.map((cat) => ({
    ...cat,
    percentage: total > 0 ? (cat.amount / total) * 100 : 0,
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        No income transactions logged for this period.
      </div>
    );
  }

  // Predefined colors for categories
  const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#059669', '#047857'];

  return (
    <div className="space-y-4">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
            <YAxis
              stroke="#475569"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '12px',
                color: '#f8fafc',
                fontSize: '11px',
              }}
              formatter={(val) => [formatCurrency(Number(val), currency), 'Amount']}
            />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {chartData.map((cat: any, index: number) => (
          <div
            key={cat.name}
            className="p-3 rounded-xl border border-slate-850 bg-slate-950/20 flex items-center justify-between text-xs"
          >
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="font-semibold text-slate-200">{cat.name}</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-100">{formatCurrency(cat.amount, currency)}</span>
              <span className="text-slate-500 block text-[9px]">{Math.round(cat.percentage || 0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default IncomeReport;
