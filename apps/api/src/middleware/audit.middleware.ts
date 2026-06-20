import { Request, Response, NextFunction } from 'express';
import prisma from '@/config/database';
import logger from '@/config/logger';

// ─────────────────────────────────────────────
// Audit Log Middleware
// ─────────────────────────────────────────────

/**
 * Middleware that logs all mutating requests (POST, PUT, PATCH, DELETE)
 * to the AuditLog table. Captures IP, user agent, user ID (if authenticated).
 */
export async function auditMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

  if (!MUTATING_METHODS.includes(req.method)) {
    return next();
  }

  // Capture original end to hook into response
  const originalJson = res.json.bind(res);
  let responseBody: any = null;

  res.json = (body: any) => {
    responseBody = body;
    return originalJson(body);
  };

  // Save reference to write audit log after response
  res.on('finish', async () => {
    try {
      const userId = req.user?.userId ?? null;
      const pathParts = req.path.split('/').filter(Boolean);

      // Infer entity name from route (e.g., /api/v1/transactions/123 → transactions)
      const entity = pathParts[2] ?? pathParts[1] ?? req.path;
      const entityId = pathParts[3] ?? null;

      // Determine action from method
      const methodActionMap: Record<string, string> = {
        POST: 'CREATE',
        PUT: 'UPDATE',
        PATCH: 'UPDATE',
        DELETE: 'DELETE',
      };
      const action = methodActionMap[req.method] ?? req.method;

      // Only log if request was at least partially successful (not 4xx client errors)
      if (res.statusCode >= 400 && res.statusCode < 500) return;

      await prisma.auditLog.create({
        data: {
          userId,
          action,
          entity,
          entityId,
          newValues: req.method !== 'DELETE' ? (req.body ?? null) : null,
          ipAddress: req.ip ?? req.socket.remoteAddress ?? null,
          userAgent: req.headers['user-agent'] ?? null,
        },
      });
    } catch (err) {
      // Never let audit logging errors crash the app
      logger.warn('[AuditLog] Failed to write audit log', { error: err });
    }
  });

  next();
}
