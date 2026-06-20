// controllers/budget.controller.ts
import { Request, Response } from 'express';
import { budgetService } from '../services/budget.service';

import { successResponse, errorResponse } from '../utils/response';

export async function getBudgets(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const budgets = await budgetService.getAll(userId);
    successResponse(res, budgets);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}

export async function getBudgetById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const budget = await budgetService.getById(id, userId);
    successResponse(res, budget);
  } catch (error: any) {
    errorResponse(res, error.message, 404);
  }
}

export async function createBudget(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const budget = await budgetService.create(userId, req.body);
    successResponse(res, budget, 'Budget created successfully', 201);
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function updateBudget(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const budget = await budgetService.update(id, userId, req.body);
    successResponse(res, budget, 'Budget updated successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function deleteBudget(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    await budgetService.delete(id, userId);
    successResponse(res, null, 'Budget deleted successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function getBudgetUsage(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const usage = await budgetService.getBudgetUsage(id, userId);
    successResponse(res, usage);
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function getBudgetRecommendations(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const recommendations = await budgetService.getBudgetRecommendations(userId);
    successResponse(res, recommendations);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}
