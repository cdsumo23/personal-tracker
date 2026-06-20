import * as React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

interface CashFlowReportProps {
  data: any[];
  isLoading: boolean;
}

export function CashFlowReport({ data, isLoading }: CashFlowReportProps) {
  const user = useAuthStore((state) => state.user);
  const currency = user?.currency || 'USD';

  if (isLoading) {
    return (
      <div className="h-72 flex items-center justify-center text-xs text-slate-500">
        Loading Cash Flow Report Chart...
      </div>
    );
  }

  const chartData = data || [];

  if (chartData.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-xs text-slate-500">
        No historical cash flow data found.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
          <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} />
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
            formatter={(val) => [formatCurrency(Number(val), currency)]}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorIncome)"
          />
          <Area
            type="monotone"
            dataKey="expense"
            name="Expenses"
            stroke="#ef4444"
            fillOpacity={1}
            fill="url(#colorExpense)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export default CashFlowReport;
