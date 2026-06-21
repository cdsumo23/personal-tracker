'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { Menu, Bell, User as UserIcon, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import * as React from 'react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { toggleSidebar, theme, setTheme } = useUiStore();
  const [showMenu, setShowMenu] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Format header title based on current path
  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'Overview';
    const rawTitle = segments[0];
    
    // Capitalize and format
    const formatMap: Record<string, string> = {
      dashboard: 'Overview',
      accounts: 'My Accounts',
      transactions: 'Ledger Activity',
      budgets: 'Monthly Budgets',
      goals: 'Savings Goals',
      debts: 'Debt Reduction',
      bills: 'Bills & Subscriptions',
      calendar: 'Financial Calendar',
      reports: 'Analytics Hub',
      profile: 'Settings',
      admin: 'Admin Console',
    };

    return formatMap[rawTitle] || rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
  };

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between transition-colors duration-300">
      {/* Left side: Hamburger (mobile) + Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 xl:hidden touch-target transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 select-none">
          {getPageTitle()}
        </h2>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors touch-target"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {!mounted ? (
            <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
          ) : theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={() => router.push('/notifications')}
          className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors touch-target"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
        </button>

        {/* User profile dropdown container */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 focus:outline-none select-none touch-target"
          >
            <Avatar
              name={`${user?.firstName || 'User'} ${user?.lastName || ''}`}
              src={user?.profilePhoto}
              size="sm"
            />
          </button>

          {/* Simple Dropdown Menu */}
          {showMenu && (
            <>
              {/* Overlay to close on click outside */}
              <div
                onClick={() => setShowMenu(false)}
                className="fixed inset-0 z-30 bg-transparent"
              />
              <div className="absolute right-0 mt-2.5 w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-2 z-40">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    router.push('/profile');
                  }}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-target"
                >
                  <UserIcon className="w-4 h-4" />
                  Account Settings
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    router.push('/profile?tab=security');
                  }}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-target"
                >
                  <Settings className="w-4 h-4" />
                  Security Options
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <button
                  onClick={() => {
                    setShowMenu(false);
                    logout();
                  }}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-lg text-xs font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-500/5 transition-colors touch-target"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
