// routes/notification.routes.ts
import { Router } from 'express';
import {
  getNotifications,
  readNotification,
  readAllNotifications,
  deleteNotification
} from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.post('/read-all', readAllNotifications);
router.patch('/:id/read', readNotification);
router.delete('/:id', deleteNotification);

export default router;
