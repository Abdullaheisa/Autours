import { NextResponse } from 'next/server';
import { BACKEND_URL, CANDIDATE_BACKEND_URLS } from '@/config/api';
import { vehicleMapper } from '@/services/mappers/vehicleMapper';
import { buildLearnedMemoryPrompt, learnFromConversation, UserMemoryProfile } from '@/services/aiLearningService';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface CurrentUser {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  country?: string;
}

interface ChatRequestBody {
  messages: Message[];
  currency?: string;
  userLocale?: string;
  customerToken?: string | null;
  currentUser?: CurrentUser | null;
  userMemory?: UserMemoryProfile | null;
  currentSearchParams?: {
    location?: string;
    dateFrom?: string;
    dateTo?: string;
    startTime?: string;
    endTime?: string;
  };
}

interface ActionButton {
  label: string;
  url?: string;
  actionType?: 'link' | 'prompt' | 'whatsapp' | 'call';
  promptText?: string;
}

// In-Memory Fast Cache for Locations
let cachedLocations: any[] | null = null;
let lastLocationsFetchTime = 0;

async function getCachedLocations() {
  const now = Date.now();
  if (cachedLocations && cachedLocations.length > 0 && now - lastLocationsFetchTime < 300000) {
    return cachedLocations;
  }
  
  const urlsToTry = Array.from(
    new Set([
      'https://www.autours.net/api/backend/get/locations',
      'https://www.autours.net/api/backend/api/get/locations',
      'http://127.0.0.1:8000/api/get/locations',
      'http://localhost:8000/api/get/locations',
      `${BACKEND_URL}/api/get/locations`,
      `${BACKEND_URL}/get/locations`,
    ].filter(Boolean))
  );

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
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
function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ىئ]/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove Arabic Tashkeel
    .replace(/(.)\1{2,}/g, '$1$1') // Remove excessive duplicate characters
    .trim();
}

function levenshteinDistance(a: string, b: string): number {
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

function isFuzzyMatch(str1: string, str2: string, threshold = 0.72): boolean {
  if (!str1 || !str2) return false;
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  if (s1 === s2 || s1.includes(s2) || s2.includes(s1)) return true;

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
const UNIVERSAL_DESTINATION_MAP: Record<string, string> = {
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

  // 🇶🇦 Qatar
  'قطر': 'Qatar', 'qatar': 'Qatar', 'الدوحة': 'Doha', 'الدوحه': 'Doha', 'doha': 'Doha', 'doh': 'Doha', 'مطار حمد': 'Doha',

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

const LOCATION_ALIASES = UNIVERSAL_DESTINATION_MAP;

function buildDynamicDatabaseContext(locations: any[]) {
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

function resolveTargetLocation(query: string, locations: any[]): any | null {
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
  if (!dateStr) return formatDate(new Date());
  const clean = dateStr.trim();
  // Handle DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyy = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (ddmmyyyy) {
    const d = ddmmyyyy[1].padStart(2, '0');
    const m = ddmmyyyy[2].padStart(2, '0');
    const y = ddmmyyyy[3];
    return `${y}-${m}-${d}`;
  }
  // Handle YYYY-MM-DD
  const yyyymmdd = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (yyyymmdd) {
    const y = yyyymmdd[1];
    const m = yyyymmdd[2].padStart(2, '0');
    const d = yyyymmdd[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return clean;
}

// ── Query Real Backend Vehicles ───────────────────────────────────────────────
async function queryAutoursVehicles(params: {
  locationIdOrName: string | number;
  dateFrom: string;
  dateTo: string;
  currency: string;
}) {
  const validFrom = normalizeDateStr(params.dateFrom);
  const validTo = normalizeDateStr(params.dateTo);

  const payload: any = {
    pickupLoc: params.locationIdOrName,
    date_from: validFrom,
    date_to: validTo,
    time_from: '10:00',
    time_to: '10:00',
    currency: params.currency || 'AED',
    page: 1,
    per_page: 6,
  };

  const urlsToTry = Array.from(
    new Set([
      'https://www.autours.net/api/backend/filter/vehicles',
      'https://www.autours.net/api/backend/api/filter/vehicles',
      'http://127.0.0.1:8000/api/filter/vehicles',
      'http://localhost:8000/api/filter/vehicles',
      `${BACKEND_URL}/api/filter/vehicles`,
      `${BACKEND_URL}/filter/vehicles`,
    ].filter(Boolean))
  );

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

function getSmartActionButtons(
  userText: string,
  locations: any[] = [],
  currentUser?: CurrentUser | null
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
        { label: isEnglish ? '👤 My Profile' : '👤 صفحتي الشخصية', url: '/profile', actionType: 'link' },
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
          { label: '⚡ أفضل السيارات الاقتصادية', promptText: 'ما هي أفضل السيارات الاقتصادية المتاحة؟' },
        ];
  }

  // 3. Dynamic Destination Extraction from Live DB Locations
  let matchedCountry: string | null = null;
  for (const [alias, canonical] of Object.entries(UNIVERSAL_DESTINATION_MAP)) {
    if (
      clean.includes(alias.toLowerCase()) ||
      alias.toLowerCase().includes(clean)
    ) {
      matchedCountry = canonical;
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

  // Default dynamic top suggestions
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

// ── Helper: Fetch customer bookings with fallback URLs ─────────────────────────
async function fetchCustomerBookings(token: string): Promise<any[]> {
  const candidateUrls = Array.from(
    new Set([
      'http://127.0.0.1:8000/api/get/rentals?per_page=20',
      'http://localhost:8000/api/get/rentals?per_page=20',
      `${BACKEND_URL}/api/backend/get/rentals?per_page=20`,
      `${BACKEND_URL}/api/get/rentals?per_page=20`,
      `${BACKEND_URL}/get/rentals?per_page=20`,
      'https://www.autours.net/api/backend/get/rentals?per_page=20',
      'https://www.autours.net/api/get/rentals?per_page=20',
    ].filter(Boolean))
  );

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) continue;

      const text = await res.text();
      if (text.trim().startsWith('<')) continue;

      const data = JSON.parse(text);
      const list = Array.isArray(data) ? data : (data?.data || []);
      if (Array.isArray(list)) {
        return list;
      }
    } catch {
      // try next URL
    }
  }

  return [];
}

// ── Helper: Call Cancel Booking API with fallback URLs ────────────────────────
async function executeCancelBooking(
  orderNumber: string,
  token?: string | null
): Promise<{ ok: boolean; status: number; message: string; data?: any }> {
  const candidateUrls = Array.from(
    new Set([
      'http://127.0.0.1:8000/api/cancel/booking',
      'http://localhost:8000/api/cancel/booking',
      `${BACKEND_URL}/api/backend/cancel/booking`,
      `${BACKEND_URL}/api/cancel/booking`,
      'https://www.autours.net/api/backend/cancel/booking',
      'https://www.autours.net/api/cancel/booking',
    ].filter(Boolean))
  );

  let lastStatus = 500;
  let lastMessage = '';

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          order_number: orderNumber,
          fareApproval: true,
        }),
      });

      const text = await res.text();
      if (text.trim().startsWith('<')) continue;

      const json = JSON.parse(text);
      const isSuccess = res.ok && (json.status === true || json.status === 1);
      const msg = json.message || json.msg || '';

      if (isSuccess) {
        return { ok: true, status: res.status, message: msg, data: json.data };
      }

      return { ok: false, status: res.status, message: msg, data: json };
    } catch (err: any) {
      lastMessage = err?.message || 'Connection error';
    }
  }

  return { ok: false, status: lastStatus, message: lastMessage || 'Unable to connect to booking server' };
}

// ── Real Booking Cancellation Resolver ───────────────────────────────────────
async function handleCancellationRequest(
  userText: string,
  currentUser: CurrentUser | null | undefined,
  customerToken?: string | null
): Promise<{ reply: string; actionButtons?: ActionButton[] } | null> {
  const isCancelIntent =
    userText.match(/(الغي|إلغاء|الغاء|الغى|ألغي|كنسل|cancel|cancelling|cancellation)/i) !== null;

  // Extract order number e.g. UNATR0024, AEATR0001, ATR0024, #UNATR0024, or tokens after "الحجز"
  let orderMatch = userText.match(/([A-Za-z0-9]{2,6}ATR\d{2,7}|ATR\d{2,7})/i);
  if (!orderMatch) {
    orderMatch = userText.match(/(?:الحجز|حجز|order|booking|#)\s*(?:ده|رقم|دا)?\s*([A-Za-z0-9_-]{4,25})/i);
  }

  const matchedOrderNumber = orderMatch ? orderMatch[1].toUpperCase().replace(/^#/, '') : null;

  if (!isCancelIntent && !matchedOrderNumber) {
    return null;
  }

  const isEnglish = !/[\u0600-\u06FF]/.test(userText);
  const userGreetingAr = currentUser?.name ? ` أستاذ ${currentUser.name}` : '';
  const userGreetingEn = currentUser?.name ? ` Mr. ${currentUser.name}` : '';

  // 1. If user gave an order number to cancel
  if (matchedOrderNumber && (isCancelIntent || userText.includes(matchedOrderNumber))) {
    if (!customerToken && !currentUser) {
      return {
        reply: isEnglish
          ? `Hello${userGreetingEn}! 🚗\n\nTo cancel booking **#${matchedOrderNumber}**, please sign in to your account first so we can verify your booking.`
          : `أهلاً بك${userGreetingAr}! 🚗\n\nلإلغاء الحجز رقم **#${matchedOrderNumber}**، يرجى تسجيل الدخول أولاً بحسابك للتحقق وتأكيد الإلغاء.`,
        actionButtons: [
          { label: isEnglish ? '👤 Sign In' : '👤 تسجيل الدخول', url: '/login', actionType: 'link' },
          { label: isEnglish ? '💬 WhatsApp Support' : '💬 محادثة واتساب الدعم', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
        ],
      };
    }

    try {
      const cancelRes = await executeCancelBooking(matchedOrderNumber, customerToken);

      if (cancelRes.ok) {
        return {
          reply: isEnglish
            ? `✅ **Booking #${matchedOrderNumber} has been successfully cancelled.**\n\nA confirmation notification has been sent to our team and the supplier company via email and WhatsApp. 🚗\n\nHow else may I assist you today?`
            : `✅ **تم إلغاء الحجز رقم #${matchedOrderNumber} بنجاح.**\n\nتم تحديث حالة الحجز في النظام وحذفه من الحجوزات النشطة وإرسال إشعار فوري لإدارة المنصة وللشركة الموردة عبر البريد الإلكتروني والواتساب. 🚗\n\nهل ترغب في المساعدة بأي حجز أو استفسار آخر؟ ✨`,
          actionButtons: [
            { label: isEnglish ? '👤 My Bookings' : '👤 صفحة حجوزاتي', url: '/profile', actionType: 'link' },
            { label: isEnglish ? '🚗 Book a New Car' : '🚗 حجز سيارة جديدة', promptText: isEnglish ? 'Show cars available at Dubai Airport for 3 days' : 'سيارات متاحة في مطار دبي لمدة 3 أيام' },
          ],
        };
      }

      const errMsg = cancelRes.message || '';

      // Reason: Less than 24 hours
      if (errMsg.includes('24') || errMsg.includes('أقل من 24') || errMsg.toLowerCase().includes('hours')) {
        return {
          reply: isEnglish
            ? `❌ **Cannot cancel booking #${matchedOrderNumber}**\n\n**Reason:** Less than 24 hours remain before pickup time (per platform cancellation policy).\n\nIf you have an emergency or need special assistance, please reach out directly to our support team.`
            : `❌ **تعذر إلغاء الحجز رقم #${matchedOrderNumber}**\n\n**السبب:** متبقي أقل من 24 ساعة على موعد الاستلام المحدد (وفقاً لشروط وسياسة الإلغاء بالمنصة).\n\nإذا كان لديك ظرف طارئ، يمكنك التواصل مباشرة مع فريق الدعم عبر الواتساب للمساعدة.`,
          actionButtons: [
            { label: isEnglish ? '💬 WhatsApp Support' : '💬 محادثة واتساب الدعم', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
            { label: isEnglish ? '👤 My Bookings' : '👤 صفحة حجوزاتي', url: '/profile', actionType: 'link' },
          ],
        };
      }

      // Reason: Period started
      if (errMsg.includes('بدأت بالفعل') || errMsg.toLowerCase().includes('started')) {
        return {
          reply: isEnglish
            ? `❌ **Cannot cancel booking #${matchedOrderNumber}**\n\n**Reason:** The rental period has already started.\n\nBookings cannot be cancelled after the rental period begins. Please contact support for help.`
            : `❌ **تعذر إلغاء الحجز رقم #${matchedOrderNumber}**\n\n**السبب:** فترة إيجار السيارة قد بدأت بالفعل ولا يمكن إلغاء الحجز بعد البدء.\n\nيمكنك التواصل مع فريق الدعم للمساعدة.`,
          actionButtons: [
            { label: isEnglish ? '💬 WhatsApp Support' : '💬 محادثة واتساب الدعم', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
            { label: isEnglish ? '👤 My Bookings' : '👤 صفحة حجوزاتي', url: '/profile', actionType: 'link' },
          ],
        };
      }

      // Reason: Already cancelled
      if (errMsg.includes('Already Cancelled') || errMsg.includes('ملغي')) {
        return {
          reply: isEnglish
            ? `ℹ️ **Booking #${matchedOrderNumber} is already cancelled** in our system.`
            : `ℹ️ **الحجز رقم #${matchedOrderNumber} ملغي بالفعل مسبقاً** في النظام.`,
          actionButtons: [
            { label: isEnglish ? '👤 My Bookings' : '👤 صفحة حجوزاتي', url: '/profile', actionType: 'link' },
          ],
        };
      }

      // Reason: Unauthorized
      if (cancelRes.status === 403 && (errMsg.includes('Unauthorized') || errMsg.includes('غير مصرح'))) {
        return {
          reply: isEnglish
            ? `❌ **Cannot cancel booking #${matchedOrderNumber}**\n\n**Reason:** You are not authorized to cancel this booking or it belongs to a different account.`
            : `❌ **تعذر إلغاء الحجز رقم #${matchedOrderNumber}**\n\n**السبب:** ليس لديك صلاحية لإلغاء هذا الحجز أو أنه مسجل بحساب آخر.`,
          actionButtons: [
            { label: isEnglish ? '👤 My Bookings' : '👤 صفحة حجوزاتي', url: '/profile', actionType: 'link' },
          ],
        };
      }

      // Reason: Not found
      if (cancelRes.status === 404 || errMsg.includes('العثور') || errMsg.toLowerCase().includes('not found')) {
        return {
          reply: isEnglish
            ? `❌ **Booking #${matchedOrderNumber} not found**\n\n**Reason:** No booking with this reference number was found in your account. Please check your booking number in your profile.`
            : `❌ **لم نتمكن من العثور على حجز برقم #${matchedOrderNumber}**\n\n**السبب:** لم يتم العثور على حجز بهذا الرقم في حسابك. يرجى مراجعة رقم الحجز من صفحة حسابك.`,
          actionButtons: [
            { label: isEnglish ? '👤 My Bookings' : '👤 صفحة حجوزاتي', url: '/profile', actionType: 'link' },
          ],
        };
      }

      // Reason: Fare approval required
      if (errMsg.includes('fare') || errMsg.includes('رسوم')) {
        return {
          reply: isEnglish
            ? `⚠️ **Cancellation Fee Applies**\n\n**Reason:** A cancellation fee applies to booking #${matchedOrderNumber}. Please confirm the cancellation directly from your Profile page or contact support.`
            : `⚠️ **توجد رسوم إلغاء**\n\n**السبب:** توجد رسوم إلغاء مقررة على الحجز رقم #${matchedOrderNumber}. يرجى تأكيد الإلغاء من صفحة حسابك أو التواصل مع الدعم.`,
          actionButtons: [
            { label: isEnglish ? '👤 My Bookings' : '👤 صفحة حجوزاتي', url: '/profile', actionType: 'link' },
            { label: isEnglish ? '💬 WhatsApp Support' : '💬 محادثة واتساب الدعم', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
          ],
        };
      }

      // General error with exact reason
      return {
        reply: isEnglish
          ? `❌ **Could not cancel booking #${matchedOrderNumber}**\n\n**Reason:** ${errMsg || 'The booking system rejected the request'}. Please try managing it from your profile or contact support.`
          : `❌ **تعذر إلغاء الحجز رقم #${matchedOrderNumber}**\n\n**السبب:** ${errMsg || 'حدث خطأ في النظام أثناء معالجة الإلغاء'}. يرجى المحاولة من صفحة حسابك أو التواصل مع فريق الدعم.`,
        actionButtons: [
          { label: isEnglish ? '👤 My Bookings' : '👤 صفحة حجوزاتي', url: '/profile', actionType: 'link' },
          { label: isEnglish ? '💬 WhatsApp Support' : '💬 محادثة واتساب الدعم', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
        ],
      };
    } catch (err: any) {
      console.error('Cancel booking error in chat route:', err);
      return {
        reply: isEnglish
          ? `❌ An unexpected error occurred while attempting to cancel booking **#${matchedOrderNumber}**. Please try from your profile.`
          : `❌ حدث خطأ غير متوقع أثناء محاولة إلغاء الحجز رقم **#${matchedOrderNumber}**. يرجى المحاولة من صفحة حسابك.`,
        actionButtons: [{ label: isEnglish ? '👤 My Bookings' : '👤 صفحة حجوزاتي', url: '/profile', actionType: 'link' }],
      };
    }
  }

  // 2. If user requested cancellation without providing an order number (e.g. "الغى حجز" / "cancel booking")
  if (isCancelIntent) {
    if (!customerToken) {
      return {
        reply: isEnglish
          ? `Hello${userGreetingEn}! 🚗\n\nTo cancel a booking, please sign in to your account first so I can view your reservations and assist you.`
          : `أهلاً بك${userGreetingAr}! 🚗\n\nلإلغاء حجز، يرجى تسجيل الدخول أولاً بحسابك حتى أتمكن من عرض حجوزاتك ومساعدتك في الإلغاء.`,
        actionButtons: [
          { label: isEnglish ? '👤 Sign In' : '👤 تسجيل الدخول', url: '/login', actionType: 'link' },
          { label: isEnglish ? '💬 WhatsApp Support' : '💬 محادثة واتساب الدعم', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
        ],
      };
    }

    try {
      const list = await fetchCustomerBookings(customerToken);

      if (!list || list.length === 0) {
        return {
          reply: isEnglish
            ? `You don't have any bookings in your account at the moment.`
            : `لا توجد لديك أي حجوزات مسجلة في حسابك حالياً.`,
          actionButtons: [
            { label: isEnglish ? '👤 My Profile' : '👤 صفحة حسابي', url: '/profile', actionType: 'link' },
            { label: isEnglish ? '🚗 Book a Car' : '🚗 حجز سيارة جديدة', promptText: isEnglish ? 'Show cars available at Dubai Airport for 3 days' : 'سيارات متاحة في مطار دبي لمدة 3 أيام' },
          ],
        };
      }

      // Bring options for the last 3 bookings
      const last3 = list.slice(0, 3);

      const formatStatus = (s: number | string) => {
        const num = Number(s);
        if (num === 1) return { en: 'Issued', ar: 'تم الإصدار' };
        if (num === 2) return { en: 'Confirmed', ar: 'مؤكد' };
        if (num === 3) return { en: 'Cancelled', ar: 'ملغي' };
        if (num === 4) return { en: 'Pending', ar: 'قيد الانتظار' };
        if (num === 5) return { en: 'Rejected', ar: 'مرفوض' };
        if (num === 6) return { en: 'Pending Payment', ar: 'بانتظار الدفع' };
        return { en: 'Active', ar: 'نشط' };
      };

      const bookingLines = last3
        .map((r: any, idx: number) => {
          const ord = r.order_number || ('#ATR' + r.id);
          const cleanOrd = ord.startsWith('#') ? ord : `#${ord}`;
          const car = r.vehicle?.name || 'Car Rental';
          const pickupDate = r.start_date ? `${r.start_date}${r.start_time ? ` (${r.start_time})` : ''}` : 'N/A';
          const st = formatStatus(r.order_status);
          return isEnglish
            ? `${idx + 1}. **${cleanOrd}** - ${car}\n   📅 Pickup: ${pickupDate} | Status: **${st.en}**`
            : `${idx + 1}. **${cleanOrd}** - ${car}\n   📅 موعد الاستلام: ${pickupDate} | الحالة: **${st.ar}**`;
        })
        .join('\n\n');

      const buttons: ActionButton[] = last3.map((r: any) => {
        const ord = r.order_number || ('ATR' + r.id);
        const cleanOrd = ord.replace(/^#/, '');
        return {
          label: isEnglish ? `❌ Cancel #${cleanOrd}` : `❌ إلغاء #${cleanOrd}`,
          promptText: isEnglish ? `Cancel booking #${cleanOrd}` : `إلغاء الحجز #${cleanOrd}`,
        };
      });

      buttons.push({
        label: isEnglish ? '👤 My Bookings' : '👤 صفحة حجوزاتي',
        url: '/profile',
        actionType: 'link',
      });

      return {
        reply: isEnglish
          ? `Here are your last ${last3.length} bookings. Which one would you like to cancel?\n\n${bookingLines}\n\nClick one of the buttons below to proceed:`
          : `فيما يلي آخر ${last3.length} حجوزات في حسابك، يرجى اختيار الحجز المراد إلغاؤه:\n\n${bookingLines}\n\nيمكنك الضغط على زر الإلغاء أدناه:`,
        actionButtons: buttons,
      };
    } catch (e) {
      console.warn('Failed to query user bookings for cancellation:', e);
    }

    return {
      reply: isEnglish
        ? `To cancel a booking, please provide your booking number (e.g., **Cancel booking UNATR0024**), or manage it directly from your Profile page.`
        : `لإلغاء أي حجز، يرجى تزويدي برقم الحجز كاملاً (مثال: **إلغاء الحجز UNATR0024**)، أو يمكنك الإلغاء مباشرة من صفحة حسابك.`,
      actionButtons: [
        { label: isEnglish ? '👤 My Bookings' : '👤 صفحة حجوزاتي', url: '/profile', actionType: 'link' },
        { label: isEnglish ? '💬 WhatsApp Support' : '💬 محادثة واتساب الدعم', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
      ],
    };
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body: ChatRequestBody = await request.json();
    const { messages, currency = 'AED', currentUser, currentSearchParams, customerToken, userMemory } = body;

    const authHeader = request.headers.get('authorization') || '';
    const headerToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const effectiveToken = customerToken || headerToken;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const latestUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const isEnglish = !/[\u0600-\u06FF]/.test(latestUserMsg);
    const todayStr = formatDate(new Date());

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

    if (isArabicSelection) {
      const userGreeting = currentUser?.name ? ` يا ${currentUser.name}` : ' يا غالي';
      return NextResponse.json({
        reply: `أهلاً وسهلاً بك${userGreeting} في **Autours**! 🚗✨\n\nأنا صديقك ومساعدك الشخصي للرحلات، ومعاك خطوة بخطوة عشان تختار السيارة الأنسب لك بأفضل سعر وبدون أي تعقيد.\n\nحابب تسافر فين أو إيه المدينة أو المطار اللي ناوي تزورها؟`,
        vehicles: [],
        searchCriteria: null,
        actionButtons: [],
        showSearchWidget: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (isEnglishSelection) {
      const userGreeting = currentUser?.name ? ` ${currentUser.name}` : '';
      return NextResponse.json({
        reply: `Welcome${userGreeting} to **Autours**! 🚗✨\n\nI'm your personal assistant and travel companion. I'll guide you step-by-step to find the perfect car for your trip at the best rate.\n\nWhere are you planning to travel, or which city/airport do you have in mind for pick-up?`,
        vehicles: [],
        searchCriteria: null,
        actionButtons: [],
        showSearchWidget: false,
        timestamp: new Date().toISOString(),
      });
    }

    // ⚡ General booking intent without destination (e.g. "عاوز حجز", "محتاج سيارة", "book a car")
    const isGeneralBookingIntent =
      /^(عاوز|عايز|اريد|أريد|محتاج|ودي|ابغى|ابغي|نبي|book|rent|i want to book|i want to rent)\s*(حجز|احجز|أحجز|سيارة|عربية|تأجير|استئجار|سياره|a car|car)?$/i.test(latestUserMsg.trim()) ||
      ['عاوز حجز', 'عايز حجز', 'اريد حجز', 'أريد حجز', 'حجز سيارة', 'حجز', 'احجز سيارة', 'book a car', 'rent a car', 'book car'].includes(cleanUserMsg);

    if (isGeneralBookingIntent) {
      if (isEnglish) {
        return NextResponse.json({
          reply: `With pleasure! Which city or airport would you like to pick up the car from? (e.g. Dubai, Istanbul, Cairo, Kuwait...)`,
          vehicles: [],
          searchCriteria: null,
          actionButtons: [],
          showSearchWidget: false,
          timestamp: new Date().toISOString(),
        });
      } else {
        return NextResponse.json({
          reply: `من عيوني يا غالي! تحب تستلم السيارة في أي مدينة أو مطار؟ (مثلاً: دبي، إسطنبول، القاهرة، الكويت...)`,
          vehicles: [],
          searchCriteria: null,
          actionButtons: [],
          showSearchWidget: false,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // ⚡ 1. Try Real Booking Cancellation First (if cancel intent or order number present)
    const cancelResolution = await handleCancellationRequest(latestUserMsg, currentUser, effectiveToken);
    if (cancelResolution) {
      return NextResponse.json({
        reply: cancelResolution.reply,
        vehicles: [],
        searchCriteria: null,
        actionButtons: cancelResolution.actionButtons || [],
        timestamp: new Date().toISOString(),
      });
    }

    // ⚡ 2. AI Generation via Gemini
    const locations = await getCachedLocations();
    const dbContext = buildDynamicDatabaseContext(locations);
    const FALLBACK_KEY_B64 = 'QVEuQWI4Uk42SmlGUWNnQjFCOWpUcHhKTXNsT19KMjJNNUlwWnV4LURGaFg4RnFIa1ZHTUE=';
    const geminiApiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      Buffer.from(FALLBACK_KEY_B64, 'base64').toString('utf8');

    let assistantResponseText = '';
    let foundVehicles: any[] = [];
    let searchCriteria: any = null;
    let actionButtons: ActionButton[] = [];

    const userInfoSummary = currentUser?.name
      ? `بيانات العميل: الاسم (${currentUser.name})، نوع الحساب (${currentUser.role})، البريد الإلكتروني (${currentUser.email || 'غير متوفر'}).`
      : `العميل زائر لم يسجل دخوله بعد.`;

    const systemPrompt = `
أنت "المساعد الذكي لخدمة عملاء منصة أوتورز" (Autours AI Assistant) لتأجير السيارات عالمياً.

👤 ${userInfoSummary}
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

${buildLearnedMemoryPrompt(userMemory)}

🎯 بيانات وقواعد المنصة الحية (مستخرجة مباشرة ولحظياً من قاعدة بيانات النظام):
- عدد البلدان والوجهات المتوفرة فعلياً في قاعدة البيانات الحية: ${dbContext.totalCountries} دولة
- قائمة البلدان والمطارات المتوفرة حالياً في السيستم:
${dbContext.summaryStr}
`;

    if (geminiApiKey) {
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

      for (const model of modelsToTry) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
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

                // 1. Resolve canonical English name if query has destination alias (e.g. "الكويت" -> "Kuwait")
                let canonicalName: string | null = null;
                for (const [alias, canonical] of Object.entries(UNIVERSAL_DESTINATION_MAP)) {
                  if (
                    locQuery.toLowerCase().includes(alias.toLowerCase()) ||
                    alias.toLowerCase().includes(locQuery.toLowerCase())
                  ) {
                    canonicalName = canonical;
                    break;
                  }
                }

                // 2. Try resolving target location object from locations list
                let targetLoc = resolveTargetLocation(locQuery, locations);
                if (!targetLoc && canonicalName) {
                  targetLoc = resolveTargetLocation(canonicalName, locations);
                }

                // Multi-turn Context fallback: If locQuery didn't match directly, check previous messages
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

                let vehicles = await queryAutoursVehicles({
                  locationIdOrName: primarySearchTerm,
                  dateFrom: dFrom,
                  dateTo: dTo,
                  currency,
                });

                // Fallback 1: If 0 vehicles, try country name or canonical name
                const countryName = targetLoc?.country || canonicalName || locQuery;
                if ((!vehicles || vehicles.length === 0) && countryName && countryName !== primarySearchTerm) {
                  const countryVehicles = await queryAutoursVehicles({
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
                  const directVehicles = await queryAutoursVehicles({
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
              } else {
                // User asked about a destination without dates -> attach dynamic destination buttons
                if (actionButtons.length === 0) {
                  actionButtons = getSmartActionButtons(latestUserMsg, locations, currentUser);
                }
              }

              assistantResponseText = rawText;
              break;
            }
          }
        } catch (err) {
          console.warn(`Model ${model} execution error:`, err);
        }
      }
    }

    if (!assistantResponseText) {
      if (isEnglish) {
        assistantResponseText = `Welcome${currentUser?.name ? ` Mr. ${currentUser.name}` : ''}! 🚗✨ I am your Autours AI assistant. How can I assist you with your car rental today? Please specify your destination and preferred rental dates.`;
      } else {
        const userGreeting = currentUser?.name ? ` أستاذ ${currentUser.name}` : '';
        assistantResponseText = `أهلاً وسهلاً بك${userGreeting}! 🚗✨ يسعدني مساعدتك في حجز أفضل سيارات الإيجار مع أوتورز. يُرجى تزويدي بوجهة السفر وتواريخ الاستلام والتسليم المفضلة لنعرض لك أفضل الخيارات المتاحة.`;
      }
    }

    if (actionButtons.length === 0 && foundVehicles.length === 0) {
      actionButtons = getSmartActionButtons(latestUserMsg, locations, currentUser);
    }

    // ⚡ 3. Real-Time Self Learning & Knowledge Accumulation
    const learningResult = learnFromConversation({
      userMessage: latestUserMsg,
      assistantReply: assistantResponseText,
      currentUser,
      existingUserMemory: userMemory,
    });

    // ⚡ 4. Activate interactive In-Chat Search Widget ONLY when a destination/location is identified
    let showSearchWidget = false;
    let detectedLocation: string | undefined = undefined;

    if (foundVehicles.length === 0) {
      const locMatch = resolveTargetLocation(latestUserMsg, locations);
      if (locMatch) {
        detectedLocation = locMatch.name || locMatch.city || locMatch.country;
        showSearchWidget = true;
      } else {
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

    // Suppress suggestion chips/buttons whenever vehicles are displayed or interactive search widget is active
    if (showSearchWidget || foundVehicles.length > 0) {
      actionButtons = [];
    }

    return NextResponse.json({
      reply: assistantResponseText,
      vehicles: foundVehicles.slice(0, 5),
      searchCriteria,
      actionButtons,
      userMemory: learningResult.updatedUserMemory,
      showSearchWidget,
      searchWidgetData: showSearchWidget ? { defaultLocation: detectedLocation } : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Chat Assistant Error:', error);
    return NextResponse.json(
      {
        reply: 'حدث خطأ مؤقت، يرجى المحاولة مرة أخرى.',
        vehicles: [],
        error: error.message,
      },
      { status: 500 }
    );
  }
}
