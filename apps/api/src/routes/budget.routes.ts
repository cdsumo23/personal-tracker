// routes/budget.routes.ts
import { Router } from 'express';
import {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetUsage,
  getBudgetRecommendations
} from '../controllers/budget.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { BudgetSchema } from '@budget/shared';

const router = Router();

router.use(authenticate);

router.get('/', getBudgets);
router.get('/recommendations', getBudgetRecommendations);
router.get('/:id', getBudgetById);
router.get('/:id/usage', getBudgetUsage);
router.post('/', validate(BudgetSchema), createBudget);
router.put('/:id', validate(BudgetSchema), updateBudget);
router.delete('/:id', deleteBudget);

export default router;
