import * as React from 'react';
import CurrencyInputField, { CurrencyInputProps as BaseProps } from 'react-currency-input-field';
import { cn } from '@/lib/utils';

export interface CurrencyInputProps extends Omit<BaseProps, 'onChange'> {
 label?: string;
 error?: string;
 icon?: React.ReactNode;
 onValueChange?: (value: string | undefined, name?: string) => void;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
 ({ className, label, error, icon, onValueChange, placeholder = '0.00', ...props }, ref) => {
 return (
 <div className="w-full space-y-1.5">
 {label && (
 <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
 {label}
 </label>
 )}
 <div className="relative">
 {icon && (
 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
 {icon}
 </div>
 )}
 <CurrencyInputField
 ref={ref}
 onValueChange={onValueChange}
 placeholder={placeholder}
 className={cn(
 'w-full py-3 rounded-xl bg-white dark:bg-slate-800 border text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
 {
 'pl-10': icon,
 'pr-4 pl-4': !icon,
 'border-slate-200 dark:border-slate-700': !error,
 'border-red-500/80 focus:ring-red-500/50': error,
 },
 className
 )}
 decimalsLimit={2}
 allowNegativeValue={false}
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

CurrencyInput.displayName = 'CurrencyInput';
