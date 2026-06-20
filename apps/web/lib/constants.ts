// ========================================
// CURRENCIES
// ========================================
export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', flag: '🇲🇽' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', flag: '🇦🇪' },
];

// ========================================
// ACCOUNT TYPES
// ========================================
export const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking', icon: 'Wallet', color: '#6366f1', description: 'Everyday spending account' },
  { value: 'savings', label: 'Savings', icon: 'PiggyBank', color: '#10b981', description: 'High-yield savings account' },
  { value: 'credit', label: 'Credit Card', icon: 'CreditCard', color: '#f59e0b', description: 'Credit card account' },
  { value: 'investment', label: 'Investment', icon: 'TrendingUp', color: '#8b5cf6', description: 'Brokerage or investment account' },
  { value: 'crypto', label: 'Crypto', icon: 'Bitcoin', color: '#f97316', description: 'Cryptocurrency wallet' },
  { value: 'cash', label: 'Cash', icon: 'Banknote', color: '#06b6d4', description: 'Physical cash on hand' },
  { value: 'loan', label: 'Loan', icon: 'Building2', color: '#ef4444', description: 'Mortgage or personal loan' },
  { value: 'retirement', label: 'Retirement', icon: 'Briefcase', color: '#ec4899', description: '401k, IRA, pension' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal', color: '#94a3b8', description: 'Other financial account' },
];

// ========================================
// TRANSACTION TYPES
// ========================================
export const TRANSACTION_TYPES = [
  { value: 'income', label: 'Income', color: '#10b981', icon: 'ArrowDownLeft' },
  { value: 'expense', label: 'Expense', color: '#ef4444', icon: 'ArrowUpRight' },
  { value: 'transfer', label: 'Transfer', color: '#6366f1', icon: 'ArrowLeftRight' },
];

// ========================================
// CATEGORY ICONS
// ========================================
export const CATEGORY_ICONS = [
  { name: 'Home', icon: 'Home', color: '#6366f1' },
  { name: 'Car', icon: 'Car', color: '#f59e0b' },
  { name: 'Food', icon: 'Utensils', color: '#ef4444' },
  { name: 'Coffee', icon: 'Coffee', color: '#92400e' },
  { name: 'Shopping', icon: 'ShoppingBag', color: '#8b5cf6' },
  { name: 'Health', icon: 'Heart', color: '#ec4899' },
  { name: 'Travel', icon: 'Plane', color: '#06b6d4' },
  { name: 'Education', icon: 'BookOpen', color: '#10b981' },
  { name: 'Entertainment', icon: 'Gamepad2', color: '#f97316' },
  { name: 'Fitness', icon: 'Dumbbell', color: '#84cc16' },
  { name: 'Phone', icon: 'Smartphone', color: '#6366f1' },
  { name: 'Internet', icon: 'Wifi', color: '#0ea5e9' },
  { name: 'Subscriptions', icon: 'Repeat', color: '#a855f7' },
  { name: 'Insurance', icon: 'Shield', color: '#14b8a6' },
  { name: 'Taxes', icon: 'Receipt', color: '#f43f5e' },
  { name: 'Savings', icon: 'PiggyBank', color: '#10b981' },
  { name: 'Investment', icon: 'TrendingUp', color: '#22c55e' },
  { name: 'Salary', icon: 'Briefcase', color: '#10b981' },
  { name: 'Freelance', icon: 'Laptop', color: '#6366f1' },
  { name: 'Business', icon: 'Building', color: '#f59e0b' },
  { name: 'Gift', icon: 'Gift', color: '#ec4899' },
  { name: 'Kids', icon: 'Baby', color: '#facc15' },
  { name: 'Pets', icon: 'PawPrint', color: '#f97316' },
  { name: 'Beauty', icon: 'Sparkles', color: '#d946ef' },
  { name: 'Charity', icon: 'HandHeart', color: '#ef4444' },
  { name: 'Utilities', icon: 'Zap', color: '#eab308' },
  { name: 'Rent', icon: 'Building2', color: '#64748b' },
  { name: 'Medical', icon: 'Stethoscope', color: '#f43f5e' },
  { name: 'Other', icon: 'MoreHorizontal', color: '#94a3b8' },
];

// ========================================
// COLOR PALETTE
// ========================================
export const COLORS_PALETTE = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Slate', value: '#64748b' },
];

// ========================================
// CHART COLORS
// ========================================
export const CHART_COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#f97316',
  '#84cc16',
  '#14b8a6',
  '#0ea5e9',
  '#a855f7',
];

// ========================================
// RECURRING INTERVALS
// ========================================
export const RECURRING_INTERVALS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semiannual', label: 'Semi-annually' },
  { value: 'annual', label: 'Annually' },
];

// ========================================
// DEBT TYPES
// ========================================
export const DEBT_TYPES = [
  { value: 'credit_card', label: 'Credit Card', icon: 'CreditCard', color: '#f59e0b' },
  { value: 'mortgage', label: 'Mortgage', icon: 'Home', color: '#6366f1' },
  { value: 'auto_loan', label: 'Auto Loan', icon: 'Car', color: '#f97316' },
  { value: 'student_loan', label: 'Student Loan', icon: 'GraduationCap', color: '#8b5cf6' },
  { value: 'personal_loan', label: 'Personal Loan', icon: 'User', color: '#06b6d4' },
  { value: 'medical', label: 'Medical Debt', icon: 'Heart', color: '#ef4444' },
  { value: 'business', label: 'Business Loan', icon: 'Building', color: '#10b981' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal', color: '#94a3b8' },
];

// ========================================
// GOAL PRIORITIES
// ========================================
export const GOAL_PRIORITIES = [
  { value: 'low', label: 'Low', color: '#94a3b8', bg: 'bg-slate-500/20 text-slate-400' },
  { value: 'medium', label: 'Medium', color: '#06b6d4', bg: 'bg-cyan-500/20 text-cyan-400' },
  { value: 'high', label: 'High', color: '#f59e0b', bg: 'bg-amber-500/20 text-amber-400' },
  { value: 'critical', label: 'Critical', color: '#ef4444', bg: 'bg-red-500/20 text-red-400' },
];

// ========================================
// BUDGET PERIODS
// ========================================
export const BUDGET_PERIODS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual', label: 'Annual' },
];

// ========================================
// NAV ITEMS
// ========================================
export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/accounts', label: 'Accounts', icon: 'Wallet' },
  { href: '/transactions', label: 'Transactions', icon: 'ArrowLeftRight' },
  { href: '/budgets', label: 'Budgets', icon: 'PieChart' },
  { href: '/goals', label: 'Goals', icon: 'Target' },
  { href: '/debts', label: 'Debts', icon: 'CreditCard' },
  { href: '/bills', label: 'Bills', icon: 'FileText' },
  { href: '/calendar', label: 'Calendar', icon: 'Calendar' },
  { href: '/reports', label: 'Reports', icon: 'BarChart3' },
  { href: '/profile', label: 'Settings', icon: 'Settings' },
];

export const BOTTOM_NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: 'LayoutDashboard' },
  { href: '/transactions', label: 'Transactions', icon: 'ArrowLeftRight' },
  { href: '/budgets', label: 'Budgets', icon: 'PieChart' },
  { href: '/goals', label: 'Goals', icon: 'Target' },
  { href: '/profile', label: 'More', icon: 'Menu' },
];

// ========================================
// FINANCIAL HEALTH TIPS
// ========================================
export const FINANCIAL_HEALTH_TIPS = [
  {
    id: '1',
    title: '50/30/20 Rule',
    description: 'Allocate 50% of income to needs, 30% to wants, and 20% to savings and debt repayment.',
    icon: 'PieChart',
    color: '#6366f1',
    category: 'budgeting',
  },
  {
    id: '2',
    title: 'Emergency Fund',
    description: 'Build a 3-6 month emergency fund to protect against unexpected expenses.',
    icon: 'Shield',
    color: '#10b981',
    category: 'savings',
  },
  {
    id: '3',
    title: 'Pay Yourself First',
    description: 'Automate your savings so you save before spending.',
    icon: 'ArrowDown',
    color: '#8b5cf6',
    category: 'savings',
  },
  {
    id: '4',
    title: 'Debt Avalanche',
    description: 'Pay off debts with the highest interest rate first to save the most money.',
    icon: 'TrendingDown',
    color: '#ef4444',
    category: 'debt',
  },
  {
    id: '5',
    title: 'Track Every Dollar',
    description: 'Knowing where your money goes is the first step to financial control.',
    icon: 'Eye',
    color: '#f59e0b',
    category: 'tracking',
  },
  {
    id: '6',
    title: 'Invest Early',
    description: 'Compound interest means even small early investments can grow dramatically.',
    icon: 'TrendingUp',
    color: '#06b6d4',
    category: 'investing',
  },
  {
    id: '7',
    title: 'Review Subscriptions',
    description: 'Audit your recurring subscriptions quarterly and cancel unused ones.',
    icon: 'Repeat',
    color: '#a855f7',
    category: 'spending',
  },
  {
    id: '8',
    title: 'Set SMART Goals',
    description: 'Make your financial goals Specific, Measurable, Achievable, Relevant, and Time-bound.',
    icon: 'Target',
    color: '#ec4899',
    category: 'goals',
  },
];

// ========================================
// MONTHS
// ========================================
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ========================================
// DATE RANGES
// ========================================
export const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_3_months', label: 'Last 3 Months' },
  { value: 'last_6_months', label: 'Last 6 Months' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_year', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' },
];

// ========================================
// NOTIFICATION TYPES
// ========================================
export const NOTIFICATION_TYPES = {
  BILL_DUE: 'bill_due',
  BUDGET_ALERT: 'budget_alert',
  GOAL_REACHED: 'goal_reached',
  LARGE_TRANSACTION: 'large_transaction',
  ACCOUNT_LOW: 'account_low',
  DEBT_PAYMENT: 'debt_payment',
  SYSTEM: 'system',
};

// ========================================
// API CONSTANTS
// ========================================
export const API_TIMEOUT = 15000;
export const STALE_TIME = 5 * 60 * 1000; // 5 minutes
export const CACHE_TIME = 10 * 60 * 1000; // 10 minutes
export const NOTIFICATION_POLL_INTERVAL = 60 * 1000; // 1 minute
export const DEFAULT_PAGE_SIZE = 20;
