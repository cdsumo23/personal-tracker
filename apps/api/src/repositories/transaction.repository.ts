// repositories/transaction.repository.ts
import prisma from '../config/database';
import { Transaction, TransactionType, RecurringInterval } from '@prisma/client';

export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  categoryId?: string;
  accountId?: string;
  type?: TransactionType;
  tags?: string[];
  search?: string;
  isRecurring?: boolean;
}

export class TransactionRepository {
  async findAll(
    userId: string,
    filters: TransactionFilters,
    pagination: { page: number; limit: number },
    sorting: { sortBy: string; sortOrder: 'asc' | 'desc' }
  ): Promise<{ data: Transaction[]; total: number }> {
    const { page, limit } = pagination;
    const { sortBy, sortOrder } = sorting;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      userId,
      deletedAt: null
    };

    if (filters.startDate || filters.endDate) {
      whereClause.date = {};
      if (filters.startDate) whereClause.date.gte = filters.startDate;
      if (filters.endDate) whereClause.date.lte = filters.endDate;
    }

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      whereClause.amount = {};
      if (filters.minAmount !== undefined) whereClause.amount.gte = filters.minAmount;
      if (filters.maxAmount !== undefined) whereClause.amount.lte = filters.maxAmount;
    }

    if (filters.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    if (filters.accountId) {
      whereClause.accountId = filters.accountId;
    }

    if (filters.type) {
      whereClause.type = filters.type;
    }

    if (filters.isRecurring !== undefined) {
      whereClause.isRecurring = filters.isRecurring;
    }

    if (filters.tags && filters.tags.length > 0) {
      whereClause.tags = {
        hasSome: filters.tags
      };
    }

    if (filters.search) {
      whereClause.OR = [
        { description: { contains: filters.search, mode: 'insensitive' } },
        { notes: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: {
          account: true,
          category: true
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.transaction.count({
        where: whereClause
      })
    ]);

    return { data, total };
  }

  async findById(id: string, userId: string): Promise<Transaction | null> {
    return prisma.transaction.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      },
      include: {
        account: true,
        category: true,
        childTransactions: {
          include: {
            category: true
          }
        }
      }
    });
  }

  async create(data: any): Promise<Transaction> {
    return prisma.transaction.create({
      data: {
        userId: data.userId,
        accountId: data.accountId,
        categoryId: data.categoryId,
        amount: data.amount,
        type: data.type,
        description: data.description,
        notes: data.notes,
        date: new Date(data.date),
        tags: data.tags || [],
        receiptUrl: data.receiptUrl,
        isRecurring: data.isRecurring || false,
        recurringInterval: data.recurringInterval,
        recurringEndDate: data.recurringEndDate ? new Date(data.recurringEndDate) : null,
        parentTransactionId: data.parentTransactionId,
        splitFrom: data.splitFrom
      }
    });
  }

  async update(id: string, data: any): Promise<Transaction> {
    return prisma.transaction.update({
      where: { id },
      data: {
        accountId: data.accountId,
        categoryId: data.categoryId,
        amount: data.amount,
        type: data.type,
        description: data.description,
        notes: data.notes,
        date: data.date ? new Date(data.date) : undefined,
        tags: data.tags,
        receiptUrl: data.receiptUrl,
        isRecurring: data.isRecurring,
        recurringInterval: data.recurringInterval,
        recurringEndDate: data.recurringEndDate ? new Date(data.recurringEndDate) : null,
        parentTransactionId: data.parentTransactionId,
        splitFrom: data.splitFrom
      }
    });
  }

  async delete(id: string): Promise<Transaction> {
    return prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
export const transactionRepository = new TransactionRepository();
