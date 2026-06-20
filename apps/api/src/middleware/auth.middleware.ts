import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractBearerToken } from '@/utils/jwt';
import { errorResponse } from '@/utils/response';
import prisma from '@/config/database';
import { Role } from '@prisma/client';

// ─────────────────────────────────────────────
// Extend Express Request type
// ─────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: Role;
      };
    }
  }
}

// ─────────────────────────────────────────────
// authenticate — Requires valid JWT
// ─────────────────────────────────────────────

/**
 * Middleware that verifies the JWT access token and attaches the user to req.user.
 * Returns 401 if no token provided, 403 if token is invalid or user not found/inactive.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      errorResponse(res, 'Access token is required', 401);
      return;
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        errorResponse(res, 'Access token has expired', 401);
      } else {
        errorResponse(res, 'Invalid access token', 401);
      }
      return;
    }

    // Verify user still exists and is active
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        isActive: true,
        deletedAt: null,
      },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user) {
      errorResponse(res, 'User not found or account is inactive', 403);
      return;
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// authorize — RBAC role check
// ─────────────────────────────────────────────

/**
 * Middleware factory that restricts access to users with specified roles.
 * Must be used after `authenticate`.
 * @param roles - Allowed roles
 */
export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Authentication required', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      errorResponse(res, 'You do not have permission to perform this action', 403);
      return;
    }

    next();
  };
}

// ─────────────────────────────────────────────
// optionalAuth — Attaches user if token present
// ─────────────────────────────────────────────

/**
 * Middleware that attaches the user to req.user if a valid token is present,
 * but does NOT block the request if no token is provided.
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return next();
    }

    try {
      const decoded = verifyAccessToken(token);

      const user = await prisma.user.findFirst({
        where: { id: decoded.userId, isActive: true, deletedAt: null },
        select: { id: true, email: true, role: true },
      });

      if (user) {
        req.user = { userId: user.id, email: user.email, role: user.role };
      }
    } catch {
      // Silently ignore invalid tokens in optional auth
    }

    next();
  } catch (error) {
    next(error);
  }
}
