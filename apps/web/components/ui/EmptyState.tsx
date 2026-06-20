import * as React from 'react';
import { Button } from './Button';
import { Plus } from 'lucide-react';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 max-w-md mx-auto my-6 space-y-4">
      <div className="p-4 rounded-full bg-slate-800/60 text-slate-400">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-200">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-2">
          <Plus className="w-4 h-4 mr-1.5" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
