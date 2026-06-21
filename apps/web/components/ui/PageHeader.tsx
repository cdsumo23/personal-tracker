import * as React from 'react';
import { Button } from './Button';
import { Plus } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  subtitle,
  actionLabel,
  onAction,
  actionIcon,
  action,
}: PageHeaderProps) {
  const displayDescription = description || subtitle;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 select-none">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h1>
        {displayDescription && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{displayDescription}</p>
        )}
      </div>
      {action ? (
        <div className="sm:self-center">{action}</div>
      ) : (
        actionLabel && onAction && (
          <Button onClick={onAction} className="sm:self-center">
            {actionIcon || <Plus className="w-4 h-4 mr-1.5" />}
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
}
