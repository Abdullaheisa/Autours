import type { Currency, Vehicle } from '@/types';
import { convertFromUsd } from '@/utils/currency';
import { fallbackRates } from '@/store/slices/currencySlice';

/**
 * Total rental price for display.
 * Prefer API `final_price` (total for the period in the search currency).
 * Refetch on currency change updates this value from the backend.
 */
export function getVehicleDisplayPrice(
  vehicle: Vehicle | null | undefined,
  currencyCode: Currency,
  allRates: Record<string, number> = {},
  daysNumber: number = 1,
  fetchedCurrency?: string
): number {
  if (!vehicle) return 0;

  const finalPrice = Number(vehicle.final_price);
  if (finalPrice > 0) {
    const priceCurrency = (fetchedCurrency || vehicle.baseCurrency || 'AED').toUpperCase();
    const targetCode = (currencyCode || 'AED').toUpperCase();
    if (priceCurrency !== targetCode) {
      const rateToBase = allRates[priceCurrency] || fallbackRates[priceCurrency] || 1;
      const usdValue = finalPrice / rateToBase;
      return Math.round(convertFromUsd(usdValue, targetCode, allRates));
    }
    return Math.round(finalPrice);
  }

  const usdPerDay = Number(vehicle.price_in_usd) || 0;
  if (usdPerDay > 0) {
    const days = Math.max(daysNumber || 1, 1);
    return Math.round(convertFromUsd(usdPerDay * days, currencyCode, allRates));
  }

  const v = vehicle as Vehicle & { price?: number };
  return Math.round(Number(v.price) || 0);
}

/**
 * Converts a vehicle's raw deposit amount from its base currency to the target currency.
 * Inspects both `deposit_amount` and vehicle inclusions (e.g. "Security Deposit: 7000 TRY").
 */
export function getVehicleDepositPrice(
  vehicle: Vehicle | null | undefined,
  currencyCode: Currency,
  allRates: Record<string, number> = {},
  fetchedCurrency?: string
): number {
  if (!vehicle) return 0;
  let rawDeposit = Number(vehicle.deposit_amount ?? (vehicle as any)?.deposit ?? 0);
  let depositBaseCurrency = (
    fetchedCurrency ||
    vehicle.baseCurrency ||
    (vehicle.branch as any)?.currency ||
    'AED'
  ).toUpperCase();

  // If deposit_amount is not set directly, inspect inclusions/what_is_included
  if (rawDeposit <= 0) {
    const rawInclusions = [
      ...(Array.isArray(vehicle.included) ? vehicle.included : []),
      ...(Array.isArray((vehicle as any)?.what_is_included) ? (vehicle as any).what_is_included : []),
    ];

    for (const item of rawInclusions) {
      const text = (typeof item === 'string' ? item : item?.what_is_included || item?.name || item?.description || '').trim();
      const lower = text.toLowerCase();
      if (lower.includes('deposit') && !lower.includes('zero') && !lower.includes('no deposit') && !lower.includes('without deposit')) {
        const numMatch = text.match(/(\d+(?:[.,]\d+)?)/);
        if (numMatch) {
          const parsed = parseFloat(numMatch[1].replace(/,/g, ''));
          if (!isNaN(parsed) && parsed > 0) {
            rawDeposit = parsed;
            const currMatch = text.match(/\b([A-Z]{3})\b/);
            if (currMatch) {
              const code = currMatch[1].toUpperCase();
              const normCode = code === 'TL' ? 'TRY' : code;
              if (allRates[normCode] || fallbackRates[normCode]) {
                depositBaseCurrency = normCode;
              }
            }
            break;
          }
        }
      }
    }
  }

  // If still not found, inspect rental_terms (for suppliers like SurPrice, Green Motion, Jimpisoft, U-Save)
  if (rawDeposit <= 0 && Array.isArray(vehicle.rental_terms)) {
    for (const term of vehicle.rental_terms) {
      const title = (typeof term === 'object' && term ? (term.title || term.name || '') : '').trim();
      const desc = (typeof term === 'object' && term ? (term.description || term.desc || '') : '')
        .replace(/<[^>]*>/g, ' ')
        .trim();
      const text = `${title} ${desc}`;
      const lower = text.toLowerCase();

      if (
        lower.includes('deposit') &&
        !lower.includes('zero deposit') &&
        !lower.includes('no deposit') &&
        !lower.includes('without deposit')
      ) {
        const match1 = text.match(/(?:deposit|pre-?authori[sz]ation)[^\d]{1,60}?\b([A-Z]{3})\s*(\d+(?:[.,]\d+)?)/i);
        const match2 = text.match(/(?:deposit|pre-?authori[sz]ation)[^\d]{1,60}?(\d+(?:[.,]\d+)?)\s*([A-Z]{3})\b/i);
        const m = match1 || match2;
        if (m) {
          const code = (match1 ? m[1] : m[2]).toUpperCase();
          const normCode = code === 'TL' ? 'TRY' : code;
          const amtStr = match1 ? m[2] : m[1];
          const parsed = parseFloat(amtStr.replace(/,/g, ''));
          if (!isNaN(parsed) && parsed > 0 && (allRates[normCode] || fallbackRates[normCode])) {
            rawDeposit = parsed;
            depositBaseCurrency = normCode;
            break;
          }
        }
      }
    }
  }

  if (rawDeposit <= 0) return 0;

  const targetCurr = (currencyCode || 'AED').toUpperCase();

  if (depositBaseCurrency === targetCurr) {
    return Math.round(rawDeposit);
  }

  const rateToBase = allRates[depositBaseCurrency] || fallbackRates[depositBaseCurrency] || 1;
  const usdValue = rawDeposit / rateToBase;
  return Math.round(convertFromUsd(usdValue, targetCurr, allRates));
}

/** @deprecated Use getVehicleDisplayPrice */
export function getVehicleTotalPrice(vehicle: Vehicle | null | undefined): number {
  return getVehicleDisplayPrice(vehicle, 'USD', { USD: 1 }, 1);
}
