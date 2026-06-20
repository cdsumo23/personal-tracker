// services/currency.service.ts
import prisma from '../config/database';
import logger from '../config/logger';
import { config } from '../config/env';
import axios from 'axios';

export class CurrencyService {
  /**
   * Fetches latest exchange rates from free open exchange rate API (or falls back to database defaults)
   */
  async updateExchangeRates(): Promise<void> {
    const apiKey = config.EXCHANGE_RATE_API_KEY;
    if (!apiKey) {
      logger.info('No EXCHANGE_RATE_API_KEY found. Skipping online exchange rates update.');
      return;
    }

    try {
      const response = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
      
      if (response.data && response.data.result === 'success') {
        const rates = response.data.conversion_rates;
        
        const supported = ['USD', 'EUR', 'GBP', 'LRD', 'NGN', 'GHS'];
        for (const [currency, rate] of Object.entries(rates)) {
          if (supported.includes(currency)) {
            await prisma.exchangeRate.upsert({
              where: {
                baseCurrency_targetCurrency: {
                  baseCurrency: 'USD',
                  targetCurrency: currency
                }
              },
              update: { rate: rate as number },
              create: {
                baseCurrency: 'USD',
                targetCurrency: currency,
                rate: rate as number
              }
            });
          }
        }
        logger.info('Exchange rates updated successfully from ExchangeRateAPI.');
      }
    } catch (error: any) {
      logger.error('Failed to update online exchange rates:', error.message);
    }
  }

  async getExchangeRates() {
    const rates = await prisma.exchangeRate.findMany({
      orderBy: [{ baseCurrency: 'asc' }, { targetCurrency: 'asc' }]
    });
    // Serialize Prisma Decimal to plain number so JSON response contains numeric values
    return rates.map(r => ({ ...r, rate: Number(r.rate) }));
  }

  /**
   * Upsert a single exchange rate by the user.
   */
  async upsertRate(baseCurrency: string, targetCurrency: string, rate: number) {
    return prisma.exchangeRate.upsert({
      where: {
        baseCurrency_targetCurrency: { baseCurrency, targetCurrency }
      },
      update: { rate },
      create: { baseCurrency, targetCurrency, rate }
    });
  }

  /**
   * Converts amount between two currencies using the stored USD-based conversion rates.
   * Falls back gracefully with a 1:1 ratio if rate is missing.
   */
  async convertAmount(amount: number, from: string, to: string): Promise<number> {
    if (from === to) return amount;

    const rates = await this.getExchangeRates();
    
    let fromRate: number | null = null;
    if (from === 'USD') {
      fromRate = 1;
    } else {
      const direct = rates.find((r) => r.targetCurrency === from && r.baseCurrency === 'USD');
      if (direct) {
        fromRate = direct.rate;
      } else {
        const inverse = rates.find((r) => r.baseCurrency === from && r.targetCurrency === 'USD');
        if (inverse && inverse.rate !== 0) {
          fromRate = 1 / inverse.rate;
        }
      }
    }

    let toRate: number | null = null;
    if (to === 'USD') {
      toRate = 1;
    } else {
      const direct = rates.find((r) => r.targetCurrency === to && r.baseCurrency === 'USD');
      if (direct) {
        toRate = direct.rate;
      } else {
        const inverse = rates.find((r) => r.baseCurrency === to && r.targetCurrency === 'USD');
        if (inverse && inverse.rate !== 0) {
          toRate = 1 / inverse.rate;
        }
      }
    }

    if (fromRate === null || toRate === null) {
      logger.warn(`Exchange rate missing for ${from} -> ${to}. Returning original amount.`);
      return amount;
    }

    const amountInUSD = amount / fromRate;
    return amountInUSD * toRate;
  }

  /**
   * Converts an amount to the user's base currency. Returns original amount on failure.
   */
  async convertToBaseCurrency(amount: number, fromCurrency: string, baseCurrency: string): Promise<number> {
    try {
      return await this.convertAmount(amount, fromCurrency, baseCurrency);
    } catch {
      return amount;
    }
  }
}
export const currencyService = new CurrencyService();
