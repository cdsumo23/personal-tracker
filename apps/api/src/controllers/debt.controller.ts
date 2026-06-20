// controllers/debt.controller.ts
import { Request, Response } from 'express';
import { debtService } from '../services/debt.service';

import { successResponse, errorResponse } from '../utils/response';

export async function getDebts(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const debts = await debtService.getAll(userId);
    successResponse(res, debts);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}

export async function getDebtById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const debt = await debtService.getById(id, userId);
    successResponse(res, debt);
  } catch (error: any) {
    errorResponse(res, error.message, 404);
  }
}

export async function createDebt(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const debt = await debtService.create(userId, req.body);
    successResponse(res, debt, 'Debt record created successfully', 201);
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function updateDebt(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const debt = await debtService.update(id, userId, req.body);
    successResponse(res, debt, 'Debt record updated successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function deleteDebt(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    await debtService.delete(id, userId);
    successResponse(res, null, 'Debt record deleted successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function addDebtPayment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const result = await debtService.addPayment(id, userId, req.body);
    successResponse(res, result, 'Debt payment recorded successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function calculatePayoff(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const strategy = (req.query.strategy as 'SNOWBALL' | 'AVALANCHE') || 'AVALANCHE';
    const extraPayment = parseFloat((req.query.extraPayment as string) || '0');
    
    const payoffPlan = await debtService.calculatePayoffStrategy(userId, strategy, extraPayment);
    successResponse(res, payoffPlan);
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}
