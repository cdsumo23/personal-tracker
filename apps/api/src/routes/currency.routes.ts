// routes/currency.routes.ts
import { Router } from 'express';
import { currencyService } from '../services/currency.service';
import { successResponse, errorResponse } from '../utils/response';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// GET /api/currency/rates — list all stored exchange rates
router.get('/rates', authenticate, async (req, res) => {
  try {
    const rates = await currencyService.getExchangeRates();
    successResponse(res, rates);
  } catch (error: any) {
    errorResponse(res, error.message);
  }
});

// PUT /api/currency/rates — upsert a single exchange rate
// Body: { baseCurrency: string, targetCurrency: string, rate: number }
router.put('/rates', authenticate, async (req, res) => {
  try {
    const { baseCurrency, targetCurrency, rate } = req.body;
    if (!baseCurrency || !targetCurrency || rate === undefined) {
      errorResponse(res, 'baseCurrency, targetCurrency, and rate are required', 400);
      return;
    }
    if (typeof rate !== 'number' || rate <= 0) {
      errorResponse(res, 'rate must be a positive number', 400);
      return;
    }
    const updated = await currencyService.upsertRate(baseCurrency.toUpperCase(), targetCurrency.toUpperCase(), rate);
    successResponse(res, updated, 'Exchange rate updated successfully');
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
});

// POST /api/currency/convert
router.post('/convert', authenticate, async (req, res) => {
  try {
    const { amount, from, to } = req.body;
    if (!amount || !from || !to) {
      errorResponse(res, 'amount, from, and to are required parameters', 400);
      return;
    }
    const result = await currencyService.convertAmount(parseFloat(amount), from, to);
    successResponse(res, { amount, from, to, convertedAmount: result });
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
});

export default router;
