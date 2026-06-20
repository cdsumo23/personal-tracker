// controllers/export.controller.ts
import { Request, Response } from 'express';
import { exportService } from '../services/export.service';
import { importService } from '../services/import.service';

import { successResponse, errorResponse } from '../utils/response';

export async function downloadCSV(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const csvContent = await exportService.exportTransactionsCSV(userId);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.status(200).send(csvContent);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}

export async function downloadExcel(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const excelBuffer = await exportService.exportTransactionsExcel(userId);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.xlsx');
    res.status(200).send(excelBuffer);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}

export async function downloadPDF(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const pdfBuffer = await exportService.exportTransactionsPDF(userId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=ledger.pdf');
    res.status(200).send(pdfBuffer);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}

export async function exportBackup(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const backup = await exportService.exportFullBackup(userId);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=budget-planner-backup-${new Date().toISOString().split('T')[0]}.json`);
    res.status(200).json(backup);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
}

export async function importCSV(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { accountId } = req.body;
    
    if (!req.file) {
      errorResponse(res, 'CSV file is required', 400);
      return;
    }
    if (!accountId) {
      errorResponse(res, 'Destination accountId is required', 400);
      return;
    }

    const result = await importService.importTransactionsCSV(userId, accountId, req.file.buffer || fs.readFileSync(req.file.path));
    successResponse(res, result, 'CSV statement imported successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

import fs from 'fs';

export async function restoreBackup(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const backupData = req.body; // Expect JSON backup payload
    
    const result = await importService.restoreFullBackup(userId, backupData);
    successResponse(res, result, 'Backup restored successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}
