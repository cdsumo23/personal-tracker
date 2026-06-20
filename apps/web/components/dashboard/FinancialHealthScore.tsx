import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export interface FinancialHealthScoreProps {
  score: number;
  className?: string;
}

export function FinancialHealthScore({ score, className }: FinancialHealthScoreProps) {
  // Determine rating based on score
  const getRating = (val: number) => {
    if (val >= 80) return { label: 'Excellent', color: 'text-emerald-400', stroke: '#10b981', desc: 'Your financial habits are exemplary. Keep building your assets.' };
    if (val >= 60) return { label: 'Good', color: 'text-primary-400', stroke: '#6366f1', desc: 'You are on track, but there is room to optimize your budget allocations.' };
    if (val >= 40) return { label: 'Fair', color: 'text-amber-400', stroke: '#f59e0b', desc: 'Watch your expense limits. Consider reducing luxury subscriptions.' };
    return { label: 'Needs Attention', color: 'text-red-400', stroke: '#ef4444', desc: 'Your debt balances or budget limits require immediate restructuring.' };
  };

  const rating = getRating(score);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className={cn('flex flex-col sm:flex-row items-center gap-6 hover:border-slate-700/60', className)}>
      {/* Circular Gauge */}
      <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          {/* Base track */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Active indicator */}
          <motion.circle
            cx="56"
            cy="56"
            r={radius}
            stroke={rating.stroke}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
          <span className="text-2xl font-black text-slate-100 tracking-tight">{score}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Score</span>
        </div>
      </div>

      {/* Advice and text details */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <Activity className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Financial Health</span>
        </div>
        <h3 className={cn('text-lg font-extrabold tracking-tight', rating.color)}>
          {rating.label}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
          {rating.desc}
        </p>
      </div>
    </Card>
  );
}
