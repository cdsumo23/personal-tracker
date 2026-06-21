import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
 label?: string;
 error?: string;
 icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
 ({ className, type = 'text', label, error, icon, ...props }, ref) => {
 return (
 <div className="w-full space-y-1.5">
 {label && (
 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
 {label}
 </label>
 )}
 <div className="relative">
 {icon && (
 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
 {icon}
 </div>
 )}
 <input
 ref={ref}
 type={type}
 className={cn(
 'w-full py-3 rounded-xl bg-white dark:bg-slate-800 border text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
 {
 'pl-10': icon,
 'pr-4': !icon,
 'pl-4': !icon,
 'border-slate-200 dark:border-slate-700': !error,
 'border-red-500/80 focus:ring-red-500/50': error,
 },
 className
 )}
 {...props}
 />
 </div>
 {error && (
 <p className="text-xs text-red-400 mt-1">{error}</p>
 )}
 </div>
 );
 }
);

Input.displayName = 'Input';
