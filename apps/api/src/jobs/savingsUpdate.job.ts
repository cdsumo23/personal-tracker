// jobs/savingsUpdate.job.ts
import prisma from '../config/database';
import { goalRepository } from '../repositories/goal.repository';
import logger from '../config/logger';

export async function processSavingsContributions(): Promise<void> {
  logger.info('Processing automatic savings goal contributions...');

  try {
    const goals = await prisma.savingsGoal.findMany({
      where: {
        deletedAt: null,
        isCompleted: false,
        autoContribute: true,
        contributionAmount: { gt: 0 }
      }
    });

    for (const goal of goals) {
      const amt = goal.contributionAmount?.toNumber() || 0;
      
      // Look up checking/default accounts to debit
      const defaultAccount = await prisma.account.findFirst({
        where: { userId: goal.userId, isDefault: true, deletedAt: null }
      });

      if (!defaultAccount) {
        logger.warn(`No default account found to debit auto-contribution for goal: ${goal.name} (user: ${goal.userId})`);
        continue;
      }

      if (defaultAccount.balance.toNumber() < amt) {
        logger.warn(`Insufficient balance in default account to process auto-contribution for goal: ${goal.name} (user: ${goal.userId})`);
        continue;
      }

      await prisma.$transaction(async (tx) => {
        // Debit checking account
        await tx.account.update({
          where: { id: defaultAccount.id },
          data: { balance: { decrement: amt } }
        });

        // Log transaction as a savings expense
        await tx.transaction.create({
          data: {
            userId: goal.userId,
            accountId: defaultAccount.id,
            amount: amt,
            type: 'EXPENSE',
            description: `Auto-Savings Goal Contribution: ${goal.name}`,
            date: new Date(),
            notes: `Auto contribution transferred to savings goal: ${goal.name}`
          }
        });

        // Increment Goal current progress
        await tx.goalContribution.create({
          data: {
            goalId: goal.id,
            amount: amt,
            note: 'Auto contribution transfer',
            date: new Date()
          }
        });

        const updatedGoal = await tx.savingsGoal.update({
          where: { id: goal.id },
          data: {
            currentAmount: { increment: amt }
          }
        });

        // Mark completed if threshold met
        if (updatedGoal.currentAmount.toNumber() >= updatedGoal.targetAmount.toNumber()) {
          await tx.savingsGoal.update({
            where: { id: goal.id },
            data: { isCompleted: true }
          });
        }
      });

      logger.info(`Automated savings contribution processed for goal: ${goal.name} (user: ${goal.userId})`);
    }
  } catch (error: any) {
    logger.error('Error in savings goals auto contributions job:', error.message);
  }
}
