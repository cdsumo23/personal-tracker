// jobs/monthlyReport.job.ts
import prisma from '../config/database';
import { sendMonthlySummaryEmail } from '../utils/email';
import { reportService } from '../services/report.service';
import { netWorthService } from '../services/networth.service';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';
import logger from '../config/logger';

export async function processMonthlyReports(): Promise<void> {
  logger.info('Running monthly summary report and net worth snapshots job...');

  try {
    const users = await prisma.user.findMany({
      where: { isActive: true, deletedAt: null }
    });

    const now = new Date();
    const lastMonth = subMonths(now, 1);
    const startOfLastMonth = startOfMonth(lastMonth);
    const endOfLastMonth = endOfMonth(lastMonth);

    for (const user of users) {
      // 1. Take Net Worth Snapshot for historical logs
      await netWorthService.takeSnapshot(user.id);

      // 2. Fetch last month's ledger details
      const txs = await prisma.transaction.findMany({
        where: {
          userId: user.id,
          deletedAt: null,
          date: { gte: startOfLastMonth, lte: endOfLastMonth }
        }
      });

      let income = 0;
      let expense = 0;

      for (const t of txs) {
        const amt = t.amount.toNumber();
        if (t.type === 'INCOME') income += amt;
        if (t.type === 'EXPENSE') expense += amt;
      }

      const savings = Math.max(0, income - expense);
      const nwCurrent = await netWorthService.getCurrentNetWorth(user.id);

      // 3. Email summary
      const monthName = lastMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      await sendMonthlySummaryEmail(user.email, user.firstName, {
        month: monthName,
        totalIncome: income,
        totalExpenses: expense,
        netSavings: savings,
        topCategory: 'N/A',
        budgetAdherence: 100,
        savingsGoalProgress: 0
      });

      logger.info(`Processed monthly report snapshot for user ${user.id}`);
    }
  } catch (error: any) {
    logger.error('Error in monthly reports job:', error.message);
  }
}
