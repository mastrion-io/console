import type { Currency } from './types';

const EUR_FORMATTER = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

/**
 * Formats integer cents as a de-DE EUR currency string.
 * Money is always integer cents; never pass floats.
 */
export function formatMoney(amountCents: number, currency: Currency = 'EUR'): string {
  if (!Number.isFinite(amountCents)) {
    return EUR_FORMATTER.format(0);
  }
  const safeCurrency: Currency = currency === 'EUR' ? 'EUR' : 'EUR';
  const formatter =
    safeCurrency === 'EUR'
      ? EUR_FORMATTER
      : new Intl.NumberFormat('de-DE', { style: 'currency', currency: safeCurrency });
  return formatter.format(amountCents / 100);
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value / 100);
}
