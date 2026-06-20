import { Request, Response, NextFunction } from 'express';
import { accountService } from '@/services/account.service';
import { successResponse, createdResponse, noContentResponse, paginatedResponse } from '@/utils/response';
import { parsePagination } from '@/utils/response';

export class AccountController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accounts = await accountService.getAll(req.user!.userId);
      successResponse(res, accounts, 'Accounts retrieved successfully');
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const account = await accountService.getById(req.params.id, req.user!.userId);
      successResponse(res, account, 'Account retrieved successfully');
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const account = await accountService.create(req.user!.userId, req.body);
      createdResponse(res, account, 'Account created successfully');
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const account = await accountService.update(req.params.id, req.user!.userId, req.body);
      successResponse(res, account, 'Account updated successfully');
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await accountService.delete(req.params.id, req.user!.userId);
      noContentResponse(res);
    } catch (error) { next(error); }
  }

  async transfer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fromAccountId, toAccountId, amount, description, date } = req.body;
      const result = await accountService.transfer(
        req.user!.userId,
        fromAccountId,
        toAccountId,
        amount,
        description,
        date ? new Date(date) : undefined
      );
      createdResponse(res, result, 'Transfer completed successfully');
    } catch (error) { next(error); }
  }

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, skip } = parsePagination(req.query as any);
      const { transactions, total } = await accountService.getHistory(req.params.id, req.user!.userId, page, limit);
      paginatedResponse(res, transactions, total, page, limit, 'Transaction history retrieved');
    } catch (error) { next(error); }
  }
}

export const accountController = new AccountController();
