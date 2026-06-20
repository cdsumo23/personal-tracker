'use client';

import * as React from 'react';
import { useReports } from '@/hooks/useReports';
import { useQuery } from '@tanstack/react-query';
import { reportsApi, exportApi } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { DatePicker } from '@/components/ui/DatePicker';
import { Button } from '@/components/ui/Button';
import { IncomeReport } from '@/components/reports/IncomeReport';
import { ExpenseReport } from '@/components/reports/ExpenseReport';
import { CashFlowReport } from '@/components/reports/CashFlowReport';
import { NetWorthReport } from '@/components/reports/NetWorthReport';
import { useAuthStore } from '@/store/auth.store';
import { format, subMonths, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { Download, Calendar, BarChart2, PieChart, TrendingUp, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const user = useAuthStore((state) => state.user);

  // Default range: last 6 months
  const [startDate, setStartDate] = React.useState<Date>(startOfMonth(subMonths(new Date(), 5)));
  const [endDate, setEndDate] = React.useState<Date>(endOfMonth(new Date()));
  const [activeTab, setActiveTab] = React.useState<'income' | 'expense' | 'cashflow' | 'networth'>('income');
  const [isExporting, setIsExporting] = React.useState(false);

  const formatApiDate = (date: Date) => format(date, 'yyyy-MM-dd');

  const reportParams = {
    startDate: formatApiDate(startDate),
    endDate: formatApiDate(endDate),
  };

  // Fetch standard reports using hook
  const { incomeReport, isIncomeLoading, expenseReport, isExpenseLoading, cashFlow, isCashFlowLoading } =
    useReports(reportParams);

  // Fetch net worth history specifically
  const netWorthQuery = useQuery({
    queryKey: ['report-networth', reportParams],
    queryFn: async () => {
      const res = await reportsApi.getNetWorthHistory(reportParams);
      return res.data.data as any[];
    },
    enabled: activeTab === 'networth',
  });

  // Apply Quick Date Filters
  const applyPreset = (preset: 'this-month' | 'last-3' | 'this-year') => {
    const today = new Date();
    if (preset === 'this-month') {
      setStartDate(startOfMonth(today));
      setEndDate(endOfMonth(today));
    } else if (preset === 'last-3') {
      setStartDate(startOfMonth(subMonths(today, 2)));
      setEndDate(endOfMonth(today));
    } else if (preset === 'this-year') {
      setStartDate(startOfYear(today));
      setEndDate(endOfMonth(today));
    }
  };

  // Handle Export Downloads
  const handleExport = async (formatType: 'csv' | 'excel' | 'pdf') => {
    setIsExporting(true);
    try {
      const params = {
        startDate: formatApiDate(startDate),
        endDate: formatApiDate(endDate),
      };
      
      let response;
      if (formatType === 'csv') {
        response = await exportApi.exportCSV(activeTab, params);
      } else if (formatType === 'excel') {
        response = await exportApi.exportExcel(activeTab, params);
      } else {
        response = await exportApi.exportPDF(activeTab, params);
      }

      // Trigger file download
      const blob = new Blob([response.data], { type: response.headers['content-type'] ? String(response.headers['content-type']) : undefined });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `report-${activeTab}-${params.startDate}_to_${params.endDate}.${formatType === 'excel' ? 'xlsx' : formatType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${formatType.toUpperCase()} report successfully!`);
    } catch {
      toast.error('Failed to export report.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Reports & Analytics"
        description="Visualize income, spending behaviors, historical net worth snapshots, and cash flow."
      />

      {/* Filters Card */}
      <Card className="p-6 border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <DatePicker
              label="Start Date"
              date={startDate}
              onDateChange={(d) => d && setStartDate(d)}
            />
            <DatePicker
              label="End Date"
              date={endDate}
              onDateChange={(d) => d && setEndDate(d)}
            />
          </div>

          <div className="flex items-center space-x-2 flex-wrap">
            <Button size="sm" variant="ghost" onClick={() => applyPreset('this-month')}>
              This Month
            </Button>
            <Button size="sm" variant="ghost" onClick={() => applyPreset('last-3')}>
              Last 3 Months
            </Button>
            <Button size="sm" variant="ghost" onClick={() => applyPreset('this-year')}>
              This Year
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs and Actions bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-2">
        {/* Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('income')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'income'
                ? 'bg-primary-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Income Analysis</span>
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'expense'
                ? 'bg-primary-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Expense Breakdown</span>
          </button>
          <button
            onClick={() => setActiveTab('cashflow')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'cashflow'
                ? 'bg-primary-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Cash Flow Trends</span>
          </button>
          <button
            onClick={() => setActiveTab('networth')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'networth'
                ? 'bg-primary-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Net Worth Snapshots</span>
          </button>
        </div>

        {/* Exports */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <Button size="sm" variant="outline" onClick={() => handleExport('csv')} isLoading={isExporting}>
            <Download className="w-3.5 h-3.5 mr-1" /> CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleExport('excel')} isLoading={isExporting}>
            <Download className="w-3.5 h-3.5 mr-1" /> Excel
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleExport('pdf')} isLoading={isExporting}>
            <Download className="w-3.5 h-3.5 mr-1" /> PDF
          </Button>
        </div>
      </div>

      {/* Chart Render Area */}
      <Card className="p-6 border-slate-800 bg-slate-900/60 backdrop-blur-md">
        {activeTab === 'income' && <IncomeReport data={incomeReport} isLoading={isIncomeLoading} />}
        {activeTab === 'expense' && <ExpenseReport data={expenseReport} isLoading={isExpenseLoading} />}
        {activeTab === 'cashflow' && <CashFlowReport data={cashFlow || []} isLoading={isCashFlowLoading} />}
        {activeTab === 'networth' && (
          <NetWorthReport data={netWorthQuery.data || []} isLoading={netWorthQuery.isLoading} />
        )}
      </Card>
    </div>
  );
}
