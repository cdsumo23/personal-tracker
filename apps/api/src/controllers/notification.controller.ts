// controllers/notification.controller.ts
import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';

import { successResponse, errorResponse } from '../utils/response';

export async function getNotifications(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const notifications = await notificationService.getAll(userId);
    successResponse(res, notifications);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}

export async function readNotification(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const result = await notificationService.markRead(id, userId);
    successResponse(res, result, 'Notification marked as read');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function readAllNotifications(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    await notificationService.markAllRead(userId);
    successResponse(res, null, 'All notifications marked as read');
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}

export async function deleteNotification(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    await notificationService.delete(id, userId);
    successResponse(res, null, 'Notification deleted successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}
