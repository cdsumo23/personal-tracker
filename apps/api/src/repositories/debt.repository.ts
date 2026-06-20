// repositories/debt.repository.ts
import prisma from '../config/database';
import { Debt, DebtType, DebtStrategy } from '@prisma/client';

export class DebtRepository {
  async findAll(userId: string): Promise<Debt[]> {
    return prisma.debt.findMany({
      where: {
        userId,
        deletedAt: null
      },
      include: {
        payments: {
          orderBy: { date: 'desc' }
        }
      },
      orderBy: {
        currentBalance: 'desc'
      }
    });
  }

  async findById(id: string, userId: string): Promise<Debt | null> {
    return prisma.debt.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      },
      include: {
        payments: {
          orderBy: { date: 'desc' }
        }
      }
    });
  }

  async create(
    userId: string,
    data: {
      name: string;
      type: DebtType;
      originalAmount: number;
      currentBalance: number;
      interestRate: number;
      minimumPayment: number;
      dueDate?: Date | null;
      lender?: string | null;
      notes?: string | null;
      strategy?: DebtStrategy | null;
    }
  ): Promise<Debt> {
    return prisma.debt.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        originalAmount: data.originalAmount,
        currentBalance: data.currentBalance,
        interestRate: data.interestRate,
        minimumPayment: data.minimumPayment,
        dueDate: data.dueDate,
        lender: data.lender,
        notes: data.notes,
        strategy: data.strategy
      }
    });
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Omit<Debt, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Debt> {
    return prisma.debt.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<Debt> {
    return prisma.debt.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async addPayment(debtId: string, amount: number, note?: string | null, date = new Date()) {
    return prisma.$transaction(async (tx) => {
      // 1. Log payment
      const payment = await tx.debtPayment.create({
        data: {
          debtId,
          amount,
          note,
          date
        }
      });

      // 2. Decrement balance on debt
      const debt = await tx.debt.update({
        where: { id: debtId },
        data: {
          currentBalance: {
            decrement: amount
          }
        }
      });

      return { payment, debt };
    });
  }
}
export const debtRepository = new DebtRepository();
