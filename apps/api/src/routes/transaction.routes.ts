// routes/transaction.routes.ts
import { Router } from 'express';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  duplicateTransaction,
  splitTransaction,
  bulkCreateTransactions
} from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { TransactionSchema, SplitTransactionSchema } from '@budget/shared';

const router = Router();

router.use(authenticate);

router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.post('/', validate(TransactionSchema), createTransaction);
router.put('/:id', validate(TransactionSchema), updateTransaction);
router.delete('/:id', deleteTransaction);
router.post('/:id/duplicate', duplicateTransaction);
router.post('/split', validate(SplitTransactionSchema), splitTransaction);
router.post('/bulk', bulkCreateTransactions);

export default router;
