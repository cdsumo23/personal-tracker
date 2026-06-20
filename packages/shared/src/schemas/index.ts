// schemas/index.ts
import { z } from 'zod';
import {
  CURRENCIES,
  ACCOUNT_TYPES,
  TRANSACTION_TYPES,
  RECURRING_INTERVALS,
  BUDGET_PERIODS,
  PRIORITIES,
  DEBT_TYPES,
  DEBT_STRATEGIES,
  BILL_FREQUENCIES
} from '../constants';

// ---- Authentication Schemas ----

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  currency: z.enum(CURRENCIES).default('USD'),
  timezone: z.string().default('UTC')
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(8)
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  currency: z.enum(CURRENCIES),
  timezone: z.string().default('UTC'),
  preferences: z.object({
    theme: z.enum(['light', 'dark']).default('dark'),
    notificationsEnabled: z.boolean().default(true)
  }).optional()
});

// ---- Accounts Schemas ----

export const AccountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  type: z.enum(ACCOUNT_TYPES),
  balance: z.number().default(0),
  currency: z.enum(CURRENCIES).default('USD'),
  color: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  isDefault: z.boolean().default(false),
  notes: z.string().optional().nullable()
});

export const TransferSchema = z.object({
  fromAccountId: z.string().min(1, 'Invalid sender account ID'),
  toAccountId: z.string().min(1, 'Invalid receiver account ID'),
  amount: z.number().positive('Transfer amount must be greater than zero'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().or(z.date()).default(() => new Date())
}).refine(data => data.fromAccountId !== data.toAccountId, {
  message: 'Source and destination accounts must be different',
  path: ['toAccountId']
});

// ---- Categories Schemas ----

export const CategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  type: z.enum(['INCOME', 'EXPENSE']),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable()
});

// ---- Transactions Schemas ----

export const TransactionSchema = z.object({
  accountId: z.string().min(1, 'Invalid account ID'),
  categoryId: z.string().min(1, 'Invalid category ID').optional().nullable(),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  type: z.enum(TRANSACTION_TYPES),
  description: z.string().min(1, 'Description is required'),
  notes: z.string().optional().nullable(),
  date: z.string().or(z.date()).default(() => new Date()),
  tags: z.array(z.string()).default([]),
  receiptUrl: z.string().optional().nullable(),
  isRecurring: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  recurringInterval: z.enum(RECURRING_INTERVALS).optional().nullable(),
  recurringEndDate: z.string().or(z.date()).optional().nullable()
}).refine(data => !data.isRecurring || !!data.recurringInterval, {
  message: 'Recurring interval is required for recurring transactions',
  path: ['recurringInterval']
});

export const TransactionSplitItemSchema = z.object({
  categoryId: z.string().min(1, 'Invalid category ID'),
  amount: z.number().positive('Split amount must be greater than zero'),
  description: z.string().optional()
});

export const SplitTransactionSchema = z.object({
  transactionId: z.string().min(1, 'Invalid transaction ID'),
  splits: z.array(TransactionSplitItemSchema).min(2, 'Must split into at least 2 categories')
});

// ---- Budgets Schemas ----

export const BudgetCategorySchema = z.object({
  categoryId: z.string().min(1, 'Invalid category ID'),
  allocatedAmount: z.number().nonnegative('Allocated amount must be zero or positive'),
  currency: z.enum(CURRENCIES).default('USD')
});

export const BudgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  period: z.enum(BUDGET_PERIODS),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  totalAmount: z.number().positive('Total budget must be greater than zero'),
  carryover: z.boolean().default(false),
  categories: z.array(BudgetCategorySchema)
});

// ---- Savings Goals Schemas ----

export const SavingsGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  targetAmount: z.number().positive('Target amount must be greater than zero'),
  currentAmount: z.number().nonnegative().default(0),
  deadline: z.string().or(z.date()).optional().nullable(),
  priority: z.enum(PRIORITIES).default('MEDIUM'),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  autoContribute: z.boolean().default(false),
  contributionAmount: z.number().positive().optional().nullable(),
  contributionInterval: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable()
});

export const GoalContributionSchema = z.object({
  amount: z.number().positive('Contribution amount must be greater than zero'),
  note: z.string().optional().nullable(),
  date: z.string().or(z.date()).default(() => new Date())
});

// ---- Debts Schemas ----

export const DebtSchema = z.object({
  name: z.string().min(1, 'Debt name is required'),
  type: z.enum(DEBT_TYPES),
  originalAmount: z.number().positive('Original amount must be greater than zero'),
  currentBalance: z.number().nonnegative('Current balance must be zero or positive'),
  interestRate: z.number().nonnegative('Interest rate must be zero or positive'),
  minimumPayment: z.number().positive('Minimum payment must be greater than zero'),
  dueDate: z.string().or(z.date()).optional().nullable(),
  lender: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  strategy: z.enum(DEBT_STRATEGIES).optional().nullable()
});

export const DebtPaymentSchema = z.object({
  amount: z.number().positive('Payment amount must be greater than zero'),
  date: z.string().or(z.date()).default(() => new Date()),
  note: z.string().optional().nullable()
});

// ---- Bills & Subscriptions Schemas ----

export const BillSchema = z.object({
  name: z.string().min(1, 'Bill name is required'),
  amount: z.number().positive('Bill amount must be greater than zero'),
  currency: z.enum(CURRENCIES).default('USD'),
  dueDay: z.number().int().min(1).max(31, 'Due day must be between 1 and 31'),
  category: z.string().optional().nullable(),
  isRecurring: z.boolean().default(true),
  frequency: z.enum(BILL_FREQUENCIES).default('MONTHLY'),
  reminderDays: z.number().int().nonnegative().default(3),
  notes: z.string().optional().nullable()
});
