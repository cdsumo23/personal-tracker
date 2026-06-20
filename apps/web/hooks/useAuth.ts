import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { User } from '@/types';

export function useAuth() {
  const queryClient = useQueryClient();
  const store = useAuthStore();

  // 1. Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<{
      firstName: string;
      lastName: string;
      phone: string;
      country: string;
      currency: string;
      timezone: string;
      avatar: string;
    }>) => {
      const response = await authApi.updateProfile(data);
      return response.data.data as User;
    },
    onSuccess: (updatedUser) => {
      store.setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Profile updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    },
  });

  // 2. Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      await authApi.changePassword(data);
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    },
  });

  // 3. Upload Avatar Mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const response = await authApi.uploadAvatar(file);
      return response.data.data as User;
    },
    onSuccess: (updatedUser) => {
      store.setUser(updatedUser);
      toast.success('Profile picture updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to upload profile picture.');
    },
  });

  return {
    // State
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,

    // Actions
    login: store.login,
    logout: store.logout,
    clearError: store.clearError,
    initializeAuth: store.initializeAuth,
    refreshToken: store.refreshToken,

    // Mutations
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,

    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,

    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isUploadingAvatar: uploadAvatarMutation.isPending,
  };
}
