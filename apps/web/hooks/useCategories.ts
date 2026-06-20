import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api';
import toast from 'react-hot-toast';

export interface Category {
  id: string;
  userId: string | null;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string | null;
  color: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useCategories(type?: 'income' | 'expense') {
  const queryClient = useQueryClient();

  // 1. Fetch all categories
  const categoriesQuery = useQuery({
    queryKey: ['categories', type],
    queryFn: async () => {
      const response = await categoriesApi.getAll(type);
      return response.data.data as Category[];
    },
  });

  // 2. Create category
  const createCategoryMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      icon: string;
      color: string;
      type: 'INCOME' | 'EXPENSE';
    }) => {
      const response = await categoriesApi.create({
        name: data.name,
        icon: data.icon,
        color: data.color,
        type: data.type,
      });
      return response.data.data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create category.');
    },
  });

  // 3. Update category
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<{ name: string; icon: string; color: string }> }) => {
      const response = await categoriesApi.update(id, data);
      return response.data.data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-usage'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Category updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update category.');
    },
  });

  // 4. Delete category
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await categoriesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-usage'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Category deleted successfully.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete category.');
    },
  });

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error,
    refetch: categoriesQuery.refetch,

    createCategory: createCategoryMutation.mutateAsync,
    isCreating: createCategoryMutation.isPending,

    updateCategory: updateCategoryMutation.mutateAsync,
    isUpdating: updateCategoryMutation.isPending,

    deleteCategory: deleteCategoryMutation.mutateAsync,
    isDeleting: deleteCategoryMutation.isPending,
  };
}
