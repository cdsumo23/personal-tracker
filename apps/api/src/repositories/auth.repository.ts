import prisma from '@/config/database';
import { Role, Prisma } from '@prisma/client';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
  currency?: string;
  timezone?: string;
  role?: Role;
  emailVerificationToken?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  currency?: string;
  timezone?: string;
  profilePhoto?: string;
  isVerified?: boolean;
  isActive?: boolean;
  emailVerificationToken?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpiry?: Date | null;
  passwordHash?: string;
  failedLoginAttempts?: number;
  lockedUntil?: Date | null;
  lastLoginAt?: Date;
}

// ─────────────────────────────────────────────
// Auth Repository
// ─────────────────────────────────────────────

export class AuthRepository {
  /**
   * Find a user by email address (including deleted for auth checks).
   */
  async findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email: email.toLowerCase().trim() },
    });
  }

  /**
   * Find an active user by ID.
   */
  async findUserById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
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
      },
    });
  }

  /**
   * Create a new user record.
   */
  async createUser(data: CreateUserData) {
    return prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase().trim(),
      },
    });
  }

  /**
   * Update an existing user by ID.
   */
  async updateUser(id: string, data: UpdateUserData) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Find user by email verification token.
   */
  async findUserByVerificationToken(token: string) {
    return prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });
  }

  /**
   * Find user by password reset token (only valid, non-expired).
   */
  async findUserByResetToken(token: string) {
    return prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gt: new Date() },
      },
    });
  }

  // ─────────────────────────────────────────────
  // Refresh Tokens
  // ─────────────────────────────────────────────

  /**
   * Persist a refresh token to the database.
   */
  async createRefreshToken(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  }

  /**
   * Look up a refresh token by its value (only if not expired).
   */
  async findRefreshToken(token: string) {
    return prisma.refreshToken.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  }

  /**
   * Delete a specific refresh token (on logout).
   */
  async deleteRefreshToken(token: string) {
    return prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  /**
   * Delete all refresh tokens for a user (force logout all devices).
   */
  async deleteAllUserTokens(userId: string) {
    return prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * Rotate a refresh token: delete old, create new.
   */
  async rotateRefreshToken(oldToken: string, userId: string, newToken: string, expiresAt: Date) {
    return prisma.$transaction([
      prisma.refreshToken.deleteMany({ where: { token: oldToken } }),
      prisma.refreshToken.create({ data: { userId, token: newToken, expiresAt } }),
    ]);
  }

  // ─────────────────────────────────────────────
  // Audit Logs
  // ─────────────────────────────────────────────

  /**
   * Write an audit log entry.
   */
  async createAuditLog(data: any) {
    return prisma.auditLog.create({ data });
  }
}

export const authRepository = new AuthRepository();
