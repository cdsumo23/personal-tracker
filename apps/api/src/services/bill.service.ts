// services/bill.service.ts
import { billRepository } from '../repositories/bill.repository';
import { transactionService } from './transaction.service';
import { currencyService } from './currency.service';
import prisma from '../config/database';

export class BillService {
  private determineIsPaid(bill: any): boolean {
    if (bill.isPaid) return true;
    if (!bill.lastPaidDate) return false;

    const lastPaid = new Date(bill.lastPaidDate);
    const now = new Date();
    
    // Normalize to midnight for fair date comparison
    const lastPaidMidnight = new Date(lastPaid.getFullYear(), lastPaid.getMonth(), lastPaid.getDate());
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = Math.abs(nowMidnight.getTime() - lastPaidMidnight.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const frequency = (bill.frequency || 'MONTHLY').toUpperCase();

    if (frequency === 'WEEKLY') {
      return diffDays <= 7;
    }
    if (frequency === 'MONTHLY') {
      return lastPaid.getMonth() === now.getMonth() && lastPaid.getFullYear() === now.getFullYear();
    }
    if (frequency === 'QUARTERLY') {
      return diffDays <= 90;
    }
    if (frequency === 'YEARLY') {
      return lastPaid.getFullYear() === now.getFullYear();
    }

    return false;
  }

  private async serializeBillResponse(bill: any, baseCurrency: string) {
    const billCurrency = (bill as any).currency || 'USD';
    const amountInBase = await currencyService.convertAmount(Number(bill.amount), billCurrency, baseCurrency);
    return {
      ...bill,
      amountInBase,
      isPaid: this.determineIsPaid(bill)
    };
  }

  async getAll(userId: string) {
    const bills = await billRepository.findAll(userId);
    const userRecord = await prisma.user.findUnique({ where: { id: userId }, select: { currency: true } });
    const baseCurrency = userRecord?.currency || 'USD';

    return Promise.all(bills.map(bill => this.serializeBillResponse(bill, baseCurrency)));
  }

  async getById(id: string, userId: string) {
    const bill = await billRepository.findById(id, userId);
    if (!bill) throw new Error('Bill not found');
    
    const userRecord = await prisma.user.findUnique({ where: { id: userId }, select: { currency: true } });
    const baseCurrency = userRecord?.currency || 'USD';

    return this.serializeBillResponse(bill, baseCurrency);
  }

  async create(userId: string, data: any) {
    // Calculate initial next due date
    const nextDueDate = this.calculateNextDueDate(new Date(), data.dueDay, data.frequency || 'MONTHLY');
    // Accept both `category` and `categoryId` field names for flexibility
    const category = data.category || data.categoryId || null;
    
    const bill = await billRepository.create(userId, {
      name: data.name,
      amount: data.amount,
      currency: data.currency || 'USD',
      dueDay: data.dueDay,
      category,
      isRecurring: data.isRecurring,
      frequency: data.frequency,
      reminderDays: data.reminderDays,
      notes: data.notes,
      nextDueDate
    });

    const userRecord = await prisma.user.findUnique({ where: { id: userId }, select: { currency: true } });
    const baseCurrency = userRecord?.currency || 'USD';
    return this.serializeBillResponse(bill, baseCurrency);
  }

  async update(id: string, userId: string, data: any) {
    const bill = await this.getById(id, userId);
    
    const updateData: any = { ...data };
    // Normalize category field — accept either `category` or `categoryId`
    if (updateData.categoryId !== undefined && updateData.category === undefined) {
      updateData.category = updateData.categoryId;
      delete updateData.categoryId;
    }
    if (data.dueDay !== undefined || data.frequency !== undefined) {
      const dueDay = data.dueDay !== undefined ? data.dueDay : bill.dueDay;
      const freq = data.frequency !== undefined ? data.frequency : bill.frequency;
      updateData.nextDueDate = this.calculateNextDueDate(new Date(), dueDay, freq);
    }
    
    const updated = await billRepository.update(id, userId, updateData);
    const userRecord = await prisma.user.findUnique({ where: { id: userId }, select: { currency: true } });
    const baseCurrency = userRecord?.currency || 'USD';
    return this.serializeBillResponse(updated, baseCurrency);
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    return billRepository.delete(id);
  }

  async getUpcomingBills(userId: string, days = 30) {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + days);
    const bills = await billRepository.findUpcoming(userId, limitDate);
    const userRecord = await prisma.user.findUnique({ where: { id: userId }, select: { currency: true } });
    const baseCurrency = userRecord?.currency || 'USD';

    return Promise.all(bills.map(bill => this.serializeBillResponse(bill, baseCurrency)));
  }

  /**
   * Marks a bill as paid. Optionally records a transaction on a specific account
   * and computes the subsequent due date if recurring.
   */
  async markAsPaid(id: string, userId: string, accountId?: string) {
    const bill = await this.getById(id, userId);

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Log transaction in ledger if accountId provided
      if (accountId) {
        const account = await tx.account.findUnique({ where: { id: accountId } });
        const accountCurrency = account?.currency || 'USD';
        const billCurrency = (bill as any).currency || 'USD';
        const convertedAmount = await currencyService.convertAmount(Number(bill.amount), billCurrency, accountCurrency);

        // We inject the transaction creation logic inline inside our transaction scope
        await tx.transaction.create({
          data: {
            userId,
            accountId,
            categoryId: bill.category || null,
            amount: convertedAmount,
            type: 'EXPENSE',
            description: `Paid Bill: ${bill.name}`,
            date: new Date(),
            notes: `Auto-generated from paid bill record.`
          }
        });

        // Deduct from account balance
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { decrement: convertedAmount } }
        });

        // Auto-contribute to savings goal if category matches and is active
        if (bill.category) {
          const goal = await tx.savingsGoal.findFirst({
            where: {
              userId,
              categoryId: bill.category,
              deletedAt: null,
              isCompleted: false
            }
          });

          if (goal) {
            // Create contribution
            await tx.goalContribution.create({
              data: {
                goalId: goal.id,
                amount: convertedAmount,
                note: `Auto-contributed from paid bill: ${bill.name}`,
                date: new Date()
              }
            });

            // Update goal currentAmount
            const updatedGoal = await tx.savingsGoal.update({
              where: { id: goal.id },
              data: {
                currentAmount: {
                  increment: convertedAmount
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
      }

      // 2. Compute next due date if recurring
      let nextDueDate = bill.nextDueDate;
      let isPaid = true;

      if (bill.isRecurring) {
        nextDueDate = this.calculateNextDueDate(bill.nextDueDate, bill.dueDay, bill.frequency);
        isPaid = false; // still active for the next interval
      }

      return tx.bill.update({
        where: { id },
        data: {
          lastPaidDate: new Date(),
          nextDueDate,
          isPaid
        }
      });
    });

    const userRecord = await prisma.user.findUnique({ where: { id: userId }, select: { currency: true } });
    const baseCurrency = userRecord?.currency || 'USD';
    return this.serializeBillResponse(updated, baseCurrency);
  }

  // --- Helper to calculate dates ---
  private calculateNextDueDate(currentDate: Date, dueDay: number, frequency: string): Date {
    const date = new Date(currentDate);
    
    if (frequency === 'WEEKLY') {
      date.setDate(date.getDate() + 7);
      return date;
    }

    if (frequency === 'MONTHLY') {
      // Move to next month
      date.setMonth(date.getMonth() + 1);
      date.setDate(Math.min(dueDay, this.getDaysInMonth(date.getFullYear(), date.getMonth())));
      return date;
    }

    if (frequency === 'QUARTERLY') {
      date.setMonth(date.getMonth() + 3);
      date.setDate(Math.min(dueDay, this.getDaysInMonth(date.getFullYear(), date.getMonth())));
      return date;
    }

    if (frequency === 'YEARLY') {
      date.setFullYear(date.getFullYear() + 1);
      date.setDate(Math.min(dueDay, this.getDaysInMonth(date.getFullYear(), date.getMonth())));
      return date;
    }

    return date;
  }

  private getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }
}
export const billService = new BillService();
