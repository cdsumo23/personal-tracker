import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getToken, setToken, removeToken, getRefreshToken } from './auth';

// ========================================
// AXIOS INSTANCE
// ========================================
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ========================================
// REQUEST INTERCEPTOR
// ========================================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// ========================================
// RESPONSE INTERCEPTOR (auto-refresh on 401)
// ========================================
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = response.data.data;
        setToken(accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.error(`[API Error] ${error.response?.status} ${error.config?.url}`, error.response?.data);
    }

    return Promise.reject(error);
  }
);

// ========================================
// TYPES
// ========================================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

// ========================================
// AUTH API
// ========================================
export const authApi = {
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) =>
    api.post<ApiResponse<{ user: unknown; accessToken: string }>>('/auth/login', credentials),

  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    currency?: string;
  }) => api.post<ApiResponse<{ user: unknown; accessToken: string }>>('/auth/register', data),

  logout: () => api.post('/auth/logout'),

  refreshToken: () =>
    api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh-token'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; password: string }) =>
    api.post('/auth/reset-password', data),

  verifyEmail: (token: string) =>
    api.get(`/auth/verify-email?token=${token}`),

  getMe: () =>
    api.get<ApiResponse<unknown>>('/auth/me'),

  updateProfile: (data: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    country: string;
    currency: string;
    timezone: string;
    avatar: string;
  }>) => api.put('/auth/me', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', {
      oldPassword: data.currentPassword,
      newPassword: data.newPassword,
    }),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post('/auth/me/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ========================================
// ACCOUNTS API
// ========================================
export const accountsApi = {
  getAll: () => api.get<ApiResponse<unknown[]>>('/accounts'),

  getById: (id: string) => api.get<ApiResponse<unknown>>(`/accounts/${id}`),

  create: (data: {
    name: string;
    type: string;
    currency: string;
    balance: number;
    color?: string;
    icon?: string;
    isDefault?: boolean;
  }) => api.post<ApiResponse<unknown>>('/accounts', data),

  update: (id: string, data: Partial<{
    name: string;
    type: string;
    currency: string;
    balance: number;
    color: string;
    icon: string;
  }>) => api.put<ApiResponse<unknown>>(`/accounts/${id}`, data),

  delete: (id: string) => api.delete(`/accounts/${id}`),

  transfer: (data: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description?: string;
    date?: string;
  }) => api.post<ApiResponse<unknown>>('/accounts/transfer', data),
};

// ========================================
// TRANSACTIONS API
// ========================================
export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: 'income' | 'expense' | 'transfer';
  categoryId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  tags?: string[];
}

export const transactionsApi = {
  getAll: (params?: TransactionFilters) =>
    api.get<PaginatedResponse<unknown>>('/transactions', { params }),

  getById: (id: string) => api.get<ApiResponse<unknown>>(`/transactions/${id}`),

  create: (data: {
    amount: number;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    categoryId?: string | null;
    accountId: string;
    description: string;
    date: string;
    notes?: string | null;
    tags?: string[];
    isRecurring?: boolean;
    recurringInterval?: string | null;
    receipt?: File;
  }) => {
    // Only use FormData if there is an actual file to upload
    if (data.receipt) {
      const formData = new FormData();
      const { receipt, ...rest } = data;
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => formData.append(key, v));
          } else {
            formData.append(key, String(value));
          }
        }
      });
      formData.append('receipt', receipt);
      return api.post<ApiResponse<unknown>>('/transactions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    // No file — send as JSON to keep types intact (amount as number, isRecurring as boolean, etc.)
    const { receipt: _ignored, ...jsonData } = data;
    return api.post<ApiResponse<unknown>>('/transactions', jsonData);
  },

  update: (id: string, data: Partial<{
    amount: number;
    type: string;
    categoryId: string;
    accountId: string;
    description: string;
    date: string;
    notes: string;
    tags: string[];
  }>) => api.put<ApiResponse<unknown>>(`/transactions/${id}`, data),

  delete: (id: string) => api.delete(`/transactions/${id}`),

  bulkDelete: (ids: string[]) =>
    api.delete('/transactions/bulk', { data: { ids } }),

  duplicate: (id: string) =>
    api.post<ApiResponse<unknown>>(`/transactions/${id}/duplicate`),
};

// ========================================
// CATEGORIES API
// ========================================
export const categoriesApi = {
  getAll: (type?: 'income' | 'expense') =>
    api.get<ApiResponse<unknown[]>>('/categories', { params: { type } }),

  create: (data: {
    name: string;
    icon: string;
    color: string;
    type: 'INCOME' | 'EXPENSE';
    parentId?: string;
  }) => api.post<ApiResponse<unknown>>('/categories', data),

  update: (id: string, data: Partial<{
    name: string;
    icon: string;
    color: string;
  }>) => api.put<ApiResponse<unknown>>(`/categories/${id}`, data),

  delete: (id: string) => api.delete(`/categories/${id}`),
};

// ========================================
// BUDGETS API
// ========================================
export const budgetsApi = {
  getAll: (period?: string) =>
    api.get<ApiResponse<unknown[]>>('/budgets', { params: { period } }),

  getById: (id: string) => api.get<ApiResponse<unknown>>(`/budgets/${id}`),

  create: (data: any) => {
    const totalAmount = data.categories?.reduce(
      (sum: number, c: any) => sum + Number(c.amount || c.allocatedAmount || 0),
      0
    ) || 0;
    const mapped = {
      ...data,
      totalAmount,
      categories: data.categories?.map((c: any) => ({
        categoryId: c.categoryId,
        allocatedAmount: Number(c.amount || c.allocatedAmount || 0),
        currency: c.currency || 'USD',
      })) || [],
    };
    return api.post<ApiResponse<unknown>>('/budgets', mapped);
  },

  update: (id: string, data: any) => {
    const totalAmount = data.categories?.reduce(
      (sum: number, c: any) => sum + Number(c.amount || c.allocatedAmount || 0),
      0
    );
    const mapped = {
      ...data,
      ...(totalAmount !== undefined ? { totalAmount } : {}),
      ...(data.categories
        ? {
            categories: data.categories.map((c: any) => ({
              categoryId: c.categoryId,
              allocatedAmount: Number(c.amount || c.allocatedAmount || 0),
              currency: c.currency || 'USD',
            })),
          }
        : {}),
    };
    return api.put<ApiResponse<unknown>>(`/budgets/${id}`, mapped);
  },

  delete: (id: string) => api.delete(`/budgets/${id}`),

  getUsage: (id: string) =>
    api.get<ApiResponse<unknown>>(`/budgets/${id}/usage`),
};

// ========================================
// GOALS API
// ========================================
export const goalsApi = {
  getAll: () => api.get<ApiResponse<unknown[]>>('/goals'),

  getById: (id: string) => api.get<ApiResponse<unknown>>(`/goals/${id}`),

  create: (data: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    autoContribute?: boolean;
    monthlyContribution?: number;
    contributionAmount?: number;
    contributionInterval?: string;
    icon?: string;
    color?: string;
    categoryId?: string;
  }) => {
    const { monthlyContribution, contributionAmount, ...rest } = data;
    // Only include contributionAmount if it's a valid positive number
    const resolvedContribution = contributionAmount ?? monthlyContribution;
    return api.post<ApiResponse<unknown>>('/goals', {
      ...rest,
      ...(resolvedContribution && resolvedContribution > 0 ? { contributionAmount: resolvedContribution } : {}),
    });
  },

  update: (id: string, data: Partial<{
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    priority: string;
    autoContribute: boolean;
    monthlyContribution: number;
    contributionAmount: number;
    categoryId: string;
  }>) => {
    const { monthlyContribution, contributionAmount, ...rest } = data;
    const resolvedContribution = contributionAmount ?? monthlyContribution;
    return api.put<ApiResponse<unknown>>(`/goals/${id}`, {
      ...rest,
      ...(resolvedContribution && resolvedContribution > 0 ? { contributionAmount: resolvedContribution } : {}),
    });
  },

  delete: (id: string) => api.delete(`/goals/${id}`),

  addContribution: (id: string, data: {
    amount: number;
    note?: string;
    date?: string;
  }) => api.post<ApiResponse<unknown>>(`/goals/${id}/contributions`, data),
};

// ========================================
// DEBTS API
// ========================================
export const debtsApi = {
  getAll: () => api.get<ApiResponse<unknown[]>>('/debts'),

  getById: (id: string) => api.get<ApiResponse<unknown>>(`/debts/${id}`),

  create: (data: {
    name: string;
    type: string;
    lender: string;
    originalAmount: number;
    currentBalance: number;
    interestRate: number;
    minimumPayment: number;
    dueDate: string;
    nextPaymentDate?: string;
  }) => api.post<ApiResponse<unknown>>('/debts', data),

  update: (id: string, data: Partial<{
    name: string;
    currentBalance: number;
    interestRate: number;
    minimumPayment: number;
    dueDate: string;
  }>) => api.put<ApiResponse<unknown>>(`/debts/${id}`, data),

  delete: (id: string) => api.delete(`/debts/${id}`),

  addPayment: (id: string, data: {
    amount: number;
    date?: string;
    note?: string;
  }) => api.post<ApiResponse<unknown>>(`/debts/${id}/payments`, data),

  getPayoffPlan: (strategy: 'snowball' | 'avalanche', extraPayment?: number) =>
    api.get<ApiResponse<unknown>>('/debts/payoff-plan', {
      params: { strategy, extraPayment },
    }),
};

// ========================================
// BILLS API
// ========================================
export const billsApi = {
  getAll: (params?: { status?: string; month?: string }) =>
    api.get<ApiResponse<unknown[]>>('/bills', { params }),

  getById: (id: string) => api.get<ApiResponse<unknown>>(`/bills/${id}`),

  create: (data: {
    name: string;
    amount: number;
    currency?: string;
    dueDay: number;
    isRecurring: boolean;
    frequency?: string;
    reminderDays?: number;
    categoryId?: string;
    notes?: string;
    autoPay?: boolean;
  }) => api.post<ApiResponse<unknown>>('/bills', data),

  update: (id: string, data: Partial<{
    name: string;
    amount: number;
    currency: string;
    dueDay: number;
    isRecurring: boolean;
    frequency: string;
    reminderDays: number;
    category: string;
    notes: string;
    autoPay: boolean;
  }>) => api.put<ApiResponse<unknown>>(`/bills/${id}`, data),

  delete: (id: string) => api.delete(`/bills/${id}`),

  markPaid: (id: string, data?: { paidDate?: string; paidAmount?: number; accountId?: string }) =>
    api.post<ApiResponse<unknown>>(`/bills/${id}/mark-paid`, data),
};

// ========================================
// REPORTS API
// ========================================
export interface ReportParams {
  startDate: string;
  endDate: string;
  accountId?: string;
  categoryId?: string;
  groupBy?: 'day' | 'week' | 'month' | 'year';
}

export const reportsApi = {
  getDashboardStats: (period?: string) =>
    api.get<ApiResponse<unknown>>('/reports/dashboard', { params: { period } }),

  getIncomeReport: (params: ReportParams) =>
    api.get<ApiResponse<unknown>>('/reports/income', { params }),

  getExpenseReport: (params: ReportParams) =>
    api.get<ApiResponse<unknown>>('/reports/expenses', { params }),

  getCashFlowReport: (params: ReportParams) =>
    api.get<ApiResponse<unknown>>('/reports/cash-flow', { params }),

  getNetWorthHistory: (params: { startDate: string; endDate: string }) =>
    api.get<ApiResponse<unknown>>('/reports/net-worth', { params }),

  getBudgetReport: (params: ReportParams) =>
    api.get<ApiResponse<unknown>>('/reports/budget', { params }),
};

// ========================================
// NOTIFICATIONS API
// ========================================
export const notificationsApi = {
  getAll: (params?: { page?: number; limit?: number; unread?: boolean }) =>
    api.get<PaginatedResponse<unknown>>('/notifications', { params }),

  markRead: (id: string) =>
    api.put(`/notifications/${id}/read`),

  markAllRead: () =>
    api.put('/notifications/mark-all-read'),

  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// ========================================
// SEARCH API
// ========================================
export const searchApi = {
  globalSearch: (query: string, limit?: number) =>
    api.get<ApiResponse<{
      transactions: unknown[];
      accounts: unknown[];
      budgets: unknown[];
      goals: unknown[];
      bills: unknown[];
    }>>('/search', { params: { q: query, limit } }),
};

// ========================================
// ADMIN API
// ========================================
export interface AdminUserPayload {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  isVerified: boolean;
  phone?: string | null;
  country?: string | null;
  currency?: string;
  timezone?: string;
  profilePhoto?: string | null;
}

export const adminApi = {
  getStats: () => api.get<ApiResponse<unknown>>('/admin/stats'),

  getUsers: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get<PaginatedResponse<unknown>>('/admin/users', { params }),

  createUser: (data: AdminUserPayload & { password: string }) =>
    api.post<ApiResponse<unknown>>('/admin/users', data),

  updateUser: (userId: string, data: AdminUserPayload) =>
    api.put<ApiResponse<unknown>>(`/admin/users/${userId}`, data),

  deleteUser: (userId: string) =>
    api.delete(`/admin/users/${userId}`),

  updateUserStatus: (userId: string, status: 'active' | 'suspended') =>
    api.put(`/admin/users/${userId}/status`, { status }),

  getAuditLogs: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<unknown>>('/admin/audit-logs', { params }),
};

// ========================================
// CURRENCY API
// ========================================
export interface ExchangeRate {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  updatedAt: string;
}

export const currencyApi = {
  getRates: () =>
    api.get<ApiResponse<ExchangeRate[]>>('/currency/rates'),

  upsertRate: (data: { baseCurrency: string; targetCurrency: string; rate: number }) =>
    api.put<ApiResponse<ExchangeRate>>('/currency/rates', data),

  convert: (data: { amount: number; from: string; to: string }) =>
    api.post<ApiResponse<{ amount: number; from: string; to: string; convertedAmount: number }>>('/currency/convert', data),
};

// ========================================
// EXPORT API
// ========================================
export const exportApi = {
  exportCSV: (type: string, params: ReportParams) =>
    api.get(`/export/${type}/csv`, {
      params,
      responseType: 'blob',
    }),

  exportExcel: (type: string, params: ReportParams) =>
    api.get(`/export/${type}/excel`, {
      params,
      responseType: 'blob',
    }),

  exportPDF: (type: string, params: ReportParams) =>
    api.get(`/export/${type}/pdf`, {
      params,
      responseType: 'blob',
    }),

  exportAllData: () =>
    api.get('/export/backup', { responseType: 'blob' }),

  restoreBackup: (backupData: any) =>
    api.post('/export/restore', backupData),
};

// ========================================
// PUSH NOTIFICATIONS API
// ========================================
export const pushApi = {
  getPublicKey: () =>
    api.get<ApiResponse<{ publicKey: string }>>('/push/public-key'),

  subscribe: (subscription: any) =>
    api.post<ApiResponse<any>>('/push/subscribe', subscription),

  unsubscribe: (endpoint: string) =>
    api.post<ApiResponse<any>>('/push/unsubscribe', { endpoint }),

  testPush: () =>
    api.post<ApiResponse<any>>('/push/test'),
};

export default api;
