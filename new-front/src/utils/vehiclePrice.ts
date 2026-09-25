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
 */
export function getVehicleDepositPrice(
  vehicle: Vehicle | null | undefined,
  currencyCode: Currency,
  allRates: Record<string, number> = {},
  fetchedCurrency?: string
): number {
  if (!vehicle) return 0;
  const rawDeposit = Number(vehicle.deposit_amount ?? (vehicle as any)?.deposit ?? 0);
  if (rawDeposit <= 0) return 0;

  const priceCurrency = (fetchedCurrency || vehicle.baseCurrency || 'AED').toUpperCase();
  const targetCurr = (currencyCode || 'AED').toUpperCase();

  if (priceCurrency === targetCurr) {
    return Math.round(rawDeposit);
  }

  const rateToBase = allRates[priceCurrency] || fallbackRates[priceCurrency] || 1;
  const usdValue = rawDeposit / rateToBase;
  return Math.round(convertFromUsd(usdValue, targetCurr, allRates));
}

/** @deprecated Use getVehicleDisplayPrice */
export function getVehicleTotalPrice(vehicle: Vehicle | null | undefined): number {
  return getVehicleDisplayPrice(vehicle, 'USD', { USD: 1 }, 1);
}
