import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

// ========================================
// CLASS NAME MERGER
// ========================================
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ========================================
// CURRENCY FORMATTING
// ========================================
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
  CHF: 'CHF',
  CNY: '¥',
  INR: '₹',
  MXN: 'MX$',
  BRL: 'R$',
  KRW: '₩',
  SGD: 'S$',
  HKD: 'HK$',
  NOK: 'kr',
  SEK: 'kr',
  DKK: 'kr',
  NZD: 'NZ$',
  ZAR: 'R',
  AED: 'AED',
};

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  options?: Intl.NumberFormatOptions
): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    }).format(amount);
  } catch {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${symbol}${Math.abs(amount).toFixed(2)}`;
  }
}

export function formatCurrencyCompact(amount: number, currency: string = 'USD'): string {
  const abs = Math.abs(amount);
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  if (abs >= 1_000_000) {
    return `${symbol}${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${symbol}${(abs / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(amount, currency);
}

// ========================================
// DATE FORMATTING
// ========================================
export function formatDate(date: string | Date, dateFormat: string = 'MMM d, yyyy'): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return 'Invalid date';
    return format(d, dateFormat);
  } catch {
    return 'Invalid date';
  }
}

export function formatRelativeDate(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return 'Invalid date';
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return 'Invalid date';
  }
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'MMM d, yyyy h:mm a');
}

// ========================================
// STRING UTILITIES
// ========================================
export function getInitials(name: string): string {
  if (!name) return '??';
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

export function truncate(str: string, length: number = 50): string {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + '…';
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ========================================
// NUMBER UTILITIES
// ========================================
export function calculatePercentage(current: number, total: number): number {
  if (!total || total === 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
}

export function getStatusColor(percentage: number): {
  text: string;
  bg: string;
  fill: string;
  label: string;
} {
  if (percentage < 70) {
    return {
      text: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      fill: 'bg-emerald-400',
      label: 'On Track',
    };
  }
  if (percentage < 90) {
    return {
      text: 'text-amber-400',
      bg: 'bg-amber-400/10',
      fill: 'bg-amber-400',
      label: 'Warning',
    };
  }
  return {
    text: 'text-red-400',
    bg: 'bg-red-400/10',
    fill: 'bg-red-400',
    label: 'Over Budget',
  };
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

// ========================================
// FUNCTION UTILITIES
// ========================================
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// ========================================
// COLOR UTILITIES
// ========================================
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#ffffff';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// ========================================
// MISC UTILITIES
// ========================================
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const group = String(item[key]);
      if (!result[group]) result[group] = [];
      result[group].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export const getDaysUntil = (date: string | Date): number => {
  const target = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
