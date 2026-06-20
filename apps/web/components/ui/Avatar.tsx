import * as React from 'react';
import { cn, getInitials } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ className, src, name, size = 'md', ...props }: AvatarProps) {
  const [error, setError] = React.useState(false);
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden bg-slate-800 border border-slate-700 text-slate-200 select-none font-semibold shadow-inner',
        {
          'w-8 h-8 text-xs': size === 'sm',
          'w-10 h-10 text-sm': size === 'md',
          'w-14 h-14 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {src && !error ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          onError={() => setError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-slate-300">{initials}</span>
      )}
    </div>
  );
}
