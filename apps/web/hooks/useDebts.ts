import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debtsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Debt } from '@/types';

export function useDebts() {
  const queryClient = useQueryClient();

  // 1. Fetch all debts
  const debtsQuery = useQuery({
    queryKey: ['debts'],
    queryFn: async () => {
      const response = await debtsApi.getAll();
      return response.data.data as Debt[];
    },
  });

  // 2. Create debt
  const createDebtMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      type: string;
      lender: string;
      originalAmount: number;
      currentBalance: number;
      interestRate: number;
      minimumPayment: number;
      dueDate: string;
      nextPaymentDate?: string;
    }) => {
      const response = await debtsApi.create(data);
      return response.data.data as Debt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Debt added successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add debt.');
    },
  });

  // 3. Update debt
  const updateDebtMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await debtsApi.update(id, data);
      return response.data.data as Debt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Debt updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update debt.');
    },
  });

  // 4. Delete debt
  const deleteDebtMutation = useMutation({
    mutationFn: async (id: string) => {
      await debtsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Debt deleted successfully.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete debt.');
    },
  });

  // 5. Add payment
  const addPaymentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { amount: number; date?: string; note?: string } }) => {
      const response = await debtsApi.addPayment(id, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Payment recorded successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to record payment.');
    },
  });

  // 6. Payoff plan query helper (not a standard hook query since it's dynamic based on inputs)
  const getPayoffPlan = async (strategy: 'snowball' | 'avalanche', extraPayment?: number) => {
    const response = await debtsApi.getPayoffPlan(strategy, extraPayment);
    return response.data.data;
  };

  return {
    debts: debtsQuery.data || [],
    isLoading: debtsQuery.isLoading,
    isError: debtsQuery.isError,
    error: debtsQuery.error,
    refetch: debtsQuery.refetch,

    createDebt: createDebtMutation.mutateAsync,
    isCreating: createDebtMutation.isPending,

    updateDebt: updateDebtMutation.mutateAsync,
    isUpdating: updateDebtMutation.isPending,

    deleteDebt: deleteDebtMutation.mutateAsync,
    isDeleting: deleteDebtMutation.isPending,

    addPayment: addPaymentMutation.mutateAsync,
    isPaying: addPaymentMutation.isPending,

    getPayoffPlan,
  };
}
