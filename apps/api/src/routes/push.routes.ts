// routes/push.routes.ts
import { Router } from 'express';
import { getPublicKey, subscribe, unsubscribe, testPush } from '../controllers/push.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public VAPID key fetch (does not strictly require authentication, but we can secure it if needed)
router.get('/public-key', getPublicKey);

// Authenticated push registration routes
router.post('/subscribe', authenticate, subscribe);
router.post('/unsubscribe', authenticate, unsubscribe);
router.post('/test', authenticate, testPush);

export default router;
