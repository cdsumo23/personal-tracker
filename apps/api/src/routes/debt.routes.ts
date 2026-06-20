// routes/debt.routes.ts
import { Router } from 'express';
import {
  getDebts,
  getDebtById,
  createDebt,
  updateDebt,
  deleteDebt,
  addDebtPayment,
  calculatePayoff
} from '../controllers/debt.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { DebtSchema, DebtPaymentSchema } from '@budget/shared';

const router = Router();

router.use(authenticate);

router.get('/', getDebts);
router.get('/payoff-plan', calculatePayoff);
router.get('/:id', getDebtById);
router.post('/', validate(DebtSchema), createDebt);
router.put('/:id', validate(DebtSchema), updateDebt);
router.delete('/:id', deleteDebt);
router.post('/:id/payment', validate(DebtPaymentSchema), addDebtPayment);
router.post('/:id/payments', validate(DebtPaymentSchema), addDebtPayment); // alias for frontend

export default router;
