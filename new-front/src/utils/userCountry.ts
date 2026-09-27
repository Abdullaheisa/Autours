import { worldCountries, WorldCountry } from '@/data/worldCountries';
import { countryNamesMap } from '@/utils/countryUtils';

const STORAGE_KEY_COUNTRY = 'autours_user_residence_country';
const STORAGE_KEY_ISO = 'autours_user_country_iso';
const STORAGE_KEY_MANUAL = 'autours_user_manual_country';
const STORAGE_KEY_TIMESTAMP = 'autours_user_country_timestamp';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const DEFAULT_FALLBACK_COUNTRY: WorldCountry = {
  name: "United Arab Emirates",
  code: "+971",
  iso: "AE",
  currency: "AED",
};

/**
 * Match country in worldCountries by 2-letter ISO code (e.g. "EG", "AE", "US", "DE")
 */
export function findCountryByIso(iso: string | null | undefined): WorldCountry | undefined {
  if (!iso || typeof iso !== 'string') return undefined;
  const cleanIso = iso.trim().toUpperCase();
  return worldCountries.find((c) => c.iso.toUpperCase() === cleanIso);
}

/**
 * Match country in worldCountries by name or known aliases
 */
export function findCountryByName(name: string | null | undefined): WorldCountry | undefined {
  if (!name || typeof name !== 'string') return undefined;
  const clean = name.trim().toLowerCase();

  // 1. Direct exact match
  let found = worldCountries.find((c) => c.name.toLowerCase() === clean);
  if (found) return found;

  // 2. Lookup alias via countryNamesMap
  const mapped = countryNamesMap[name.trim()] || countryNamesMap[clean.toUpperCase()] || countryNamesMap[name.toUpperCase()];
  if (mapped) {
    found = worldCountries.find((c) => c.name.toLowerCase() === mapped.toLowerCase());
    if (found) return found;
  }

  // 3. Partial match
  found = worldCountries.find((c) => c.name.toLowerCase().includes(clean) || clean.includes(c.name.toLowerCase()));
  return found;
}

/**
 * Synchronous read from localStorage / sessionStorage (0ms instant return)
 */
export function getUserCountrySync(): WorldCountry | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Check if user previously saved a full country object
    const savedCountryStr = localStorage.getItem(STORAGE_KEY_COUNTRY);
    if (savedCountryStr) {
      const parsed = JSON.parse(savedCountryStr);
      if (parsed?.iso) {
        const found = findCountryByIso(parsed.iso);
        if (found) return found;
      }
    }

    // 2. Check cached ISO code in sessionStorage or localStorage
    const cachedIso = sessionStorage.getItem(STORAGE_KEY_ISO) || localStorage.getItem(STORAGE_KEY_ISO);
    if (cachedIso) {
      const found = findCountryByIso(cachedIso);
      if (found) return found;
    }
  } catch {}

  return null;
}

/**
 * Persist user country selection
 */
export function saveUserCountry(country: WorldCountry, isManual = true): void {
  if (typeof window === 'undefined' || !country) return;

  try {
    localStorage.setItem(STORAGE_KEY_COUNTRY, JSON.stringify(country));
    localStorage.setItem(STORAGE_KEY_ISO, country.iso);
    sessionStorage.setItem(STORAGE_KEY_ISO, country.iso);
    localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString());

    if (isManual) {
      sessionStorage.setItem(STORAGE_KEY_MANUAL, 'true');
      localStorage.setItem(STORAGE_KEY_MANUAL, 'true');
    }
  } catch {}
}

/**
 * Fast fetch user country based on public IP address
 * Uses multi-source racing (<50ms) with local caching
 */
export async function detectUserCountry(forceRefresh = false): Promise<WorldCountry> {
  if (typeof window !== 'undefined' && !forceRefresh) {
    // If the user manually changed their country in the dropdown during this session, honor their explicit choice
    const isManual = sessionStorage.getItem(STORAGE_KEY_MANUAL) === 'true';
    if (isManual) {
      const manualCountry = getUserCountrySync();
      if (manualCountry) return manualCountry;
    }
  }

  // Fast fetcher 1: Cloudflare Edge Worker (typically 20-50ms)
  const fetchFromCountryIs = async (): Promise<string | null> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1800);
    try {
      const res = await fetch('https://api.country.is', {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        if (data?.country && typeof data.country === 'string' && data.country.length === 2) {
          return data.country.toUpperCase();
        }
      }
    } catch {}
    return null;
  };

  // Fast fetcher 2: First-party Next.js API Route (/api/geo)
  const fetchFromInternalApi = async (): Promise<string | null> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1800);
    try {
      const res = await fetch('/api/geo', {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        if (data?.countryCode && typeof data.countryCode === 'string' && data.countryCode.length === 2) {
          return data.countryCode.toUpperCase();
        }
      }
    } catch {}
    return null;
  };

  // Fallback fetcher 3: ipwho.is
  const fetchFromIpWhoIs = async (): Promise<string | null> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    try {
      const res = await fetch('https://ipwho.is/', {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.country_code && data.country_code.length === 2) {
          return data.country_code.toUpperCase();
        }
      }
    } catch {}
    return null;
  };

  try {
    // Race primary fast fetchers
    const detectedIso = await Promise.any([
      fetchFromCountryIs().then((iso) => {
        if (!iso) throw new Error('No ISO');
        return iso;
      }),
      fetchFromInternalApi().then((iso) => {
        if (!iso) throw new Error('No ISO');
        return iso;
      }),
    ]).catch(async () => {
      // If primary endpoints fail or are blocked, try fallback
      return await fetchFromIpWhoIs();
    });

    if (detectedIso) {
      const matched = findCountryByIso(detectedIso);
      if (matched) {
        saveUserCountry(matched, false);
        return matched;
      }
    }
  } catch {}

  // Final fallback to cached or default
  return getUserCountrySync() || DEFAULT_FALLBACK_COUNTRY;
}
