import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema, ZodError, z } from 'zod';

// ─────────────────────────────────────────────
// Validation Target
// ─────────────────────────────────────────────

type ValidationTarget = 'body' | 'query' | 'params';

// ─────────────────────────────────────────────
// validate — Zod Middleware Factory
// ─────────────────────────────────────────────

/**
 * Creates an Express middleware that validates the request against a Zod schema.
 * On validation failure, returns a 400 response with field-level error messages.
 *
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate: 'body' | 'query' | 'params'
 * @returns Express middleware function
 *
 * @example
 * router.post('/register', validate(registerSchema), authController.register);
 */
export function validate<T extends ZodSchema>(
  schema: T,
  target: ValidationTarget = 'body'
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req[target];
      const parsed = await schema.parseAsync(data);

      // Replace request data with parsed (coerced/transformed) values
      req[target] = parsed;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((issue) => {
          const field = issue.path.join('.') || 'value';
          if (!errors[field]) {
            errors[field] = issue.message;
          }
        });

        console.error('Validation failed for target', target, 'errors:', errors, 'data:', req[target]);
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
          timestamp: new Date().toISOString(),
        });
        return;
      }
      next(error);
    }
  };
}

// ─────────────────────────────────────────────
// Common Validation Schemas (shared across modules)
// ─────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const idParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid ID format' }),
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
});
