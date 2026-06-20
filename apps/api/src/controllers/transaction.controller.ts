// controllers/transaction.controller.ts
import { Request, Response } from 'express';
import { transactionService } from '../services/transaction.service';

import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

export async function getTransactions(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    // Extract filters from query parameters
    const { page, limit, sortBy, sortOrder, ...filters } = req.query;
    
    const result = await transactionService.getAll(userId, filters, { page, limit, sortBy, sortOrder });
    paginatedResponse(
      res,
      result.data,
      result.total,
      parseInt((page || '1') as string, 10),
      parseInt((limit || '20') as string, 10)
    );
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}

export async function getTransactionById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const tx = await transactionService.getById(id, userId);
    successResponse(res, tx);
  } catch (error: any) {
    errorResponse(res, error.message, 404);
  }
}

export async function createTransaction(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const tx = await transactionService.create(userId, req.body);
    successResponse(res, tx, 'Transaction created successfully', 201);
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function updateTransaction(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const tx = await transactionService.update(id, userId, req.body);
    successResponse(res, tx, 'Transaction updated successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function deleteTransaction(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    await transactionService.delete(id, userId);
    successResponse(res, null, 'Transaction deleted successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function duplicateTransaction(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const duplicated = await transactionService.duplicate(id, userId);
    successResponse(res, duplicated, 'Transaction duplicated successfully', 201);
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function splitTransaction(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const result = await transactionService.splitTransaction(userId, req.body);
    successResponse(res, result, 'Transaction split successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function bulkCreateTransactions(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { transactions } = req.body;
    if (!transactions || !Array.isArray(transactions)) {
      errorResponse(res, 'Transactions array is required', 400);
      return;
    }
    const result = await transactionService.bulkCreate(userId, transactions);
    successResponse(res, result, 'Bulk transactions processed', 201);
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}
