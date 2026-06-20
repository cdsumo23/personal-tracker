import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Account } from '@/types';

export function useAccounts() {
  const queryClient = useQueryClient();

  // 1. Fetch all accounts
  const accountsQuery = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await accountsApi.getAll();
      return response.data.data as Account[];
    },
  });

  // 2. Create account
  const createAccountMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      type: string;
      currency: string;
      balance: number;
      color?: string;
      icon?: string;
      isDefault?: boolean;
    }) => {
      const response = await accountsApi.create(data);
      return response.data.data as Account;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Account created successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create account.');
    },
  });

  // 3. Update account
  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await accountsApi.update(id, data);
      return response.data.data as Account;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Account updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update account.');
    },
  });

  // 4. Delete account
  const deleteAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      await accountsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Account deleted successfully.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete account.');
    },
  });

  // 5. Transfer funds
  const transferMutation = useMutation({
    mutationFn: async (data: {
      fromAccountId: string;
      toAccountId: string;
      amount: number;
      description?: string;
      date?: string;
    }) => {
      const response = await accountsApi.transfer(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Funds transferred successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Transfer failed.');
    },
  });

  return {
    accounts: accountsQuery.data || [],
    isLoading: accountsQuery.isLoading,
    isError: accountsQuery.isError,
    error: accountsQuery.error,
    refetch: accountsQuery.refetch,
    
    createAccount: createAccountMutation.mutateAsync,
    isCreating: createAccountMutation.isPending,
    
    updateAccount: updateAccountMutation.mutateAsync,
    isUpdating: updateAccountMutation.isPending,
    
    deleteAccount: deleteAccountMutation.mutateAsync,
    isDeleting: deleteAccountMutation.isPending,
    
    transferFunds: transferMutation.mutateAsync,
    isTransferring: transferMutation.isPending,
  };
}
