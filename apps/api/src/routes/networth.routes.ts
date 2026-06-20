// routes/networth.routes.ts
import { Router } from 'express';
import {
  getNetWorth,
  takeSnapshot,
  getNetWorthHistory
} from '../controllers/networth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getNetWorth);
router.get('/history', getNetWorthHistory);
router.post('/snapshot', takeSnapshot);

export default router;
