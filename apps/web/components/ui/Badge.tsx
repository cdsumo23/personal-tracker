import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold select-none border transition-colors',
        {
          'bg-primary-500/10 text-primary-400 border-primary-500/20': variant === 'default',
          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20': variant === 'success',
          'bg-amber-500/10 text-amber-400 border-amber-500/20': variant === 'warning',
          'bg-red-500/10 text-red-400 border-red-500/20': variant === 'danger',
          'bg-blue-500/10 text-blue-400 border-blue-500/20': variant === 'info',
          'border-slate-700 bg-transparent text-slate-400': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
}
