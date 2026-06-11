import type { LocationBranch } from '@/types';

/** Full address line shown in dropdowns (not country / city summary). */
export function getLocationDisplayLabel(loc: LocationBranch): string {
  const name = loc.name?.trim() || '';
  let addressPart = loc.adresse?.trim() || (loc as { location_address?: string }).location_address?.trim() || loc.location?.trim() || '';

  if (addressPart) {
    addressPart = addressPart.replace(/\n/g, ', ');
  }

  let label = '';
  if (name && addressPart && name !== addressPart) {
    if (!addressPart.toLowerCase().includes(name.toLowerCase())) {
      label = `${name}, ${addressPart}`;
    } else {
      label = addressPart;
    }
  } else {
    label = name || addressPart;
  }

  return loc.abriviation ? `${label} - ${loc.abriviation}` : label;
}

/** Value sent to /filter/vehicles as pickupLoc. */
export function getLocationPickupValue(loc: LocationBranch): string {
  return loc.location?.trim() || loc.name?.trim() || getLocationDisplayLabel(loc);
}
