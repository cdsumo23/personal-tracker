import logger from '../config/logger';
// services/transaction.service.ts
import { transactionRepository } from '../repositories/transaction.repository';
import { accountRepository } from '../repositories/account.repository';
import prisma from '../config/database';
import { Transaction } from '@prisma/client';

export class TransactionService {
  async getAll(userId: string, filters: any, query: any) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const sortBy = query.sortBy || 'date';
    const sortOrder = (query.sortOrder || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    // Parse filters
    const parsedFilters: any = {};
    if (filters.startDate) parsedFilters.startDate = new Date(filters.startDate);
    if (filters.endDate) parsedFilters.endDate = new Date(filters.endDate);
    if (filters.minAmount) parsedFilters.minAmount = parseFloat(filters.minAmount);
    if (filters.maxAmount) parsedFilters.maxAmount = parseFloat(filters.maxAmount);
    if (filters.categoryId) parsedFilters.categoryId = filters.categoryId;
    if (filters.accountId) parsedFilters.accountId = filters.accountId;
    if (filters.type) parsedFilters.type = filters.type;
    if (filters.search) parsedFilters.search = filters.search;
    if (filters.isRecurring !== undefined) parsedFilters.isRecurring = filters.isRecurring === 'true';
    if (filters.tags) {
      parsedFilters.tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
    }

    return transactionRepository.findAll(userId, parsedFilters, { page, limit }, { sortBy, sortOrder });
  }

  async getById(id: string, userId: string) {
    const tx = await transactionRepository.findById(id, userId);
    if (!tx) throw new Error('Transaction not found');
    return tx;
  }

  async create(userId: string, data: any) {
    // 1. Verify and get account
    const account = await accountRepository.findById(data.accountId, userId);
    if (!account) throw new Error('Account not found');

    // 2. Perform inside database transaction
    return prisma.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId: data.accountId,
          categoryId: data.categoryId || null,
          amount: data.amount,
          type: data.type,
          description: data.description,
          notes: data.notes,
          date: new Date(data.date),
          tags: data.tags || [],
          receiptUrl: data.receiptUrl,
          isRecurring: data.isRecurring || false,
          recurringInterval: data.recurringInterval || null,
          recurringEndDate: data.recurringEndDate ? new Date(data.recurringEndDate) : null
        }
      });

      // Update account balance
      const balanceChange = data.type === 'INCOME' ? data.amount : -data.amount;
      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: { increment: balanceChange } }
      });

      // 3. Auto-contribute to savings goal if category matches and is active
      if (data.categoryId) {
        const goal = await tx.savingsGoal.findFirst({
          where: {
            userId,
            categoryId: data.categoryId,
            deletedAt: null,
            isCompleted: false
          }
        });

        if (goal) {
          // Create contribution
          await tx.goalContribution.create({
            data: {
              goalId: goal.id,
              amount: data.amount,
              note: `Auto-contributed from transaction: ${data.description || 'Savings transaction'}`,
              date: new Date(data.date)
            }
          });

          // Update goal currentAmount
          const updatedGoal = await tx.savingsGoal.update({
            where: { id: goal.id },
            data: {
              currentAmount: {
                increment: data.amount
              }
            }
          });

          // Mark completed if threshold reached
          if (updatedGoal.currentAmount.toNumber() >= updatedGoal.targetAmount.toNumber()) {
            await tx.savingsGoal.update({
              where: { id: goal.id },
              data: { isCompleted: true }
            });
          }
        }
      }

      return transaction;
    });
  }

  async update(id: string, userId: string, data: any) {
    // 1. Get existing transaction to calculate balance diff
    const oldTx = await this.getById(id, userId);

    return prisma.$transaction(async (tx) => {
      // 1. Revert balance on old account
      const oldRevertAmount = oldTx.type === 'INCOME' ? -oldTx.amount.toNumber() : oldTx.amount.toNumber();
      await tx.account.update({
        where: { id: oldTx.accountId },
        data: { balance: { increment: oldRevertAmount } }
      });

      // 2. Apply new balance changes (might be on a new account)
      const targetAccountId = data.accountId || oldTx.accountId;
      const targetAmount = data.amount !== undefined ? data.amount : oldTx.amount.toNumber();
      const targetType = data.type || oldTx.type;

      const newApplyAmount = targetType === 'INCOME' ? targetAmount : -targetAmount;
      await tx.account.update({
        where: { id: targetAccountId },
        data: { balance: { increment: newApplyAmount } }
      });

      // 3. Save modifications
      const updatedTx = await tx.transaction.update({
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
          recurringEndDate: data.recurringEndDate ? new Date(data.recurringEndDate) : null
        }
      });

      return updatedTx;
    });
  }

  async delete(id: string, userId: string) {
    const transaction = await this.getById(id, userId);

    return prisma.$transaction(async (tx) => {
      // 1. Revert account balance
      const balanceChange = transaction.type === 'INCOME' ? -transaction.amount.toNumber() : transaction.amount.toNumber();
      await tx.account.update({
        where: { id: transaction.accountId },
        data: { balance: { increment: balanceChange } }
      });

      // 2. Soft delete transaction
      return tx.transaction.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    });
  }

  async duplicate(id: string, userId: string) {
    const original = await this.getById(id, userId);
    const { id: _, createdAt: __, updatedAt: ___, ...data } = original as any;
    
    // Duplicate with current date
    data.date = new Date();
    data.amount = original.amount.toNumber();
    return this.create(userId, data);
  }

  async splitTransaction(userId: string, data: any) {
    const mainTx = await this.getById(data.transactionId, userId);
    if (mainTx.type !== 'EXPENSE') {
      throw new Error('Only Expense transactions can be split');
    }

    const totalSplitAmount = data.splits.reduce((acc: number, item: any) => acc + item.amount, 0);
    if (Math.abs(mainTx.amount.toNumber() - totalSplitAmount) > 0.01) {
      throw new Error('Split amounts must sum up to the total transaction amount');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Delete previous splits if any
      await tx.transaction.updateMany({
        where: { parentTransactionId: mainTx.id },
        data: { deletedAt: new Date() }
      });

      // 2. Create child transactions for each category
      const childTxs = [];
      for (const item of data.splits) {
        const child = await tx.transaction.create({
          data: {
            userId,
            accountId: mainTx.accountId,
            categoryId: item.categoryId,
            amount: item.amount,
            type: 'EXPENSE',
            description: item.description || `Split: ${mainTx.description}`,
            date: mainTx.date,
            parentTransactionId: mainTx.id,
            splitFrom: 'CATEGORIES'
          }
        });
        childTxs.push(child);
      }

      return {
        parent: mainTx,
        splits: childTxs
      };
    });
  }

  async bulkCreate(userId: string, transactions: any[]) {
    const results = [];
    for (const item of transactions) {
      try {
        const res = await this.create(userId, item);
        results.push(res);
      } catch (err: any) {
        logger.error(`Failed to bulk insert transaction: ${err.message}`);
      }
    }
    return results;
  }
}
export const transactionService = new TransactionService();
