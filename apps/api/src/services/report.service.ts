// services/report.service.ts
import prisma from '../config/database';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { currencyService } from './currency.service';

export class ReportService {
  /**
   * Get the user's preferred currency (base currency) from their profile.
   */
  private async getUserCurrency(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currency: true }
    });
    return user?.currency ?? 'USD';
  }

  async getIncomeReport(userId: string, startDate: Date, endDate: Date) {
    const baseCurrency = await this.getUserCurrency(userId);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'INCOME',
        deletedAt: null,
        date: { gte: startDate, lte: endDate }
      },
      include: {
        category: true,
        account: { select: { currency: true } }
      }
    });

    const categoryBreakdown: Record<string, { name: string; amount: number; color: string }> = {};
    let total = 0;

    for (const tx of transactions) {
      const raw = tx.amount.toNumber();
      const accountCurrency = tx.account?.currency ?? baseCurrency;
      const amt = await currencyService.convertToBaseCurrency(raw, accountCurrency, baseCurrency);
      total += amt;
      const catId = tx.categoryId || 'uncategorized';
      const catName = tx.category?.name || 'Uncategorized';
      const catColor = tx.category?.color || '#94a3b8';

      if (!categoryBreakdown[catId]) {
        categoryBreakdown[catId] = { name: catName, amount: 0, color: catColor };
      }
      categoryBreakdown[catId].amount += amt;
    }

    return {
      total,
      breakdown: Object.values(categoryBreakdown),
      currency: baseCurrency
    };
  }

  async getExpenseReport(userId: string, startDate: Date, endDate: Date) {
    const baseCurrency = await this.getUserCurrency(userId);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        deletedAt: null,
        date: { gte: startDate, lte: endDate }
      },
      include: {
        category: true,
        account: { select: { currency: true } }
      }
    });

    const categoryBreakdown: Record<string, { name: string; amount: number; color: string }> = {};
    let total = 0;

    for (const tx of transactions) {
      const raw = tx.amount.toNumber();
      const accountCurrency = tx.account?.currency ?? baseCurrency;
      const amt = await currencyService.convertToBaseCurrency(raw, accountCurrency, baseCurrency);
      total += amt;
      const catId = tx.categoryId || 'uncategorized';
      const catName = tx.category?.name || 'Uncategorized';
      const catColor = tx.category?.color || '#94a3b8';

      if (!categoryBreakdown[catId]) {
        categoryBreakdown[catId] = { name: catName, amount: 0, color: catColor };
      }
      categoryBreakdown[catId].amount += amt;
    }

    return {
      total,
      breakdown: Object.values(categoryBreakdown),
      currency: baseCurrency
    };
  }

  async getCashFlowReport(userId: string, months = 6) {
    const baseCurrency = await this.getUserCurrency(userId);
    const cashFlow = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const start = startOfMonth(subMonths(now, i));
      const end = endOfMonth(subMonths(now, i));

      const txs = await prisma.transaction.findMany({
        where: {
          userId,
          deletedAt: null,
          date: { gte: start, lte: end }
        },
        include: { account: { select: { currency: true } } }
      });

      let income = 0;
      let expense = 0;

      for (const tx of txs) {
        const raw = tx.amount.toNumber();
        const accountCurrency = tx.account?.currency ?? baseCurrency;
        const amt = await currencyService.convertToBaseCurrency(raw, accountCurrency, baseCurrency);
        if (tx.type === 'INCOME') income += amt;
        if (tx.type === 'EXPENSE') expense += amt;
      }

      cashFlow.push({
        month: start.toLocaleString('default', { month: 'short', year: '2-digit' }),
        income,
        expense,
        netCashFlow: income - expense
      });
    }

    return cashFlow;
  }

  async getNetWorthHistory(userId: string) {
    return prisma.netWorthSnapshot.findMany({
      where: { userId },
      orderBy: { snapshotDate: 'asc' }
    });
  }

  async getDashboardStats(userId: string) {
    const baseCurrency = await this.getUserCurrency(userId);

    // 1. Fetch all active accounts — convert balances to user's base currency
    const accounts = await prisma.account.findMany({
      where: { userId, deletedAt: null }
    });

    let totalAssets = 0;
    let totalLiabilities = 0;

    for (const acc of accounts) {
      const rawBal = acc.balance.toNumber();
      const bal = await currencyService.convertToBaseCurrency(rawBal, acc.currency, baseCurrency);

      if (acc.type === 'CREDIT_CARD') {
        totalLiabilities += Math.max(0, bal);
      } else {
        if (bal >= 0) {
          totalAssets += bal;
        } else {
          totalLiabilities += Math.abs(bal);
        }
      }
    }

    // 2. Include debts in liabilities (debts don't have their own currency — assume base)
    const debts = await prisma.debt.findMany({
      where: { userId, deletedAt: null }
    });
    for (const debt of debts) {
      totalLiabilities += debt.currentBalance.toNumber();
    }

    const netWorth = totalAssets - totalLiabilities;

    // 3. Monthly Income vs Expenses (current month) — convert each transaction
    const startOfCurrentMonth = startOfMonth(new Date());
    const endOfCurrentMonth = endOfMonth(new Date());

    const currentMonthTxs = await prisma.transaction.findMany({
      where: {
        userId,
        deletedAt: null,
        date: { gte: startOfCurrentMonth, lte: endOfCurrentMonth }
      },
      include: { account: { select: { currency: true } } }
    });

    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    for (const tx of currentMonthTxs) {
      const raw = tx.amount.toNumber();
      const accountCurrency = tx.account?.currency ?? baseCurrency;
      const amt = await currencyService.convertToBaseCurrency(raw, accountCurrency, baseCurrency);
      if (tx.type === 'INCOME') monthlyIncome += amt;
      if (tx.type === 'EXPENSE') monthlyExpenses += amt;
    }

    // 4. Budget progress
    const activeBudgets = await prisma.budget.findMany({
      where: {
        userId, isActive: true, deletedAt: null,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() }
      }
    });

    let budgetAllocated = 0;
    let budgetSpent = 0;

    if (activeBudgets.length > 0) {
      budgetAllocated = activeBudgets.reduce((acc, b) => acc + b.totalAmount.toNumber(), 0);
      const budgetSpendTxs = await prisma.transaction.findMany({
        where: {
          userId, type: 'EXPENSE', deletedAt: null,
          date: { gte: activeBudgets[0].startDate, lte: activeBudgets[0].endDate }
        },
        include: { account: { select: { currency: true } } }
      });
      for (const tx of budgetSpendTxs) {
        const raw = tx.amount.toNumber();
        const accountCurrency = tx.account?.currency ?? baseCurrency;
        budgetSpent += await currencyService.convertToBaseCurrency(raw, accountCurrency, baseCurrency);
      }
    }

    // 5. Savings Goals
    const activeGoals = await prisma.savingsGoal.findMany({
      where: { userId, deletedAt: null }
    });
    const savingsTarget = activeGoals.reduce((acc, g) => acc + g.targetAmount.toNumber(), 0);
    const savingsCurrent = activeGoals.reduce((acc, g) => acc + g.currentAmount.toNumber(), 0);

    // 6. Upcoming Bills
    const upcomingBillsLimit = new Date();
    upcomingBillsLimit.setDate(upcomingBillsLimit.getDate() + 7);
    const upcomingBillsCount = await prisma.bill.count({
      where: { userId, deletedAt: null, isPaid: false, nextDueDate: { lte: upcomingBillsLimit } }
    });

    // 7. Health Score
    let healthScore = 75;
    if (monthlyIncome > 0) {
      const savingsRate = (monthlyIncome - monthlyExpenses) / monthlyIncome;
      if (savingsRate > 0.2) healthScore += 15;
      else if (savingsRate < 0) healthScore -= 20;
    }
    if (budgetAllocated > 0 && budgetSpent > budgetAllocated) healthScore -= 15;
    if (totalLiabilities > totalAssets * 0.5) healthScore -= 10;
    healthScore = Math.max(10, Math.min(100, healthScore));

    return {
      currentBalance: totalAssets - totalLiabilities,
      totalAssets,
      totalLiabilities,
      netWorth,
      monthlyIncome,
      monthlyExpenses,
      currency: baseCurrency,
      budgetUsage: {
        allocated: budgetAllocated,
        spent: budgetSpent,
        percentage: budgetAllocated > 0 ? (budgetSpent / budgetAllocated) * 100 : 0
      },
      savingsProgress: {
        target: savingsTarget,
        current: savingsCurrent,
        percentage: savingsTarget > 0 ? (savingsCurrent / savingsTarget) * 100 : 0
      },
      upcomingBillsCount,
      financialHealthScore: healthScore
    };
  }
}
export const reportService = new ReportService();
