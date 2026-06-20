import { Response } from 'express';

// ─────────────────────────────────────────────
// Response Types
// ─────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string> | string[];
  meta?: PaginationMeta;
  timestamp: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─────────────────────────────────────────────
// Response Helpers
// ─────────────────────────────────────────────

/**
 * Send a successful JSON response.
 * @param res - Express Response object
 * @param data - Payload to return
 * @param message - Human-readable success message
 * @param statusCode - HTTP status code (default 200)
 */
export function successResponse<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): Response {
  const body: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(body);
}

/**
 * Send an error JSON response.
 * @param res - Express Response object
 * @param message - Human-readable error message
 * @param statusCode - HTTP status code (default 500)
 * @param errors - Optional field-level validation errors or array of error strings
 */
export function errorResponse(
  res: Response,
  message: string = 'Internal Server Error',
  statusCode: number = 500,
  errors?: Record<string, string> | string[]
): Response {
  const body: ApiResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    ...(errors ? { errors } : {}),
  };
  return res.status(statusCode).json(body);
}

/**
 * Send a paginated list response.
 * @param res - Express Response object
 * @param data - Array of items for the current page
 * @param total - Total number of records across all pages
 * @param page - Current page number (1-indexed)
 * @param limit - Number of items per page
 * @param message - Optional success message
 */
export function paginatedResponse<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Records retrieved successfully'
): Response {
  const totalPages = Math.ceil(total / limit);
  const meta: PaginationMeta = {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  const body: ApiResponse<T[]> = {
    success: true,
    message,
    data,
    meta,
    timestamp: new Date().toISOString(),
  };
  return res.status(200).json(body);
}

/**
 * Send a 201 Created response.
 */
export function createdResponse<T>(res: Response, data: T, message: string = 'Resource created successfully'): Response {
  return successResponse(res, data, message, 201);
}

/**
 * Send a 204 No Content response.
 */
export function noContentResponse(res: Response): Response {
  return res.status(204).send();
}

/**
 * Parse pagination query params, returning safe page/limit/skip values.
 */
export function parsePagination(query: Record<string, any>): { page: number; limit: number; skip: number } {
  const page = Math.max(1, parseInt(query.page as string, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string, 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
