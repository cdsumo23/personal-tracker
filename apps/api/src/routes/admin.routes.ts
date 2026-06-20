import { Router } from 'express';
import { z } from 'zod';
import {
  getStats,
  getUsers,
  toggleUser,
  getAuditLogs,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

// ─────────────────────────────────────────────
// Validation Schemas
// ─────────────────────────────────────────────

const idParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid user ID format' }),
});

const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/\d/, 'Must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Must contain at least one special character'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
  isActive: z.boolean().optional().default(true),
  isVerified: z.boolean().optional().default(true),
  phone: z.string().optional(),
  country: z.string().optional(),
  currency: z.string().length(3).optional().default('USD'),
  timezone: z.string().optional().default('UTC'),
});

const updateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/\d/, 'Must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Must contain at least one special character')
    .optional()
    .or(z.literal(''))
    .nullable(),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  role: z.enum(['USER', 'ADMIN']),
  isActive: z.boolean(),
  isVerified: z.boolean(),
  phone: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  currency: z.string().length(3).optional(),
  timezone: z.string().optional(),
  profilePhoto: z.string().optional().nullable(),
});

const router = Router();

// Require authenticate and ADMIN authorize roles
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.post('/users', validate(createUserSchema), createUser);
router.put('/users/:id', validate(idParamSchema, 'params'), validate(updateUserSchema), updateUser);
router.delete('/users/:id', validate(idParamSchema, 'params'), deleteUser);

// Handle both standard PUT /users/:id/status and legacy PATCH /users/:id/toggle
router.put('/users/:id/status', validate(idParamSchema, 'params'), updateUserStatus);
router.patch('/users/:id/toggle', validate(idParamSchema, 'params'), toggleUser);

router.get('/audit-logs', getAuditLogs);

export default router;
