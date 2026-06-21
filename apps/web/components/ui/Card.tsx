import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glow, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 p-6 shadow-xl backdrop-blur-md transition-all duration-300',
          {
            'shadow-glow border-primary-500/20': glow,
          },
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
