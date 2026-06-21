import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'success' | 'violet';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed select-none touch-target transform active:scale-98',
          {
            // Variants
            'bg-gradient-to-r from-primary-500 to-violet-600 text-white hover:from-primary-600 hover:to-violet-700 shadow-glow':
              variant === 'default',
            'bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700 shadow-glow':
              variant === 'violet',
            'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80':
              variant === 'outline',
            'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80':
              variant === 'ghost',
            'bg-red-500 text-white hover:bg-red-600':
              variant === 'destructive',
            'bg-emerald-500 text-white hover:bg-emerald-600':
              variant === 'success',
            
            // Sizes
            'px-3.5 py-1.5 text-xs': size === 'sm',
            'px-5 py-2.5 text-sm min-h-[44px]': size === 'md',
            'px-7 py-3 text-base min-h-[48px]': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
