// routes/bill.routes.ts
import { Router } from 'express';
import {
  getBills,
  getBillById,
  createBill,
  updateBill,
  deleteBill,
  getUpcoming,
  markPaid
} from '../controllers/bill.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { BillSchema } from '@budget/shared';

const router = Router();

router.use(authenticate);

router.get('/', getBills);
router.get('/upcoming', getUpcoming);
router.get('/:id', getBillById);
router.post('/', validate(BillSchema), createBill);
router.put('/:id', validate(BillSchema), updateBill);
router.delete('/:id', deleteBill);
router.post('/:id/pay', markPaid);
router.post('/:id/mark-paid', markPaid); // alias for frontend

export default router;
