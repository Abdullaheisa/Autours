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

/** Helper to strip any trailing airport abbreviation (e.g. " (DXB)", " - DXB") from a location label */
export function stripLocationAbbreviation(label: string, abbreviation?: string): string {
  if (!label) return '';
  let cleaned = label;
  if (abbreviation && abbreviation.trim()) {
    const escaped = abbreviation.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleaned = cleaned.replace(new RegExp(`(?:\\s*[-–—]?\\s*\\(?${escaped}\\)?|\\s+${escaped})\\s*$`, 'i'), '').trim();
  }
  // Also strip generic trailing 3-letter IATA code if present with dash or parentheses:
  cleaned = cleaned.replace(/\s*[-–—]\s*[A-Za-z]{3}\s*$/, '').trim();
  cleaned = cleaned.replace(/\s*\([A-Za-z]{3}\)\s*$/, '').trim();
  cleaned = cleaned.replace(/\s*[-–—]\s*$/, '').trim();
  return cleaned;
}

/** Full address line shown in dropdowns and search inputs (e.g. "Dubai International Airport (DXB)"). */
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

  const abbr = (loc.abriviation || '').trim().toUpperCase();

  // If a valid 3-letter IATA abbreviation exists, standardize display to "Name (CODE)"
  if (abbr && /^[A-Z]{3}$/.test(abbr)) {
    const baseLabel = stripLocationAbbreviation(label, abbr);
    return baseLabel ? `${baseLabel} (${abbr})` : `(${abbr})`;
  }

  // If loc.abriviation is not present, check if label has a trailing 3-letter code like " - DXB" or "(DXB)"
  const trailingDashCodeMatch = label.match(/^(.*?)\s*[-–—]\s*([A-Za-z]{3})\s*$/);
  if (trailingDashCodeMatch) {
    const baseLabel = trailingDashCodeMatch[1].trim();
    const code = trailingDashCodeMatch[2].toUpperCase();
    return `${baseLabel} (${code})`;
  }

  const trailingParenCodeMatch = label.match(/^(.*?)\s*\(([A-Za-z]{3})\)\s*$/);
  if (trailingParenCodeMatch) {
    const baseLabel = trailingParenCodeMatch[1].trim();
    const code = trailingParenCodeMatch[2].toUpperCase();
    return `${baseLabel} (${code})`;
  }

  return label;
}

/** Value sent to /filter/vehicles as pickupLoc. */
export function getLocationPickupValue(loc: LocationBranch): string {
  return loc.name?.trim() || loc.location?.trim() || getLocationDisplayLabel(loc);
}

