import * as React from 'react';
import { cn, getInitials } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
 src?: string;
 name: string;
 size?: 'sm' | 'md' | 'lg';
}

const API_HOST = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');

export function Avatar({ className, src, name, size = 'md', ...props }: AvatarProps) {
 const [error, setError] = React.useState(false);
 const initials = getInitials(name);

 const getFullSrc = () => {
 if (!src) return undefined;
 if (src.startsWith('http') || src.startsWith('data:')) return src;
 return `${API_HOST}${src}`;
 };

 const fullSrc = getFullSrc();

 return (
 <div
 className={cn(
 'relative inline-flex items-center justify-center rounded-full overflow-hidden bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 select-none font-semibold shadow-inner',
 {
 'w-8 h-8 text-xs': size === 'sm',
 'w-10 h-10 text-sm': size === 'md',
 'w-14 h-14 text-lg': size === 'lg',
 },
 className
 )}
 {...props}
 >
 {fullSrc && !error ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img
 src={fullSrc}
 alt={name}
 onError={() => setError(true)}
 className="w-full h-full object-cover"
 />
 ) : (
 <span className="text-slate-600 dark:text-slate-300">{initials}</span>
 )}
 </div>
 );
}
