// controllers/bill.controller.ts
import { Request, Response } from 'express';
import { billService } from '../services/bill.service';

import { successResponse, errorResponse } from '../utils/response';

export async function getBills(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const bills = await billService.getAll(userId);
    successResponse(res, bills);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}

export async function getBillById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const bill = await billService.getById(id, userId);
    successResponse(res, bill);
  } catch (error: any) {
    errorResponse(res, error.message, 404);
  }
}

export async function createBill(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const bill = await billService.create(userId, req.body);
    successResponse(res, bill, 'Bill reminder created successfully', 201);
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function updateBill(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const bill = await billService.update(id, userId, req.body);
    successResponse(res, bill, 'Bill reminder updated successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function deleteBill(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    await billService.delete(id, userId);
    successResponse(res, null, 'Bill reminder deleted successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function getUpcoming(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const days = parseInt((req.query.days as string) || '30', 10);
    const bills = await billService.getUpcomingBills(userId, days);
    successResponse(res, bills);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}

export async function markPaid(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { accountId } = req.body; // optional source account
    
    const result = await billService.markAsPaid(id, userId, accountId);
    successResponse(res, result, 'Bill recorded as paid successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}
