// repositories/budget.repository.ts
import prisma from '../config/database';
import { Budget, BudgetPeriod } from '@prisma/client';

function serializeBudget(budget: any) {
  if (!budget) return null;
  return {
    ...budget,
    totalAmount: budget.totalAmount != null ? Number(budget.totalAmount) : 0,
    budgetCategories: budget.budgetCategories
      ? budget.budgetCategories.map((bc: any) => ({
          ...bc,
          allocatedAmount: bc.allocatedAmount != null ? Number(bc.allocatedAmount) : 0
        }))
      : []
  };
}

export class BudgetRepository {
  async findAll(userId: string): Promise<any[]> {
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        deletedAt: null
      },
      include: {
        budgetCategories: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });
    return budgets.map(serializeBudget);
  }

  async findById(id: string, userId: string): Promise<any | null> {
    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      },
      include: {
        budgetCategories: {
          include: {
            category: true
          }
        }
      }
    });
    return serializeBudget(budget);
  }

  async create(
    userId: string,
    data: {
      name: string;
      period: BudgetPeriod;
      startDate: Date;
      endDate: Date;
      totalAmount: number;
      carryover?: boolean;
      categories: Array<{ categoryId: string; allocatedAmount: number; currency?: string }>;
    }
  ): Promise<any> {
    const budget = await prisma.budget.create({
      data: {
        userId,
        name: data.name,
        period: data.period,
        startDate: data.startDate,
        endDate: data.endDate,
        totalAmount: data.totalAmount,
        carryover: data.carryover || false,
        budgetCategories: {
          create: data.categories.map((cat) => ({
            categoryId: cat.categoryId,
            allocatedAmount: cat.allocatedAmount,
            currency: cat.currency || 'USD'
          }))
        }
      },
      include: {
        budgetCategories: {
          include: {
            category: true
          }
        }
      }
    });
    return serializeBudget(budget);
  }

  async update(
    id: string,
    userId: string,
    data: {
      name?: string;
      period?: BudgetPeriod;
      startDate?: Date;
      endDate?: Date;
      totalAmount?: number;
      carryover?: boolean;
      isActive?: boolean;
      categories?: Array<{ categoryId: string; allocatedAmount: number; currency?: string }>;
    }
  ): Promise<any> {
    return prisma.$transaction(async (tx) => {
      // 1. If categories list is updated, wipe previous categories and re-create
      if (data.categories) {
        await tx.budgetCategory.deleteMany({
          where: { budgetId: id }
        });
      }

      // 2. Perform budget updating
      const budget = await tx.budget.update({
        where: { id },
        data: {
          name: data.name,
          period: data.period,
          startDate: data.startDate,
          endDate: data.endDate,
          totalAmount: data.totalAmount,
          carryover: data.carryover,
          isActive: data.isActive,
          budgetCategories: data.categories
            ? {
                create: data.categories.map((cat) => ({
                  categoryId: cat.categoryId,
                  allocatedAmount: cat.allocatedAmount,
                  currency: cat.currency || 'USD'
                }))
              }
            : undefined
        },
        include: {
          budgetCategories: {
            include: {
              category: true
            }
          }
        }
      });
      return serializeBudget(budget);
    });
  }

  async delete(id: string): Promise<any> {
    return prisma.budget.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async findActiveBudgets(userId: string, date = new Date()): Promise<any[]> {
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        isActive: true,
        deletedAt: null,
        startDate: { lte: date },
        endDate: { gte: date }
      },
      include: {
        budgetCategories: true
      }
    });
    return budgets.map(serializeBudget);
  }
}
export const budgetRepository = new BudgetRepository();
