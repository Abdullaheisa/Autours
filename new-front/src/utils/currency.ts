import type { Currency } from '@/types';
import { fallbackRates } from '@/store/slices/currencySlice';

/**
 * Formats only the numerical value of a price without currency code
 */
export const formatNumberOnly = (
  amount: number,
  currency: Currency,
  locale: string = 'en-US'
): string => {
  try {
    const numFormatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    return numFormatter.format(Math.round(amount));
  } catch (e) {
    return Math.round(amount).toLocaleString();
  }
};

/**
 * Formats a price into separate amount and currency parts
 */
export const formatPriceParts = (
  amount: number,
  currency: Currency,
  locale: string = 'en-US'
): { amount: string; currency: string } => {
  return {
    amount: formatNumberOnly(amount, currency, locale),
    currency: (currency || 'USD').toUpperCase(),
  };
};

/**
 * Formats a price as: [currency_code] [amount]
 * e.g. KWD 14.12 | AED 250.00 | USD 45.00
 */
export const formatPrice = (
  amount: number,
  currency: Currency,
  locale: string = 'en-US'
): string => {
  const formattedNumber = formatNumberOnly(amount, currency, locale);
  return `${(currency || 'USD').toUpperCase()} ${formattedNumber}`;
};

/**
 * Converts a price from USD to the target currency using the provided rates.
 */
export const convertFromUsd = (
  amountInUsd: number,
  targetCurrency: Currency,
  rates: Record<string, number> = {}
): number => {
  const code = (targetCurrency || 'USD').toUpperCase();
  const rate = rates[code] || fallbackRates[code] || 1;
  return amountInUsd * rate;
};

/**
 * Standardizes price storage logic (normalization)
 * All prices should be stored/processed in USD internally.
 */
export const normalizeToUsd = (
  amount: number,
  fromCurrency: Currency,
  rates: Record<string, number> = {}
): number => {
  const code = (fromCurrency || 'USD').toUpperCase();
  const rate = rates[code] || fallbackRates[code] || 1;
  return amount / rate;
};
