import { AccountType } from '@prisma/client';
import { accountRepository, CreateAccountData, UpdateAccountData } from '@/repositories/account.repository';
import { AppError } from '@/middleware/error.middleware';
import prisma from '@/config/database';
import { TransactionType } from '@prisma/client';

export class AccountService {
  /** Get all accounts for a user. */
  async getAll(userId: string) {
    return accountRepository.findAll(userId);
  }

  /** Get a single account by ID. Throws if not found or not owned by user. */
  async getById(id: string, userId: string) {
    const account = await accountRepository.findById(id, userId);
    if (!account) throw new AppError('Account not found', 404);
    return account;
  }

  /** Create a new account for a user. */
  async create(userId: string, data: Omit<CreateAccountData, 'userId'>) {
    return accountRepository.create({ ...data, userId });
  }

  /** Update an account. */
  async update(id: string, userId: string, data: UpdateAccountData) {
    await this.getById(id, userId); // ownership check
    return accountRepository.update(id, userId, data);
  }

  /** Soft-delete an account. Prevents deletion if it has linked transactions. */
  async delete(id: string, userId: string) {
    await this.getById(id, userId);

    const txCount = await prisma.transaction.count({
      where: { accountId: id, deletedAt: null },
    });

    if (txCount > 0) {
      throw new AppError(
        `Cannot delete account with ${txCount} active transaction(s). Archive transactions first.`,
        400
      );
    }

    await accountRepository.delete(id, userId);
  }

  /**
   * Transfer money between two accounts.
   * Creates a TRANSFER transaction record on both accounts.
   */
  async transfer(
    userId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description: string,
    date?: Date
  ) {
    if (fromAccountId === toAccountId) {
      throw new AppError('Cannot transfer to the same account', 400);
    }

    if (amount <= 0) {
      throw new AppError('Transfer amount must be greater than 0', 400);
    }

    const [fromAccount, toAccount] = await Promise.all([
      accountRepository.findById(fromAccountId, userId),
      accountRepository.findById(toAccountId, userId),
    ]);

    if (!fromAccount) throw new AppError('Source account not found', 404);
    if (!toAccount) throw new AppError('Destination account not found', 404);

    const transferDate = date ?? new Date();

    const result = await prisma.$transaction(async (tx) => {
      // Debit source
      await (tx as any).account.update({
        where: { id: fromAccountId },
        data: { balance: { decrement: amount } },
      });

      // Credit destination
      await (tx as any).account.update({
        where: { id: toAccountId },
        data: { balance: { increment: amount } },
      });

      // Create two transaction records
      const outgoing = await (tx as any).transaction.create({
        data: {
          userId,
          accountId: fromAccountId,
          amount,
          type: TransactionType.TRANSFER,
          description: description ?? `Transfer to ${toAccount.name}`,
          date: transferDate,
          tags: ['transfer'],
        },
      });

      const incoming = await (tx as any).transaction.create({
        data: {
          userId,
          accountId: toAccountId,
          amount,
          type: TransactionType.TRANSFER,
          description: description ?? `Transfer from ${fromAccount.name}`,
          date: transferDate,
          tags: ['transfer'],
          splitFrom: outgoing.id,
        },
      });

      return { outgoing, incoming };
    });

    return result;
  }

  /** Get account transaction history with pagination. */
  async getHistory(id: string, userId: string, page: number, limit: number) {
    await this.getById(id, userId);
    const skip = (page - 1) * limit;
    return accountRepository.getHistory(id, userId, skip, limit);
  }

  /** Get total balance across all accounts. */
  async getTotalBalance(userId: string) {
    return accountRepository.getTotalBalance(userId);
  }
}

export const accountService = new AccountService();
