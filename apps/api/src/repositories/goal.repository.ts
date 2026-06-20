// repositories/goal.repository.ts
import prisma from '../config/database';
import { SavingsGoal, Priority } from '@prisma/client';

export class GoalRepository {
  async findAll(userId: string): Promise<any[]> {
    return prisma.savingsGoal.findMany({
      where: {
        userId,
        deletedAt: null
      },
      include: {
        contributions: {
          orderBy: { date: 'desc' }
        },
        category: true
      },
      orderBy: {
        deadline: 'asc'
      }
    });
  }

  async findById(id: string, userId: string): Promise<any | null> {
    return prisma.savingsGoal.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      },
      include: {
        contributions: {
          orderBy: { date: 'desc' }
        },
        category: true
      }
    });
  }

  async create(
    userId: string,
    data: {
      name: string;
      targetAmount: number;
      currentAmount?: number;
      deadline?: Date | null;
      priority?: Priority;
      icon?: string | null;
      color?: string | null;
      categoryId?: string | null;
      autoContribute?: boolean;
      contributionAmount?: number | null;
      contributionInterval?: string | null;
    }
  ): Promise<any> {
    return prisma.savingsGoal.create({
      data: {
        userId,
        name: data.name,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || 0,
        deadline: data.deadline,
        priority: data.priority || 'MEDIUM',
        icon: data.icon,
        color: data.color,
        categoryId: data.categoryId,
        autoContribute: data.autoContribute || false,
        contributionAmount: data.contributionAmount,
        contributionInterval: data.contributionInterval
      }
    });
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<any> {
    return prisma.savingsGoal.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<any> {
    return prisma.savingsGoal.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async addContribution(
    goalId: string,
    amount: number,
    note?: string | null,
    date = new Date()
  ) {
    return prisma.$transaction(async (tx) => {
      // Create contribution record
      const contribution = await tx.goalContribution.create({
        data: {
          goalId,
          amount,
          note,
          date
        }
      });

      // Update goal total progress
      const goal = await tx.savingsGoal.update({
        where: { id: goalId },
        data: {
          currentAmount: {
            increment: amount
          }
        }
      });

      // Mark completed if threshold reached
      if (goal.currentAmount.toNumber() >= goal.targetAmount.toNumber()) {
        await tx.savingsGoal.update({
          where: { id: goalId },
          data: { isCompleted: true }
        });
      }

      return { contribution, goal };
    });
  }
}
export const goalRepository = new GoalRepository();
