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
    const isThreeDecimal = currency === 'KWD' || currency === 'BHD' || currency === 'OMR' || currency === 'TND' || currency === 'LYD' || currency === 'JOD';
    const isZeroDecimal = currency === 'JPY' || currency === 'KRW' || currency === 'IDR' || currency === 'CLP' || currency === 'IQD' || currency === 'LBP' || currency === 'SYP' || currency === 'VND';
    const maxFrac = isThreeDecimal ? 3 : (isZeroDecimal ? 0 : 2);

    const numFormatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxFrac,
    });

    return numFormatter.format(amount);
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
 * Formats a price as: [amount] [currency_code]
 * e.g. 250 AED | 1,500 SAR | 0.310 KWD
 */
export const formatPrice = (
  amount: number,
  currency: Currency,
  locale: string = 'en-US'
): string => {
  const formattedNumber = formatNumberOnly(amount, currency, locale);
  return `${formattedNumber} ${currency}`;
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
