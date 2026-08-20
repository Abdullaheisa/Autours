import type { Currency, Vehicle } from '@/types';
import { convertFromUsd } from '@/utils/currency';

/**
 * Total rental price for display.
 * Prefer API `final_price` (total for the period in the search currency).
 * Refetch on currency change updates this value from the backend.
 */
export function getVehicleDisplayPrice(
  vehicle: Vehicle | null | undefined,
  currencyCode: Currency,
  allRates: Record<string, number>,
  daysNumber: number = 1,
  fetchedCurrency?: string
): number {
  if (!vehicle) return 0;

  const finalPrice = Number(vehicle.final_price);
  if (finalPrice > 0) {
    const priceCurrency = fetchedCurrency || vehicle.baseCurrency || 'AED';
    if (priceCurrency !== currencyCode) {
      const rateToBase = allRates[priceCurrency] || 1;
      const usdValue = finalPrice / rateToBase;
      return Math.round(convertFromUsd(usdValue, currencyCode, allRates));
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

/** @deprecated Use getVehicleDisplayPrice */
export function getVehicleTotalPrice(vehicle: Vehicle | null | undefined): number {
  return getVehicleDisplayPrice(vehicle, 'USD', { USD: 1 }, 1);
}
