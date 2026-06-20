import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config } from '@/config/env';

// ─────────────────────────────────────────────
// Common rate limit response handler
// ─────────────────────────────────────────────

function rateLimitHandler(_req: Request, res: Response): void {
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please slow down and try again later.',
    timestamp: new Date().toISOString(),
  });
}

// ─────────────────────────────────────────────
// General API Rate Limiter — 100 req / 15 min
// ─────────────────────────────────────────────

export const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,       // 15 minutes
  max: config.RATE_LIMIT_MAX,                  // 100 requests
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => config.NODE_ENV === 'test',
  keyGenerator: (req) => req.ip ?? 'unknown',
  message: 'Too many requests from this IP',
});

// ─────────────────────────────────────────────
// Auth Rate Limiter — 10 req / 15 min
// Protects login, register, forgot-password endpoints
// ─────────────────────────────────────────────

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: config.AUTH_RATE_LIMIT_MAX,  // 10 requests
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
      timestamp: new Date().toISOString(),
    });
  },
  skip: (_req) => config.NODE_ENV === 'test',
  keyGenerator: (req) => req.ip ?? 'unknown',
});

// ─────────────────────────────────────────────
// Upload Rate Limiter — 20 req / hour
// ─────────────────────────────────────────────

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Upload limit reached. You may upload up to 20 files per hour.',
      timestamp: new Date().toISOString(),
    });
  },
  skip: (_req) => config.NODE_ENV === 'test',
});

// ─────────────────────────────────────────────
// Strict Rate Limiter — for sensitive endpoints (e.g. password reset)
// 5 req / 15 min
// ─────────────────────────────────────────────

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests for this action. Please try again after 15 minutes.',
      timestamp: new Date().toISOString(),
    });
  },
  skip: (_req) => config.NODE_ENV === 'test',
});
