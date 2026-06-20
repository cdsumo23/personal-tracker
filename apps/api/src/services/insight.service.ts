// services/insight.service.ts
import prisma from '../config/database';
import { startOfMonth, subMonths, endOfMonth } from 'date-fns';

export class InsightService {
  async generateInsights(userId: string) {
    const insights = [];
    const now = new Date();
    
    const currentMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // 1. Compare current month spending vs last month spending
    const currentExpenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        deletedAt: null,
        date: { gte: currentMonthStart }
      }
    });

    const lastExpenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        deletedAt: null,
        date: { gte: lastMonthStart, lte: lastMonthEnd }
      }
    });

    const currentSpent = currentExpenses.reduce((acc, tx) => acc + tx.amount.toNumber(), 0);
    const lastSpent = lastExpenses.reduce((acc, tx) => acc + tx.amount.toNumber(), 0);

    if (lastSpent > 0) {
      const percentageDiff = ((currentSpent - lastSpent) / lastSpent) * 100;
      if (percentageDiff > 15) {
        insights.push({
          type: 'WARNING',
          title: 'Spending Spike',
          message: `Your spending increased by ${percentageDiff.toFixed(0)}% this month compared to last month. Consider reviewing your shopping category.`
        });
      } else if (percentageDiff < -15) {
        insights.push({
          type: 'SUCCESS',
          title: 'Great Savings!',
          message: `Awesome job! You have spent ${Math.abs(percentageDiff).toFixed(0)}% less than last month so far.`
        });
      }
    }

    // 2. Check category-level budgets
    const activeBudgets = await prisma.budget.findMany({
      where: {
        userId,
        isActive: true,
        deletedAt: null,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      include: {
        budgetCategories: {
          include: { category: true }
        }
      }
    });

    for (const budget of activeBudgets) {
      for (const bc of budget.budgetCategories) {
        const spent = currentExpenses
          .filter((tx) => tx.categoryId === bc.categoryId)
          .reduce((acc, tx) => acc + tx.amount.toNumber(), 0);
        
        const allocated = bc.allocatedAmount.toNumber();
        if (allocated > 0) {
          const usagePercent = (spent / allocated) * 100;
          if (usagePercent > 100) {
            insights.push({
              type: 'ALERT',
              title: 'Budget Exceeded',
              message: `Your spending in "${bc.category?.name}" exceeds its budget limit by $${(spent - allocated).toFixed(2)}.`
            });
          } else if (usagePercent > 85) {
            insights.push({
              type: 'WARNING',
              title: 'Budget Alert',
              message: `You have utilized ${usagePercent.toFixed(0)}% of your "${bc.category?.name}" budget.`
            });
          }
        }
      }
    }

    // 3. Savings Goal tracking projections
    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId, deletedAt: null, isCompleted: false }
    });

    for (const goal of savingsGoals) {
      if (goal.deadline) {
        const remaining = goal.targetAmount.toNumber() - goal.currentAmount.toNumber();
        const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysLeft > 0) {
          const requiredMonthly = (remaining / daysLeft) * 30;
          if (requiredMonthly > 0) {
            insights.push({
              type: 'INFO',
              title: 'Savings Pace',
              message: `To reach your goal "${goal.name}" on time, you should contribute approximately $${requiredMonthly.toFixed(2)} monthly.`
            });
          }
        }
      }
    }

    // Default insight if empty
    if (insights.length === 0) {
      insights.push({
        type: 'SUCCESS',
        title: 'Healthy Finances',
        message: 'Your spending is currently within normal parameters. Keep up the good habits!'
      });
    }

    return insights;
  }
}
export const insightService = new InsightService();
