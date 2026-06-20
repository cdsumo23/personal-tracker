import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import type { SavingsGoal } from '@/types';

export function useGoals() {
  const queryClient = useQueryClient();

  // 1. Fetch all goals
  const goalsQuery = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const response = await goalsApi.getAll();
      return response.data.data as SavingsGoal[];
    },
  });

  // 2. Create goal
  const createGoalMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      targetAmount: number;
      currentAmount: number;
      deadline: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH';
      autoContribute?: boolean;
      monthlyContribution?: number;
      icon?: string;
      color?: string;
      categoryId?: string;
    }) => {
      const response = await goalsApi.create(data);
      return response.data.data as SavingsGoal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Savings goal created successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create savings goal.');
    },
  });

  // 3. Update goal
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await goalsApi.update(id, data);
      return response.data.data as SavingsGoal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Savings goal updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update savings goal.');
    },
  });

  // 4. Delete goal
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      await goalsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Savings goal deleted successfully.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete savings goal.');
    },
  });

  // 5. Add contribution
  const addContributionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { amount: number; note?: string; date?: string } }) => {
      const response = await goalsApi.addContribution(id, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Contribution added successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add contribution.');
    },
  });

  return {
    goals: goalsQuery.data || [],
    isLoading: goalsQuery.isLoading,
    isError: goalsQuery.isError,
    error: goalsQuery.error,
    refetch: goalsQuery.refetch,

    createGoal: createGoalMutation.mutateAsync,
    isCreating: createGoalMutation.isPending,

    updateGoal: updateGoalMutation.mutateAsync,
    isUpdating: updateGoalMutation.isPending,

    deleteGoal: deleteGoalMutation.mutateAsync,
    isDeleting: deleteGoalMutation.isPending,

    addContribution: addContributionMutation.mutateAsync,
    isContributing: addContributionMutation.isPending,
  };
}
