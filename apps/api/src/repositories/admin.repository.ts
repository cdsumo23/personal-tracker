// repositories/admin.repository.ts
import prisma from '../config/database';
import { User, AuditLog } from '@prisma/client';

export class AdminRepository {
  async countUsers(): Promise<number> {
    return prisma.user.count({ where: { deletedAt: null } });
  }

  async countTransactions(): Promise<number> {
    return prisma.transaction.count({ where: { deletedAt: null } });
  }

  async fetchUsers(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ data: Omit<User, 'passwordHash'>[]; total: number }> {
    const skip = (page - 1) * limit;

    const whereClause: any = {
      deletedAt: null
    };

    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          country: true,
          currency: true,
          timezone: true,
          profilePhoto: true,
          role: true,
          isVerified: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          failedLoginAttempts: true,
          lockedUntil: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ]);

    return { data: users as any, total };
  }

  async fetchAuditLogs(
    page: number,
    limit: number,
    filters: { userId?: string; action?: string; entity?: string }
  ): Promise<{ data: AuditLog[]; total: number }> {
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (filters.userId) whereClause.userId = filters.userId;
    if (filters.action) whereClause.action = filters.action;
    if (filters.entity) whereClause.entity = filters.entity;

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: { email: true, firstName: true, lastName: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.auditLog.count({ where: whereClause })
    ]);

    return { data, total };
  }
}
export const adminRepository = new AdminRepository();
