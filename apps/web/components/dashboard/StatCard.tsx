import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

export interface StatCardProps {
 title: string;
 value: string;
 icon: React.ReactNode;
 trend?: {
 value: number;
 isPositive: boolean;
 };
 description?: string;
 className?: string;
}

export function StatCard({ title, value, icon, trend, description, className }: StatCardProps) {
 return (
 <Card className={cn('hover:border-slate-300 dark:border-slate-700/60 overflow-hidden relative group', className)}>
 <div className="flex justify-between items-start">
 <div className="space-y-2.5">
 <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
 <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{value}</h3>
 </div>
 <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 group-hover:text-primary-400 group-hover:bg-primary-500/10 transition-all duration-300">
 {icon}
 </div>
 </div>

 {(trend || description) && (
 <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/60 text-xs">
 {trend && (
 <span
 className={cn(
 'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold',
 trend.isPositive
 ? 'bg-emerald-500/10 text-emerald-400'
 : 'bg-red-500/10 text-red-400'
 )}
 >
 {trend.isPositive ? (
 <ArrowUpRight className="w-3.5 h-3.5" />
 ) : (
 <ArrowDownRight className="w-3.5 h-3.5" />
 )}
 {trend.value}%
 </span>
 )}
 {description && (
 <span className="text-slate-500 dark:text-slate-400 font-medium">{description}</span>
 )}
 </div>
 )}
 </Card>
 );
}
