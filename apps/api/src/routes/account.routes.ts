import { Router } from 'express';
import { z } from 'zod';
import { accountController } from '@/controllers/account.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { AccountType } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation Schemas
const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(50),
  type: z.nativeEnum(AccountType, { required_error: 'Account type is required' }),
  balance: z.coerce.number().optional().default(0),
  currency: z.string().length(3).optional().default('USD'),
  color: z.string().optional(),
  icon: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
  notes: z.string().optional(),
});

const transferSchema = z.object({
  fromAccountId: z.string().uuid('Invalid sender account ID'),
  toAccountId: z.string().uuid('Invalid receiver account ID'),
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().max(255).optional(),
  date: z.string().datetime({ offset: true }).optional(),
});

// Routes
router.get('/', accountController.getAll.bind(accountController));
router.get('/:id', accountController.getById.bind(accountController));
router.post('/', validate(accountSchema), accountController.create.bind(accountController));
router.put('/:id', validate(accountSchema), accountController.update.bind(accountController));
router.delete('/:id', accountController.delete.bind(accountController));
router.post('/transfer', validate(transferSchema), accountController.transfer.bind(accountController));
router.get('/:id/history', accountController.getHistory.bind(accountController));

export default router;
