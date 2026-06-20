// types/index.ts
import {
  Currency,
  AccountType,
  TransactionType,
  RecurringInterval,
  BudgetPeriod,
  Priority,
  DebtType,
  DebtStrategy,
  BillFrequency,
  NotificationType
} from '../constants';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  country?: string | null;
  currency: Currency;
  timezone: string;
  profilePhoto?: string | null;
  role: 'USER' | 'ADMIN';
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: Currency;
  color?: string | null;
  icon?: string | null;
  isDefault: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId?: string | null;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string | null;
  color?: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId?: string | null;
  amount: number;
  type: TransactionType;
  description: string;
  notes?: string | null;
  date: string;
  tags: string[];
  receiptUrl?: string | null;
  isRecurring: boolean;
  recurringInterval?: RecurringInterval | null;
  recurringEndDate?: string | null;
  parentTransactionId?: string | null;
  splitFrom?: string | null;
  createdAt: string;
  updatedAt: string;
  account?: Account;
  category?: Category | null;
}

export interface BudgetCategory {
  id: string;
  budgetId: string;
  categoryId: string;
  allocatedAmount: number;
  category?: Category;
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
  budgetCategories: BudgetCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetTemplate {
  id: string;
  userId: string;
  name: string;
  items: any;
  createdAt: string;
  updatedAt: string;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  note?: string | null;
  date: string;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | null;
  priority: Priority;
  icon?: string | null;
  color?: string | null;
  isCompleted: boolean;
  autoContribute: boolean;
  contributionAmount?: number | null;
  contributionInterval?: string | null;
  contributions?: GoalContribution[];
  createdAt: string;
  updatedAt: string;
}

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  date: string;
  note?: string | null;
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
  dueDate?: string | null;
  lender?: string | null;
  notes?: string | null;
  strategy?: DebtStrategy | null;
  payments?: DebtPayment[];
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  id: string;
  userId: string;
  name: string;
  amount: number;
  dueDay: number;
  category?: string | null;
  isRecurring: boolean;
  frequency: BillFrequency;
  nextDueDate: string;
  lastPaidDate?: string | null;
  isPaid: boolean;
  reminderDays: number;
  notes?: string | null;
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
  link?: string | null;
  createdAt: string;
}

export interface UploadedFile {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  entityType?: string | null;
  entityId?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: User | null;
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

export interface DashboardStats {
  currentBalance: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  budgetUsage: {
    allocated: number;
    spent: number;
    percentage: number;
  };
  savingsProgress: {
    target: number;
    current: number;
    percentage: number;
  };
  debtProgress: {
    original: number;
    current: number;
    paid: number;
    percentage: number;
  };
  upcomingBillsCount: number;
  financialHealthScore: number;
}
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
