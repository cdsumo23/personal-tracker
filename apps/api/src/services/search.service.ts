// services/search.service.ts
import prisma from '../config/database';

export class SearchService {
  async globalSearch(userId: string, query: string) {
    if (!query || query.trim() === '') {
      return { transactions: [], accounts: [], categories: [], goals: [], debts: [], bills: [] };
    }

    const term = query.trim();

    // Query databases in parallel
    const [transactions, accounts, categories, goals, debts, bills] = await Promise.all([
      // 1. Transactions
      prisma.transaction.findMany({
        where: {
          userId,
          deletedAt: null,
          OR: [
            { description: { contains: term, mode: 'insensitive' } },
            { notes: { contains: term, mode: 'insensitive' } },
            { tags: { has: term } }
          ]
        },
        take: 10,
        include: { category: true, account: true }
      }),
      // 2. Accounts
      prisma.account.findMany({
        where: {
          userId,
          deletedAt: null,
          name: { contains: term, mode: 'insensitive' }
        },
        take: 5
      }),
      // 3. Categories
      prisma.category.findMany({
        where: {
          deletedAt: null,
          name: { contains: term, mode: 'insensitive' },
          OR: [
            { userId },
            { isSystem: true }
          ]
        },
        take: 5
      }),
      // 4. Savings Goals
      prisma.savingsGoal.findMany({
        where: {
          userId,
          deletedAt: null,
          name: { contains: term, mode: 'insensitive' }
        },
        take: 5
      }),
      // 5. Debts
      prisma.debt.findMany({
        where: {
          userId,
          deletedAt: null,
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { lender: { contains: term, mode: 'insensitive' } }
          ]
        },
        take: 5
      }),
      // 6. Bills
      prisma.bill.findMany({
        where: {
          userId,
          deletedAt: null,
          name: { contains: term, mode: 'insensitive' }
        },
        take: 5
      })
    ]);

    return {
      transactions,
      accounts,
      categories,
      goals,
      debts,
      bills
    };
  }
}
export const searchService = new SearchService();
