// controllers/networth.controller.ts
import { Request, Response } from 'express';
import { netWorthService } from '../services/networth.service';

import { successResponse, errorResponse } from '../utils/response';

export async function getNetWorth(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const current = await netWorthService.getCurrentNetWorth(userId);
    successResponse(res, current);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}

export async function takeSnapshot(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const snapshot = await netWorthService.takeSnapshot(userId);
    successResponse(res, snapshot, 'Net worth snapshot captured successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function getNetWorthHistory(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const history = await netWorthService.getHistory(userId);
    successResponse(res, history);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}
