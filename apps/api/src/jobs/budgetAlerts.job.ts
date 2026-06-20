// jobs/budgetAlerts.job.ts
import prisma from '../config/database';
import { sendBudgetAlertEmail } from '../utils/email';
import { notificationRepository } from '../repositories/notification.repository';
import { budgetService } from '../services/budget.service';
import logger from '../config/logger';

export async function processBudgetAlerts(): Promise<void> {
  logger.info('Running budget utilization alert checker job...');

  try {
    const activeBudgets = await prisma.budget.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() }
      },
      include: {
        user: true
      }
    });

    for (const budget of activeBudgets) {
      const usage = await budgetService.getBudgetUsage(budget.id, budget.userId);
      
      if (usage.percentage >= 80) {
        const severity = usage.percentage >= 100 ? 'ALERT' : 'WARNING';
        const title = usage.percentage >= 100 ? 'Budget Limit Exceeded' : 'Budget Warning (80%+)';
        const message = `Your budget "${budget.name}" has reached ${usage.percentage.toFixed(0)}% utilization. Spent $${usage.totalSpent.toFixed(2)} of $${usage.totalAmount.toFixed(2)}.`;

        // Create notification
        await notificationRepository.create(budget.userId, {
          title,
          message,
          type: severity,
          link: `/budgets`
        });

        // Send warning email
        await sendBudgetAlertEmail(budget.user.email, budget.name, 'Overall', usage.percentage);
        logger.info(`Budget notification triggered for user ${budget.userId}: ${usage.percentage.toFixed(0)}%`);
      }
    }
  } catch (error: any) {
    logger.error('Error in budget alerts job:', error.message);
  }
}
