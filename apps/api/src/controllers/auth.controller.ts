import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth.service';
import { successResponse, createdResponse, errorResponse } from '@/utils/response';
import { config } from '@/config/env';
import path from 'path';

// ─────────────────────────────────────────────
// Auth Controller
// ─────────────────────────────────────────────

export class AuthController {
  /**
   * POST /auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, tokens } = await authService.register(req.body);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: config.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      createdResponse(res, { user, accessToken: tokens.accessToken }, 'Registration successful. Please verify your email.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, rememberMe } = req.body;
      const { user, tokens } = await authService.login({
        email,
        password,
        rememberMe,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      // If rememberMe is selected, extend cookie/token life to 30 days, otherwise 7 days
      const cookieMaxAge = rememberMe
        ? 30 * 24 * 60 * 60 * 1000  // 30 days
        : 7 * 24 * 60 * 60 * 1000;  // 7 days

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: config.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: cookieMaxAge,
      });

      successResponse(res, { user, accessToken: tokens.accessToken }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken ?? req.body?.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie('refreshToken');
      successResponse(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/refresh-token
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken ?? req.body?.refreshToken;

      if (!refreshToken) {
        errorResponse(res, 'Refresh token is required', 401);
        return;
      }

      const tokens = await authService.refreshTokens(refreshToken);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: config.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // preserve long session on rotation
      });

      successResponse(res, { accessToken: tokens.accessToken }, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/verify-email/:token
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.verifyEmail(req.params.token);
      successResponse(res, null, 'Email verified successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/forgot-password
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.forgotPassword(req.body.email);
      // Always return success to prevent email enumeration
      successResponse(res, null, 'If an account exists with this email, a password reset link has been sent.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/reset-password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      successResponse(res, null, 'Password reset successful. Please log in with your new password.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/change-password
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { oldPassword, newPassword } = req.body;
      await authService.changePassword(req.user!.userId, oldPassword, newPassword);
      successResponse(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/me
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getProfile(req.user!.userId);
      successResponse(res, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /auth/me
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.updateProfile(req.user!.userId, req.body);
      const { passwordHash: _, emailVerificationToken: __, passwordResetToken: ___, ...safeUser } = user;
      successResponse(res, safeUser, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/me/photo
   */
  async uploadProfilePhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        errorResponse(res, 'No file uploaded', 400);
        return;
      }

      let photoPath: string;
      if (req.file.buffer) {
        const base64Data = req.file.buffer.toString('base64');
        photoPath = `data:${req.file.mimetype};base64,${base64Data}`;
      } else {
        photoPath = `/uploads/${req.user!.userId}/profiles/${req.file.filename}`;
      }
      const user = await authService.updateProfilePhoto(req.user!.userId, photoPath);

      const { passwordHash: _, emailVerificationToken: __, passwordResetToken: ___, ...safeUser } = user;
      successResponse(res, safeUser, 'Profile photo updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
