import multer, { FileFilterCallback, StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { config } from '@/config/env';
import { AppError } from '@/middleware/error.middleware';

// ─────────────────────────────────────────────
// Allowed MIME types
// ─────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];
const ALLOWED_ALL_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

// ─────────────────────────────────────────────
// Storage Engine Factory
// ─────────────────────────────────────────────

function createStorage(subDir: string = ''): StorageEngine {
  return multer.diskStorage({
    destination: (req: Request, _file, cb) => {
      const userId = req.user?.userId ?? 'anonymous';
      const uploadPath = path.join(process.cwd(), config.UPLOAD_DIR, userId, subDir);

      // Create directory if it doesn't exist
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${uuidv4()}${ext}`;
      cb(null, uniqueName);
    },
  });
}

// ─────────────────────────────────────────────
// File Filter Factories
// ─────────────────────────────────────────────

function imageFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPG, PNG, and WebP images are allowed', 400));
  }
}

function documentFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  if (ALLOWED_ALL_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPG, PNG, and PDF files are allowed', 400));
  }
}

// ─────────────────────────────────────────────
// Multer Upload Instances
// ─────────────────────────────────────────────

/**
 * Upload middleware for receipt images and PDFs.
 * Accepts: JPG, PNG, PDF. Max: 10MB.
 */
export const receiptUpload = multer({
  storage: createStorage('receipts'),
  fileFilter: documentFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
    files: 5,
  },
});

/**
 * Upload middleware for bank statements (PDF only).
 * Max: 10MB.
 */
export const statementUpload = multer({
  storage: createStorage('statements'),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('text/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only PDF and CSV files are allowed for statements', 400));
    }
  },
  limits: {
    fileSize: config.MAX_FILE_SIZE,
    files: 1,
  },
});

/**
 * Upload middleware for profile photos.
 * Accepts: JPG, PNG, WebP. Max: 5MB.
 */
export const profilePhotoUpload = multer({
  storage: createStorage('profiles'),
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
});

/**
 * Upload middleware for import files (CSV/XLSX).
 */
export const importUpload = multer({
  storage: multer.memoryStorage(), // Keep in memory for processing
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'text/csv',
      'application/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.csv') || file.originalname.endsWith('.xlsx')) {
      cb(null, true);
    } else {
      cb(new AppError('Only CSV and XLSX files are allowed for import', 400));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
});

/**
 * Utility: Build the public URL or local path for a stored file.
 */
export function buildFileUrl(req: Request, filename: string, userId: string, subDir: string = ''): string {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${userId}/${subDir ? subDir + '/' : ''}${filename}`;
}
