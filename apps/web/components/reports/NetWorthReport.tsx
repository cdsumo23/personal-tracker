import * as React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

interface NetWorthReportProps {
 data: any[];
 isLoading: boolean;
}

export function NetWorthReport({ data, isLoading }: NetWorthReportProps) {
 const user = useAuthStore((state) => state.user);
 const currency = user?.currency || 'USD';

 if (isLoading) {
 return (
 <div className="h-72 flex items-center justify-center text-xs text-slate-500">
 Loading Net Worth Report Chart...
 </div>
 );
 }

 const chartData = data || [];

 if (chartData.length === 0) {
 return (
 <div className="h-72 flex items-center justify-center text-xs text-slate-500">
 No historical net worth snapshots found.
 </div>
 );
 }

 return (
 <div className="h-72 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #e2e8f0)" opacity={0.6} />
 <XAxis dataKey="snapshotDate" stroke="var(--text-secondary, #475569)" fontSize={10} tickLine={false} />
 <YAxis
 stroke="var(--text-secondary, #475569)"
 fontSize={10}
 tickLine={false}
 axisLine={false}
 tickFormatter={(val) => `$${val}`}
 />
 <Tooltip
 contentStyle={{
 backgroundColor: 'var(--bg-secondary, #ffffff)',
 borderColor: 'var(--border-color, #e2e8f0)',
 borderRadius: '12px',
 color: 'var(--text-primary, #0f172a)',
 fontSize: '11px',
 }}
 formatter={(val) => [formatCurrency(Number(val), currency)]}
 />
 <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
 <Line type="monotone" dataKey="totalAssets" name="Assets" stroke="#10b981" strokeWidth={2} activeDot={{ r: 4 }} />
 <Line type="monotone" dataKey="totalLiabilities" name="Liabilities" stroke="#ef4444" strokeWidth={2} />
 <Line type="monotone" dataKey="netWorth" name="Net Worth" stroke="#6366f1" strokeWidth={3} />
 </LineChart>
 </ResponsiveContainer>
 </div>
 );
}
export default NetWorthReport;
