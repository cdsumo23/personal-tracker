'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  User
} from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const mobileNavItems = [
    { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Activity', href: '/transactions', icon: ArrowLeftRight },
    { label: 'Budgets', href: '/budgets', icon: PieChart },
    { label: 'Goals', href: '/goals', icon: Target },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800/80 backdrop-blur-md flex items-center justify-around xl:hidden px-2 pb-safe transition-colors duration-300">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full py-2 text-[10px] font-semibold select-none touch-target transition-colors',
              {
                'text-primary-600 dark:text-primary-400': isActive,
                'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300': !isActive,
              }
            )}
          >
            <Icon className="w-5 h-5 mb-1" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
