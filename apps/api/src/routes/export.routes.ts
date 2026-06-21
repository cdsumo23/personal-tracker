// routes/export.routes.ts
import { Router } from 'express';
import {
  downloadCSV,
  downloadExcel,
  downloadPDF,
  exportBackup,
  importCSV,
  restoreBackup
} from '../controllers/export.controller';
import { authenticate } from '../middleware/auth.middleware';
import { importUpload } from '../middleware/upload.middleware';

const router = Router();

router.use(authenticate);

router.get('/csv', downloadCSV);
router.get('/:type/csv', downloadCSV);
router.get('/excel', downloadExcel);
router.get('/:type/excel', downloadExcel);
router.get('/pdf', downloadPDF);
router.get('/:type/pdf', downloadPDF);
router.get('/backup', exportBackup);
router.post('/restore', restoreBackup);
router.post('/import-csv', importUpload.single('file'), importCSV);

export default router;
