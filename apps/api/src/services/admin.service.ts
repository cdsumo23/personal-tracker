// services/admin.service.ts
import { adminRepository } from '../repositories/admin.repository';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { AppError } from '../middleware/error.middleware';

export class AdminService {
  async getPlatformStats() {
    const totalUsers = await adminRepository.countUsers();
    const totalTransactions = await adminRepository.countTransactions();
    
    // Calculate total assets tracked on the platform
    const sumAccounts = await prisma.account.aggregate({
      where: { deletedAt: null },
      _sum: { balance: true }
    });

    return {
      totalUsers,
      totalTransactions,
      totalAssetsTracked: sumAccounts._sum.balance?.toNumber() || 0
    };
  }

  async getAllUsers(query: any) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || undefined;
    return adminRepository.fetchUsers(page, limit, search);
  }

  async createUser(data: any) {
    // Check if email already exists
    const existing = await prisma.user.findFirst({
      where: { email: data.email, deletedAt: null }
    });

    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'USER',
        isActive: data.isActive !== undefined ? data.isActive : true,
        isVerified: data.isVerified !== undefined ? data.isVerified : true,
        phone: data.phone || null,
        country: data.country || null,
        currency: data.currency || 'USD',
        timezone: data.timezone || 'UTC'
      },
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
        createdAt: true,
        updatedAt: true
      }
    });

    return user;
  }

  async updateUser(id: string, data: any) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if new email is taken by another user
    if (data.email && data.email !== user.email) {
      const emailConflict = await prisma.user.findFirst({
        where: { email: data.email, id: { not: id }, deletedAt: null }
      });

      if (emailConflict) {
        throw new AppError('An account with this email already exists', 409);
      }
    }

    const updateData: any = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      isActive: data.isActive,
      isVerified: data.isVerified,
      phone: data.phone || null,
      country: data.country || null,
      currency: data.currency || 'USD',
      timezone: data.timezone || 'UTC',
      profilePhoto: data.profilePhoto || null
    };

    // Only update password if provided
    if (data.password && data.password.trim() !== '') {
      updateData.passwordHash = await hashPassword(data.password);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
        createdAt: true,
        updatedAt: true
      }
    });

    return updatedUser;
  }

  async deleteUser(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Soft delete the user by setting deletedAt
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async toggleUserStatus(id: string, isActive: boolean) {
    return prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });
  }

  async getAuditLogs(query: any) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const filters = {
      userId: query.userId,
      action: query.action,
      entity: query.entity
    };
    return adminRepository.fetchAuditLogs(page, limit, filters);
  }
}
export const adminService = new AdminService();
