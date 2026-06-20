import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { MulterError } from 'multer';
import logger from '@/config/logger';
import { config } from '@/config/env';

// ─────────────────────────────────────────────
// Custom Application Error
// ─────────────────────────────────────────────

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: Record<string, string> | string[];

  constructor(
    message: string,
    statusCode: number = 500,
    errors?: Record<string, string> | string[]
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─────────────────────────────────────────────
// Prisma Error Handler
// ─────────────────────────────────────────────

function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
  message: string;
  statusCode: number;
} {
  switch (error.code) {
    case 'P2002': {
      const fields = (error.meta?.target as string[]) ?? ['field'];
      const fieldStr = fields.join(', ');
      return { message: `A record with this ${fieldStr} already exists`, statusCode: 409 };
    }
    case 'P2025':
      return { message: 'Record not found', statusCode: 404 };
    case 'P2003':
      return { message: 'Related record not found', statusCode: 400 };
    case 'P2014':
      return { message: 'Invalid ID provided', statusCode: 400 };
    case 'P2016':
      return { message: 'Record not found', statusCode: 404 };
    case 'P2021':
      return { message: 'Table does not exist', statusCode: 500 };
    case 'P2022':
      return { message: 'Column does not exist', statusCode: 500 };
    default:
      return { message: 'Database error occurred', statusCode: 500 };
  }
}

// ─────────────────────────────────────────────
// Zod Validation Error Handler
// ─────────────────────────────────────────────

function handleZodError(error: ZodError): { message: string; errors: Record<string, string>; statusCode: number } {
  const errors: Record<string, string> = {};
  error.errors.forEach((issue) => {
    const field = issue.path.join('.');
    errors[field || 'value'] = issue.message;
  });
  return { message: 'Validation failed', errors, statusCode: 400 };
}

// ─────────────────────────────────────────────
// Global Error Handler Middleware
// ─────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function globalErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the error
  logger.error('[ErrorHandler]', {
    name: error.name,
    message: error.message,
    stack: config.NODE_ENV !== 'production' ? error.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // AppError (operational)
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.errors ? { errors: error.errors } : {}),
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Prisma known errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const { message, statusCode } = handlePrismaError(error);
    res.status(statusCode).json({ success: false, message, timestamp: new Date().toISOString() });
    return;
  }

  // Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({ success: false, message: 'Invalid data provided', timestamp: new Date().toISOString() });
    return;
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    const { message, errors, statusCode } = handleZodError(error);
    res.status(statusCode).json({ success: false, message, errors, timestamp: new Date().toISOString() });
    return;
  }

  // JWT errors
  if (error instanceof TokenExpiredError) {
    res.status(401).json({ success: false, message: 'Token has expired', timestamp: new Date().toISOString() });
    return;
  }
  if (error instanceof JsonWebTokenError) {
    res.status(401).json({ success: false, message: 'Invalid token', timestamp: new Date().toISOString() });
    return;
  }

  // Multer errors (file upload)
  if (error instanceof MulterError) {
    let message = 'File upload error';
    let statusCode = 400;
    if (error.code === 'LIMIT_FILE_SIZE') {
      message = `File too large. Maximum size allowed is ${config.MAX_FILE_SIZE / 1024 / 1024}MB`;
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files uploaded at once';
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      message = `Unexpected file field: ${error.field}`;
    }
    res.status(statusCode).json({ success: false, message, timestamp: new Date().toISOString() });
    return;
  }

  // SyntaxError (bad JSON body)
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ success: false, message: 'Invalid JSON in request body', timestamp: new Date().toISOString() });
    return;
  }

  // Unknown errors
  const statusCode = 500;
  const message =
    config.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.NODE_ENV !== 'production' ? { stack: error.stack } : {}),
    timestamp: new Date().toISOString(),
  });
}

// ─────────────────────────────────────────────
// 404 Not Found Handler
// ─────────────────────────────────────────────

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
}
