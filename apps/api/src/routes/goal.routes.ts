// routes/goal.routes.ts
import { Router } from 'express';
import {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  addContribution,
  forecastGoal
} from '../controllers/goal.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { SavingsGoalSchema, GoalContributionSchema } from '@budget/shared';

const router = Router();

router.use(authenticate);

router.get('/', getGoals);
router.get('/:id', getGoalById);
router.get('/:id/forecast', forecastGoal);
router.post('/', validate(SavingsGoalSchema), createGoal);
router.put('/:id', validate(SavingsGoalSchema), updateGoal);
router.delete('/:id', deleteGoal);
router.post('/:id/contribute', validate(GoalContributionSchema), addContribution);
router.post('/:id/contributions', validate(GoalContributionSchema), addContribution);

export default router;
