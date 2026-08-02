import type { LocationBranch } from '@/types';

const AIRPORT_NAMES: Record<string, string> = {
  'IST': 'Istanbul Airport',
  'SAW': 'Sabiha Gökçen International Airport',
  'AYT': 'Antalya Airport',
  'ADB': 'Adnan Menderes Airport',
  'ESB': 'Ankara Esenboğa Airport',
  'TZX': 'Trabzon Airport',
  'DLM': 'Dalaman Airport',
  'BJV': 'Milas-Bodrum Airport',
  'GZP': 'Gazipaşa-Alanya Airport',
  'NAV': 'Nevşehir Kapadokya Airport',
  'DXB': 'Dubai International Airport',
  'DWC': 'Al Maktoum International Airport',
  'AUH': 'Zayed International Airport',
  'SHJ': 'Sharjah International Airport',
  'RKT': 'Ras Al Khaimah International Airport',
  'FJR': 'Fujairah International Airport',
  'AAN': 'Al Ain International Airport',
  'CMN': 'Mohammed V International Airport',
  'RAK': 'Marrakesh Menara Airport',
  'AGA': 'Agadir Al Massira Airport',
  'TNG': 'Tangier Ibn Battouta Airport',
  'FEZ': 'Fès–Saïss Airport',
  'RBA': 'Rabat–Salé Airport',
  'AMM': 'Queen Alia International Airport',
  'AQJ': 'King Hussein International Airport',
  'TBS': 'Tbilisi International Airport',
  'BUS': 'Batumi International Airport',
  'KUT': 'Kutaisi International Airport',
  'CAI': 'Cairo International Airport',
  'SPX': 'Sphinx International Airport',
  'HRG': 'Hurghada International Airport',
  'SSH': 'Sharm El Sheikh International Airport',
  'HBE': 'Borg El Arab International Airport',
  'LXR': 'Luxor International Airport',
  'ASW': 'Aswan International Airport',
  'RMF': 'Marsa Alam International Airport',
  'KWI': 'Kuwait International Airport',
  'RUH': 'King Khalid International Airport',
  'JED': 'King Abdulaziz International Airport',
  'DMM': 'King Fahd International Airport',
  'MED': 'Prince Mohammad Bin Abdulaziz Airport',
  'AHB': 'Abha International Airport',
  'TIF': 'Taif International Airport',
  'TAB': 'Tabuk Regional Airport',
  'GIZ': 'Jazan Airport',
  'ELQ': 'Prince Naif Bin Abdulaziz Airport',
  'ULH': 'AlUla International Airport',
  'YNB': 'Yanbu Airport',
  'BAH': 'Bahrain International Airport',
  'DOH': 'Hamad International Airport'
};

/** Full address line shown in dropdowns (not country / city summary). */
export function getLocationDisplayLabel(loc: LocationBranch): string {
  let label = '';

  if (loc.abriviation && AIRPORT_NAMES[loc.abriviation.toUpperCase()]) {
    label = AIRPORT_NAMES[loc.abriviation.toUpperCase()];
  } else {
    const name = loc.name?.trim() || '';
    let addressPart = loc.adresse?.trim() || (loc as { location_address?: string }).location_address?.trim() || loc.location?.trim() || '';

    if (addressPart) {
      addressPart = addressPart.replace(/\n/g, ', ');
    }

    // If we have both name and address, we prefer the name for a cleaner display.
    if (name && addressPart && name !== addressPart) {
      if (addressPart.toLowerCase().startsWith(name.toLowerCase())) {
          label = name; 
      } else if (addressPart.toLowerCase().includes(name.toLowerCase())) {
          label = name; 
      } else {
          label = name;
      }
    } else {
      label = name || addressPart;
    }
  }

  return loc.abriviation && !label.includes(loc.abriviation) ? `${label} - ${loc.abriviation}` : label;
}

/** Value sent to /filter/vehicles as pickupLoc. */
export function getLocationPickupValue(loc: LocationBranch): string {
  return loc.name?.trim() || loc.location?.trim() || getLocationDisplayLabel(loc);
}
