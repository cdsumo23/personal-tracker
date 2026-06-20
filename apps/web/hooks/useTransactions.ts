import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi, TransactionFilters } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Transaction } from '@/types';

export function useTransactions(filters?: TransactionFilters) {
  const queryClient = useQueryClient();

  // 1. Fetch all transactions (filtered/paginated)
  const transactionsQuery = useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const response = await transactionsApi.getAll(filters);
      return response.data; // returns PaginatedResponse shape: { success: boolean, data: Transaction[], pagination: {...} }
    },
  });

  // 2. Create transaction
  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await transactionsApi.create(data);
      return response.data.data as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-usage'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Transaction recorded successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to record transaction.');
    },
  });

  // 3. Update transaction
  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await transactionsApi.update(id, data);
      return response.data.data as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-usage'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Transaction updated successfully.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update transaction.');
    },
  });

  // 4. Delete transaction
  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      await transactionsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-usage'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Transaction deleted successfully.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete transaction.');
    },
  });

  // 5. Bulk Delete transactions
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await transactionsApi.bulkDelete(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Transactions deleted successfully.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete transactions.');
    },
  });

  // 6. Duplicate transaction
  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await transactionsApi.duplicate(id);
      return response.data.data as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Transaction duplicated.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to duplicate transaction.');
    },
  });

  return {
    transactions: (transactionsQuery.data?.data as Transaction[]) || [],
    pagination: transactionsQuery.data?.meta || { page: 1, limit: 20, total: 0, totalPages: 0 },
    isLoading: transactionsQuery.isLoading,
    isError: transactionsQuery.isError,
    error: transactionsQuery.error,
    refetch: transactionsQuery.refetch,
    
    createTransaction: createTransactionMutation.mutateAsync,
    isCreating: createTransactionMutation.isPending,
    
    updateTransaction: updateTransactionMutation.mutateAsync,
    isUpdating: updateTransactionMutation.isPending,
    
    deleteTransaction: deleteTransactionMutation.mutateAsync,
    isDeleting: deleteTransactionMutation.isPending,
    
    bulkDeleteTransactions: bulkDeleteMutation.mutateAsync,
    isBulkDeleting: bulkDeleteMutation.isPending,
    
    duplicateTransaction: duplicateMutation.mutateAsync,
    isDuplicating: duplicateMutation.isPending,
  };
}
