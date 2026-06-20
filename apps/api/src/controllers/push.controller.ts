// controllers/push.controller.ts
import { Request, Response } from 'express';
import { pushService } from '../services/push.service';
import { successResponse, errorResponse } from '../utils/response';
import { config } from '../config/env';

export async function getPublicKey(req: Request, res: Response): Promise<void> {
  try {
    const publicKey = config.VAPID_PUBLIC_KEY;
    if (!publicKey) {
      throw new Error('VAPID public key not configured on server');
    }
    successResponse(res, { publicKey });
  } catch (error: any) {
    errorResponse(res, error.message, 500);
  }
}

export async function subscribe(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys || !keys.auth || !keys.p256dh) {
      errorResponse(res, 'Missing subscription payload properties (endpoint, keys.auth, keys.p256dh)', 400);
      return;
    }

    const subscription = await pushService.subscribe(userId, { endpoint, keys });
    successResponse(res, subscription, 'Subscribed to push notifications successfully', 201);
  } catch (error: any) {
    errorResponse(res, error.message, 550);
  }
}

export async function unsubscribe(req: Request, res: Response): Promise<void> {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      errorResponse(res, 'Missing endpoint parameter', 400);
      return;
    }

    await pushService.unsubscribe(endpoint);
    successResponse(res, null, 'Unsubscribed from push notifications successfully');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}

export async function testPush(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    await pushService.sendNotificationToUser(userId, {
      title: 'Smart Planner Push Test',
      body: 'Congratulations! Native push notifications are working correctly on your PWA device.',
      url: '/notifications'
    });
    successResponse(res, null, 'Test push notification dispatched');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}
