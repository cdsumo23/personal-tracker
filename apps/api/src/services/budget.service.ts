// services/budget.service.ts
import { budgetRepository } from '../repositories/budget.repository';
import { currencyService } from './currency.service';
import prisma from '../config/database';

export class BudgetService {
  async getAll(userId: string) {
    const budgets = await budgetRepository.findAll(userId);
    const userRecord = await prisma.user.findUnique({ where: { id: userId }, select: { currency: true } });
    const baseCurrency = userRecord?.currency || 'USD';

    for (const budget of budgets) {
      let calculatedTotal = 0;
      if (budget.budgetCategories && Array.isArray(budget.budgetCategories)) {
        for (const bc of budget.budgetCategories) {
          const catCurrency = bc.currency || 'USD';
          const allocatedAmount = Number(bc.allocatedAmount || 0);
          const amountInBase = await currencyService.convertAmount(allocatedAmount, catCurrency, baseCurrency);
          calculatedTotal += amountInBase;
        }
        budget.totalAmount = calculatedTotal;
      }
    }
    return budgets;
  }

  async getById(id: string, userId: string) {
    const budget = await budgetRepository.findById(id, userId);
    if (!budget) throw new Error('Budget not found');
    
    const userRecord = await prisma.user.findUnique({ where: { id: userId }, select: { currency: true } });
    const baseCurrency = userRecord?.currency || 'USD';

    let calculatedTotal = 0;
    if (budget.budgetCategories && Array.isArray(budget.budgetCategories)) {
      for (const bc of budget.budgetCategories) {
        const catCurrency = bc.currency || 'USD';
        const allocatedAmount = Number(bc.allocatedAmount || 0);
        const amountInBase = await currencyService.convertAmount(allocatedAmount, catCurrency, baseCurrency);
        calculatedTotal += amountInBase;
      }
      budget.totalAmount = calculatedTotal;
    }
    return budget;
  }

  async create(userId: string, data: any) {
    const userRecord = await prisma.user.findUnique({ where: { id: userId }, select: { currency: true } });
    const baseCurrency = userRecord?.currency || 'USD';

    let calculatedTotalAmount = 0;
    if (data.categories && Array.isArray(data.categories)) {
      for (const cat of data.categories) {
        const catCurrency = cat.currency || 'USD';
        const allocatedAmount = Number(cat.allocatedAmount || cat.amount || 0);
        const amountInBase = await currencyService.convertAmount(allocatedAmount, catCurrency, baseCurrency);
        calculatedTotalAmount += amountInBase;
      }
    } else {
      calculatedTotalAmount = Number(data.totalAmount || 0);
    }

    return budgetRepository.create(userId, {
      name: data.name,
      period: data.period,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      totalAmount: calculatedTotalAmount,
      carryover: data.carryover,
      categories: data.categories
    });
  }

  async update(id: string, userId: string, data: any) {
    await this.getById(id, userId); // check ownership
    const userRecord = await prisma.user.findUnique({ where: { id: userId }, select: { currency: true } });
    const baseCurrency = userRecord?.currency || 'USD';

    let calculatedTotalAmount = data.totalAmount;
    if (data.categories && Array.isArray(data.categories)) {
      calculatedTotalAmount = 0;
      for (const cat of data.categories) {
        const catCurrency = cat.currency || 'USD';
        const allocatedAmount = Number(cat.allocatedAmount || cat.amount || 0);
        const amountInBase = await currencyService.convertAmount(allocatedAmount, catCurrency, baseCurrency);
        calculatedTotalAmount += amountInBase;
      }
    }

    return budgetRepository.update(id, userId, {
      name: data.name,
      period: data.period,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      totalAmount: calculatedTotalAmount,
      carryover: data.carryover,
      isActive: data.isActive,
      categories: data.categories
    });
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    return budgetRepository.delete(id);
  }

  /**
   * Calculates actual spending for a budget and compares it with allocations.
   * Each budget category can have its own currency; amounts are converted accordingly.
   * Overall totals are expressed in USD (pivot) so different currencies can be summed.
   */
  async getBudgetUsage(id: string, userId: string) {
    const budget = await this.getById(id, userId);

    // Fetch the user's base currency for overall totals
    const userRecord = await prisma.user.findUnique({ where: { id: userId }, select: { currency: true } });
    const baseCurrency = userRecord?.currency || 'USD';

    // Fetch all expense transactions in the budget date range, including account currency
    // Use start of day for startDate and end of day for endDate to cover entire days
    const startOfDay = new Date(budget.startDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(budget.endDate);
    endOfDay.setHours(23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        deletedAt: null,
        type: 'EXPENSE',
        date: { gte: startOfDay, lte: endOfDay }
      },
      include: { account: { select: { currency: true } } }
    });

    // Group transactions by category; convert each transaction to the category's currency
    // We'll accumulate per-category spending in that category's own currency.
    // We also accumulate everything in baseCurrency for the overall total.
    const categorySpendingInCatCurrency: Record<string, number> = {};
    let totalSpentInBase = 0;

    // Build a lookup of budgetCategory currency by categoryId
    const catCurrencyMap: Record<string, string> = {};
    for (const bc of budget.budgetCategories) {
      catCurrencyMap[bc.categoryId] = (bc as any).currency || 'USD';
    }

    for (const tx of transactions) {
      const txCurrency = (tx as any).account?.currency || 'USD';
      const txAmount = tx.amount.toNumber();

      // Convert to base currency for overall total
      const amtInBase = await currencyService.convertAmount(txAmount, txCurrency, baseCurrency);
      totalSpentInBase += amtInBase;

      // Convert to category's currency for per-category comparison
      if (tx.categoryId) {
        const catCurrency = catCurrencyMap[tx.categoryId] || 'USD';
        const amtInCatCurrency = await currencyService.convertAmount(txAmount, txCurrency, catCurrency);
        categorySpendingInCatCurrency[tx.categoryId] =
          (categorySpendingInCatCurrency[tx.categoryId] || 0) + amtInCatCurrency;
      }
    }

    // Compute totalAmount in base currency by converting each category allocation
    let totalAmountInBase = 0;
    const categoriesUsage = await Promise.all(
      budget.budgetCategories.map(async (bc) => {
        const catCurrency = (bc as any).currency || 'USD';
        const allocated = Number(bc.allocatedAmount || 0);
        const spent = categorySpendingInCatCurrency[bc.categoryId] || 0;
        const remaining = allocated - spent;
        const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;

        // Convert allocated amount to base for summing overall total
        const allocatedInBase = await currencyService.convertAmount(allocated, catCurrency, baseCurrency);
        totalAmountInBase += allocatedInBase;

        return {
          categoryId: bc.categoryId,
          categoryName: bc.category?.name || 'Unknown',
          name: bc.category?.name || 'Unknown',
          color: bc.category?.color || '#cbd5e1',
          icon: bc.category?.icon || 'HelpCircle',
          currency: catCurrency,
          allocated,
          spent,
          remaining,
          percentage
        };
      })
    );

    // Also accept the stored totalAmount if it was explicitly set, but prioritize the dynamic total computed from conversions
    const storedTotal = Number(budget.totalAmount || 0);
    const effectiveTotal = totalAmountInBase > 0 ? totalAmountInBase : storedTotal;
    const overallPercentage = effectiveTotal > 0 ? (totalSpentInBase / effectiveTotal) * 100 : 0;

    return {
      budgetId: budget.id,
      name: budget.name,
      baseCurrency,
      totalAmount: effectiveTotal,
      allocated: effectiveTotal,
      totalSpent: totalSpentInBase,
      spent: totalSpentInBase,
      remainingAmount: effectiveTotal - totalSpentInBase,
      remaining: effectiveTotal - totalSpentInBase,
      percentage: overallPercentage,
      categories: categoriesUsage
    };
  }

  /**
   * Generates budget recommendations based on historical transactions
   */
  async getBudgetRecommendations(userId: string) {
    // Look back at last 30 days of expenses
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const expenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        deletedAt: null,
        date: { gte: startDate }
      },
      include: {
        category: true
      }
    });

    const categoryTotals: Record<string, { name: string; amount: number }> = {};
    let totalExpense = 0;

    for (const exp of expenses) {
      if (exp.categoryId && exp.category) {
        const amt = exp.amount.toNumber();
        totalExpense += amt;
        if (!categoryTotals[exp.categoryId]) {
          categoryTotals[exp.categoryId] = { name: exp.category.name, amount: 0 };
        }
        categoryTotals[exp.categoryId].amount += amt;
      }
    }

    // Suggest reducing categories representing highest expenses or matching averages
    const recommendations = Object.entries(categoryTotals).map(([catId, info]) => {
      const averageSpent = info.amount;
      const recommendedBudget = Math.round(averageSpent * 0.9); // recommend a 10% saving cut
      return {
        categoryId: catId,
        categoryName: info.name,
        averageSpent,
        recommendedBudget,
        reason: `Based on your last 30 days of spending ($${averageSpent.toFixed(2)}), budgeting $${recommendedBudget.toFixed(2)} could save you $${(averageSpent - recommendedBudget).toFixed(2)} (10%).`
      };
    });

    return {
      last30DaysTotalSpent: totalExpense,
      recommendations
    };
  }
}
export const budgetService = new BudgetService();
