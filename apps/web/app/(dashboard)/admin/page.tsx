'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuthStore } from '@/store/auth.store';
import {
 ShieldAlert, Users, Landmark, Activity, History,
 Plus, Pencil, Trash2, Power, PowerOff, Search, X,
 CheckCircle, AlertCircle, Eye, EyeOff, ChevronLeft, ChevronRight
} from 'lucide-react';
import { formatDate, formatRelativeDate } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface AdminUser {
 id: string;
 email: string;
 firstName: string;
 lastName: string;
 phone?: string | null;
 country?: string | null;
 currency: string;
 timezone: string;
 profilePhoto?: string | null;
 role: 'USER' | 'ADMIN';
 isVerified: boolean;
 isActive: boolean;
 lastLoginAt?: string | null;
 createdAt: string;
 failedLoginAttempts?: number;
 lockedUntil?: string | null;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'GHS', 'LRD', 'CAD', 'AUD', 'JPY'];
const TIMEZONES = ['UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Africa/Lagos', 'Africa/Accra', 'Asia/Kolkata', 'Asia/Tokyo'];

// ─────────────────────────────────────────────
// User Form Modal (Create & Edit)
// ─────────────────────────────────────────────

interface UserFormModalProps {
 isOpen: boolean;
 onClose: () => void;
 editUser?: AdminUser | null;
 onSuccess: () => void;
}

function UserFormModal({ isOpen, onClose, editUser, onSuccess }: UserFormModalProps) {
 const isEdit = !!editUser;
 const [showPassword, setShowPassword] = React.useState(false);
 const [isSubmitting, setIsSubmitting] = React.useState(false);

 const [form, setForm] = React.useState({
 email: '',
 password: '',
 firstName: '',
 lastName: '',
 phone: '',
 country: '',
 currency: 'USD',
 timezone: 'UTC',
 role: 'USER' as 'USER' | 'ADMIN',
 isActive: true,
 isVerified: true,
 });
 const [errors, setErrors] = React.useState<Record<string, string>>({});

 // Populate form when editing
 React.useEffect(() => {
 if (editUser) {
 setForm({
 email: editUser.email,
 password: '',
 firstName: editUser.firstName,
 lastName: editUser.lastName,
 phone: editUser.phone || '',
 country: editUser.country || '',
 currency: editUser.currency || 'USD',
 timezone: editUser.timezone || 'UTC',
 role: editUser.role,
 isActive: editUser.isActive,
 isVerified: editUser.isVerified,
 });
 } else {
 setForm({
 email: '', password: '', firstName: '', lastName: '',
 phone: '', country: '', currency: 'USD', timezone: 'UTC',
 role: 'USER', isActive: true, isVerified: true,
 });
 }
 setErrors({});
 setShowPassword(false);
 }, [editUser, isOpen]);

 const validate = () => {
 const e: Record<string, string> = {};
 if (!form.firstName.trim()) e.firstName = 'First name is required';
 if (!form.lastName.trim()) e.lastName = 'Last name is required';
 if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email is required';
 if (!isEdit && !form.password.trim()) e.password = 'Password is required';
 if (form.password && form.password.length < 8) e.password = 'Password must be at least 8 characters';
 if (form.password && !/[A-Z]/.test(form.password)) e.password = 'Must contain an uppercase letter';
 if (form.password && !/[0-9]/.test(form.password)) e.password = 'Must contain a number';
 if (form.password && !/[^a-zA-Z0-9]/.test(form.password)) e.password = 'Must contain a special character';
 setErrors(e);
 return Object.keys(e).length === 0;
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!validate()) return;
 setIsSubmitting(true);
 try {
 const payload: any = {
 email: form.email,
 firstName: form.firstName,
 lastName: form.lastName,
 phone: form.phone || null,
 country: form.country || null,
 currency: form.currency,
 timezone: form.timezone,
 role: form.role,
 isActive: form.isActive,
 isVerified: form.isVerified,
 };
 if (!isEdit || form.password.trim()) {
 payload.password = form.password;
 }

 if (isEdit && editUser) {
 await adminApi.updateUser(editUser.id, payload);
 toast.success(`${form.firstName}'s profile updated.`);
 } else {
 await adminApi.createUser(payload);
 toast.success(`User ${form.email} created successfully.`);
 }
 onSuccess();
 onClose();
 } catch (err: any) {
 const msg = err.response?.data?.message || 'An error occurred. Please try again.';
 toast.error(msg);
 } finally {
 setIsSubmitting(false);
 }
 };

 const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

 return (
 <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? `Edit User — ${editUser?.firstName}` : 'Create New User'} className="sm:max-w-2xl">
 <form onSubmit={handleSubmit} className="space-y-5 pt-1">

 {/* Name Row */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">First Name <span className="text-red-500">*</span></label>
 <input
 value={form.firstName}
 onChange={e => set('firstName', e.target.value)}
 placeholder="John"
 className={`w-full py-3 px-4 rounded-xl bg-white dark:bg-slate-800 border text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${errors.firstName ? 'border-red-500/80' : 'border-slate-300 dark:border-slate-700'}`}
 />
 {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
 </div>
 <div className="space-y-1.5">
 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Last Name <span className="text-red-500">*</span></label>
 <input
 value={form.lastName}
 onChange={e => set('lastName', e.target.value)}
 placeholder="Doe"
 className={`w-full py-3 px-4 rounded-xl bg-white dark:bg-slate-800 border text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${errors.lastName ? 'border-red-500/80' : 'border-slate-300 dark:border-slate-700'}`}
 />
 {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
 </div>
 </div>

 {/* Email */}
 <div className="space-y-1.5">
 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address <span className="text-red-500">*</span></label>
 <input
 type="email"
 value={form.email}
 onChange={e => set('email', e.target.value)}
 placeholder="john@example.com"
 className={`w-full py-3 px-4 rounded-xl bg-white dark:bg-slate-800 border text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${errors.email ? 'border-red-500/80' : 'border-slate-300 dark:border-slate-700'}`}
 />
 {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
 </div>

 {/* Password */}
 <div className="space-y-1.5">
 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
 {isEdit ? 'New Password (leave blank to keep current)' : 'Password'} {!isEdit && <span className="text-red-500">*</span>}
 </label>
 <div className="relative">
 <input
 type={showPassword ? 'text' : 'password'}
 value={form.password}
 onChange={e => set('password', e.target.value)}
 placeholder={isEdit ? '•••••••• (unchanged)' : 'Min. 8 chars, uppercase, number, symbol'}
 className={`w-full py-3 pl-4 pr-11 rounded-xl bg-white dark:bg-slate-800 border text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${errors.password ? 'border-red-500/80' : 'border-slate-300 dark:border-slate-700'}`}
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
 >
 {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
 </div>

 {/* Phone & Country Row */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
 <input
 value={form.phone}
 onChange={e => set('phone', e.target.value)}
 placeholder="+1234567890"
 className="w-full py-3 px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
 />
 </div>
 <div className="space-y-1.5">
 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Country</label>
 <input
 value={form.country}
 onChange={e => set('country', e.target.value)}
 placeholder="US"
 className="w-full py-3 px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
 />
 </div>
 </div>

 {/* Currency & Timezone */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Select
 label="Currency"
 value={form.currency}
 onChange={e => set('currency', e.target.value)}
 options={CURRENCIES.map(c => ({ value: c, label: c }))}
 />
 <Select
 label="Timezone"
 value={form.timezone}
 onChange={e => set('timezone', e.target.value)}
 options={TIMEZONES.map(t => ({ value: t, label: t.replace('_', ' ') }))}
 />
 </div>

 {/* Role & Toggles */}
 <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
 <div className="flex-1 space-y-1.5">
 <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Role</label>
 <div className="flex gap-2">
 {(['USER', 'ADMIN'] as const).map(r => (
 <button
 key={r}
 type="button"
 onClick={() => set('role', r)}
 className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
 form.role === r
 ? r === 'ADMIN'
 ? 'bg-violet-500/20 border border-violet-500/50 text-violet-600 dark:text-violet-300'
 : 'bg-primary-500/20 border border-primary-500/50 text-primary-600 dark:text-primary-300'
 : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
 }`}
 >
 {r}
 </button>
 ))}
 </div>
 </div>
 <div className="flex sm:flex-col gap-4 sm:gap-2">
 <label className="flex items-center gap-2 cursor-pointer">
 <div
 onClick={() => set('isActive', !form.isActive)}
 className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${form.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
 >
 <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
 </div>
 <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Active</span>
 </label>
 <label className="flex items-center gap-2 cursor-pointer">
 <div
 onClick={() => set('isVerified', !form.isVerified)}
 className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${form.isVerified ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'}`}
 >
 <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isVerified ? 'translate-x-5' : 'translate-x-0.5'}`} />
 </div>
 <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Verified</span>
 </label>
 </div>
 </div>

 {/* Submit Row */}
 <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
 <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
 <Button
 type="submit"
 size="sm"
 isLoading={isSubmitting}
 className="bg-gradient-to-r from-primary-500 to-violet-600 hover:from-primary-600 hover:to-violet-700 border-0"
 >
 {isEdit ? 'Save Changes' : 'Create User'}
 </Button>
 </div>
 </form>
 </Modal>
 );
}

// ─────────────────────────────────────────────
// Main Admin Page
// ─────────────────────────────────────────────

const API_HOST = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');

function getAvatarUrl(profilePhoto?: string | null): string | undefined {
 if (!profilePhoto) return undefined;
 if (profilePhoto.startsWith('http') || profilePhoto.startsWith('data:')) return profilePhoto;
 return `${API_HOST}${profilePhoto}`;
}

export default function AdminPage() {
 const user = useAuthStore((state) => state.user);
 const queryClient = useQueryClient();

 const [activeTab, setActiveTab] = React.useState<'stats' | 'users' | 'audit'>('stats');
 const [usersPage, setUsersPage] = React.useState(1);
 const [logsPage, setLogsPage] = React.useState(1);
 const [search, setSearch] = React.useState('');
 const [debouncedSearch, setDebouncedSearch] = React.useState('');

 // Modals state
 const [createOpen, setCreateOpen] = React.useState(false);
 const [editUser, setEditUser] = React.useState<AdminUser | null>(null);
 const [deleteTarget, setDeleteTarget] = React.useState<AdminUser | null>(null);
 const [suspendTarget, setSuspendTarget] = React.useState<AdminUser | null>(null);

 const isAdmin = user?.role === 'ADMIN';

 // Debounce search input
 React.useEffect(() => {
 const t = setTimeout(() => {
 setDebouncedSearch(search);
 setUsersPage(1);
 }, 350);
 return () => clearTimeout(t);
 }, [search]);

 // Queries
 const statsQuery = useQuery({
 queryKey: ['admin-stats'],
 queryFn: async () => {
 const res = await adminApi.getStats();
 return res.data.data as any;
 },
 enabled: isAdmin && activeTab === 'stats',
 });

 const usersQuery = useQuery({
 queryKey: ['admin-users', usersPage, debouncedSearch],
 queryFn: async () => {
 const res = await adminApi.getUsers({ page: usersPage, limit: 10, search: debouncedSearch || undefined });
 return res.data;
 },
 enabled: isAdmin && activeTab === 'users',
 });

 const auditLogsQuery = useQuery({
 queryKey: ['admin-audit-logs', logsPage],
 queryFn: async () => {
 const res = await adminApi.getAuditLogs({ page: logsPage, limit: 15 });
 return res.data;
 },
 enabled: isAdmin && activeTab === 'audit',
 });

 // Mutations
 const deleteMutation = useMutation({
 mutationFn: (id: string) => adminApi.deleteUser(id),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['admin-users'] });
 queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
 toast.success('User deleted successfully.');
 setDeleteTarget(null);
 },
 onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete user.'),
 });

 const statusMutation = useMutation({
 mutationFn: ({ userId, status }: { userId: string; status: 'active' | 'suspended' }) =>
 adminApi.updateUserStatus(userId, status),
 onSuccess: (_, vars) => {
 queryClient.invalidateQueries({ queryKey: ['admin-users'] });
 toast.success(`User ${vars.status === 'active' ? 'activated' : 'suspended'} successfully.`);
 setSuspendTarget(null);
 },
 onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update status.'),
 });

 const invalidateUsers = () => {
 queryClient.invalidateQueries({ queryKey: ['admin-users'] });
 queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
 };

 if (!isAdmin) {
 return (
 <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 space-y-4">
 <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
 <ShieldAlert className="w-12 h-12" />
 </div>
 <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Access Denied</h3>
 <p className="text-sm text-slate-500 max-w-sm leading-normal">
 This panel is restricted to system administrators. Contact a support representative if you believe this is a mistake.
 </p>
 </div>
 );
 }

 const users: AdminUser[] = (usersQuery.data?.data as AdminUser[]) || [];
 const usersPagination = usersQuery.data?.meta;
 const auditLogs: any[] = (auditLogsQuery.data?.data as any[]) || [];
 const auditPagination = auditLogsQuery.data?.meta;

 return (
 <div className="space-y-6 pb-20">
 <PageHeader
 title="Admin Control Panel"
 description="Monitor system behaviors, analyze metrics, audit logins, and manage user profiles."
 />

 {/* Tabs */}
 <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
 {([
 { id: 'stats', label: 'System Metrics', icon: Activity },
 { id: 'users', label: 'User Profiles', icon: Users },
 { id: 'audit', label: 'Audit Logging', icon: History },
 ] as const).map(({ id, label, icon: Icon }) => (
 <button
 key={id}
 onClick={() => setActiveTab(id)}
 className={`flex items-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
 activeTab === id
 ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
 : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
 }`}
 >
 <Icon className="w-4 h-4" />
 <span>{label}</span>
 </button>
 ))}
 </div>

 {/* ── STATS TAB ── */}
 {activeTab === 'stats' && (
 <div className="space-y-6">
 {statsQuery.isLoading ? (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
 {[1, 2, 3].map((n) => <Card key={n} className="h-28 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700" />)}
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <Card className="p-5 flex items-center space-x-4 hover:border-violet-500/30 transition-colors">
 <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400">
 <Users className="w-5 h-5" />
 </div>
 <div>
 <p className="text-xs font-semibold text-slate-500">Total Users</p>
 <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-200">{statsQuery.data?.totalUsers || 0}</p>
 </div>
 </Card>
 <Card className="p-5 flex items-center space-x-4 hover:border-emerald-500/30 transition-colors">
 <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
 <Landmark className="w-5 h-5" />
 </div>
 <div>
 <p className="text-xs font-semibold text-slate-500">Total Transactions</p>
 <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-200">{statsQuery.data?.totalTransactions || 0}</p>
 </div>
 </Card>
 <Card className="p-5 flex items-center space-x-4 hover:border-sky-500/30 transition-colors">
 <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400">
 <Activity className="w-5 h-5" />
 </div>
 <div>
 <p className="text-xs font-semibold text-slate-500">Total Assets Tracked</p>
 <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-200">
 ${Number(statsQuery.data?.totalAssetsTracked || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
 </p>
 </div>
 </Card>
 </div>
 )}

 <Card className="p-6">
 <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-4">Server & Service Health</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
 {[
 { label: 'API Gateway Status', status: 'Online', variant: 'success' as const },
 { label: 'PostgreSQL DB Cluster', status: 'Connected', variant: 'success' as const },
 { label: 'Background Jobs Worker', status: 'Active', variant: 'success' as const },
 { label: 'PWA / Service Worker', status: 'Enabled', variant: 'info' as const },
 ].map(({ label, status, variant }) => (
 <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800">
 <span className="text-slate-500 dark:text-slate-400">{label}</span>
 <Badge variant={variant}>{status}</Badge>
 </div>
 ))}
 </div>
 </Card>
 </div>
 )}

 {/* ── USERS TAB ── */}
 {activeTab === 'users' && (
 <div className="space-y-4">
 {/* Toolbar */}
 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
 <div className="relative flex-1 w-full sm:max-w-sm">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
 <input
 value={search}
 onChange={e => setSearch(e.target.value)}
 placeholder="Search by name or email…"
 className="w-full py-2.5 pl-9 pr-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
 />
 {search && (
 <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
 <X className="w-4 h-4" />
 </button>
 )}
 </div>
 <Button
 size="sm"
 onClick={() => setCreateOpen(true)}
 className="bg-gradient-to-r from-primary-500 to-violet-600 hover:from-primary-600 hover:to-violet-700 border-0 shadow-lg shadow-primary-500/10 whitespace-nowrap"
 >
 <Plus className="w-4 h-4 mr-1.5" />
 Add New User
 </Button>
 </div>

 {/* Users Grid */}
 <Card className="overflow-hidden">
 {usersQuery.isLoading ? (
 <div className="p-6 space-y-4">
 {[...Array(5)].map((_, i) => (
 <div key={i} className="flex items-center gap-4 animate-pulse">
 <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
 <div className="flex-1 space-y-2">
 <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
 <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
 </div>
 </div>
 ))}
 </div>
 ) : users.length === 0 ? (
 <div className="p-16 text-center">
 <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
 <p className="text-sm font-semibold text-slate-500">
 {debouncedSearch ? `No users matching "${debouncedSearch}"` : 'No users found'}
 </p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-xs">
 <thead>
 <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30">
 <th className="text-left py-3.5 px-5 font-semibold text-slate-500 uppercase tracking-wide">User</th>
 <th className="text-left py-3.5 px-4 font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Role</th>
 <th className="text-left py-3.5 px-4 font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Status</th>
 <th className="text-left py-3.5 px-4 font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Joined</th>
 <th className="text-right py-3.5 px-5 font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
 {users.map((u) => (
 <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
 {/* User Column */}
 <td className="py-3.5 px-5">
 <div className="flex items-center gap-3">
 <div className="relative">
 <Avatar
 name={`${u.firstName} ${u.lastName}`}
 src={getAvatarUrl(u.profilePhoto)}
 size="md"
 />
 <span
 className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
 u.isActive ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'
 }`}
 />
 </div>
 <div>
 <p className="font-semibold text-slate-900 dark:text-slate-200 text-[13px]">{u.firstName} {u.lastName}</p>
 <p className="text-slate-500 text-[11px] mt-0.5">{u.email}</p>
 </div>
 </div>
 </td>

 {/* Role */}
 <td className="py-3.5 px-4 hidden sm:table-cell">
 <Badge variant={u.role === 'ADMIN' ? 'info' : 'outline'}>
 {u.role}
 </Badge>
 </td>

 {/* Status */}
 <td className="py-3.5 px-4 hidden md:table-cell">
 <div className="flex items-center gap-1.5">
 {u.isActive ? (
 <><CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /><span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active</span></>
 ) : (
 <><AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /><span className="text-amber-600 dark:text-amber-400 font-semibold">Suspended</span></>
 )}
 {u.isVerified && <span className="ml-1.5 text-sky-600 dark:text-sky-400 text-[10px] font-bold bg-sky-50 dark:bg-sky-400/10 px-1.5 py-0.5 rounded-full">VERIFIED</span>}
 </div>
 </td>

 {/* Joined */}
 <td className="py-3.5 px-4 hidden lg:table-cell">
 <span className="text-slate-500">{formatDate(u.createdAt, 'MMM d, yyyy')}</span>
 </td>

 {/* Actions */}
 <td className="py-3.5 px-5">
 <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
 {/* Edit */}
 <button
 onClick={() => setEditUser(u)}
 title="Edit user"
 className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
 >
 <Pencil className="w-3.5 h-3.5" />
 </button>

 {/* Suspend/Activate */}
 <button
 onClick={() => setSuspendTarget(u)}
 title={u.isActive ? 'Suspend user' : 'Activate user'}
 className={`p-1.5 rounded-lg transition-colors ${
 u.isActive
 ? 'text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-400/10'
 : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-400/10'
 }`}
 >
 {u.isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
 </button>

 {/* Delete */}
 <button
 onClick={() => setDeleteTarget(u)}
 title="Delete user"
 className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {/* Pagination */}
 {usersPagination && usersPagination.totalPages > 1 && (
 <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
 <span>
 Showing {((usersPage - 1) * 10) + 1}–{Math.min(usersPage * 10, usersPagination.total)} of {usersPagination.total} users
 </span>
 <div className="flex items-center gap-2">
 <button
 onClick={() => setUsersPage(p => Math.max(1, p - 1))}
 disabled={usersPage <= 1}
 className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
 >
 <ChevronLeft className="w-4 h-4" />
 </button>
 <span className="font-semibold text-slate-600 dark:text-slate-300">{usersPage} / {usersPagination.totalPages}</span>
 <button
 onClick={() => setUsersPage(p => Math.min(usersPagination.totalPages, p + 1))}
 disabled={usersPage >= usersPagination.totalPages}
 className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
 >
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </div>
 )}
 </Card>
 </div>
 )}

 {/* ── AUDIT LOG TAB ── */}
 {activeTab === 'audit' && (
 <Card className="overflow-hidden">
 {auditLogsQuery.isLoading ? (
 <div className="p-6 space-y-3 animate-pulse">
 {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}
 </div>
 ) : auditLogs.length === 0 ? (
 <div className="p-16 text-center">
 <History className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
 <p className="text-sm font-semibold text-slate-500">No audit logs recorded yet</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-xs">
 <thead>
 <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30">
 <th className="text-left py-3.5 px-5 font-semibold text-slate-500 uppercase tracking-wide">Time</th>
 <th className="text-left py-3.5 px-4 font-semibold text-slate-500 uppercase tracking-wide">User</th>
 <th className="text-left py-3.5 px-4 font-semibold text-slate-500 uppercase tracking-wide">Action</th>
 <th className="text-left py-3.5 px-4 font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Entity</th>
 <th className="text-left py-3.5 px-4 font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">IP</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
 {auditLogs.map((log) => (
 <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
 <td className="py-3 px-5 text-slate-500 whitespace-nowrap">{formatRelativeDate(log.createdAt)}</td>
 <td className="py-3 px-4">
 {log.user ? (
 <span className="text-slate-700 dark:text-slate-300 font-semibold">{log.user.firstName} {log.user.lastName}</span>
 ) : (
 <span className="text-slate-500">System</span>
 )}
 </td>
 <td className="py-3 px-4">
 <span className="font-bold text-primary-600 dark:text-primary-400">{log.action}</span>
 </td>
 <td className="py-3 px-4 hidden md:table-cell">
 <div>
 <span className="text-slate-700 dark:text-slate-300 font-semibold">{log.entity}</span>
 <p className="text-slate-500 text-[10px] truncate max-w-[120px]">{log.entityId}</p>
 </div>
 </td>
 <td className="py-3 px-4 hidden lg:table-cell font-mono text-slate-500">{log.ipAddress || '—'}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {/* Audit Pagination */}
 {auditPagination && auditPagination.totalPages > 1 && (
 <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
 <span>{auditPagination.total} total events</span>
 <div className="flex items-center gap-2">
 <button
 onClick={() => setLogsPage(p => Math.max(1, p - 1))}
 disabled={logsPage <= 1}
 className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
 >
 <ChevronLeft className="w-4 h-4" />
 </button>
 <span className="font-semibold text-slate-600 dark:text-slate-300">{logsPage} / {auditPagination.totalPages}</span>
 <button
 onClick={() => setLogsPage(p => Math.min(auditPagination.totalPages, p + 1))}
 disabled={logsPage >= auditPagination.totalPages}
 className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
 >
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </div>
 )}
 </Card>
 )}

 {/* ── MODALS ── */}

 {/* Create User Modal */}
 <UserFormModal
 isOpen={createOpen}
 onClose={() => setCreateOpen(false)}
 onSuccess={invalidateUsers}
 />

 {/* Edit User Modal */}
 <UserFormModal
 isOpen={!!editUser}
 onClose={() => setEditUser(null)}
 editUser={editUser}
 onSuccess={invalidateUsers}
 />

 {/* Suspend/Activate Confirm */}
 <ConfirmDialog
 isOpen={!!suspendTarget}
 onClose={() => setSuspendTarget(null)}
 onConfirm={async () => {
 if (!suspendTarget) return;
 await statusMutation.mutateAsync({
 userId: suspendTarget.id,
 status: suspendTarget.isActive ? 'suspended' : 'active',
 });
 }}
 title={suspendTarget?.isActive ? 'Suspend User Account' : 'Activate User Account'}
 message={
 suspendTarget?.isActive
 ? `Are you sure you want to suspend ${suspendTarget.firstName} ${suspendTarget.lastName}? They will immediately lose access to the platform.`
 : `Reactivate ${suspendTarget?.firstName} ${suspendTarget?.lastName}'s account? They will regain full access to the platform.`
 }
 confirmLabel={suspendTarget?.isActive ? 'Yes, Suspend' : 'Yes, Activate'}
 isDestructive={suspendTarget?.isActive}
 />

 {/* Delete Confirm */}
 <ConfirmDialog
 isOpen={!!deleteTarget}
 onClose={() => setDeleteTarget(null)}
 onConfirm={async () => {
 if (!deleteTarget) return;
 await deleteMutation.mutateAsync(deleteTarget.id);
 }}
 title="Permanently Delete User"
 message={`This will soft-delete ${deleteTarget?.firstName} ${deleteTarget?.lastName} (${deleteTarget?.email}). They will be removed from all active listings and will not be able to log in. This action is difficult to reverse.`}
 confirmLabel="Yes, Delete User"
 isDestructive
 />
 </div>
 );
}
