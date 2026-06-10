import type { LocationBranch } from '@/types';

/** Full address line shown in dropdowns (not country / city summary). */
export function getLocationDisplayLabel(loc: LocationBranch): string {
  let label = '';
  const adresse = loc.adresse?.trim();

  if (adresse) {
    label = adresse.replace(/\n/g, ', ');
  } else {
    const locationAddress = (loc as { location_address?: string }).location_address?.trim();
    if (locationAddress) {
      label = locationAddress;
    } else {
      const location = loc.location?.trim();
      if (!location) {
        label = loc.name?.trim() || '';
      } else {
        const parts = location.split(',').map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          label = parts.slice(1).join(', ');
        } else {
          label = location;
        }
      }
    }
  }

  return loc.abriviation ? `${label} - ${loc.abriviation}` : label;
}

/** Value sent to /filter/vehicles as pickupLoc. */
export function getLocationPickupValue(loc: LocationBranch): string {
  return loc.location?.trim() || loc.name?.trim() || getLocationDisplayLabel(loc);
}
