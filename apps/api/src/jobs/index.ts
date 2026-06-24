// jobs/index.ts
import cron from 'node-cron';
import { processRecurringTransactions } from './recurringTransactions.job';
import { processBillReminders } from './billReminders.job';
import { processBudgetAlerts } from './budgetAlerts.job';
import { processMonthlyReports } from './monthlyReport.job';
import { processSavingsContributions } from './savingsUpdate.job';
import { currencyService } from '../services/currency.service';
import { budgetService } from '../services/budget.service';
import logger from '../config/logger';

export function startBackgroundJobs(): void {
  logger.info('Initializing background cron schedules...');

  // 1. Daily midnight jobs (0 0 * * *)
  cron.schedule('0 0 * * *', async () => {
    logger.info('Triggering daily scheduled tasks...');
    try {
      await budgetService.autoExpireBudgets();
    } catch (err: any) {
      logger.error('Error auto-expiring budgets:', err.message);
    }
    await processRecurringTransactions();
    await processBillReminders();
    await processBudgetAlerts();
    await processSavingsContributions();
  });

  // 2. Monthly jobs on the 1st day of month (0 1 1 * *)
  cron.schedule('0 1 1 * *', async () => {
    logger.info('Triggering monthly scheduled summary reports...');
    await processMonthlyReports();
  });

  // 3. Hourly updates for currency exchange rates (0 * * * *)
  cron.schedule('0 * * * *', async () => {
    logger.info('Triggering hourly currency rates sync...');
    await currencyService.updateExchangeRates();
  });

  logger.info('Background cron schedules started.');
}
