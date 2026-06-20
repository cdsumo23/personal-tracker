// controllers/admin.controller.ts
import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';

import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    const stats = await adminService.getPlatformStats();
    successResponse(res, stats);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}

export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const result = await adminService.getAllUsers(req.query);
    paginatedResponse(
      res,
      result.data,
      result.total,
      parseInt((req.query.page || '1') as string, 10),
      parseInt((req.query.limit || '10') as string, 10)
    );
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}

export async function toggleUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    if (isActive === undefined) {
      errorResponse(res, 'isActive is required', 400);
      return;
    }

    const user = await adminService.toggleUserStatus(id, isActive);
    successResponse(res, user, `User status updated to ${isActive ? 'active' : 'inactive'}`);
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const user = await adminService.createUser(req.body);
    successResponse(res, user, 'User created successfully', 201);
  } catch (error: any) {
    errorResponse(res, error.message, error.statusCode || 400);
  }
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = await adminService.updateUser(id, req.body);
    successResponse(res, user, 'User updated successfully');
  } catch (error: any) {
    errorResponse(res, error.message, error.statusCode || 400);
  }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await adminService.deleteUser(id);
    successResponse(res, null, 'User soft deleted successfully');
  } catch (error: any) {
    errorResponse(res, error.message, error.statusCode || 400);
  }
}

export async function updateUserStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, isActive } = req.body;

    let activeState = true;
    if (isActive !== undefined) {
      activeState = isActive;
    } else if (status !== undefined) {
      activeState = status === 'active';
    } else {
      errorResponse(res, 'status or isActive is required', 400);
      return;
    }

    const user = await adminService.toggleUserStatus(id, activeState);
    successResponse(res, user, `User status updated to ${activeState ? 'active' : 'suspended'}`);
  } catch (error: any) {
    errorResponse(res, error.message, error.statusCode || 400);
  }
}

export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  try {
    const result = await adminService.getAuditLogs(req.query);
    paginatedResponse(
      res,
      result.data,
      result.total,
      parseInt((req.query.page || '1') as string, 10),
      parseInt((req.query.limit || '20') as string, 10)
    );
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}
