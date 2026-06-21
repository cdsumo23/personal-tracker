'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { Avatar } from '@/components/ui/Avatar';
import {
  TrendingUp,
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PieChart,
  Target,
  TrendingDown,
  CalendarDays,
  Calendar,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  X,
  Globe,
  Tags
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUiStore();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Accounts', href: '/accounts', icon: Wallet },
    { label: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
    { label: 'Budgets', href: '/budgets', icon: PieChart },
    { label: 'Categories', href: '/categories', icon: Tags },
    { label: 'Savings Goals', href: '/goals', icon: Target },
    { label: 'Debts', href: '/debts', icon: TrendingDown },
    { label: 'Bills', href: '/bills', icon: CalendarDays },
    { label: 'Calendar', href: '/calendar', icon: Calendar },
    { label: 'Reports', href: '/reports', icon: BarChart3 },
    { label: 'Exchange Rates', href: '/currency', icon: Globe },
    { label: 'Settings', href: '/profile', icon: Settings },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ label: 'Admin Panel', href: '/admin', icon: Shield });
  }

  return (
    <>
      {/* Sidebar container (Desktop: sidebar, Mobile: overlay drawer) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 transition-all duration-300 xl:translate-x-0 xl:static xl:h-screen',
          {
            'translate-x-0': isSidebarOpen,
            '-translate-x-full': !isSidebarOpen,
          }
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-200 dark:border-slate-800/80">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-base">Smart Planner</span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 xl:hidden touch-target"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User profile brief */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center gap-3">
          <Avatar
            name={`${user?.firstName || 'User'} ${user?.lastName || ''}`}
            src={user?.profilePhoto}
            size="md"
          />
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
              {user?.firstName} {user?.lastName}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Nav list */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1280) toggleSidebar();
                }}
                className={cn(
                  'flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 select-none touch-target',
                  {
                    'bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/10 shadow-glow': isActive,
                    'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 border border-transparent': !isActive,
                  }
                )}
              >
                <Icon className={cn('w-5 h-5', { 'text-primary-600 dark:text-primary-400': isActive })} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/5 transition-all duration-200 select-none touch-target"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
          <div className="mt-4 text-[10px] text-slate-400 dark:text-slate-500 text-center select-none leading-relaxed">
            Smart Planner v1.0.0
            <br />
            Developed by <span className="text-slate-600 dark:text-slate-400 font-semibold">Charles D. Sumo</span>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-xs xl:hidden"
        />
      )}
    </>
  );
}
