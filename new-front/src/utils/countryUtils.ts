export const countryNamesMap: Record<string, string> = {
  "EG": "Egypt",
  "UAE": "United Arab Emirates",
  "United Arab Emirates22": "United Arab Emirates",
  "AE": "United Arab Emirates",
  "TR": "Turkey",
  "TURKEY": "Turkey",
  "CY": "Cyprus",
  "CYPRUS": "Cyprus",
  "GR": "Greece",
  "GREECE": "Greece",
  "MA": "Morocco",
  "MOROCCO": "Morocco",
  "ES": "Spain",
  "SPAIN": "Spain",
  "IT": "Italy",
  "ITALY": "Italy",
  "PT": "Portugal",
  "PORTUGAL": "Portugal",
  "US": "United States",
  "USA": "United States",
  "UNITED STATES OF AMERICA": "United States",
  "UK": "United Kingdom",
  "GB": "United Kingdom",
  "UNITED KINGDOM": "United Kingdom",
  "ME": "Montenegro",
  "MONTENEGRO": "Montenegro",
  "GE": "Georgia",
  "GEORGIA": "Georgia",
  "JO": "Jordan",
  "JORDAN": "Jordan",
  "KW": "Kuwait",
  "KUWAIT": "Kuwait",
  "OM": "Oman",
  "OMAN": "Oman",
  "QA": "Qatar",
  "QATAR": "Qatar",
  "SA": "Saudi Arabia",
  "SAUDI ARABIA": "Saudi Arabia",
  "AL": "Albania",
  "ALBANIA": "Albania",
  "AT": "Austria",
  "AUSTRIA": "Austria",
  "BG": "Bulgaria",
  "BULGARIA": "Bulgaria",
  "HR": "Croatia",
  "CROATIA": "Croatia",
  "BA": "Bosnia and Herzegovina",
  "BOSNIA AND HERZEGOVINA": "Bosnia and Herzegovina",
  "MK": "North Macedonia",
  "CA": "Canada",
  "CANADA": "Canada",
  "AU": "Australia",
  "AUSTRALIA": "Australia",
  "DE": "Germany",
  "GERMANY": "Germany",
  "FR": "France",
  "FRANCE": "France",
  "JM": "Jamaica",
  "JAMAICA": "Jamaica",
  "GT": "Guatemala",
  "GUATEMALA": "Guatemala",
  "PA": "Panama",
  "PANAMA": "Panama",
  "Türkiye": "Turkey",
  "TÜRKIYE": "Turkey",
  "TÜRKİYE": "Turkey",
  "Gaziemir": "Turkey",
  "GAZIEMIR": "Turkey",
  "Demo Street": "United Arab Emirates",
  "DEMO STREET": "United Arab Emirates",
};

export const countryFlags: Record<string, string> = {
  "Egypt": "🇪🇬",
  "United Arab Emirates": "🇦🇪",
  "Turkey": "🇹🇷",
  "Cyprus": "🇨🇾",
  "Greece": "🇬🇷",
  "Morocco": "🇲🇦",
  "Spain": "🇪🇸",
  "Italy": "🇮🇹",
  "Portugal": "🇵🇹",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  "Montenegro": "🇲🇪",
  "Georgia": "🇬🇪",
  "Jordan": "🇯🇴",
  "Kuwait": "🇰🇼",
  "Oman": "🇴🇲",
  "Qatar": "🇶🇦",
  "Saudi Arabia": "🇸🇦",
  "Albania": "🇦🇱",
  "Austria": "🇦🇹",
  "Bulgaria": "🇧🇬",
  "Croatia": "🇭🇷",
  "Bosnia and Herzegovina": "🇧🇦",
  "North Macedonia": "🇲🇰",
  "Kosovo": "🇽🇰",
  "Canada": "🇨🇦",
  "Australia": "🇦🇺",
  "Germany": "🇩🇪",
  "France": "🇫🇷",
};

// ISO 2-letter codes for flagcdn.com image flags (works on all platforms including Windows)
export const countryIsoMap: Record<string, string> = {
  "Egypt": "eg",
  "United Arab Emirates": "ae",
  "Turkey": "tr",
  "Cyprus": "cy",
  "Greece": "gr",
  "Morocco": "ma",
  "Spain": "es",
  "Italy": "it",
  "Portugal": "pt",
  "United States": "us",
  "United Kingdom": "gb",
  "Montenegro": "me",
  "Georgia": "ge",
  "Jordan": "jo",
  "Kuwait": "kw",
  "Oman": "om",
  "Qatar": "qa",
  "Saudi Arabia": "sa",
  "Albania": "al",
  "Austria": "at",
  "Bulgaria": "bg",
  "Croatia": "hr",
  "Bosnia and Herzegovina": "ba",
  "North Macedonia": "mk",
  "Kosovo": "xk",
  "Canada": "ca",
  "Australia": "au",
  "Germany": "de",
  "France": "fr",
  "Bahrain": "bh",
  "Lebanon": "lb",
  "Iraq": "iq",
  "Libya": "ly",
  "Tunisia": "tn",
  "Algeria": "dz",
  "Sudan": "sd",
  "Syria": "sy",
  "Yemen": "ye",
  "Palestine": "ps",
  "Netherlands": "nl",
  "Belgium": "be",
  "Switzerland": "ch",
  "Sweden": "se",
  "Norway": "no",
  "Denmark": "dk",
  "Poland": "pl",
  "Czech Republic": "cz",
  "Romania": "ro",
  "Hungary": "hu",
  "Serbia": "rs",
  "Slovakia": "sk",
  "Slovenia": "si",
  "Ireland": "ie",
  "Finland": "fi",
  "Russia": "ru",
  "Ukraine": "ua",
  "Thailand": "th",
  "Japan": "jp",
  "China": "cn",
  "India": "in",
  "South Korea": "kr",
  "Singapore": "sg",
  "Malaysia": "my",
  "Indonesia": "id",
  "Philippines": "ph",
  "Pakistan": "pk",
  "Brazil": "br",
  "Mexico": "mx",
  "Argentina": "ar",
  "South Africa": "za",
  "Nigeria": "ng",
  "Kenya": "ke",
  "Ethiopia": "et",
  "Ghana": "gh",
  "Tanzania": "tz",
  "Tanzania, United Republic Of": "tz",
  "New Zealand": "nz",
  "Fiji": "fj",
  "Malta": "mt",
  "Nepal": "np",
  "Estonia": "ee",
  "Jamaica": "jm",
  "Guatemala": "gt",
  "Panama": "pa",
  "Antigua and Barbuda": "ag",
  "Antigua And Barbuda": "ag",
  "Armenia": "am",
  "Chile": "cl",
  "Dominican Republic": "do",
  "Mauritius": "mu",
  "Saint Martin": "mf",
  "Sint Maarten": "sx",
  "St. Lucia": "lc",
  "U.s. Virgin Islands": "vi",
  "Venezuela": "ve",
  "Liechtenstein": "li",
  "Grenada": "gd",
  "Iceland": "is",
  "Puerto Rico": "pr",
};

export function getCountryFullName(countryName?: string): string {
  if (!countryName) return "Global";
  const trimmed = countryName.trim();
  return countryNamesMap[trimmed] || countryNamesMap[trimmed.toUpperCase()] || trimmed;
}

// Convert ISO 2-letter code to Emoji flag dynamically
function getFlagEmoji(isoCode: string): string {
  const codePoints = isoCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function getCountryFlag(countryName?: string): string {
  if (!countryName) return "🌐";
  const fullName = getCountryFullName(countryName);
  
  // 1. Try hardcoded dictionary
  if (countryFlags[fullName]) return countryFlags[fullName];
  if (countryFlags[countryName.trim()]) return countryFlags[countryName.trim()];

  // 2. Eagerly generate dynamically using ISO code
  const iso = getCountryIso(countryName);
  if (iso) {
    try {
      return getFlagEmoji(iso);
    } catch (e) {
      // Fallback
    }
  }

  return "🌐";
}

/**
 * Returns the ISO 2-letter code for flagcdn.com
 * Usage: <img src={`https://flagcdn.com/w40/${getCountryIso(country)}.png`} />
 */
export function getCountryIso(countryName?: string): string | null {
  if (!countryName) return null;
  const fullName = getCountryFullName(countryName);
  return countryIsoMap[fullName] || countryIsoMap[countryName.trim()] || null;
}
