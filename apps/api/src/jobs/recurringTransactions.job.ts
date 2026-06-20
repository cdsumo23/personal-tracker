// jobs/recurringTransactions.job.ts
import prisma from '../config/database';
import { transactionService } from '../services/transaction.service';
import logger from '../config/logger';

export async function processRecurringTransactions(): Promise<void> {
  logger.info('Running recurring transactions generator job...');

  try {
    const today = new Date();
    
    // Find active recurring templates that are due
    const recurringTxs = await prisma.transaction.findMany({
      where: {
        isRecurring: true,
        deletedAt: null,
        parentTransactionId: null, // template root
        OR: [
          { recurringEndDate: null },
          { recurringEndDate: { gte: today } }
        ]
      }
    });

    for (const tx of recurringTxs) {
      // Find the last generated child of this transaction
      const lastChild = await prisma.transaction.findFirst({
        where: {
          parentTransactionId: tx.id,
          deletedAt: null
        },
        orderBy: { date: 'desc' }
      });

      const referenceDate = lastChild ? lastChild.date : tx.date;
      const isDue = checkIfIntervalReached(referenceDate, today, tx.recurringInterval!);

      if (isDue) {
        // Create duplicate transaction representing the next occurrence
        await transactionService.create(tx.userId, {
          accountId: tx.accountId,
          categoryId: tx.categoryId,
          amount: tx.amount.toNumber(),
          type: tx.type,
          description: tx.description,
          notes: `Auto-generated recurrence from transaction: ${tx.description}`,
          date: today,
          tags: tx.tags,
          parentTransactionId: tx.id
        });
        logger.info(`Generated recurring transaction for user ${tx.userId}: ${tx.description}`);
      }
    }
  } catch (error: any) {
    logger.error('Error in recurring transactions job:', error.message);
  }
}

function checkIfIntervalReached(lastDate: Date, currentDate: Date, interval: string): boolean {
  const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (interval === 'DAILY' && diffDays >= 1) return true;
  if (interval === 'WEEKLY' && diffDays >= 7) return true;
  if (interval === 'MONTHLY') {
    const months = (currentDate.getFullYear() - lastDate.getFullYear()) * 12 + (currentDate.getMonth() - lastDate.getMonth());
    if (months >= 1) return true;
  }
  if (interval === 'QUARTERLY') {
    const months = (currentDate.getFullYear() - lastDate.getFullYear()) * 12 + (currentDate.getMonth() - lastDate.getMonth());
    if (months >= 3) return true;
  }
  if (interval === 'YEARLY') {
    const years = currentDate.getFullYear() - lastDate.getFullYear();
    if (years >= 1) return true;
  }

  return false;
}
