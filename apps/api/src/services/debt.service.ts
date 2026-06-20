// services/debt.service.ts
import { debtRepository } from '../repositories/debt.repository';

export class DebtService {
  async getAll(userId: string) {
    return debtRepository.findAll(userId);
  }

  async getById(id: string, userId: string) {
    const debt = await debtRepository.findById(id, userId);
    if (!debt) throw new Error('Debt record not found');
    return debt;
  }

  async create(userId: string, data: any) {
    return debtRepository.create(userId, {
      name: data.name,
      type: data.type,
      originalAmount: data.originalAmount,
      currentBalance: data.currentBalance,
      interestRate: data.interestRate,
      minimumPayment: data.minimumPayment,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      lender: data.lender,
      notes: data.notes,
      strategy: data.strategy
    });
  }

  async update(id: string, userId: string, data: any) {
    await this.getById(id, userId); // check ownership
    return debtRepository.update(id, userId, {
      name: data.name,
      type: data.type,
      originalAmount: data.originalAmount,
      currentBalance: data.currentBalance,
      interestRate: data.interestRate,
      minimumPayment: data.minimumPayment,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      lender: data.lender,
      notes: data.notes,
      strategy: data.strategy
    });
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    return debtRepository.delete(id);
  }

  async addPayment(id: string, userId: string, data: any) {
    await this.getById(id, userId); // verify ownership
    return debtRepository.addPayment(id, data.amount, data.note, data.date ? new Date(data.date) : undefined);
  }

  /**
   * Calculates debt payoff projections using Snowball (smallest balance first)
   * or Avalanche (highest interest rate first) strategies.
   */
  async calculatePayoffStrategy(userId: string, strategy: 'SNOWBALL' | 'AVALANCHE', extraPayment = 0) {
    const debts = await this.getAll(userId);
    const activeDebts = debts
      .filter((d) => d.currentBalance.toNumber() > 0)
      .map((d) => ({
        id: d.id,
        name: d.name,
        balance: d.currentBalance.toNumber(),
        rate: d.interestRate.toNumber() / 100, // percentage to decimal
        minPay: d.minimumPayment.toNumber(),
        months: 0,
        interestPaid: 0
      }));

    if (activeDebts.length === 0) {
      return { schedule: [], totalMonths: 0, totalInterestPaid: 0 };
    }

    // Sort debts based on strategy
    if (strategy === 'SNOWBALL') {
      // Smallest balance first
      activeDebts.sort((a, b) => a.balance - b.balance);
    } else {
      // Highest interest rate first
      activeDebts.sort((a, b) => b.rate - a.rate);
    }

    const schedule = [];
    let currentMonth = 0;
    let totalInterestPaid = 0;

    // Simulate month-by-month payments
    while (activeDebts.some((d) => d.balance > 0)) {
      currentMonth++;
      let availableExtra = extraPayment;

      // 1. Gather all minimum payments required for active debts
      const activeThisMonth = activeDebts.filter((d) => d.balance > 0);
      
      // Calculate monthly interest and apply payments
      for (const debt of activeThisMonth) {
        // Calculate interest (rate / 12)
        const interest = (debt.balance * debt.rate) / 12;
        debt.balance += interest;
        debt.interestPaid += interest;
        totalInterestPaid += interest;

        // Apply minimum payment
        const pay = Math.min(debt.minPay, debt.balance);
        debt.balance -= pay;
        
        if (debt.balance <= 0) {
          // surplus goes back to available extra
          availableExtra += (debt.minPay - pay);
        }
      }

      // 2. Direct extra payments to the target debt (first item in the sorted active array)
      const targetDebt = activeDebts.find((d) => d.balance > 0);
      if (targetDebt && availableExtra > 0) {
        const extraPay = Math.min(availableExtra, targetDebt.balance);
        targetDebt.balance -= extraPay;
      }

      // Record month snapshot
      schedule.push({
        month: currentMonth,
        remainingDebts: activeDebts.map((d) => ({
          name: d.name,
          remainingBalance: Math.max(0, d.balance)
        }))
      });

      // Avoid infinite loop if payment is too low to cover interest
      if (currentMonth > 360) {
        // cap at 30 years
        break;
      }
    }

    return {
      strategy,
      totalMonths: currentMonth,
      totalInterestPaid,
      schedule
    };
  }
}
export const debtService = new DebtService();
