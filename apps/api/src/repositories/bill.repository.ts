// repositories/bill.repository.ts
import prisma from '../config/database';
import { Bill, BillFrequency } from '@prisma/client';

function serializeBill(bill: any) {
  if (!bill) return null;
  return {
    ...bill,
    amount: bill.amount != null ? Number(bill.amount) : 0
  };
}

export class BillRepository {
  async findAll(userId: string): Promise<Bill[]> {
    const bills = await prisma.bill.findMany({
      where: {
        userId,
        deletedAt: null
      },
      orderBy: {
        nextDueDate: 'asc'
      }
    });
    return bills.map(serializeBill) as any;
  }

  async findById(id: string, userId: string): Promise<Bill | null> {
    const bill = await prisma.bill.findFirst({
      where: {
        id,
        userId,
        deletedAt: null
      }
    });
    return serializeBill(bill) as any;
  }

  async create(
    userId: string,
    data: {
      name: string;
      amount: number;
      currency?: string;
      dueDay: number;
      category?: string | null;
      isRecurring?: boolean;
      frequency?: BillFrequency;
      reminderDays?: number;
      notes?: string | null;
      nextDueDate: Date;
    }
  ): Promise<Bill> {
    const bill = await prisma.bill.create({
      data: {
        userId,
        name: data.name,
        amount: data.amount,
        currency: data.currency || 'USD',
        dueDay: data.dueDay,
        category: data.category,
        isRecurring: data.isRecurring !== undefined ? data.isRecurring : true,
        frequency: data.frequency || 'MONTHLY',
        reminderDays: data.reminderDays !== undefined ? data.reminderDays : 3,
        notes: data.notes,
        nextDueDate: data.nextDueDate
      }
    });
    return serializeBill(bill) as any;
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Omit<Bill, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Bill> {
    const bill = await prisma.bill.update({
      where: { id },
      data
    });
    return serializeBill(bill) as any;
  }

  async delete(id: string): Promise<Bill> {
    const bill = await prisma.bill.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return serializeBill(bill) as any;
  }

  async findUpcoming(userId: string, dateLimit: Date): Promise<Bill[]> {
    const bills = await prisma.bill.findMany({
      where: {
        userId,
        deletedAt: null,
        isPaid: false,
        nextDueDate: {
          lte: dateLimit
        }
      },
      orderBy: {
        nextDueDate: 'asc'
      }
    });
    return bills.map(serializeBill) as any;
  }
}
export const billRepository = new BillRepository();
