import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';

import { config } from '@/config/env';
import { morganStream } from '@/config/logger';
import { generalLimiter } from '@/middleware/rateLimiter.middleware';
import { auditMiddleware } from '@/middleware/audit.middleware';
import { globalErrorHandler, notFoundHandler } from '@/middleware/error.middleware';

// Import routers
import authRoutes from '@/routes/auth.routes';
import accountRoutes from '@/routes/account.routes';
import categoryRoutes from '@/routes/category.routes';
import transactionRoutes from '@/routes/transaction.routes';
import budgetRoutes from '@/routes/budget.routes';
import goalRoutes from '@/routes/goal.routes';
import debtRoutes from '@/routes/debt.routes';
import billRoutes from '@/routes/bill.routes';
import notificationRoutes from '@/routes/notification.routes';
import reportRoutes from '@/routes/report.routes';
import searchRoutes from '@/routes/search.routes';
import exportRoutes from '@/routes/export.routes';
import adminRoutes from '@/routes/admin.routes';
import networthRoutes from '@/routes/networth.routes';
import currencyRoutes from '@/routes/currency.routes';
import uploadRoutes from '@/routes/upload.routes';
import pushRoutes from '@/routes/push.routes';

const app = express();

// 1. Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS Configuration
const getAllowedOrigins = () => {
  const envOrigins = config.FRONTEND_URL.split(',').map(url => url.trim());
  return [
    ...envOrigins,
    'http://localhost:3000',
    'http://localhost:4000',
  ];
};

app.use(cors({
  origin: (origin, callback) => {
    const allowed = getAllowedOrigins();
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

// 2. Request Parsers & Compressors
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// 3. Request Logger
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream: morganStream }));

// 4. Rate Limiting (Skip for tests)
if (config.NODE_ENV !== 'test') {
  app.use('/api', generalLimiter);
}

// 5. Audit Logging (mutating requests)
app.use('/api', auditMiddleware);

// 6. Serve static uploads (with custom security headers if needed)
app.use('/uploads', express.static(path.join(process.cwd(), config.UPLOAD_DIR)));

// 7. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/networth', networthRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/push', pushRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    config: config.NODE_ENV,
  });
});

// 8. 404 Route handler
app.use(notFoundHandler);

// 9. Global Error Handler
app.use(globalErrorHandler);

export default app;
