import { useQuery } from '@tanstack/react-query';
import { reportsApi, ReportParams } from '@/lib/api';

export function useReports(params?: Partial<ReportParams & { months?: number }>) {
  const queryParams = params || {};

  const incomeReportQuery = useQuery({
    queryKey: ['report-income', queryParams],
    queryFn: async () => {
      const response = await reportsApi.getIncomeReport(queryParams as ReportParams);
      return response.data.data;
    },
    enabled: !!queryParams.startDate && !!queryParams.endDate,
  });

  const expenseReportQuery = useQuery({
    queryKey: ['report-expense', queryParams],
    queryFn: async () => {
      const response = await reportsApi.getExpenseReport(queryParams as ReportParams);
      return response.data.data;
    },
    enabled: !!queryParams.startDate && !!queryParams.endDate,
  });

  const cashFlowQuery = useQuery({
    queryKey: ['report-cashflow', queryParams],
    queryFn: async () => {
      const response = await reportsApi.getCashFlowReport(queryParams as any);
      return response.data.data as Array<{
        month: string;
        income: number;
        expense: number;
        netCashFlow: number;
      }>;
    },
  });

  return {
    incomeReport: incomeReportQuery.data,
    isIncomeLoading: incomeReportQuery.isLoading,
    expenseReport: expenseReportQuery.data,
    isExpenseLoading: expenseReportQuery.isLoading,
    cashFlow: cashFlowQuery.data,
    isCashFlowLoading: cashFlowQuery.isLoading,
    refetchCashFlow: cashFlowQuery.refetch,
  };
}
