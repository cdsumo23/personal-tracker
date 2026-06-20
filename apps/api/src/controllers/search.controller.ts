// controllers/search.controller.ts
import { Request, Response } from 'express';
import { searchService } from '../services/search.service';

import { successResponse, errorResponse } from '../utils/response';

export async function globalSearch(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const query = req.query.q as string;
    
    const results = await searchService.globalSearch(userId, query);
    successResponse(res, results);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}
