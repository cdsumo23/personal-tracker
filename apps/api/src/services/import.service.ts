// services/import.service.ts
import prisma from '../config/database';
import { parse } from 'csv-parse/sync';
import { transactionService } from './transaction.service';

export class ImportService {
  async importTransactionsCSV(userId: string, accountId: string, fileBuffer: Buffer) {
    const records = parse(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const imported = [];
    const duplicates = [];

    // Fetch existing transactions on this account to match duplicates
    const existing = await prisma.transaction.findMany({
      where: { userId, accountId, deletedAt: null }
    });

    for (const record of records) {
      const amount = parseFloat(record.Amount || record.amount);
      const description = record.Description || record.description || 'CSV Import';
      const date = new Date(record.Date || record.date || new Date());
      const type = (record.Type || record.type || 'EXPENSE').toUpperCase() === 'INCOME' ? 'INCOME' : 'EXPENSE';

      if (isNaN(amount)) continue;

      // Duplicate detection: check if there's an existing transaction
      // with same date (day), description, and amount
      const isDuplicate = existing.some((tx) => {
        const txDateStr = tx.date.toISOString().split('T')[0];
        const recordDateStr = date.toISOString().split('T')[0];
        const txAmount = tx.amount.toNumber();
        return (
          txDateStr === recordDateStr &&
          tx.description.toLowerCase().trim() === description.toLowerCase().trim() &&
          Math.abs(txAmount - amount) < 0.01
        );
      });

      if (isDuplicate) {
        duplicates.push({ date, description, amount });
        continue;
      }

      // Record to database
      const txRecord = await transactionService.create(userId, {
        accountId,
        amount,
        type,
        description,
        date,
        notes: 'Imported from bank statement CSV.'
      });

      imported.push(txRecord);
    }

    return {
      totalProcessed: records.length,
      importedCount: imported.length,
      duplicatesCount: duplicates.length,
      imported,
      duplicates
    };
  }

  /**
   * Restores full backup data (accounts, transactions, categories, budgets, savings goals, debts, bills)
   */
  async restoreFullBackup(userId: string, backupData: any) {
    if (!backupData || backupData.version !== '1.0.0' || !backupData.data) {
      throw new Error('Invalid backup file format');
    }

    const { accounts, transactions, categories, budgets, savingsGoals, debts, bills } = backupData.data;

    return prisma.$transaction(async (tx) => {
      // 1. Clear existing user data (soft deletes or deletions)
      await tx.transaction.deleteMany({ where: { userId } });
      await tx.account.deleteMany({ where: { userId } });
      await tx.category.deleteMany({ where: { userId } });
      await tx.budget.deleteMany({ where: { userId } });
      await tx.savingsGoal.deleteMany({ where: { userId } });
      await tx.debt.deleteMany({ where: { userId } });
      await tx.bill.deleteMany({ where: { userId } });

      // 2. Restore accounts
      if (accounts && Array.isArray(accounts)) {
        await tx.account.createMany({
          data: accounts.map((acc) => ({
            id: acc.id,
            userId,
            name: acc.name,
            type: acc.type,
            balance: acc.balance,
            currency: acc.currency,
            color: acc.color,
            icon: acc.icon,
            isDefault: acc.isDefault,
            notes: acc.notes,
            createdAt: new Date(acc.createdAt),
            updatedAt: new Date(acc.updatedAt)
          }))
        });
      }

      // 3. Restore custom categories
      if (categories && Array.isArray(categories)) {
        await tx.category.createMany({
          data: categories.map((cat) => ({
            id: cat.id,
            userId,
            name: cat.name,
            type: cat.type,
            icon: cat.icon,
            color: cat.color,
            isSystem: false,
            createdAt: new Date(cat.createdAt),
            updatedAt: new Date(cat.updatedAt)
          }))
        });
      }

      // ── Build FK safety sets ──────────────────────────────────────────────
      // Valid account IDs: only what we just restored from the backup.
      const validAccountIds = new Set((accounts || []).map((a: any) => a.id));

      // Valid category IDs: user categories restored above + system (built-in)
      // categories already present in this environment. System category IDs can
      // differ between local and live databases (different seed runs), so we
      // fetch them fresh from the current DB instead of trusting the backup IDs.
      const userCategoryIds = new Set((categories || []).map((c: any) => c.id));
      const systemCategories = await tx.category.findMany({
        where: { isSystem: true },
        select: { id: true }
      });
      const validCategoryIds = new Set([
        ...userCategoryIds,
        ...systemCategories.map((c) => c.id)
      ]);
      // ─────────────────────────────────────────────────────────────────────

      // 4. Restore transactions
      // Guard both accountId and categoryId — either missing FK will crash the DB.
      if (transactions && Array.isArray(transactions)) {
        const validTransactions = transactions.filter(
          (t: any) => t.accountId && validAccountIds.has(t.accountId)
        );
        if (validTransactions.length > 0) {
          await tx.transaction.createMany({
            data: validTransactions.map((t: any) => ({
              id: t.id,
              userId,
              accountId: t.accountId,
              categoryId: t.categoryId && validCategoryIds.has(t.categoryId) ? t.categoryId : null,
              amount: t.amount,
              type: t.type,
              description: t.description,
              notes: t.notes,
              date: new Date(t.date),
              tags: t.tags || [],
              receiptUrl: t.receiptUrl,
              isRecurring: t.isRecurring,
              recurringInterval: t.recurringInterval,
              recurringEndDate: t.recurringEndDate ? new Date(t.recurringEndDate) : null,
              createdAt: new Date(t.createdAt),
              updatedAt: new Date(t.updatedAt)
            }))
          });
        }
      }

      // 5. Restore budgets
      // Strip any budgetCategory row whose categoryId doesn't exist in this env.
      if (budgets && Array.isArray(budgets)) {
        for (const b of budgets) {
          const validBudgetCategories = (b.budgetCategories || []).filter(
            (bc: any) => bc.categoryId && validCategoryIds.has(bc.categoryId)
          );

          await tx.budget.create({
            data: {
              id: b.id,
              userId,
              name: b.name,
              period: b.period,
              startDate: new Date(b.startDate),
              endDate: new Date(b.endDate),
              totalAmount: b.totalAmount,
              isActive: b.isActive,
              carryover: b.carryover,
              createdAt: new Date(b.createdAt),
              updatedAt: new Date(b.updatedAt),
              budgetCategories: validBudgetCategories.length > 0
                ? {
                    create: validBudgetCategories.map((bc: any) => ({
                      categoryId: bc.categoryId,
                      allocatedAmount: bc.allocatedAmount
                    }))
                  }
                : undefined
            }
          });
        }
      }

      // 6. Restore savings goals
      // Guard the optional categoryId FK.
      if (savingsGoals && Array.isArray(savingsGoals)) {
        for (const g of savingsGoals) {
          await tx.savingsGoal.create({
            data: {
              id: g.id,
              userId,
              name: g.name,
              targetAmount: g.targetAmount,
              currentAmount: g.currentAmount,
              deadline: g.deadline ? new Date(g.deadline) : null,
              priority: g.priority,
              icon: g.icon,
              color: g.color,
              isCompleted: g.isCompleted,
              autoContribute: g.autoContribute,
              contributionAmount: g.contributionAmount,
              contributionInterval: g.contributionInterval,
              categoryId: g.categoryId && validCategoryIds.has(g.categoryId) ? g.categoryId : undefined,
              createdAt: new Date(g.createdAt),
              updatedAt: new Date(g.updatedAt),
              contributions: g.contributions
                ? {
                    create: g.contributions.map((c: any) => ({
                      amount: c.amount,
                      note: c.note,
                      date: new Date(c.date)
                    }))
                  }
                : undefined
            }
          });
        }
      }

      // 7. Restore debts (no category FK — safe to restore as-is)
      if (debts && Array.isArray(debts)) {
        for (const d of debts) {
          await tx.debt.create({
            data: {
              id: d.id,
              userId,
              name: d.name,
              type: d.type,
              originalAmount: d.originalAmount,
              currentBalance: d.currentBalance,
              interestRate: d.interestRate,
              minimumPayment: d.minimumPayment,
              dueDate: d.dueDate ? new Date(d.dueDate) : null,
              lender: d.lender,
              notes: d.notes,
              strategy: d.strategy,
              createdAt: new Date(d.createdAt),
              updatedAt: new Date(d.updatedAt),
              payments: d.payments
                ? {
                    create: d.payments.map((p: any) => ({
                      amount: p.amount,
                      date: new Date(p.date),
                      note: p.note
                    }))
                  }
                : undefined
            }
          });
        }
      }

      // 8. Restore bills (category is a plain string field — no FK risk)
      if (bills && Array.isArray(bills)) {
        await tx.bill.createMany({
          data: bills.map((b) => ({
            id: b.id,
            userId,
            name: b.name,
            amount: b.amount,
            dueDay: b.dueDay,
            category: b.category,
            isRecurring: b.isRecurring,
            frequency: b.frequency,
            nextDueDate: new Date(b.nextDueDate),
            lastPaidDate: b.lastPaidDate ? new Date(b.lastPaidDate) : null,
            isPaid: b.isPaid,
            reminderDays: b.reminderDays,
            notes: b.notes,
            createdAt: new Date(b.createdAt),
            updatedAt: new Date(b.updatedAt)
          }))
        });
      }

      return { success: true };
    });
  }
}
export const importService = new ImportService();
