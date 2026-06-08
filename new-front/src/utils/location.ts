import type { LocationBranch } from '@/types';

/** Full address line shown in dropdowns (not country / city summary). */
export function getLocationDisplayLabel(loc: LocationBranch): string {
  const adresse = loc.adresse?.trim();
  if (adresse) return adresse.replace(/\n/g, ', ');

  const locationAddress = (loc as { location_address?: string }).location_address?.trim();
  if (locationAddress) return locationAddress;

  const location = loc.location?.trim();
  if (!location) return loc.name?.trim() || '';

  // "Country, City, (Type)" → prefer city + type part without country prefix
  const parts = location.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return parts.slice(1).join(', ');
  }

  return location;
}

/** Value sent to /filter/vehicles as pickupLoc. */
export function getLocationPickupValue(loc: LocationBranch): string {
  return loc.location?.trim() || loc.name?.trim() || getLocationDisplayLabel(loc);
}
