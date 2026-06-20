export type Role = 'USER' | 'ADMIN';
export type AccountType = 'CASH' | 'CHECKING' | 'SAVINGS' | 'MOBILE_MONEY' | 'CREDIT_CARD' | 'INVESTMENT';
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type BudgetPeriod = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type DebtType = 'PERSONAL_LOAN' | 'BANK_LOAN' | 'CREDIT_CARD' | 'MORTGAGE' | 'OTHER';
export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ALERT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
  currency: string;
  timezone: string;
  profilePhoto?: string;
  role: Role;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color?: string;
  icon?: string;
  isDefault: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId?: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  color: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId?: string;
  amount: number;
  type: TransactionType;
  description: string;
  notes?: string;
  date: string;
  tags: string[];
  receiptUrl?: string;
  isRecurring: boolean;
  recurringInterval?: string;
  recurringEndDate?: string;
  parentTransactionId?: string;
  splitFrom?: string;
  account?: Account;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  id: string;
  budgetId: string;
  categoryId: string;
  allocatedAmount: number;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  name: string;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  totalAmount: number;
  isActive: boolean;
  carryover: boolean;
  budgetCategories?: BudgetCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  priority: Priority;
  icon?: string;
  color?: string;
  categoryId?: string;
  category?: Category;
  isCompleted: boolean;
  autoContribute: boolean;
  contributionAmount?: number;
  contributionInterval?: string;
  contributions?: GoalContribution[];
  createdAt: string;
  updatedAt: string;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  note?: string;
  date: string;
  createdAt: string;
}

export interface Debt {
  id: string;
  userId: string;
  name: string;
  type: DebtType;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string;
  lender?: string;
  notes?: string;
  strategy?: string;
  payments?: DebtPayment[];
  createdAt: string;
  updatedAt: string;
}

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}

export interface Bill {
  id: string;
  userId: string;
  name: string;
  amount: number;
  amountInBase?: number;
  currency: string;
  dueDay: number;
  category: string;
  isRecurring: boolean;
  frequency: string;
  nextDueDate: string;
  lastPaidDate?: string;
  isPaid: boolean;
  reminderDays: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface NetWorthSnapshot {
  id: string;
  userId: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  snapshotDate: string;
  createdAt: string;
}

export interface ExchangeRate {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  updatedAt: string;
}

export interface DashboardStats {
  currentBalance: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  budgetUsage: number;
  savingsProgress: number;
  upcomingBills: any[];
  financialHealthScore: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string> | string[];
  timestamp: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  meta?: PaginationMeta;
}
