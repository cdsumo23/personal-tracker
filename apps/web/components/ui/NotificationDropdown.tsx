import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Bell, Info, AlertTriangle, CheckCircle, XCircle, Trash2, CheckSquare } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '@/types';
import Link from 'next/link';

export function NotificationDropdown() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, isLoading } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'ALERT':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case 'INFO':
      default:
        return <Info className="w-4 h-4 text-sky-400" />;
    }
  };

  const handleNotificationClick = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(id);
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="relative p-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors focus:outline-none"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-slate-900 animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 max-h-[420px] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-850 bg-slate-900/60">
            <span className="text-sm font-semibold text-slate-100">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="flex items-center space-x-1 text-xs text-primary-400 hover:text-primary-300 font-semibold transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto max-h-[300px] divide-y divide-slate-850 scrollbar-thin scrollbar-thumb-slate-800">
            {isLoading ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center space-y-2">
                <Bell className="w-8 h-8 opacity-20" />
                <span>You have no notifications.</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n.id, n.isRead)}
                  className={cn(
                    'flex items-start p-4 hover:bg-slate-800/30 transition-colors cursor-pointer relative group',
                    !n.isRead && 'bg-slate-800/10'
                  )}
                >
                  <div className="mr-3 mt-0.5 shrink-0">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <p className={cn('text-xs text-slate-200 leading-normal', !n.isRead && 'font-semibold')}>
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n.id);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Unread Indicator */}
                  {!n.isRead && (
                    <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary-500" />
                  )}
                </div>
              ))
            )}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
