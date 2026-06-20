import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import type { DashboardStats } from '@/types';

export function useDashboard(period?: string) {
  const dashboardQuery = useQuery({
    queryKey: ['dashboard-stats', period],
    queryFn: async () => {
      const response = await reportsApi.getDashboardStats(period);
      return response.data.data as DashboardStats;
    },
  });

  return {
    stats: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch,
  };
}
