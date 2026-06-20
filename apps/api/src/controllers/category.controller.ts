// controllers/category.controller.ts
import { Request, Response } from 'express';
import { categoryService } from '../services/category.service';

import { successResponse, errorResponse } from '../utils/response';

export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const categories = await categoryService.getAll(userId);
    successResponse(res, categories);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}

export async function getCategoryById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const category = await categoryService.getById(id, userId);
    successResponse(res, category);
  } catch (error: any) {
    errorResponse(res, error.message, 404);
  }
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const category = await categoryService.create(userId, req.body);
    successResponse(res, category, 'Category created successfully', 201);
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function updateCategory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const isAdmin = req.user!.role === 'ADMIN';
    const category = await categoryService.update(id, userId, req.body, isAdmin);
    successResponse(res, category, 'Category updated successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function deleteCategory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const isAdmin = req.user!.role === 'ADMIN';
    await categoryService.delete(id, userId, isAdmin);
    successResponse(res, null, 'Category deleted successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}
