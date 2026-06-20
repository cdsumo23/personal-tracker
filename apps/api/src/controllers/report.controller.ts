// controllers/report.controller.ts
import { Request, Response } from 'express';
import { reportService } from '../services/report.service';

import { successResponse, errorResponse } from '../utils/response';

export async function getDashboard(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const stats = await reportService.getDashboardStats(userId);
    successResponse(res, stats);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}

export async function getIncomeSummary(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const startDate = new Date((req.query.startDate as string) || new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const endDate = new Date((req.query.endDate as string) || new Date());
    
    const summary = await reportService.getIncomeReport(userId, startDate, endDate);
    successResponse(res, summary);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}

export async function getExpenseSummary(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const startDate = new Date((req.query.startDate as string) || new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const endDate = new Date((req.query.endDate as string) || new Date());
    
    const summary = await reportService.getExpenseReport(userId, startDate, endDate);
    successResponse(res, summary);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}

export async function getCashFlow(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const months = parseInt((req.query.months as string) || '6', 10);
    const cashFlow = await reportService.getCashFlowReport(userId, months);
    successResponse(res, cashFlow);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}

export async function getNetWorthHistory(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const history = await reportService.getNetWorthHistory(userId);
    successResponse(res, history);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}
