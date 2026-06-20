// routes/report.routes.ts
import { Router } from 'express';
import {
  getDashboard,
  getIncomeSummary,
  getExpenseSummary,
  getCashFlow,
  getNetWorthHistory
} from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboard);
router.get('/income', getIncomeSummary);
router.get('/expense', getExpenseSummary);
router.get('/expenses', getExpenseSummary);
router.get('/cash-flow', getCashFlow);
router.get('/net-worth', getNetWorthHistory);

export default router;
