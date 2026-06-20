// controllers/goal.controller.ts
import { Request, Response } from 'express';
import { goalService } from '../services/goal.service';

import { successResponse, errorResponse } from '../utils/response';

export async function getGoals(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const goals = await goalService.getAll(userId);
    successResponse(res, goals);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}

export async function getGoalById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const goal = await goalService.getById(id, userId);
    successResponse(res, goal);
  } catch (error: any) {
    errorResponse(res, error.message, 404);
  }
}

export async function createGoal(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const goal = await goalService.create(userId, req.body);
    successResponse(res, goal, 'Savings goal created successfully', 201);
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function updateGoal(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const goal = await goalService.update(id, userId, req.body);
    successResponse(res, goal, 'Savings goal updated successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function deleteGoal(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    await goalService.delete(id, userId);
    successResponse(res, null, 'Savings goal deleted successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function addContribution(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const result = await goalService.addContribution(id, userId, req.body);
    successResponse(res, result, 'Contribution added successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function forecastGoal(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const forecast = await goalService.forecastGoalCompletion(id, userId);
    successResponse(res, forecast);
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}
