import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Notification } from '@/types';

export function useNotifications(filters?: { page?: number; limit?: number; unread?: boolean }) {
  const queryClient = useQueryClient();

  // 1. Query notifications
  const notificationsQuery = useQuery({
    queryKey: ['notifications', filters],
    queryFn: async () => {
      const response = await notificationsApi.getAll(filters);
      return response.data.data as Notification[];
    },
  });

  // 2. Mark single notification as read
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await notificationsApi.markRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to mark notification as read.');
    },
  });

  // 3. Mark all notifications as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await notificationsApi.markAllRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to mark all notifications as read.');
    },
  });

  // 4. Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      await notificationsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete notification.');
    },
  });

  return {
    notifications: notificationsQuery.data || [],
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    error: notificationsQuery.error,
    refetch: notificationsQuery.refetch,

    markAsRead: markReadMutation.mutateAsync,
    isMarkingRead: markReadMutation.isPending,

    markAllAsRead: markAllReadMutation.mutateAsync,
    isMarkingAllRead: markAllReadMutation.isPending,

    deleteNotification: deleteNotificationMutation.mutateAsync,
    isDeleting: deleteNotificationMutation.isPending,
  };
}
