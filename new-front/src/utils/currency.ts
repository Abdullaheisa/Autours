import type { Currency } from '@/types';


/**
 * Formats a price as: [amount] [currency_code]
 * e.g. 250 AED | 1,500 SAR | 0.310 KWD
 */
export const formatPrice = (
  amount: number,
  currency: Currency,
  locale: string = 'en-US'
): string => {
  try {
    // Determine decimal places based on currency
    const isThreeDecimal = currency === 'KWD' || currency === 'BHD' || currency === 'OMR';
    const minFrac = isThreeDecimal ? 3 : 0;
    const maxFrac = isThreeDecimal ? 3 : 2;

    // Format the number only (no currency symbol)
    const numFormatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: minFrac,
      maximumFractionDigits: maxFrac,
    });

    const formattedNumber = numFormatter.format(amount);

    // Always display the currency code abbreviation (USD, AED, SAR, etc.)
    return `${formattedNumber} ${currency}`;
  } catch (e) {
    return `${Math.round(amount).toLocaleString()} ${currency}`;
  }
};

/**
 * Converts a price from USD to the target currency using the provided rates.
 */
export const convertFromUsd = (
  amountInUsd: number,
  targetCurrency: Currency,
  rates: Record<string, number>
): number => {
  const rate = rates[targetCurrency] || 1;
  return amountInUsd * rate;
};

/**
 * Standardizes price storage logic (normalization)
 * All prices should be stored/processed in USD internally.
 */
export const normalizeToUsd = (
  amount: number,
  fromCurrency: Currency,
  rates: Record<string, number>
): number => {
  const rate = rates[fromCurrency] || 1;
  return amount / rate;
};
