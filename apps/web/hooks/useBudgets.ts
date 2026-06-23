import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Budget } from '@/types';

export function useBudgets(period?: string) {
  const queryClient = useQueryClient();

  const budgetsQuery = useQuery({
    queryKey: ['budgets', period],
    queryFn: async () => {
      const response = await budgetsApi.getAll(period);
      return response.data.data as Budget[];
    },
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await budgetsApi.create(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-usage'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Budget created successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create budget.');
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await budgetsApi.update(id, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-usage'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Budget updated successfully.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update budget.');
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: async (id: string) => {
      await budgetsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-usage'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Budget deleted successfully.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete budget.');
    },
  });

  return {
    budgets: budgetsQuery.data || [],
    isLoading: budgetsQuery.isLoading,
    isError: budgetsQuery.isError,
    error: budgetsQuery.error,
    refetch: budgetsQuery.refetch,

    createBudget: createBudgetMutation.mutateAsync,
    isCreating: createBudgetMutation.isPending,

    updateBudget: updateBudgetMutation.mutateAsync,
    isUpdating: updateBudgetMutation.isPending,

    deleteBudget: deleteBudgetMutation.mutateAsync,
    isDeleting: deleteBudgetMutation.isPending,
  };
}

export function useBudgetUsage(budgetId: string) {
  const usageQuery = useQuery({
    queryKey: ['budget-usage', budgetId],
    queryFn: async () => {
      const response = await budgetsApi.getUsage(budgetId);
      return response.data.data as {
        allocated: number;
        spent: number;
        remaining: number;
        percentage: number;
        projectedSpent?: number;
        projectedPercentage?: number;
        isProjectedOver?: boolean;
        useExtrapolation?: boolean;
        categories: Array<{
          categoryId: string;
          name: string;
          allocated: number;
          spent: number;
          remaining: number;
          percentage: number;
          color: string;
          icon: string;
          projectedSpent?: number;
          projectedPercentage?: number;
          isProjectedOver?: boolean;
        }>;
      };
    },
    enabled: !!budgetId,
  });

  return {
    usage: usageQuery.data,
    isLoading: usageQuery.isLoading,
    isError: usageQuery.isError,
    refetch: usageQuery.refetch,
  };
}
