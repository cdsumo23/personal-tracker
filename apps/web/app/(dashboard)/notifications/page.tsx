'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
 Bell, Check, Trash2, Info, AlertTriangle, CheckCircle2,
 Clock, ArrowRight, Eye, RefreshCw
} from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
 const router = useRouter();
 const [filter, setFilter] = React.useState<'all' | 'unread' | 'read'>('all');
 
 const {
 notifications,
 isLoading,
 markAsRead,
 markAllAsRead,
 deleteNotification,
 } = useNotifications();

 const filteredNotifications = notifications.filter((n) => {
 if (filter === 'unread') return !n.isRead;
 if (filter === 'read') return n.isRead;
 return true;
 });

 const getNotificationIcon = (type: string) => {
 switch (type) {
 case 'SUCCESS':
 return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
 case 'WARNING':
 return <AlertTriangle className="w-4 h-4 text-amber-400" />;
 case 'ALERT':
 return <Bell className="w-4 h-4 text-rose-400" />;
 case 'INFO':
 default:
 return <Info className="w-4 h-4 text-blue-400" />;
 }
 };

 const getNotificationBg = (type: string, isRead: boolean) => {
 if (isRead) return 'bg-slate-900/10 border-slate-200 dark:border-slate-800/40 opacity-70';
 switch (type) {
 case 'SUCCESS':
 return 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/25';
 case 'WARNING':
 return 'bg-amber-500/5 border-amber-500/10 hover:border-amber-500/25';
 case 'ALERT':
 return 'bg-red-500/5 border-red-500/10 hover:border-red-500/25';
 case 'INFO':
 default:
 return 'bg-blue-500/5 border-blue-500/10 hover:border-blue-500/25';
 }
 };

 const handleMarkRead = async (id: string, e: React.MouseEvent) => {
 e.stopPropagation();
 try {
 await markAsRead(id);
 toast.success('Marked as read');
 } catch (error) {
 // Toast error handled inside hook
 }
 };

 const handleDelete = async (id: string, e: React.MouseEvent) => {
 e.stopPropagation();
 try {
 await deleteNotification(id);
 toast.success('Notification deleted');
 } catch (error) {
 // Toast error handled inside hook
 }
 };

 const handleMarkAllRead = async () => {
 try {
 await markAllAsRead();
 } catch (error) {
 // Toast error handled inside hook
 }
 };

 const handleNotificationClick = async (notification: any) => {
 if (!notification.isRead) {
 await markAsRead(notification.id);
 }
 if (notification.link) {
 router.push(notification.link);
 }
 };

 const hasUnread = notifications.some((n) => !n.isRead);

 if (isLoading) {
 return (
 <div className="space-y-6 pb-20">
 <PageHeader title="Alert Notification Center" description="View and manage your alerts." />
 <Card className="p-6 space-y-4">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800/80 rounded-xl animate-pulse">
 <div className="w-8 h-8 rounded-full bg-slate-800" />
 <div className="flex-1 space-y-2">
 <div className="h-4 bg-slate-800 rounded w-1/4" />
 <div className="h-3 bg-slate-800 rounded w-3/4" />
 </div>
 </div>
 ))}
 </Card>
 </div>
 );
 }

 return (
 <div className="space-y-6 pb-20">
 <PageHeader
 title="Alert Notification Center"
 description="Stay updated with budget alerts, bills reminders, and system events."
 action={
 hasUnread && (
 <Button
 variant="outline"
 size="sm"
 onClick={handleMarkAllRead}
 className="border-slate-300 dark:border-slate-700 hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs font-bold"
 >
 <Check className="w-4 h-4 text-emerald-400" />
 Mark All Read
 </Button>
 )
 }
 />

 {/* Filters */}
 <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
 <div className="flex gap-1.5">
 {(['all', 'unread', 'read'] as const).map((t) => (
 <button
 key={t}
 onClick={() => setFilter(t)}
 className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all relative ${
 filter === t
 ? 'bg-slate-800 text-slate-900 dark:text-slate-100'
 : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-800/30'
 }`}
 >
 {t.charAt(0).toUpperCase() + t.slice(1)}
 {t === 'unread' && notifications.filter((n) => !n.isRead).length > 0 && (
 <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary-500 text-[9px] text-white font-bold leading-none inline-flex items-center justify-center">
 {notifications.filter((n) => !n.isRead).length}
 </span>
 )}
 </button>
 ))}
 </div>
 <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
 Total: {filteredNotifications.length}
 </p>
 </div>

 {/* Notifications List */}
 <Card className="overflow-hidden p-6 space-y-3">
 {filteredNotifications.length === 0 ? (
 <EmptyState
 icon={<Bell className="w-8 h-8" />}
 title="Clean Inbox!"
 description={
 filter === 'all'
 ?"You don't have any notifications yet."
 : filter === 'unread'
 ?"You don't have any unread notifications."
 :"You don't have any read notifications."
 }
 />
 ) : (
 <div className="divide-y divide-slate-800/50">
 {filteredNotifications.map((n) => (
 <div
 key={n.id}
 onClick={() => handleNotificationClick(n)}
 className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 group mb-3 last:mb-0 cursor-pointer ${getNotificationBg(
 n.type,
 n.isRead
 )}`}
 >
 {/* Icon Container */}
 <div className={`p-2 rounded-xl flex-shrink-0 bg-slate-950/40 border border-slate-200 dark:border-slate-800/80`}>
 {getNotificationIcon(n.type)}
 </div>

 {/* Content */}
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <h4 className={`text-[13px] font-bold tracking-tight ${n.isRead ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100'}`}>
 {n.title}
 </h4>
 {!n.isRead && (
 <Badge variant="info" className="px-1.5 py-0 text-[9px] font-extrabold uppercase tracking-wide">New</Badge>
 )}
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
 {n.message}
 </p>
 <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500 font-semibold">
 <Clock className="w-3.5 h-3.5" />
 <span>{formatRelativeDate(n.createdAt)}</span>
 </div>
 </div>

 {/* Action Buttons */}
 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 self-center">
 {!n.isRead && (
 <button
 onClick={(e) => handleMarkRead(n.id, e)}
 title="Mark as read"
 className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors touch-target"
 >
 <Check className="w-3.5 h-3.5" />
 </button>
 )}
 <button
 onClick={(e) => handleDelete(n.id, e)}
 title="Delete permanently"
 className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors touch-target"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 {n.link && (
 <div className="p-1.5 text-slate-500 group-hover:text-primary-400 transition-colors">
 <ArrowRight className="w-3.5 h-3.5" />
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </Card>
 </div>
 );
}
