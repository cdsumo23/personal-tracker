// constants/index.ts

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'LRD', 'NGN', 'GHS'] as const;
export type Currency = typeof CURRENCIES[number];

export const ACCOUNT_TYPES = [
  'CASH',
  'CHECKING',
  'SAVINGS',
  'MOBILE_MONEY',
  'CREDIT_CARD',
  'INVESTMENT'
] as const;
export type AccountType = typeof ACCOUNT_TYPES[number];

export const TRANSACTION_TYPES = ['INCOME', 'EXPENSE', 'TRANSFER'] as const;
export type TransactionType = typeof TRANSACTION_TYPES[number];

export const RECURRING_INTERVALS = [
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'YEARLY'
] as const;
export type RecurringInterval = typeof RECURRING_INTERVALS[number];

export const BUDGET_PERIODS = ['MONTHLY', 'QUARTERLY', 'ANNUAL'] as const;
export type BudgetPeriod = typeof BUDGET_PERIODS[number];

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type Priority = typeof PRIORITIES[number];

export const DEBT_TYPES = [
  'PERSONAL_LOAN',
  'BANK_LOAN',
  'CREDIT_CARD',
  'MORTGAGE',
  'OTHER'
] as const;
export type DebtType = typeof DEBT_TYPES[number];

export const DEBT_STRATEGIES = ['SNOWBALL', 'AVALANCHE'] as const;
export type DebtStrategy = typeof DEBT_STRATEGIES[number];

export const BILL_FREQUENCIES = ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'] as const;
export type BillFrequency = typeof BILL_FREQUENCIES[number];

export const NOTIFICATION_TYPES = ['INFO', 'WARNING', 'SUCCESS', 'ALERT'] as const;
export type NotificationType = typeof NOTIFICATION_TYPES[number];

export const DEFAULT_CATEGORIES = {
  INCOME: [
    { name: 'Salary', icon: 'Briefcase', color: '#10b981' },
    { name: 'Business', icon: 'TrendingUp', color: '#059669' },
    { name: 'Freelance', icon: 'Laptop', color: '#3b82f6' },
    { name: 'Investment', icon: 'BarChart2', color: '#8b5cf6' },
    { name: 'Bonus', icon: 'Gift', color: '#ec4899' },
    { name: 'Other Income', icon: 'PlusCircle', color: '#6b7280' }
  ],
  EXPENSE: [
    { name: 'Food & Dining', icon: 'Utensils', color: '#f97316' },
    { name: 'Rent & Housing', icon: 'Home', color: '#ef4444' },
    { name: 'Utilities', icon: 'Zap', color: '#eab308' },
    { name: 'Transportation', icon: 'Car', color: '#06b6d4' },
    { name: 'Healthcare', icon: 'HeartPulse', color: '#14b8a6' },
    { name: 'Education', icon: 'GraduationCap', color: '#6366f1' },
    { name: 'Entertainment', icon: 'Sparkles', color: '#a855f7' },
    { name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899' },
    { name: 'Insurance', icon: 'ShieldCheck', color: '#3b82f6' },
    { name: 'Travel', icon: 'Plane', color: '#10b981' },
    { name: 'Personal Care', icon: 'Smile', color: '#f43f5e' },
    { name: 'Subscriptions', icon: 'CalendarDays', color: '#64748b' },
    { name: 'Savings', icon: 'PiggyBank', color: '#059669' },
    { name: 'Debt Payment', icon: 'CreditCard', color: '#b91c1c' },
    { name: 'Other', icon: 'HelpCircle', color: '#94a3b8' }
  ]
};
