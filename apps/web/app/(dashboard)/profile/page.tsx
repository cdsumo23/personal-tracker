'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { Badge } from '@/components/ui/Badge';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Shield, Sliders, Database, KeyRound, Download, LogOut, CheckCircle2, BellRing, BellOff } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { CURRENCIES } from '@/lib/constants';
import toast from 'react-hot-toast';
import { exportApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const profileSchema = z.object({
 firstName: z.string().min(2, 'First name must be at least 2 characters'),
 lastName: z.string().min(2, 'Last name must be at least 2 characters'),
 phone: z.string().optional(),
 country: z.string().optional(),
 currency: z.string().min(3, 'Select default currency'),
 timezone: z.string().min(3, 'Select timezone'),
});

const passwordSchema = z.object({
 currentPassword: z.string().min(1, 'Current password is required'),
 newPassword: z
 .string()
 .min(8, 'Password must be at least 8 characters')
 .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
 .regex(/[a-z]/, 'Must contain at least one lowercase letter')
 .regex(/\d/, 'Must contain at least one number')
 .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Must contain at least one special character'),
 confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
 message:"New passwords don't match",
 path: ['confirmPassword'],
});

export default function ProfilePage() {
 const { user, logout, updateProfile, changePassword, uploadAvatar, isUpdatingProfile, isChangingPassword } = useAuth();
 const push = usePushNotifications();
 const [activeTab, setActiveTab] = React.useState<'info' | 'security' | 'preferences' | 'data'>('info');
 const [avatarFile, setAvatarFile] = React.useState<File | undefined>(undefined);
 const [isBackupExporting, setIsBackupExporting] = React.useState(false);
 const [restoreFile, setRestoreFile] = React.useState<File | undefined>(undefined);
 const [isBackupRestoring, setIsBackupRestoring] = React.useState(false);

 // Profile Form
 const {
 register: regProfile,
 handleSubmit: handleProfileSubmit,
 formState: { errors: profileErrors },
 reset: resetProfile,
 } = useForm({
 resolver: zodResolver(profileSchema),
 defaultValues: {
 firstName: user?.firstName || '',
 lastName: user?.lastName || '',
 phone: user?.phone || '',
 country: user?.country || '',
 currency: user?.currency || 'USD',
 timezone: user?.timezone || 'GMT',
 },
 });

 // Sync profile values if user loads async
 React.useEffect(() => {
 if (user) {
 resetProfile({
 firstName: user.firstName,
 lastName: user.lastName,
 phone: user.phone || '',
 country: user.country || '',
 currency: user.currency,
 timezone: user.timezone || 'GMT',
 });
 }
 }, [user, resetProfile]);

 // Password Form
 const {
 register: regPassword,
 handleSubmit: handlePasswordSubmit,
 formState: { errors: passwordErrors },
 reset: resetPassword,
 } = useForm({
 resolver: zodResolver(passwordSchema),
 defaultValues: {
 currentPassword: '',
 newPassword: '',
 confirmPassword: '',
 },
 });

 // Submit Profile Changes
 const onProfileSubmit = async (data: any) => {
 try {
 // 1. Upload photo if selected
 if (avatarFile) {
 await uploadAvatar(avatarFile);
 setAvatarFile(undefined);
 }
 // 2. Update metadata
 await updateProfile(data);
 } catch {
 // Handled in hook
 }
 };

 // Submit Password Change
 const onPasswordSubmit = async (data: any) => {
 try {
 await changePassword({
 currentPassword: data.currentPassword,
 newPassword: data.newPassword,
 });
 resetPassword();
 } catch {
 // Handled in hook
 }
 };

 // Export Data Backup
 const handleBackupExport = async () => {
 setIsBackupExporting(true);
 try {
 const response = await exportApi.exportAllData();
 const blob = new Blob([response.data], { type: 'application/json' });
 const link = document.createElement('a');
 link.href = window.URL.createObjectURL(blob);
 link.download = `budget-planner-backup-${formatDate(new Date(), 'yyyy-MM-dd')}.json`;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 toast.success('Backup exported successfully!');
 } catch {
 toast.error('Failed to export system backup.');
 } finally {
 setIsBackupExporting(false);
 }
 };

 const handleBackupRestore = (file: File | undefined) => {
 setRestoreFile(file);
 };

 const executeRestore = async () => {
 if (!restoreFile) return;
 setIsBackupRestoring(true);
 try {
 const text = await restoreFile.text();
 const backupData = JSON.parse(text);
 await exportApi.restoreBackup(backupData);
 toast.success('Backup restored successfully!');
 setRestoreFile(undefined);
 setTimeout(() => {
 window.location.reload();
 }, 1500);
 } catch (error: any) {
 console.error(error);
 const errMsg = error.response?.data?.message || 'Failed to restore system backup. Verify file format.';
 toast.error(errMsg);
 } finally {
 setIsBackupRestoring(false);
 }
 };

 return (
 <div className="space-y-6 pb-20">
 <PageHeader
 title="Settings & Profile"
 description="Update personal credentials, account priorities, password options, and data backups."
 />

 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
 {/* Navigation Sidebar */}
 <Card className="p-4 lg:h-fit space-y-1">
 <button
 onClick={() => setActiveTab('info')}
 className={`flex items-center space-x-2.5 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
 activeTab === 'info'
 ? 'bg-primary-500 text-white'
 : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
 }`}
 >
 <User className="w-4 h-4" />
 <span>Personal Information</span>
 </button>
 <button
 onClick={() => setActiveTab('security')}
 className={`flex items-center space-x-2.5 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
 activeTab === 'security'
 ? 'bg-primary-500 text-white'
 : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
 }`}
 >
 <Shield className="w-4 h-4" />
 <span>Login & Security</span>
 </button>
 <button
 onClick={() => setActiveTab('preferences')}
 className={`flex items-center space-x-2.5 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
 activeTab === 'preferences'
 ? 'bg-primary-500 text-white'
 : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
 }`}
 >
 <Sliders className="w-4 h-4" />
 <span>Preferences</span>
 </button>
 <button
 onClick={() => setActiveTab('data')}
 className={`flex items-center space-x-2.5 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
 activeTab === 'data'
 ? 'bg-primary-500 text-white'
 : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
 }`}
 >
 <Database className="w-4 h-4" />
 <span>Data Operations</span>
 </button>

 <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
 <button
 onClick={() => logout()}
 className="flex items-center space-x-2.5 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
 >
 <LogOut className="w-4 h-4" />
 <span>Sign Out</span>
 </button>
 </div>
 </Card>

 {/* Form panel */}
 <Card className="lg:col-span-3 p-6">
 {/* TAB 1: PERSONAL INFORMATION */}
 {activeTab === 'info' && (
 <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
 <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-3">
 Personal Details
 </h3>

 <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-slate-100 dark:border-slate-700">
 <div className="w-32 shrink-0">
 <FileUpload
 onFileSelect={setAvatarFile}
 value={avatarFile}
 previewUrl={user?.profilePhoto}
 accept="image/*"
 label="Avatar photo"
 variant="avatar"
 />
 </div>
 <div className="space-y-1 text-center sm:text-left">
 <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Profile Photo</h4>
 <p className="text-xs text-slate-500">
 Upload a square JPEG, PNG, or GIF. Max 2MB.
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Input
 label="First Name"
 error={profileErrors.firstName?.message}
 {...regProfile('firstName')}
 />
 <Input
 label="Last Name"
 error={profileErrors.lastName?.message}
 {...regProfile('lastName')}
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Input
 label="Email (Read-only)"
 value={user?.email || ''}
 disabled
 className="opacity-60 bg-slate-850 cursor-not-allowed"
 />
 <Input
 label="Phone Number"
 error={profileErrors.phone?.message}
 {...regProfile('phone')}
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Input
 label="Country"
 error={profileErrors.country?.message}
 {...regProfile('country')}
 />
 <Select
 label="Default Base Currency"
 options={(CURRENCIES || ['USD', 'EUR', 'GBP']).map((c) => ({
 value: typeof c === 'string' ? c : (c as any).code,
 label: typeof c === 'string' ? c : `${(c as any).code} - ${(c as any).name}`,
 }))}
 error={profileErrors.currency?.message}
 {...regProfile('currency')}
 />
 </div>

 <div className="flex justify-end pt-4">
 <Button type="submit" isLoading={isUpdatingProfile}>
 Save Profile Settings
 </Button>
 </div>
 </form>
 )}

 {/* TAB 2: SECURITY & PASSWORD */}
 {activeTab === 'security' && (
 <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
 <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center">
 <KeyRound className="w-5 h-5 mr-2 text-primary-400" />
 <span>Change Account Password</span>
 </h3>

 <div className="space-y-4 max-w-md">
 <Input
 label="Current Password"
 type="password"
 error={passwordErrors.currentPassword?.message}
 {...regPassword('currentPassword')}
 />
 <Input
 label="New Password"
 type="password"
 error={passwordErrors.newPassword?.message}
 {...regPassword('newPassword')}
 />
 <Input
 label="Confirm New Password"
 type="password"
 error={passwordErrors.confirmPassword?.message}
 {...regPassword('confirmPassword')}
 />
 </div>

 <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
 <Button type="submit" isLoading={isChangingPassword}>
 Update Password
 </Button>
 </div>
 </form>
 )}

 {/* TAB 3: USER PREFERENCES */}
 {activeTab === 'preferences' && (
 <div className="space-y-6">
 <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-3">
 Interface Preferences
 </h3>

 <div className="space-y-4 max-w-md">
 <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20">
 <div>
 <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">Dark Theme Mode</span>
 <span className="text-xs text-slate-500">Enable high-contrast glassmorphism theme</span>
 </div>
 <Badge variant="success">
 <CheckCircle2 className="w-3 h-3 mr-1" /> Active
 </Badge>
 </div>

 <Select
 label="System Language"
 options={[
 { value: 'en', label: 'English (US)' },
 { value: 'fr', label: 'French (FR)' },
 { value: 'es', label: 'Spanish (ES)' },
 ]}
 defaultValue="en"
 />

 <Select
 label="Time Zone"
 options={[
 { value: 'GMT', label: 'GMT' },
 { value: 'EST', label: 'EST (New York)' },
 { value: 'PST', label: 'PST (Los Angeles)' },
 { value: 'WAT', label: 'WAT (Lagos)' },
 ]}
 defaultValue="GMT"
 />
 </div>

 <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-3 pt-6 flex items-center">
 <BellRing className="w-5 h-5 mr-2 text-primary-400" />
 <span>PWA Push Notifications</span>
 </h3>

 <div className="space-y-4 max-w-md">
 {push.isLoading ? (
 <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 animate-pulse">
 <div className="space-y-2">
 <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
 <div className="h-3 w-52 bg-slate-200 dark:bg-slate-700 rounded" />
 </div>
 <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
 </div>
 ) : !push.isSupported ? (
 <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/5 text-xs text-red-400">
 Push notifications are not supported on this device or browser. To use push notifications, please make sure you are using a secure context (HTTPS) and a modern mobile or desktop browser that supports service workers.
 </div>
 ) : (
 <div className="space-y-4">
 <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20">
 <div>
 <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">Push Alerts Status</span>
 <span className="text-xs text-slate-500">
 {push.isSubscribed
 ? 'Native device push alerts are active.'
 : push.permission === 'denied'
 ? 'Blocked by browser. Reset notification permission to enable.'
 : 'Receive alerts when bills are due or budgets are close to limit.'}
 </span>
 </div>
 <Button
 size="sm"
 variant={push.isSubscribed ? 'destructive' : 'default'}
 onClick={push.isSubscribed ? push.unsubscribe : push.subscribe}
 isLoading={push.isActionLoading}
 >
 {push.isSubscribed ? (
 <>
 <BellOff className="w-3.5 h-3.5 mr-1.5" /> Disable
 </>
 ) : (
 <>
 <BellRing className="w-3.5 h-3.5 mr-1.5" /> Enable
 </>
 )}
 </Button>
 </div>

 {push.isSubscribed && (
 <div className="flex justify-start pt-2">
 <Button
 size="sm"
 variant="outline"
 onClick={push.sendTestNotification}
 >
 Send Test Push Notification
 </Button>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 )}

 {/* TAB 4: SYSTEM DATA OPERATIONS */}
 {activeTab === 'data' && (
 <div className="space-y-6">
 <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center">
 <Database className="w-5 h-5 mr-2 text-primary-400" />
 <span>Backup, Export & System Restore</span>
 </h3>

 <div className="space-y-5">
 <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/10 space-y-3">
 <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Download Full Local Backup</h4>
 <p className="text-xs text-slate-500 leading-normal">
 Securely export a JSON backup containing all registered accounts, budget category allocations, transaction
 histories, savings logs, debt tracks, and active bills.
 </p>
 <Button size="sm" onClick={handleBackupExport} isLoading={isBackupExporting}>
 <Download className="w-3.5 h-3.5 mr-1.5" /> Download System Backup
 </Button>
 </div>

 <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/10 space-y-3">
 <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Restore System Backup</h4>
 <p className="text-xs text-slate-500 leading-normal">
 Restore all your transactions, categories, budgets, and settings from a previously downloaded JSON backup file.
 <span className="text-red-400 font-medium block mt-1">
 Warning: Doing this will permanently delete your current accounts and overwrite them with the backup data!
 </span>
 </p>
 <div className="max-w-md">
 <FileUpload
 onFileSelect={handleBackupRestore}
 value={restoreFile}
 accept="application/json"
 label="Select backup JSON file"
 />
 </div>
 {restoreFile && (
 <div className="flex items-center space-x-2 pt-2">
 <Button
 size="sm"
 onClick={executeRestore}
 isLoading={isBackupRestoring}
 >
 Execute Restore
 </Button>
 <Button
 size="sm"
 variant="outline"
 onClick={() => setRestoreFile(undefined)}
 disabled={isBackupRestoring}
 >
 Cancel
 </Button>
 </div>
 )}
 </div>

 <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/5 space-y-3">
 <h4 className="text-sm font-semibold text-red-400">Danger Zone</h4>
 <p className="text-xs text-slate-500 leading-normal">
 Deleting your account is permanent. It clears your profile and drops all database tables, deleting all your
 financial records completely.
 </p>
 <Button size="sm" variant="destructive" onClick={() => alert('Account deletion requires contacting administrator.')}>
 Delete Account Permanently
 </Button>
 </div>
 </div>
 </div>
 )}
 </Card>
 </div>
 </div>
 );
}
