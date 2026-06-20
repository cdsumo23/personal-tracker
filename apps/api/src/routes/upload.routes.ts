// routes/upload.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { receiptUpload } from '../middleware/upload.middleware';
import { successResponse, errorResponse } from '../utils/response';
import prisma from '../config/database';
import path from 'path';
import fs from 'fs';

const router = Router();

router.use(authenticate);

// 1. Receipt Upload
router.post('/receipt', receiptUpload.single('receipt'), async (req: any, res) => {
  try {
    if (!req.file) {
      errorResponse(res, 'No receipt file provided', 400);
      return;
    }

    const userId = req.user!.userId;
    const fileRecord = await prisma.uploadedFile.create({
      data: {
        userId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        entityType: 'TRANSACTION'
      }
    });

    // Return the relative download path
    const urlPath = `/uploads/${userId}/receipts/${req.file.filename}`;
    successResponse(res, { url: urlPath, file: fileRecord }, 'Receipt uploaded successfully', 201);
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
});

// 2. Fetch File
router.get('/:userId/:filename', async (req, res) => {
  try {
    const { userId, filename } = req.params;
    
    // Safety check: ensure user is fetching their own file or is admin
    if (req.user!.userId !== userId && req.user!.role !== 'ADMIN') {
      errorResponse(res, 'Access denied', 403);
      return;
    }

    const filePath = path.join(process.cwd(), 'uploads', userId, 'receipts', filename);
    if (!fs.existsSync(filePath)) {
      errorResponse(res, 'File not found', 404);
      return;
    }

    res.sendFile(filePath);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
});

export default router;
