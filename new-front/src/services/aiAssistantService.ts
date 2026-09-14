import { Vehicle } from '@/types';
import { vehicleMapper } from '@/services/mappers/vehicleMapper';
import { BACKEND_URL, CANDIDATE_BACKEND_URLS } from '@/config/api';
import { buildLearnedMemoryPrompt, learnFromConversation, UserMemoryProfile } from './aiLearningService';
import {
  getCountryFlagButtons,
  matchCountry,
  formatLocationsAndAirportsText,
  getLocationsAndAirportsButtons,
  matchLocationOrAirport,
} from '@/config/chatDestinations';

export interface ActionButton {
  label: string;
  url?: string;
  actionType?: 'link' | 'prompt' | 'whatsapp' | 'call';
  promptText?: string;
  flagIso?: string;
}

export interface AssistantChatResult {
  reply: string;
  vehicles?: Vehicle[];
  searchCriteria?: any;
  actionButtons?: ActionButton[];
  userMemory?: UserMemoryProfile;
  showSearchWidget?: boolean;
  searchWidgetData?: {
    defaultLocation?: string;
    dateFrom?: string;
    dateTo?: string;
    startTime?: string;
    endTime?: string;
  };
}

const FALLBACK_B64 = 'QVEuQWI4Uk42SmlGUWNnQjFCOWpUcHhKTXNsT19KMjJNNUlwWnV4LURGaFg4RnFIa1ZHTUE=';
const GEMINI_KEY_DIRECT =
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  (typeof window !== 'undefined' ? atob(FALLBACK_B64) : Buffer.from(FALLBACK_B64, 'base64').toString('utf8'));

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

// ── String Normalization & Fuzzy Levenshtein Matching ─────────────────────────
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ىئ]/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove Arabic Tashkeel
    .replace(/(.)\1{2,}/g, '$1$1') // Remove excessive duplicate characters (e.g. كوييييت -> كويت)
    .trim();
}

export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function isFuzzyMatch(str1: string, str2: string, threshold = 0.72): boolean {
  if (!str1 || !str2) return false;
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  if (s1 === s2 || s1.includes(s2) || s2.includes(s1)) return true;

  // Strip 'ال' prefix and test again
  const s1NoAl = s1.startsWith('ال') ? s1.slice(2) : s1;
  const s2NoAl = s2.startsWith('ال') ? s2.slice(2) : s2;
  if (s1NoAl === s2NoAl || s1NoAl.includes(s2NoAl) || s2NoAl.includes(s1NoAl)) return true;

  const maxLen = Math.max(s1NoAl.length, s2NoAl.length);
  if (maxLen === 0) return true;
  const dist = levenshteinDistance(s1NoAl, s2NoAl);
  const similarity = (maxLen - dist) / maxLen;
  return similarity >= threshold || dist <= 2;
}

// Universal Global Destination Dictionary (Multilingual, Nicknames, Slang, & Common Typos)
export const UNIVERSAL_DESTINATION_MAP: Record<string, string> = {
  // 🇰🇼 Kuwait & Cities
  'الكويت': 'Kuwait', 'كويت': 'Kuwait', 'الكوت': 'Kuwait', 'الكوايت': 'Kuwait', 'الدانة': 'Kuwait',
  'kuwait': 'Kuwait', 'kwi': 'Kuwait', 'kuwayt': 'Kuwait', 'al kuwait': 'Kuwait', 'مطار الكويت': 'Kuwait',
  'الفروانية': 'Kuwait', 'حولي': 'Kuwait', 'الري': 'Kuwait', 'الأحمدي': 'Kuwait', 'السالمية': 'Kuwait',

  // 🇦🇪 UAE & Dubai
  'دبي': 'Dubai', 'دبى': 'Dubai', 'دار الحي': 'Dubai', 'dubai': 'Dubai', 'dxb': 'Dubai', 'dubay': 'Dubai',
  'أبوظبي': 'Abu Dhabi', 'ابوظبي': 'Abu Dhabi', 'أبو ظبي': 'Abu Dhabi', 'ابو ظبي': 'Abu Dhabi', 'abu dhabi': 'Abu Dhabi', 'auh': 'Abu Dhabi',
  'الشارقة': 'Sharjah', 'الشارقه': 'Sharjah', 'sharjah': 'Sharjah', 'shj': 'Sharjah',
  'الإمارات': 'United Arab Emirates', 'الامارات': 'United Arab Emirates', 'uae': 'United Arab Emirates', 'united arab emirates': 'United Arab Emirates', 'امارات': 'United Arab Emirates',

  // 🇹🇷 Turkey & Cities
  'تركيا': 'Turkey', 'ترركيا': 'Turkey', 'توركيا': 'Turkey', 'تركية': 'Turkey', 'turkey': 'Turkey', 'turkiye': 'Turkey', 'türkiye': 'Turkey', 'turky': 'Turkey',
  'إسطنبول': 'Istanbul', 'اسطنبول': 'Istanbul', 'إسطمبول': 'Istanbul', 'istanbul': 'Istanbul', 'ist': 'Istanbul', 'saw': 'Istanbul', 'صبيحة': 'Istanbul', 'صبيحه': 'Istanbul',
  'أنطاليا': 'Antalya', 'انطاليا': 'Antalya', 'antalya': 'Antalya', 'ayt': 'Antalya',
  'أنقرة': 'Ankara', 'انقرة': 'Ankara', 'ankara': 'Ankara', 'إزمير': 'Izmir', 'ازمير': 'Izmir', 'izmir': 'Izmir',
  'طرابزون': 'Trabzon', 'ترابزون': 'Trabzon', 'trabzon': 'Trabzon', 'بورصة': 'Bursa', 'بودروم': 'Bodrum',

  // 🇪🇬 Egypt & Cities
  'مصر': 'Egypt', 'مسر': 'Egypt', 'أم الدنيا': 'Egypt', 'ام الدنيا': 'Egypt', 'egypt': 'Egypt', 'egypte': 'Egypt', 'misr': 'Egypt',
  'القاهرة': 'Cairo', 'القاهره': 'Cairo', 'المحروسة': 'Cairo', 'المحروسه': 'Cairo', 'cairo': 'Cairo', 'cai': 'Cairo', 'كايرو': 'Cairo',
  'الغردقة': 'Hurghada', 'الغردقه': 'Hurghada', 'غردقة': 'Hurghada', 'hurghada': 'Hurghada', 'hrg': 'Hurghada',
  'شرم الشيخ': 'Sharm El Sheikh', 'شرم': 'Sharm El Sheikh', 'sharm': 'Sharm El Sheikh', 'ssh': 'Sharm El Sheikh',
  'الإسكندرية': 'Alexandria', 'الاسكندرية': 'Alexandria', 'اسكندرية': 'Alexandria', 'alexandria': 'Alexandria', 'الأقصر': 'Luxor', 'أسوان': 'Aswan',

  // 🇲🇦 Morocco & Cities
  'المغرب': 'Morocco', 'المغريب': 'Morocco', 'موروكو': 'Morocco', 'morocco': 'Morocco', 'maroc': 'Morocco', 'marruecos': 'Morocco',
  'كازابلانكا': 'Casablanca', 'كازا': 'Casablanca', 'الدار البيضاء': 'Casablanca', 'الدارالبيضاء': 'Casablanca', 'casablanca': 'Casablanca', 'cmn': 'Casablanca', 'محمد الخامس': 'Casablanca',
  'مراكش': 'Marrakech', 'marrakech': 'Marrakech', 'marrakesh': 'Marrakech', 'rak': 'Marrakech',
  'طنجة': 'Tangier', 'طنجه': 'Tangier', 'tangier': 'Tangier', 'tng': 'Tangier', 'ابن بطوطة': 'Tangier',
  'أكادير': 'Agadir', 'اكادير': 'Agadir', 'agadir': 'Agadir', 'aga': 'Agadir', 'فاس': 'Fez', 'fez': 'Fez', 'fes': 'Fez', 'الرباط': 'Rabat',

  // 🇧🇭 Bahrain
  'البحرين': 'Bahrain', 'بحرين': 'Bahrain', 'bahrain': 'Bahrain', 'bahrin': 'Bahrain', 'bah': 'Bahrain',
  'المنامة': 'Manama', 'المنامه': 'Manama', 'manama': 'Manama',

  // 🇯🇴 Jordan
  'الأردن': 'Jordan', 'الاردن': 'Jordan', 'اردن': 'Jordan', 'النشامى': 'Jordan', 'jordan': 'Jordan', 'jordanie': 'Jordan',
  'عمان': 'Amman', 'عمّان': 'Amman', 'amman': 'Amman', 'amm': 'Amman', 'الملكة علياء': 'Amman', 'العقبة': 'Aqaba',

  // 🇬🇪 Georgia
  'جورجيا': 'Georgia', 'georgia': 'Georgia', 'géorgie': 'Georgia', 'tbilisi': 'Tbilisi', 'تبليسي': 'Tbilisi', 'tbs': 'Tbilisi', 'باتومي': 'Batumi', 'batumi': 'Batumi', 'bus': 'Batumi', 'كوتايسي': 'Kutaisi',

  // 🇶🇦 Qatar & Hamad International Airport
  'قطر': 'Qatar', 'qatar': 'Qatar', 'الدوحة': 'Qatar', 'الدوحه': 'Qatar', 'doha': 'Qatar', 'doh': 'Qatar',
  'مطار حمد': 'Qatar', 'مطار حمد الدولي': 'Qatar', 'حمد الدولي': 'Qatar', 'hamad': 'Qatar', 'hamad airport': 'Qatar', 'hamad international airport': 'Qatar',

  // 🇴🇲 Oman
  'سلطنة عمان': 'Oman', 'سلطنه عمان': 'Oman', 'oman': 'Oman', 'مسقط': 'Muscat', 'muscat': 'Muscat', 'صلالة': 'Salalah',

  // 🇪🇸 Spain
  'إسبانيا': 'Spain', 'اسبانيا': 'Spain', 'أسبانيا': 'Spain', 'spain': 'Spain', 'espana': 'Spain', 'españa': 'Spain', 'spane': 'Spain',
  'مدريد': 'Madrid', 'madrid': 'Madrid', 'برشلونة': 'Barcelona', 'برشلونه': 'Barcelona', 'barcelona': 'Barcelona', 'ملقة': 'Malaga', 'malaga': 'Malaga',

  // 🇮🇹 Italy
  'إيطاليا': 'Italy', 'ايطاليا': 'Italy', 'أيطاليا': 'Italy', 'italy': 'Italy', 'italia': 'Italy', 'italie': 'Italy',
  'روما': 'Rome', 'rome': 'Rome', 'ميلانو': 'Milan', 'ميلان': 'Milan', 'milan': 'Milan', 'البندقية': 'Venice',

  // 🇬🇷 Greece & Cyprus
  'اليونان': 'Greece', 'يونان': 'Greece', 'greece': 'Greece', 'grece': 'Greece', 'أثينا': 'Athens', 'اثينا': 'Athens', 'athens': 'Athens',
  'قبرص': 'Cyprus', 'cyprus': 'Cyprus', 'chypre': 'Cyprus', 'لارنكا': 'Cyprus', 'larnaca': 'Cyprus',

  // 🇦🇱 Albania & Balkans
  'ألبانيا': 'Albania', 'البانيا': 'Albania', 'albania': 'Albania', 'تيرانا': 'Tirana', 'tirana': 'Tirana',
  'كرواتيا': 'Croatia', 'croatia': 'Croatia', 'زغرب': 'Zagreb', 'صربيا': 'Serbia', 'serbia': 'Serbia', 'الجبل الأسود': 'Montenegro', 'montenegro': 'Montenegro',
  'المجر': 'Hungary', 'hungary': 'Hungary', 'بودابست': 'Budapest', 'بولندا': 'Poland', 'poland': 'Poland', 'وارسو': 'Warsaw', 'مالطا': 'Malta', 'malta': 'Malta',

  // 🇦🇷 Argentina & Americas
  'الأرجنتين': 'Argentina', 'الارجنتين': 'Argentina', 'ارجنتين': 'Argentina', 'argentina': 'Argentina', 'argentine': 'Argentina', 'بوينس آيرس': 'Buenos Aires', 'buenos aires': 'Buenos Aires',
  'المكسيك': 'Mexico', 'مكسيك': 'Mexico', 'mexico': 'Mexico', 'كانكون': 'Cancun', 'cancun': 'Cancun',
  'تشيلي': 'Chile', 'chile': 'Chile', 'سانتياغو': 'Santiago',
  'أمريكا': 'United States', 'امريكا': 'United States', 'الولايات المتحدة': 'United States', 'usa': 'United States', 'united states': 'United States', 'ميامي': 'Miami', 'miami': 'Miami', 'أورلاندو': 'Orlando', 'orlando': 'Orlando', 'نيويورك': 'New York', 'لوس أنجلوس': 'Los Angeles',
  'كندا': 'Canada', 'canada': 'Canada', 'تورونتو': 'Toronto', 'مونتريال': 'Montreal',

  // 🇵🇹 Portugal & Others
  'البرتغال': 'Portugal', 'portugal': 'Portugal', 'لشبونة': 'Lisbon', 'lisbon': 'Lisbon', 'بورتو': 'Porto',
  'أستراليا': 'Australia', 'استراليا': 'Australia', 'australia': 'Australia', 'سيدني': 'Sydney', 'ملبورن': 'Melbourne', 'بيرث': 'Perth',
  'أرمينيا': 'Armenia', 'ارمينيا': 'Armenia', 'armenia': 'Armenia', 'يريفان': 'Yerevan',
  'موريشيوس': 'Mauritius', 'mauritius': 'Mauritius', 'المالديف': 'Maldives', 'maldives': 'Maldives',
  'إندونيسيا': 'Indonesia', 'اندونيسيا': 'Indonesia', 'indonesia': 'Indonesia', 'بالي': 'Bali', 'bali': 'Bali', 'جاكرتا': 'Jakarta',
  'ماليزيا': 'Malaysia', 'malaysia': 'Malaysia', 'كوالالمبور': 'Kuala Lumpur',
  'تايلاند': 'Thailand', 'thailand': 'Thailand', 'بانكوك': 'Bangkok', 'بوكيت': 'Phuket',
  'اليابان': 'Japan', 'japan': 'Japan', 'طوكيو': 'Tokyo',
  'السعودية': 'Saudi Arabia', 'السعوديه': 'Saudi Arabia', 'سعودية': 'Saudi Arabia', 'saudi arabia': 'Saudi Arabia', 'ksa': 'Saudi Arabia', 'الرياض': 'Riyadh', 'جدة': 'Jeddah', 'جده': 'Jeddah', 'الدمام': 'Dammam',
  'فرنسا': 'France', 'france': 'France', 'باريس': 'Paris', 'ألمانيا': 'Germany', 'المانيا': 'Germany', 'germany': 'Germany', 'برلين': 'Berlin', 'ميونخ': 'Munich',
  'بريطانيا': 'United Kingdom', 'إنجلترا': 'United Kingdom', 'uk': 'United Kingdom', 'لندن': 'London',
};

// Backward compatible export
export const ARABIC_DESTINATION_MAP = UNIVERSAL_DESTINATION_MAP;

let cachedLocations: any[] | null = null;
let lastLocationsFetchTime = 0;

export async function fetchLocations(): Promise<any[]> {
  const now = Date.now();
  if (cachedLocations && cachedLocations.length > 0 && now - lastLocationsFetchTime < 300000) {
    return cachedLocations;
  }
  
  const urlsToTry = typeof window !== 'undefined'
    ? Array.from(new Set([
        '/api/backend/get/locations',
        '/api/backend/api/get/locations',
        'https://www.autours.net/api/backend/get/locations',
        'https://www.autours.net/api/backend/api/get/locations',
        '/get/locations',
        `${BACKEND_URL}/api/get/locations`,
        `${BACKEND_URL}/get/locations`,
      ].filter(Boolean)))
    : Array.from(new Set([
        'https://www.autours.net/api/backend/get/locations',
        'https://www.autours.net/api/backend/api/get/locations',
        'http://127.0.0.1:8000/api/get/locations',
        'http://localhost:8000/api/get/locations',
        `${BACKEND_URL}/api/get/locations`,
        `${BACKEND_URL}/get/locations`,
      ].filter(Boolean)));

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          cachedLocations = data;
          lastLocationsFetchTime = now;
          return cachedLocations;
        }
      }
    } catch {
      // try next URL
    }
  }

  return cachedLocations || [];
}

export function buildDynamicDatabaseContext(locations: any[]) {
  if (!Array.isArray(locations) || locations.length === 0) {
    return {
      totalCountries: 0,
      countriesListStr: 'البلدان المتاحة: الكويت، الإمارات، تركيا، مصر، المغرب، البحرين، الأردن، جورجيا، قطر، عمان وغيرها.',
      summaryStr: '',
    };
  }

  const countryMap = new Map<string, { branches: any[]; airports: string[] }>();
  for (const loc of locations) {
    const c = loc.country;
    if (!c) continue;
    if (!countryMap.has(c)) {
      countryMap.set(c, { branches: [], airports: [] });
    }
    const data = countryMap.get(c)!;
    data.branches.push(loc);
    if (loc.airport || loc.location_type === 'Airport') {
      const name = loc.name || loc.airport?.airport_name;
      if (name && !data.airports.includes(name)) {
        data.airports.push(name);
      }
    }
  }

  const summaries: string[] = [];
  for (const [country, info] of countryMap.entries()) {
    const topAirports = info.airports.slice(0, 3).join(', ');
    summaries.push(`- ${country} (${info.branches.length} فرع/مكتب${topAirports ? ' - مطارات: ' + topAirports : ''})`);
  }

  return {
    totalCountries: countryMap.size,
    countriesListStr: Array.from(countryMap.keys()).join(', '),
    summaryStr: summaries.slice(0, 30).join('\n'),
  };
}

export function resolveTargetLocation(query: string, locations: any[]): any | null {
  if (!query) return null;
  const cleanQ = normalizeText(query);

  // 1. Direct & Substring match in UNIVERSAL_DESTINATION_MAP
  let canonicalName: string | null = null;
  for (const [alias, enName] of Object.entries(UNIVERSAL_DESTINATION_MAP)) {
    const normAlias = normalizeText(alias);
    if (cleanQ === normAlias || cleanQ.includes(normAlias) || normAlias.includes(cleanQ)) {
      canonicalName = enName;
      break;
    }
  }

  // 2. Fuzzy Match against Universal Map if no direct match (e.g. typos: ترركيا, الكوت, مسر, spane)
  if (!canonicalName) {
    for (const [alias, enName] of Object.entries(UNIVERSAL_DESTINATION_MAP)) {
      if (isFuzzyMatch(cleanQ, alias)) {
        canonicalName = enName;
        break;
      }
    }
  }

  if (!Array.isArray(locations) || locations.length === 0) {
    if (canonicalName) {
      return { name: canonicalName, country: canonicalName, location: canonicalName };
    }
    return null;
  }

  const searchTerm = (canonicalName || cleanQ).toLowerCase();

  // 3. Filter matching branches from live DB locations
  let matches = locations.filter((l: any) => {
    const loc = (l.location || '').toLowerCase();
    const city = (l.city || '').toLowerCase();
    const name = (l.name || '').toLowerCase();
    const country = (l.country || '').toLowerCase();
    const abrv = (l.abriviation || '').toLowerCase();
    const station = (l.station_id || '').toLowerCase();
    const iata = (l.airport?.iata_code || '').toLowerCase();

    return (
      loc.includes(searchTerm) ||
      city.includes(searchTerm) ||
      name.includes(searchTerm) ||
      country.includes(searchTerm) ||
      (abrv && abrv === searchTerm) ||
      (station && station === searchTerm) ||
      (iata && iata === searchTerm) ||
      (canonicalName &&
        (loc.includes(cleanQ) || city.includes(cleanQ) || country.includes(cleanQ) || name.includes(cleanQ)))
    );
  });

  // 4. Fuzzy Match against DB Locations if exact filter found nothing
  if (matches.length === 0) {
    matches = locations.filter((l: any) => {
      return (
        isFuzzyMatch(cleanQ, l.country || '') ||
        isFuzzyMatch(cleanQ, l.city || '') ||
        isFuzzyMatch(cleanQ, l.location || '') ||
        isFuzzyMatch(cleanQ, l.name || '')
      );
    });
  }

  if (matches.length === 0) {
    if (canonicalName) {
      return { name: canonicalName, country: canonicalName, location: canonicalName };
    }
    return null;
  }

  // 5. Sort: prioritize Airport branches and active locations
  matches.sort((a: any, b: any) => {
    const aIsAirport =
      a.location_type === 'Airport' ||
      a.airport_id != null ||
      (a.name || '').toLowerCase().includes('airport') ||
      (a.name || '').toLowerCase().includes('مطار');
    const bIsAirport =
      b.location_type === 'Airport' ||
      b.airport_id != null ||
      (b.name || '').toLowerCase().includes('airport') ||
      (b.name || '').toLowerCase().includes('مطار');

    if (aIsAirport && !bIsAirport) return -1;
    if (!aIsAirport && bIsAirport) return 1;

    if (a.activation && !b.activation) return -1;
    if (!a.activation && b.activation) return 1;

    return 0;
  });

  return matches[0];
}

function normalizeDateStr(dateStr: string): string {
  if (!dateStr) {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  const clean = dateStr.trim();
  const ddmmyyyy = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (ddmmyyyy) {
    return `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`;
  }
  const yyyymmdd = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (yyyymmdd) {
    return `${yyyymmdd[1]}-${yyyymmdd[2].padStart(2, '0')}-${yyyymmdd[3].padStart(2, '0')}`;
  }
  return clean;
}

export async function queryVehicles(params: {
  locationIdOrName: string | number;
  dateFrom: string;
  dateTo: string;
  currency: string;
}): Promise<Vehicle[]> {
  const payload = {
    pickupLoc: params.locationIdOrName,
    date_from: normalizeDateStr(params.dateFrom),
    date_to: normalizeDateStr(params.dateTo),
    time_from: '10:00',
    time_to: '10:00',
    currency: params.currency || 'AED',
    page: 1,
    per_page: 50,
  };

  const urlsToTry = typeof window !== 'undefined'
    ? Array.from(new Set([
        '/api/backend/filter/vehicles',
        '/api/backend/api/filter/vehicles',
        'https://www.autours.net/api/backend/filter/vehicles',
        'https://www.autours.net/api/backend/api/filter/vehicles',
        '/filter/vehicles',
        `${BACKEND_URL}/api/filter/vehicles`,
        `${BACKEND_URL}/filter/vehicles`,
      ].filter(Boolean)))
    : Array.from(new Set([
        'https://www.autours.net/api/backend/filter/vehicles',
        'https://www.autours.net/api/backend/api/filter/vehicles',
        'http://127.0.0.1:8000/api/filter/vehicles',
        'http://localhost:8000/api/filter/vehicles',
        `${BACKEND_URL}/api/filter/vehicles`,
        `${BACKEND_URL}/filter/vehicles`,
      ].filter(Boolean)));

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const list = data.filteredVehicles || [];
        if (Array.isArray(list)) {
          return vehicleMapper.toLocalList(list);
        }
      }
    } catch {
      // try next URL
    }
  }

  return [];
}

export function getSmartActionButtons(
  userText: string,
  locations: any[] = [],
  currentUser?: any
): ActionButton[] {
  const clean = userText.toLowerCase();
  const isEnglish = !/[\u0600-\u06FF]/.test(userText);

  // 1. Account intent
  if (clean.includes('حسابي') || clean.includes('تسجيل') || clean.includes('دخول') || clean.includes('بروفايل') || clean.includes('account') || clean.includes('login') || clean.includes('profile')) {
    if (!currentUser) {
      return isEnglish
        ? [
            { label: '👤 Sign In', url: '/login', actionType: 'link' },
            { label: '📝 Create Account', url: '/register', actionType: 'link' },
          ]
        : [
            { label: '👤 تسجيل الدخول', url: '/login', actionType: 'link' },
            { label: '📝 إنشاء حساب جديد', url: '/register', actionType: 'link' },
          ];
    } else {
      return [
        { label: isEnglish ? '👤 My Profile' : '👤 حسابي الشخصي', url: '/profile', actionType: 'link' },
      ];
    }
  }

  // 2. Policy / Contact intent
  if (clean.includes('تأمين') || clean.includes('تامين') || clean.includes('شروط') || clean.includes('إلغاء') || clean.includes('دعم') || clean.includes('insurance') || clean.includes('policy') || clean.includes('cancel') || clean.includes('support')) {
    return isEnglish
      ? [
          { label: '💬 WhatsApp Support', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
          { label: '✈️ Dubai Airport Cars', promptText: 'Show cars available at Dubai Airport for 3 days' },
          { label: '⚡ Economy Car Deals', promptText: 'What are the best economy rental deals?' },
        ]
      : [
          { label: '💬 خدمة العملاء (واتساب)', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
          { label: '✈️ سيارات مطار دبي (3 أيام)', promptText: 'سيارات متاحة في مطار دبي لمدة 3 أيام' },
          { label: '⚡ أفضل العروض الاقتصادية', promptText: 'ما هي أفضل السيارات الاقتصادية المتاحة؟' },
        ];
  }

  // 3. Dynamic Destination Extraction from Live DB Locations
  let matchedCountry: string | null = null;
  for (const [ar, en] of Object.entries(ARABIC_DESTINATION_MAP)) {
    if (clean.includes(ar.toLowerCase()) || clean.includes(en.toLowerCase())) {
      matchedCountry = en;
      break;
    }
  }

  if (!matchedCountry && locations.length > 0) {
    const directMatch = locations.find((l: any) =>
      clean.includes((l.country || '').toLowerCase()) ||
      clean.includes((l.city || '').toLowerCase()) ||
      clean.includes((l.name || '').toLowerCase())
    );
    if (directMatch) matchedCountry = directMatch.country;
  }

  if (matchedCountry && locations.length > 0) {
    const countryBranches = locations.filter(
      (l: any) => (l.country || '').toLowerCase() === matchedCountry!.toLowerCase()
    );
    const airportBranches = countryBranches.filter(
      (l: any) =>
        l.location_type === 'Airport' ||
        l.airport_id != null ||
        (l.name || '').toLowerCase().includes('airport') ||
        (l.name || '').toLowerCase().includes('مطار')
    );

    const buttons: ActionButton[] = [];
    if (airportBranches.length > 0) {
      for (const b of airportBranches.slice(0, 2)) {
        buttons.push({
          label: isEnglish ? `✈️ ${b.name || b.city}` : `✈️ سيارات ${b.name || b.city}`,
          promptText: isEnglish
            ? `Available cars at ${b.name || b.city} for 3 days`
            : `سيارات متاحة في ${b.name || b.city} لمدة 3 أيام`,
        });
      }
    }
    const cityBranches = countryBranches.filter((l: any) => !airportBranches.includes(l));
    if (cityBranches.length > 0 && buttons.length < 3) {
      const b = cityBranches[0];
      buttons.push({
        label: isEnglish ? `🏢 ${b.city || b.name}` : `🏢 فروع ${b.city || b.name}`,
        promptText: isEnglish
          ? `Available cars in ${b.city || b.name} for 3 days`
          : `سيارات متاحة في ${b.city || b.name} لمدة 3 أيام`,
      });
    }
    buttons.push({
      label: isEnglish ? `⚡ Best deals in ${matchedCountry}` : `⚡ أفضل عروض ${matchedCountry}`,
      promptText: isEnglish
        ? `Best car rental deals in ${matchedCountry}`
        : `أفضل عروض تأجير السيارات في ${matchedCountry}`,
    });
    return buttons.slice(0, 4);
  }

  // Default professional top suggestions
  return isEnglish
    ? [
        { label: '✈️ Dubai Airport (3 Days)', promptText: 'Show cars available at Dubai Airport for 3 days' },
        { label: '⚡ Economy Car Deals', promptText: 'What are the best economy cars available?' },
        { label: '🇹🇷 Turkey Car Rentals', promptText: 'Car rental options in Turkey' },
        { label: '💬 WhatsApp Support', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
      ]
    : [
        { label: '✈️ مطار دبي (3 أيام)', promptText: 'سيارات متاحة في مطار دبي لمدة 3 أيام' },
        { label: '⚡ أفضل السيارات الاقتصادية', promptText: 'ما هي أفضل السيارات الاقتصادية المتاحة؟' },
        { label: '🇹🇷 سيارات تركيا', promptText: 'عروض تأجير السيارات في تركيا' },
        { label: '💬 خدمة العملاء (واتساب)', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
      ];
}

export async function processChatWithGemini(params: {
  messages: { role: string; content: string }[];
  currency?: string;
  currentUser?: any;
  userMemory?: UserMemoryProfile | null;
}): Promise<AssistantChatResult> {
  const { messages, currency = 'AED', currentUser, userMemory } = params;
  const latestUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const isEnglish = !/[\u0600-\u06FF]/.test(latestUserMsg);
  const today = new Date();

  // ⚡ Language Selection Immediate Handling (Arabic / English)
  const cleanUserMsg = latestUserMsg.trim().toLowerCase();
  const isArabicSelection =
    latestUserMsg.includes('المتابعة باللغة العربية') ||
    cleanUserMsg === 'عربي' ||
    cleanUserMsg === 'العربية' ||
    cleanUserMsg === 'arabic';

  const isEnglishSelection =
    latestUserMsg.includes('Continue in English') ||
    cleanUserMsg === 'english' ||
    cleanUserMsg === 'en' ||
    cleanUserMsg === 'انجليزي' ||
    cleanUserMsg === 'إنجليزي';

  const getCleanGreeting = (name?: string, isEn?: boolean) => {
    if (!name) return '';
    const clean = name.trim();
    const lower = clean.toLowerCase();
    if (
      lower.includes('admin') ||
      lower === 'autours' ||
      lower.includes('autours admin') ||
      lower.includes('administrator') ||
      lower === 'surprice' ||
      lower.includes('company') ||
      lower.includes('supplier')
    ) {
      return '';
    }
    return isEn ? ` ${clean}` : ` أستاذ ${clean}`;
  };

  if (isArabicSelection) {
    const userGreeting = getCleanGreeting(currentUser?.name, false);
    return {
      reply: `أهلاً وسهلاً بك${userGreeting} في Autours! 🚗\nيسعدني مساعدتك لاختيار سيارتك الأنسب بأفضل سعر.\n\nما هي وجهتك؟ يرجى اختيار الدولة بالضغط على العلم:`,
      vehicles: [],
      searchCriteria: null,
      actionButtons: getCountryFlagButtons(false),
      showSearchWidget: false,
      searchWidgetData: {},
    };
  }

  if (isEnglishSelection) {
    const userGreeting = getCleanGreeting(currentUser?.name, true);
    return {
      reply: `Welcome${userGreeting} to Autours! 🚗\nGlad to help you choose the best rental car at top rates.\n\nWhere are you traveling? Please select your destination country:`,
      vehicles: [],
      searchCriteria: null,
      actionButtons: getCountryFlagButtons(true),
      showSearchWidget: false,
      searchWidgetData: {},
    };
  }

  // ⚡ General booking intent or greetings without destination
  const isGeneralGreeting =
    /^(مرحبا|مرحباً|أهلا|اهلا|أهلاً|سلام|السلام عليكم|مساء الخير|صباح الخير|هاي|hello|hi|hey|greetings)$/i.test(cleanUserMsg) ||
    /^(عاوز|عايز|اريد|أريد|محتاج|ودي|ابغى|ابغي|نبي|book|rent|i want to book|i want to rent)\s*(حجز|احجز|أحجز|سيارة|عربية|تأجير|استئجار|سياره|a car|car)?$/i.test(latestUserMsg.trim()) ||
    ['عاوز حجز', 'عايز حجز', 'اريد حجز', 'أريد حجز', 'حجز سيارة', 'حجز', 'احجز سيارة', 'book a car', 'rent a car', 'book car'].includes(cleanUserMsg);

  if (isGeneralGreeting) {
    const userGreeting = getCleanGreeting(currentUser?.name, isEnglish);
    if (isEnglish) {
      return {
        reply: `Welcome${userGreeting} to Autours! 🚗\nGlad to help you choose the best rental car at top rates.\n\nWhere are you traveling? Please select your destination country:`,
        vehicles: [],
        searchCriteria: null,
        actionButtons: getCountryFlagButtons(true),
        showSearchWidget: false,
        searchWidgetData: {},
      };
    } else {
      return {
        reply: `أهلاً وسهلاً بك${userGreeting} في Autours! 🚗\nيسعدني مساعدتك لاختيار سيارتك الأنسب بأفضل سعر.\n\nما هي وجهتك؟ يرجى اختيار الدولة بالضغط على العلم:`,
        vehicles: [],
        searchCriteria: null,
        actionButtons: getCountryFlagButtons(false),
        showSearchWidget: false,
        searchWidgetData: {},
      };
    }
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // ⚡ Check Airport or City Selection Directly (e.g. DXB, SHJ, AUH, DOH, Downtown Dubai, etc.)
  const matchedDest = matchLocationOrAirport(latestUserMsg);
  if (matchedDest && !latestUserMsg.includes('from') && !latestUserMsg.includes('من')) {
    const destName = isEnglish ? matchedDest.nameEn : matchedDest.nameAr;
    const isCity = matchedDest.type === 'city';
    const icon = isCity ? '🏙️' : '🛫';
    const confirmReply = isEnglish
      ? `${destName} selected! ${icon}\n\nPlease select your pickup & return dates/times to view available cars:`
      : `تم اختيار ${destName} بنجاح! ${icon}\n\nيرجى تحديد تواريخ وأوقات الاستلام والتسليم للبحث عن أفضل العروض:`;

    return {
      reply: confirmReply,
      vehicles: [],
      searchCriteria: {
        location: matchedDest.searchLabel,
        locationName: matchedDest.searchLabel,
        country: matchedDest.country.nameEn,
        currency,
      },
      actionButtons: [],
      showSearchWidget: true,
      searchWidgetData: {
        defaultLocation: matchedDest.searchLabel,
        dateFrom: todayStr,
      },
    };
  }

  // ⚡ Check Country Selection (e.g. "الإمارات", "UAE", "السعودية", "Saudi Arabia", "قطر", "Qatar", etc.)
  const matchedCountry = matchCountry(latestUserMsg);
  if (matchedCountry && !latestUserMsg.includes('from') && !latestUserMsg.includes('من')) {
    return {
      reply: formatLocationsAndAirportsText(matchedCountry, isEnglish),
      vehicles: [],
      searchCriteria: null,
      actionButtons: getLocationsAndAirportsButtons(matchedCountry, isEnglish),
      showSearchWidget: false,
      searchWidgetData: {},
    };
  }
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  const fourDays = new Date(today);
  fourDays.setDate(fourDays.getDate() + 4);
  const fourDaysStr = `${fourDays.getFullYear()}-${String(fourDays.getMonth() + 1).padStart(2, '0')}-${String(fourDays.getDate()).padStart(2, '0')}`;

  const sixDays = new Date(today);
  sixDays.setDate(sixDays.getDate() + 6);
  const sixDaysStr = `${sixDays.getFullYear()}-${String(sixDays.getMonth() + 1).padStart(2, '0')}-${String(sixDays.getDate()).padStart(2, '0')}`;

  const userInfoSummary = currentUser?.name
    ? `المستخدم مسجل: الاسم (${currentUser.name})، نوع الحساب (${currentUser.role})، الإيميل (${currentUser.email || 'غير متوفر'}).`
    : `المستخدم زائر لم يسجل دخوله بعد.`;

  // ⚡ Fetch Live Locations Data Directly from DB
  const locations = await fetchLocations();
  const dbContext = buildDynamicDatabaseContext(locations);

  const systemPrompt = `
أنت "المساعد الذكي لخدمة عملاء منصة أوتورز" (Autours AI Assistant) لتأجير السيارات عالمياً.

👤 بيانات العميل: ${userInfoSummary}
📅 تاريخ اليوم الحالي: ${todayStr}

💎 قواعد الأسلوب، اللباقة، واللغة (Tone, Politeness & Strict Professionalism):
1. **أسلوب راقي ومهذب**: تحدث بلغة عربية فصحى مبسطة، أنيقة ومهذبة للغاية (تليق بخدمة عملاء المنصات العالمية المرموقة)، وخالية تماماً من الألفاظ العامية أو الشعبية أو الابتذال.
2. **الالتزام الصارم باللغة**: 
   - إذا اختار العميل أو تحدث باللغة العربية، أكمل الحوار باللغة العربية الفصحى المهذبة.
   - إذا اختار العميل أو تحدث بالإنجليزية، التزم باللغة الإنجليزية الاحترافية واللبقة (Polite, concise, and articulate customer support English).
   - لأي لغة أخرى (فرنسي، تركي، روسي)، أجب بنفس لغة العميل باحترافية.
3. **الإيجاز والتنظيم**:
   - اجعل ردودك مختصرة، مرتبة وواضحة (استخدم النقاط والعلامات المنظمة).
   - تجنب الإطالة والنصوص الإنشائية المكررة أو أسلوب "س/ج" الآلي الجامد.
   - تحاور بذكاء وتفاعل باحترام مع العميل.

🧠 قواعد التعامل مع الوجهات والتواريخ (Strict No-Guessing & Realistic Travel Dates):
1. **⛔ ممنوع التخمين العشوائي (Strictly No Guessing)**:
   - لا تخمن تواريخ من عندك ولا تفترض أن العميل سيحجز اليوم أو غداً، فالعملاء يخططون لرحلاتهم مسبقاً.
   - إذا سأل العميل عن دولة أو مدينة فقط دون تحديد تواريخ (مثل "أريد سيارة في دبي", "سيارات تركيا", "الكويت", "spain", "argentina"):
     * رحب به بلباقة واحترافية وأكد له توفر الخدمة في تلك الوجهة.
     * اطلب منه تحديد تاريخ استلام السيارة والمدة المطلوبة والمدينة/المطار المفضل.
     * ⛔ إياك أن تضع وسم [SEARCH] إذا لم يحدد العميل التواريخ أو المدة بوضوح!
2. **✅ متى تضع وسم البحث [SEARCH: Location, DateFrom, DateTo]؟**:
   - تضع الوسم فقط وحصرياً إذا حدد العميل التواريخ أو المدة بوضوح مع الوجهة (مثال: "سيارات دبي من 15 إلى 20 أكتوبر" -> [SEARCH: Dubai, 2026-10-15, 2026-10-20]).
   - تتبع سياق الحوار (Context Memory): إذا ذكر العميل الوجهة في رسالة سابقة، ثم في الرسالة التالية حدد التاريخ (مثلاً: "من 15 إلى 20 أكتوبر")، اربط الوجهة السابقة بالتواريخ وضع الوسم فوراً.
   - اكتب اسم الوجهة بالإنجليزية المعيارية المطابقة للنظام (مثل: Dubai, Abu Dhabi, Kuwait, Turkey, Egypt, Morocco, Bahrain, Jordan, Georgia, Spain, Argentina).
3. **الإجابة على الأسئلة العامة والاستفسارات**:
   - إذا سأل عن عدد الشركات أو السيارات: وضّح باختصار أن أوتورز شبكة عالمية تضم مئات الموردين وآلاف السيارات المعتمدة في مختلف البلدان حول العالم.
   - إذا سأل عن المزايا والسياسات: وضّح باختصار (إلغاء مجاني 100% حتى قبل 24 ساعة، تأمين أساسي مشمول، والدفع عند الاستلام).
   - ⛔ لا تضع وسم [SEARCH] على الاستفسارات العامة.

🎯 بيانات وقواعد المنصة الحية المتاحة حالياً في قاعدة البيانات:
- عدد البلدان والوجهات المتوفرة فعلياً في قاعدة البيانات الحية: ${dbContext.totalCountries} دولة
${dbContext.summaryStr}
`;

  const modelsToTry = [
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
  ];

  const formattedContents = messages.slice(-8).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  let assistantResponseText = '';
  let foundVehicles: Vehicle[] = [];
  let searchCriteria: any = null;
  let actionButtons: ActionButton[] = [];

  for (const model of modelsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY_DIRECT}`,
        {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: formattedContents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 250,
            },
          }),
        }
      );

      clearTimeout(timeoutId);

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        let rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (rawText) {
          const searchMatch = rawText.match(/\[SEARCH:\s*([^,]+),\s*([^,]+),\s*([^\]]+)\]/i);
          if (searchMatch) {
            let locQuery = searchMatch[1].trim();
            const dFrom = normalizeDateStr(searchMatch[2].trim());
            const dTo = normalizeDateStr(searchMatch[3].trim());

            rawText = rawText.replace(/\[SEARCH:[^\]]+\]/gi, '').trim();

            const userName = currentUser?.name ? ` يا مستر ${currentUser.name}` : ' يا غالي';

            // 1. Resolve canonical English name if query has Arabic alias (e.g. "الكويت" -> "Kuwait")
            let canonicalName: string | null = null;
            for (const [ar, en] of Object.entries(ARABIC_DESTINATION_MAP)) {
              if (locQuery.toLowerCase().includes(ar.toLowerCase()) || ar.toLowerCase().includes(locQuery.toLowerCase())) {
                canonicalName = en;
                break;
              }
            }

            // 2. Try resolving target location object from locations list
            let targetLoc = resolveTargetLocation(locQuery, locations);
            if (!targetLoc && canonicalName) {
              targetLoc = resolveTargetLocation(canonicalName, locations);
            }

            // Multi-turn fallback: If locQuery didn't resolve directly, search previous user turns
            if (!targetLoc) {
              for (const m of [...messages].reverse()) {
                const prevMatch = resolveTargetLocation(m.content, locations);
                if (prevMatch) {
                  targetLoc = prevMatch;
                  break;
                }
              }
            }

            // 3. Search target priority:
            // First try specific branch ID or branch name, or country name, or canonical name, or locQuery
            const primarySearchTerm =
              targetLoc?.id || targetLoc?.name || targetLoc?.country || canonicalName || locQuery;

            let vehicles = await queryVehicles({
              locationIdOrName: primarySearchTerm,
              dateFrom: dFrom,
              dateTo: dTo,
              currency,
            });

            // Fallback 1: If 0 vehicles, try country name or canonical name
            const countryName = targetLoc?.country || canonicalName || locQuery;
            if ((!vehicles || vehicles.length === 0) && countryName && countryName !== primarySearchTerm) {
              const countryVehicles = await queryVehicles({
                locationIdOrName: countryName,
                dateFrom: dFrom,
                dateTo: dTo,
                currency,
              });
              if (countryVehicles && countryVehicles.length > 0) {
                vehicles = countryVehicles;
              }
            }

            // Fallback 2: If 0 vehicles, try raw locQuery
            if ((!vehicles || vehicles.length === 0) && locQuery && locQuery !== primarySearchTerm && locQuery !== countryName) {
              const directVehicles = await queryVehicles({
                locationIdOrName: locQuery,
                dateFrom: dFrom,
                dateTo: dTo,
                currency,
              });
              if (directVehicles && directVehicles.length > 0) {
                vehicles = directVehicles;
              }
            }

            if (!vehicles || vehicles.length === 0) {
              const displayLocation = targetLoc?.name || targetLoc?.city || countryName || locQuery;
              const isEnglish = !/[\u0600-\u06FF]/.test(latestUserMsg);
              if (isEnglish) {
                assistantResponseText = `We apologize${currentUser?.name ? ` Mr. ${currentUser.name}` : ''}, no available vehicles were found in **${displayLocation}** for the selected dates (**${dFrom} to ${dTo}**).\n\nYou may try different dates or choose from the suggested destinations below:`;
              } else {
                const userGreeting = currentUser?.name ? ` أستاذ ${currentUser.name}` : '';
                assistantResponseText = `نعتذر منك${userGreeting}، لم تتوفر سيارات شاغرة حالياً في **${displayLocation}** للفترة المحددة (**${dFrom} إلى ${dTo}**).\n\nيمكنك تجربة تواريخ أخرى أو اختيار إحدى الوجهات المقترحة:`;
              }
              actionButtons = getSmartActionButtons(locQuery, locations, currentUser);
              foundVehicles = [];
              searchCriteria = null;
              break;
            }

            searchCriteria = {
              location: targetLoc?.id || targetLoc?.name || countryName || locQuery,
              locationName: targetLoc?.name || `${targetLoc?.city || countryName || locQuery}`.trim(),
              dateFrom: dFrom,
              dateTo: dTo,
              startTime: '10:00',
              endTime: '10:00',
              currency,
            };
            foundVehicles = vehicles;
          }

          assistantResponseText = rawText;
          break;
        }
      }
    } catch (err) {
      console.warn(`Direct model ${model} error:`, err);
    }
  }

  if (!assistantResponseText) {
    const isEnglish = !/[\u0600-\u06FF]/.test(latestUserMsg);
    if (isEnglish) {
      assistantResponseText = `Welcome${currentUser?.name ? ` Mr. ${currentUser.name}` : ''}! 🚗✨ I am your Autours AI assistant. How can I assist you with your car rental today? Please specify your destination and preferred rental dates.`;
    } else {
      const userGreeting = currentUser?.name ? ` أستاذ ${currentUser.name}` : '';
      assistantResponseText = `أهلاً وسهلاً بك${userGreeting}! 🚗✨ يسعدني مساعدتك في حجز أفضل سيارات الإيجار مع أوتورز. يُرجى تزويدي بوجهة السفر وتواريخ الاستلام والتسليم المفضلة لنعرض لك أفضل الخيارات المتاحة.`;
    }
  }

  if (actionButtons.length === 0) {
    actionButtons = getSmartActionButtons(latestUserMsg, locations, currentUser);
  }

  // ⚡ 3. Real-Time Self Learning & Knowledge Accumulation
  const learningResult = learnFromConversation({
    userMessage: latestUserMsg,
    assistantReply: assistantResponseText,
    currentUser,
    existingUserMemory: userMemory,
  });

  // ⚡ 4. Automatically activate interactive In-Chat Search Widget if destination mentioned without dates or dates requested
  let showSearchWidget = false;
  let detectedLocation: string | undefined = undefined;

  if (foundVehicles.length === 0) {
    const locMatch = resolveTargetLocation(latestUserMsg, locations);
    if (locMatch) {
      detectedLocation = locMatch.name || locMatch.city || locMatch.country;
      showSearchWidget = true;
    } else {
      // check if any country or city alias in user message or in previous turn
      for (const [alias, canonical] of Object.entries(UNIVERSAL_DESTINATION_MAP)) {
        if (
          normalizeText(latestUserMsg).includes(normalizeText(alias)) ||
          isFuzzyMatch(latestUserMsg, alias)
        ) {
          detectedLocation = canonical;
          showSearchWidget = true;
          break;
        }
      }
    }
  }

    return {
      reply: assistantResponseText,
      vehicles: foundVehicles.slice(0, 40),
      searchCriteria,
      actionButtons: showSearchWidget ? [] : actionButtons,
      userMemory: learningResult.updatedUserMemory,
      showSearchWidget,
      searchWidgetData: showSearchWidget ? { defaultLocation: detectedLocation } : undefined,
    };
}
