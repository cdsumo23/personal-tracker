import prisma from '@/config/database';
import { AccountType, Prisma } from '@prisma/client';

export interface CreateAccountData {
  userId: string;
  name: string;
  type: AccountType;
  balance?: number;
  currency?: string;
  color?: string;
  icon?: string;
  isDefault?: boolean;
  notes?: string;
}

export interface UpdateAccountData {
  name?: string;
  type?: AccountType;
  currency?: string;
  color?: string;
  icon?: string;
  isDefault?: boolean;
  notes?: string;
}

/** Converts a raw Prisma account record's Decimal balance to a plain JS number. */
function serializeAccount(account: any) {
  return {
    ...account,
    balance: account.balance != null ? Number(account.balance) : 0,
  };
}

export class AccountRepository {
  /** Get all active accounts for a user. */
  async findAll(userId: string) {
    const accounts = await prisma.account.findMany({
      where: { userId, deletedAt: null },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
    return accounts.map(serializeAccount);
  }

  /** Find an account by ID belonging to a user. */
  async findById(id: string, userId: string) {
    const account = await prisma.account.findFirst({
      where: { id, userId, deletedAt: null },
    });
    return account ? serializeAccount(account) : null;
  }

  /** Create a new account. */
  async create(data: CreateAccountData) {
    const account = await prisma.$transaction(async (tx) => {
      // If setting as default, unset all others first
      if (data.isDefault) {
        await tx.account.updateMany({
          where: { userId: data.userId, deletedAt: null },
          data: { isDefault: false },
        });
      }

      return tx.account.create({ data });
    });
    return serializeAccount(account);
  }

  /** Update an account. */
  async update(id: string, userId: string, data: UpdateAccountData) {
    const account = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.account.updateMany({
          where: { userId, deletedAt: null, NOT: { id } },
          data: { isDefault: false },
        });
      }
      return tx.account.update({ where: { id }, data });
    });
    return serializeAccount(account);
  }

  /** Soft-delete an account. */
  async delete(id: string, userId: string) {
    return prisma.account.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /** Adjust account balance by a delta (positive or negative). */
  async adjustBalance(id: string, delta: Prisma.Decimal | number, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return (client as any).account.update({
      where: { id },
      data: { balance: { increment: delta } },
    });
  }

  /** Get transaction history for an account with pagination. */
  async getHistory(accountId: string, userId: string, skip: number, take: number) {
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { accountId, userId, deletedAt: null },
        include: { category: true },
        orderBy: { date: 'desc' },
        skip,
        take,
      }),
      prisma.transaction.count({ where: { accountId, userId, deletedAt: null } }),
    ]);
    return { transactions, total };
  }

  /** Get total balance across all accounts for a user. */
  async getTotalBalance(userId: string) {
    const result = await prisma.account.aggregate({
      where: { userId, deletedAt: null },
      _sum: { balance: true },
    });
    return result._sum.balance ?? new Prisma.Decimal(0);
  }
}

export const accountRepository = new AccountRepository();
