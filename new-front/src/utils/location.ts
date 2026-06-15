import type { LocationBranch } from '@/types';

/** Full address line shown in dropdowns (not country / city summary). */
export function getLocationDisplayLabel(loc: LocationBranch): string {
  const name = loc.name?.trim() || '';
  let addressPart = loc.adresse?.trim() || (loc as { location_address?: string }).location_address?.trim() || loc.location?.trim() || '';

  if (addressPart) {
    addressPart = addressPart.replace(/\n/g, ', ');
  }

  // If we have both name and address, we prefer the name for a cleaner display.
  // We can also attach the address part if we want, but since the issue is long addresses,
  // returning just the name (or name with clean address) is better.
  let label = name;
  
  if (name && addressPart && name !== addressPart) {
    if (addressPart.toLowerCase().startsWith(name.toLowerCase())) {
        // Strip the name from the beginning of the address to avoid duplication
        const cleanAddress = addressPart.substring(name.length).replace(/^[,-\s]+/, '').trim();
        // For a cleaner look, you might just want to return the name. 
        // If you still want the address, uncomment the next line:
        // label = cleanAddress ? `${name}, ${cleanAddress}` : name;
        label = name; 
    } else if (addressPart.toLowerCase().includes(name.toLowerCase())) {
        label = name; 
    } else {
        // label = `${name}, ${addressPart}`; // uncomment to include address
        label = name;
    }
  } else {
    label = name || addressPart;
  }

  return loc.abriviation && !label.includes(loc.abriviation) ? `${label} - ${loc.abriviation}` : label;
}

/** Value sent to /filter/vehicles as pickupLoc. */
export function getLocationPickupValue(loc: LocationBranch): string {
  return loc.location?.trim() || loc.name?.trim() || getLocationDisplayLabel(loc);
}
