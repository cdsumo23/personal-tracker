import { useAuthStore } from '@/store/auth.store';
import { formatCurrency, formatCurrencyCompact } from '@/lib/utils';
import * as React from 'react';

export function useCurrency() {
  const { user } = useAuthStore();
  const currency = user?.currency || 'USD';

  const format = React.useCallback(
    (amount: number, options?: Intl.NumberFormatOptions) => {
      return formatCurrency(amount, currency, options);
    },
    [currency]
  );

  const formatCompact = React.useCallback(
    (amount: number) => {
      return formatCurrencyCompact(amount, currency);
    },
    [currency]
  );

  return {
    currency,
    format,
    formatCompact,
  };
}
