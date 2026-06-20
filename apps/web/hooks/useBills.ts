import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Bill } from '@/types';

export function useBills(params?: { status?: string; month?: string }) {
  const queryClient = useQueryClient();

  // 1. Fetch bills
  const billsQuery = useQuery({
    queryKey: ['bills', params],
    queryFn: async () => {
      const response = await billsApi.getAll(params);
      return response.data.data as Bill[];
    },
  });

  // 2. Create bill
  const createBillMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      amount: number;
      currency?: string;
      dueDay: number;
      category?: string;
      isRecurring?: boolean;
      frequency?: string;
      reminderDays?: number;
      notes?: string;
    }) => {
      // The bill service reads data.category directly — pass it through as-is
      const response = await billsApi.create({
        name: data.name,
        amount: data.amount,
        currency: data.currency || 'USD',
        dueDay: data.dueDay,
        category: data.category,
        isRecurring: data.isRecurring ?? true,
        frequency: data.frequency,
        reminderDays: data.reminderDays,
        notes: data.notes,
      } as any);
      return response.data.data as Bill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Bill created successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create bill.');
    },
  });

  // 3. Update bill
  const updateBillMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await billsApi.update(id, data);
      return response.data.data as Bill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Bill updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update bill.');
    },
  });

  // 4. Delete bill
  const deleteBillMutation = useMutation({
    mutationFn: async (id: string) => {
      await billsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Bill deleted successfully.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete bill.');
    },
  });

  // 5. Mark bill paid
  const markBillPaidMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { paidDate: string; paidAmount: number; accountId: string } }) => {
      const response = await billsApi.markPaid(id, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budget-usage'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Bill marked as paid!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to pay bill.');
    },
  });

  return {
    bills: billsQuery.data || [],
    isLoading: billsQuery.isLoading,
    isError: billsQuery.isError,
    error: billsQuery.error,
    refetch: billsQuery.refetch,

    createBill: createBillMutation.mutateAsync,
    isCreating: createBillMutation.isPending,

    updateBill: updateBillMutation.mutateAsync,
    isUpdating: updateBillMutation.isPending,

    deleteBill: deleteBillMutation.mutateAsync,
    isDeleting: deleteBillMutation.isPending,

    markBillPaid: markBillPaidMutation.mutateAsync,
    isPaying: markBillPaidMutation.isPending,
  };
}
