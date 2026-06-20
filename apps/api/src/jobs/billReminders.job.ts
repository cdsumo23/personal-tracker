// jobs/billReminders.job.ts
import prisma from '../config/database';
import { sendBillReminderEmail } from '../utils/email';
import { notificationRepository } from '../repositories/notification.repository';
import logger from '../config/logger';

export async function processBillReminders(): Promise<void> {
  logger.info('Running bill reminders checking job...');

  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    // Widen range: check 3 days in the past up to 6 days in the future
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 3);

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 6);

    const bills = await prisma.bill.findMany({
      where: {
        deletedAt: null,
        isPaid: false,
        nextDueDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        user: true
      }
    });

    for (const bill of bills) {
      // Normalize bill due date to midnight for date difference calculations
      const billDate = new Date(bill.nextDueDate);
      billDate.setHours(0,0,0,0);
      
      const daysDiff = Math.round((billDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // We only alert the user on the specific requested intervals:
      // 5 days before, 3 days before, on the day itself (0), and 2 days after (-2)
      const targetIntervals = [5, 3, 0, -2];
      
      if (targetIntervals.includes(daysDiff)) {
        let title = 'Upcoming Bill Due';
        let message = '';
        let type: 'WARNING' | 'ALERT' = 'WARNING';

        if (daysDiff === 5) {
          title = 'Bill Due in 5 Days';
          message = `Your bill "${bill.name}" ($${bill.amount.toNumber().toFixed(2)}) is due in 5 days on ${bill.nextDueDate.toLocaleDateString()}.`;
        } else if (daysDiff === 3) {
          title = 'Bill Due in 3 Days';
          message = `Your bill "${bill.name}" ($${bill.amount.toNumber().toFixed(2)}) is due in 3 days on ${bill.nextDueDate.toLocaleDateString()}.`;
        } else if (daysDiff === 0) {
          title = 'Bill Due Today';
          message = `Your bill "${bill.name}" ($${bill.amount.toNumber().toFixed(2)}) is due today!`;
          type = 'ALERT';
        } else if (daysDiff === -2) {
          title = 'Overdue Bill Reminder';
          message = `Your bill "${bill.name}" ($${bill.amount.toNumber().toFixed(2)}) was due 2 days ago on ${bill.nextDueDate.toLocaleDateString()}.`;
          type = 'ALERT';
        }

        // 1. Create in-app notification (which automatically fires a push notification via the repository hook)
        await notificationRepository.create(bill.userId, {
          title,
          message,
          type,
          link: '/bills'
        });

        // 2. Send email reminder
        await sendBillReminderEmail(bill.user.email, bill.name, bill.amount.toNumber(), bill.nextDueDate);
        logger.info(`Sent ${title} notification for "${bill.name}" to user ${bill.userId} (daysDiff: ${daysDiff})`);
      }
    }
  } catch (error: any) {
    logger.error('Error in bill reminders job:', error.message);
  }
}
