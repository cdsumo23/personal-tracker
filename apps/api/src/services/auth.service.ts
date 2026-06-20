import { authRepository } from '@/repositories/auth.repository';
import { hashPassword, comparePassword, generateResetToken, generateVerificationToken } from '@/utils/password';
import { generateAccessToken, generateRefreshToken, getExpiryDate } from '@/utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '@/utils/email';
import { AppError } from '@/middleware/error.middleware';
import { config } from '@/config/env';
import logger from '@/config/logger';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
  currency?: string;
  timezone?: string;
}

export interface LoginData {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 30;

// ─────────────────────────────────────────────
// Auth Service
// ─────────────────────────────────────────────

export class AuthService {
  /**
   * Register a new user. Sends a verification email.
   * Returns tokens so the user can start using the app immediately.
   */
  async register(data: RegisterData): Promise<{ user: any; tokens: AuthTokens }> {
    // Check if email is already in use
    const existing = await authRepository.findUserByEmail(data.email);
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const passwordHash = await hashPassword(data.password);
    const verificationToken = generateVerificationToken();

    const user = await authRepository.createUser({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      country: data.country,
      currency: data.currency ?? 'USD',
      timezone: data.timezone ?? 'UTC',
      emailVerificationToken: verificationToken,
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(user.email, verificationToken).catch((err) =>
      logger.error('[AuthService] Failed to send verification email', { err })
    );

    // Generate tokens
    const tokens = await this._generateAndStoreTokens(user);

    const { passwordHash: _, emailVerificationToken: __, ...safeUser } = user;
    return { user: safeUser, tokens };
  }

  /**
   * Authenticate a user. Handles account lockout and failed login tracking.
   */
  async login(data: LoginData): Promise<{ user: any; tokens: AuthTokens }> {
    const user = await authRepository.findUserByEmail(data.email);

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if account is deleted
    if (user.deletedAt) {
      throw new AppError('This account has been deactivated. Please contact support.', 403);
    }

    // Check if account is inactive
    if (!user.isActive) {
      throw new AppError('Your account has been disabled. Please contact support.', 403);
    }

    // Check lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new AppError(
        `Account is temporarily locked due to multiple failed login attempts. Try again in ${minutesLeft} minute(s).`,
        429
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.passwordHash);
    if (!isPasswordValid) {
      const newFailedAttempts = user.failedLoginAttempts + 1;
      const updateData: any = { failedLoginAttempts: newFailedAttempts };

      if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
        updateData.failedLoginAttempts = 0;
      }

      await authRepository.updateUser(user.id, updateData);
      throw new AppError('Invalid email or password', 401);
    }

    // Reset failed attempts on successful login
    await authRepository.updateUser(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    });

    // Audit log
    await authRepository.createAuditLog({
      userId: user.id,
      action: 'LOGIN',
      entity: 'user',
      entityId: user.id,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    const tokens = await this._generateAndStoreTokens(user);

    const { passwordHash: _, emailVerificationToken: __, passwordResetToken: ___, ...safeUser } = user;
    return { user: safeUser, tokens };
  }

  /**
   * Log a user out by deleting their refresh token.
   */
  async logout(refreshToken: string): Promise<void> {
    await authRepository.deleteRefreshToken(refreshToken);
  }

  /**
   * Rotate a refresh token pair. Validates the old refresh token
   * and issues new access + refresh tokens.
   */
  async refreshTokens(oldRefreshToken: string): Promise<AuthTokens> {
    const stored = await authRepository.findRefreshToken(oldRefreshToken);

    if (!stored) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = stored.user;
    if (!user.isActive || user.deletedAt) {
      throw new AppError('Account is inactive', 403);
    }

    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({ userId: user.id, tokenId: stored.id });
    const expiresAt = getExpiryDate(config.REFRESH_TOKEN_EXPIRES_IN);

    await authRepository.rotateRefreshToken(oldRefreshToken, user.id, newRefreshToken, expiresAt);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * Verify a user's email using the token sent on registration.
   */
  async verifyEmail(token: string): Promise<void> {
    const user = await authRepository.findUserByVerificationToken(token);
    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    if (user.isVerified) {
      throw new AppError('Email is already verified', 400);
    }

    await authRepository.updateUser(user.id, {
      isVerified: true,
      emailVerificationToken: null,
    });

    // Send welcome email
    sendWelcomeEmail(user.email, user.firstName).catch((err) =>
      logger.error('[AuthService] Failed to send welcome email', { err })
    );
  }

  /**
   * Initiate a password reset. Sends a reset link to the user's email.
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await authRepository.findUserByEmail(email);

    // Always respond with the same message to prevent email enumeration
    if (!user || !user.isActive) return;

    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await authRepository.updateUser(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpiry: expiresAt,
    });

    await sendPasswordResetEmail(user.email, resetToken);
  }

  /**
   * Complete a password reset using the token from the email.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await authRepository.findUserByResetToken(token);
    if (!user) {
      throw new AppError('Invalid or expired password reset token', 400);
    }

    const passwordHash = await hashPassword(newPassword);

    await authRepository.updateUser(user.id, {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpiry: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });

    // Revoke all existing sessions
    await authRepository.deleteAllUserTokens(user.id);
  }

  /**
   * Allow an authenticated user to change their own password.
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await authRepository.findUserByEmail(
      (await authRepository.findUserById(userId))?.email ?? ''
    );

    if (!user) throw new AppError('User not found', 404);

    const isOldPasswordValid = await comparePassword(oldPassword, user.passwordHash);
    if (!isOldPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    if (oldPassword === newPassword) {
      throw new AppError('New password must be different from the current password', 400);
    }

    const passwordHash = await hashPassword(newPassword);

    await authRepository.updateUser(userId, { passwordHash });

    // Revoke all refresh tokens to force re-login on other devices
    await authRepository.deleteAllUserTokens(userId);
  }

  /**
   * Get a user's profile by ID.
   */
  async getProfile(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  /**
   * Update a user's profile.
   */
  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      country?: string;
      currency?: string;
      timezone?: string;
    }
  ) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new AppError('User not found', 404);

    return authRepository.updateUser(userId, data);
  }

  /**
   * Update user's profile photo path.
   */
  async updateProfilePhoto(userId: string, photoPath: string) {
    return authRepository.updateUser(userId, { profilePhoto: photoPath });
  }

  // ─────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────

  private async _generateAndStoreTokens(user: { id: string; email: string; role: string }): Promise<AuthTokens> {
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({ userId: user.id, tokenId: '' });
    const expiresAt = getExpiryDate(config.REFRESH_TOKEN_EXPIRES_IN);

    await authRepository.createRefreshToken(user.id, refreshToken, expiresAt);

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
