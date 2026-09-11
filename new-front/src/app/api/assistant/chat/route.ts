import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/config/api';
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
  
  const urlsToTry = [
    `${BACKEND_URL}/api/get/locations`,
    `${BACKEND_URL}/get/locations`,
    'http://127.0.0.1:8000/api/get/locations',
    'http://127.0.0.1:8000/get/locations',
    'http://localhost:8000/api/get/locations',
    'http://localhost:8000/get/locations',
  ];

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

  const urlsToTry = [
    `${BACKEND_URL}/api/filter/vehicles`,
    `${BACKEND_URL}/filter/vehicles`,
    'http://127.0.0.1:8000/api/filter/vehicles',
    'http://127.0.0.1:8000/filter/vehicles',
    'http://localhost:8000/api/filter/vehicles',
    'http://localhost:8000/filter/vehicles',
  ];

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

  // 1. Account intent
  if (clean.includes('حسابي') || clean.includes('تسجيل') || clean.includes('دخول') || clean.includes('بروفايل')) {
    if (!currentUser) {
      return [
        { label: '👤 تسجيل الدخول', url: '/login', actionType: 'link' },
        { label: '📝 حساب جديد', url: '/register', actionType: 'link' },
      ];
    } else {
      return [
        { label: '👤 صفحتي الشخصية', url: '/profile', actionType: 'link' },
      ];
    }
  }

  // 2. Policy / Contact intent
  if (clean.includes('تأمين') || clean.includes('تامين') || clean.includes('شروط') || clean.includes('إلغاء') || clean.includes('دعم')) {
    return [
      { label: '💬 تواصل واتساب للدعم', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
      { label: '🇰🇼 سيارات الكويت (3 أيام)', promptText: 'عربيات الكويت من بكرة لمدة 3 أيام' },
      { label: '✈️ سيارات مطار دبي', promptText: 'عربيات مطار دبي من بكرة لمدة 3 أيام' },
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
          label: `✈️ ${b.name || b.city} (3 أيام)`,
          promptText: `عربيات ${b.name || b.city} من بكرة لمدة 3 أيام`,
        });
      }
    }
    const cityBranches = countryBranches.filter((l: any) => !airportBranches.includes(l));
    if (cityBranches.length > 0 && buttons.length < 3) {
      const b = cityBranches[0];
      buttons.push({
        label: `🏢 ${b.city || b.name} (3 أيام)`,
        promptText: `عربيات ${b.city || b.name} من بكرة لمدة 3 أيام`,
      });
    }
    buttons.push({
      label: `⚡ أرخص سيارة في ${matchedCountry} (5 أيام)`,
      promptText: `عربيات ${matchedCountry} من بكرة لمدة 5 أيام`,
    });
    return buttons.slice(0, 4);
  }

  // Default dynamic top suggestions
  return [
    { label: '🇰🇼 سيارات الكويت (3 أيام)', promptText: 'عربيات الكويت من بكرة لمدة 3 أيام' },
    { label: '✈️ مطار دبي (3 أيام)', promptText: 'عربيات مطار دبي من بكرة لمدة 3 أيام' },
    { label: '⚡ أرخص سيارة اقتصادية', promptText: 'أرخص عربية اقتصادية متاحة الأسبوع ده' },
    { label: '🇹🇷 سيارات تركيا (3 أيام)', promptText: 'عربيات تركيا من بكرة لمدة 3 أيام' },
  ];
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

  // If user provided an order number
  if (matchedOrderNumber) {
    const userName = currentUser?.name ? ` يا مستر ${currentUser.name}` : ' يا غالي';

    if (!customerToken && !currentUser) {
      return {
        reply: `يا هلا بيك${userName}! 🚗\n\nلإلغاء الحجز رقم **#${matchedOrderNumber}**، يرجى تسجيل الدخول أولاً بحسابك المسجل به الحجز للتحقق وتأكيد الإلغاء فوراً.`,
        actionButtons: [
          { label: '👤 تسجيل الدخول', url: '/login', actionType: 'link' },
          { label: '💬 محادثة واتساب الدعم', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
        ],
      };
    }

    try {
      const cancelRes = await fetch(`${BACKEND_URL}/api/cancel/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(customerToken ? { Authorization: `Bearer ${customerToken}` } : {}),
        },
        body: JSON.stringify({
          order_number: matchedOrderNumber,
          fareApproval: true,
        }),
      });

      const cancelData = await cancelRes.json().catch(() => ({}));

      if (cancelRes.ok && (cancelData.status === true || cancelData.status === 1)) {
        return {
          reply: `من عيوني${userName}! ✋\n\n✅ **تم إلغاء الحجز رقم #${matchedOrderNumber} بنجاح** في السيستم وحذفه من الحجوزات النشطة.\n\nتم إرسال إشعار فوري لإدارة المنصة وللشركة الموردة عبر الإيميل والواتساب. 🚗\n\nتحب نظبط حجز جديد ولا أساعدك في أي حاجة تانية؟ ✨`,
          actionButtons: [
            { label: '👤 عرض حجوزاتي', url: '/profile', actionType: 'link' },
            { label: '🚗 حجز سيارة جديدة', promptText: 'عربيات مطار دبي من بكرة لمدة 3 أيام' },
          ],
        };
      }

      const errMsg = cancelData.message || '';

      if (errMsg.includes('بدأت بالفعل') || errMsg.includes('started')) {
        return {
          reply: `عذراً${userName}! ⚠️\n\nلا يمكن إلغاء الحجز رقم **#${matchedOrderNumber}** نظراً لأن فترة الحجز قد بدأت بالفعل!`,
          actionButtons: [
            { label: '💬 تواصل مع الدعم الفني', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
            { label: '👤 صفحة حجوزاتي', url: '/profile', actionType: 'link' },
          ],
        };
      }

      if (errMsg.includes('24') || errMsg.includes('أقل من 24')) {
        return {
          reply: `عذراً${userName}! ⚠️\n\nلا يمكن إلغاء الحجز رقم **#${matchedOrderNumber}** نظراً لأنه متبقي أقل من 24 ساعة على موعد الاستلام (حسب سياسة شروط الإلغاء بالمنصة).\n\nتقدر تتواصل مع فريق الدعم لو عندك أي ظرف طارئ.`,
          actionButtons: [
            { label: '💬 محادثة واتساب الدعم', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
            { label: '👤 صفحة حجوزاتي', url: '/profile', actionType: 'link' },
          ],
        };
      }

      if (errMsg.includes('ملغي بالفعل') || errMsg.includes('Already Cancelled')) {
        return {
          reply: `الحجز رقم **#${matchedOrderNumber}** ملغي بالفعل مسبقاً في السيستم يا فندم! 👍`,
          actionButtons: [
            { label: '👤 صفحة حجوزاتي', url: '/profile', actionType: 'link' },
          ],
        };
      }

      if (cancelRes.status === 404 || errMsg.includes('العثور')) {
        return {
          reply: `عذراً${userName}، لم نتمكن من العثور على حجز بالرقم **#${matchedOrderNumber}** في حسابك. يرجى التأكد من رقم الحجز من صفحة البروفايل.`,
          actionButtons: [
            { label: '👤 صفحة حجوزاتي', url: '/profile', actionType: 'link' },
          ],
        };
      }

      if (cancelRes.status === 403 || errMsg.includes('Unauthorized') || errMsg.includes('غير مصرح')) {
        return {
          reply: `عذراً${userName}، هذا الحجز رقم **#${matchedOrderNumber}** غير تابع لهذا الحساب ولا يمكن إلغاؤه.`,
          actionButtons: [
            { label: '👤 صفحة حجوزاتي', url: '/profile', actionType: 'link' },
          ],
        };
      }

      return {
        reply: `عذراً${userName}، تعذر إلغاء الحجز رقم **#${matchedOrderNumber}**: ${errMsg || 'حدث خطأ غير متوقع'}. يرجى المحاولة من صفحة البروفايل أو التواصل مع الدعم.`,
        actionButtons: [
          { label: '👤 صفحة حجوزاتي', url: '/profile', actionType: 'link' },
          { label: '💬 محادثة واتساب الدعم', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
        ],
      };
    } catch (err: any) {
      console.error('Cancel booking error in chat route:', err);
      return {
        reply: `حدث خطأ أثناء محاولة إلغاء الحجز رقم **#${matchedOrderNumber}**. يرجى المحاولة من صفحة البروفايل.`,
        actionButtons: [{ label: '👤 صفحة حجوزاتي', url: '/profile', actionType: 'link' }],
      };
    }
  }

  // If cancellation intent without order number
  if (isCancelIntent) {
    const userName = currentUser?.name ? ` يا مستر ${currentUser.name}` : ' يا غالي';

    if (customerToken) {
      try {
        const rentalsRes = await fetch(`${BACKEND_URL}/api/get/rentals`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${customerToken}`,
          },
        });

        if (rentalsRes.ok) {
          const resData = await rentalsRes.json();
          const list = Array.isArray(resData) ? resData : (resData.data || []);
          const activeBookings = list.filter(
            (r: any) => Number(r.order_status) === 2 || Number(r.order_status) === 1
          );

          if (activeBookings.length === 1) {
            const single = activeBookings[0];
            const ordNum = single.order_number || ('ATR' + single.id);
            const carName = single.vehicle?.name || 'السيارة المحجوزة';
            return {
              reply: `يا هلا بيك${userName}! 🚗\n\nلقيت عندك حجز نشط برقم **#${ordNum}** (سيارة ${carName} - استلام ${single.start_date}).\n\nتحب ألغيهولك فوراً؟ اضغط على زر الإلغاء بالأسفل:`,
              actionButtons: [
                { label: `❌ تأكيد إلغاء #${ordNum}`, promptText: `الغي الحجز ده ${ordNum}` },
                { label: '👤 صفحة حجوزاتي', url: '/profile', actionType: 'link' },
              ],
            };
          } else if (activeBookings.length > 1) {
            const buttons: ActionButton[] = activeBookings.slice(0, 3).map((r: any) => {
              const num = r.order_number || ('ATR' + r.id);
              return {
                label: `❌ إلغاء #${num} (${r.vehicle?.name || 'سيارة'})`,
                promptText: `الغي الحجز ده ${num}`,
              };
            });
            buttons.push({ label: '👤 كل الحجوزات', url: '/profile', actionType: 'link' });

            return {
              reply: `يا هلا بيك${userName}! 🚗\nعندك أكثر من حجز نشط، اختر الحجز اللي تحب تلغيه:`,
              actionButtons: buttons,
            };
          } else {
            return {
              reply: `ما عندكش أي حجوزات نشطة حالياً قابلة للإلغاء في حسابك${userName}! 👍`,
              actionButtons: [
                { label: '👤 صفحة حجوزاتي', url: '/profile', actionType: 'link' },
                { label: '🚗 حجز سيارة جديدة', promptText: 'عربيات مطار دبي من بكرة لمدة 3 أيام' },
              ],
            };
          }
        }
      } catch (e) {
        console.warn('Failed to query user bookings for cancellation:', e);
      }
    }

    return {
      reply: `يا هلا بيك${userName}! 🚗\nلإلغاء أي حجز، يرجى تزويدي برقم الحجز كاملاً (مثال: **الغي الحجز UNATR0024**)، أو يمكنك الإلغاء مباشرة بنقرة زر من صفحة البروفايل!`,
      actionButtons: [
        { label: '👤 صفحة حجوزاتي', url: '/profile', actionType: 'link' },
        { label: '💬 محادثة واتساب الدعم', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
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
    const todayStr = formatDate(new Date());

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
      ? `المستخدم مسجل: الاسم (${currentUser.name})، نوع الحساب (${currentUser.role})، الإيميل (${currentUser.email || 'غير متوفر'}).`
      : `المستخدم زائر لم يسجل دخوله بعد.`;

    const systemPrompt = `
أنت "مساعد وصديق أوتورز الذكي" (Autours AI Assistant) لتأجير السيارات في جميع أنحاء العالم.

👤 ${userInfoSummary}
📅 تاريخ اليوم: ${todayStr}

🌐 الذكاء واللغات واللهجات (Multilingual & Global Intelligence):
- أنت ذكي جداً، لماح، وتفهم جميع لغات ولهجات العالم (العربية بجميع لهجاتها: مصرية، خليجية، كويتية، شامية، مغاربية، فرانكو، والإنجليزية، الفرنسية، الروسية، التركية، الألمانية، الإسبانية، الإيطالية، الأردية، وغيرها).
- رد دائماً بنفس لغة ولهجة المستخدم (لو كلمك بالإنجليزي رد عليه بالإنجليزي، لو بالفرنسي رد بالفرنسي، لو بالتركي رد بالتركي، لو بالعربي رد باللهجة المصرية اللطيفة والمرحة والخفيفة).

🧠 الفهم العبقري للأخطاء الإملائية والأسماء الشائعة والعامية للدول والمدن:
- أنت خبير وتفهم فوراً أسماء الدول والمدن حتى لو كُتبت بأخطاء إملائية أو حروف ناقصة أو مكررة أو بالعامية أو بألقابها وأسمائها الشائعة، مثل:
  * "الكوت" / "كويت" / "الكوايت" / "الدانة" -> Kuwait
  * "ترركيا" / "توركيا" / "تركية" / "turky" / "turkye" -> Turkey
  * "مسر" / "أم الدنيا" / "المحروسة" / "كايرو" / "cairo" -> Egypt
  * "دبى" / "دار الحي" / "dubay" -> Dubai
  * "ابوظبي" / "أبو ظبي" -> Abu Dhabi
  * "المغريب" / "كازا" / "مروك" / "moroco" -> Morocco
  * "الاردن" / "النشامى" / "عمّان" -> Jordan
  * "البحرين" / "بحرين" / "المنامة" / "bahrin" -> Bahrain
  * "جورجيا" / "تبليسي" / "باتومي" -> Georgia
  * "اسبانيا" / "أسبانيا" / "spane" / "espana" / "مدريد" / "برشلونة" -> Spain
  * "الارجنتين" / "الأرجنتين" / "argentine" -> Argentina
  * "امريكا" / "أمريكا" / "الولايات المتحدة" / "ميامي" / "usa" -> United States
  * "قطر" / "الدوحة" / "qater" -> Qatar
  * "عمان" / "سلطنة عمان" / "مسقط" -> Oman
  * "ايطاليا" / "إيطاليا" / "italie" / "روما" / "ميلان" -> Italy
  * "اليونان" / "اثينا" / "grece" -> Greece
  * "قبرص" / "لارنكا" / "cypre" -> Cyprus

${buildLearnedMemoryPrompt(userMemory)}

🎯 بيانات وقواعد المنصة الحية (مستخرجة مباشرة ولحظياً من قاعدة بيانات النظام):
- عدد البلدان والوجهات المتوفرة فعلياً في قاعدة البيانات الحية: ${dbContext.totalCountries} دولة
- قائمة البلدان والمطارات المتوفرة حالياً في السيستم:
${dbContext.summaryStr}

🎯 القواعد الصارمة للتعامل مع قاعدة البيانات:
1. ⚠️ عندما يطلب المستخدم أو يسأل عن دولة أو وجهة من قاعدة البيانات أعلاه دون تحديد التواريخ (مثلاً: "طب الكويت", "الكوت", "عايز عربية في مسر", "ترركيا", "المغرب", "عربيات دبي", "جورجيا", "spain", "argentina"):
   - ⛔ إياك أن تضع [SEARCH] أو تخترع تواريخ عشوائية من عندك!
   - ⛔ إياك أن تقول إن الدولة غير مدعومة طالما هي موجودة في قاعدة البيانات الحية أعلاه!
   - رحب به بحماس واسأله بوضوح ولطافة عن تاريخ الاستلام والمدة والمدينة/المطار المفضل في تلك الدولة.

2. ✅ متى تضع وسم [SEARCH: Location, DateFrom, DateTo]؟
   - تضع الوسم إذا حدد المستخدم التواريخ أو المدة مع الوجهة (مثلاً: "عربيات الكويت من بكرة لمدة 5 أيام" -> [SEARCH: Kuwait, ${formatDate(addDays(new Date(), 1))}, ${formatDate(addDays(new Date(), 6))}]).
   - 🧠 تتبع سياق المحادثة (Multi-turn Context): إذا كان المستخدم في الرسالة السابقة يتكلم عن وجهة معينة (مثلاً: "طب الكويت" أو "ترركيا") وفي الرسالة الحالية قال فقط: "من بكرا لمدة خمس ايام"، تذكر فوراً أن الوجهة المقصودة هي تلك الدولة وضع الوسم فوراً: [SEARCH: Kuwait, ${formatDate(addDays(new Date(), 1))}, ${formatDate(addDays(new Date(), 6))}]!
   - إذا طلب صراحة "أرخص سيارة اقتصادية الأسبوع ده" بدون تحديد وجهة: اعتبر دبي 'Dubai' وجهة افتراضية للأيام القادمة من ${formatDate(addDays(new Date(), 1))} إلى ${formatDate(addDays(new Date(), 4))}.
   - اكتب اسم الوجهة في الوسم دائماً بالاسم الإنجليزي المعياري المطابق لقاعدة البيانات (مثل Kuwait, Dubai, Turkey, Egypt, Morocco, Bahrain, Jordan, Georgia, Spain, Argentina).

3. لو المستخدم حيّاك أو رحب بيك (مثل "اهلا", "hello", "bonjour", "merhaba", "سلام", "صباح الخير"): رحب بيه بلطف واسأله ناوي يسافر فين ومحتاج عربية في أي بلد.

4. لو طلب دولة غير متوفرة إطلاقاً في قاعدة البيانات: اعتذر بلباقة واقترح عليه بعض الوجهات المتاحة حالياً في قاعدة البيانات الحية. ولا تضع [SEARCH] على وجهة غير مدعومة.

5. مزايا المنصة: إلغاء مجاني 100% حتى قبل 24 ساعة، تأمين أساسي مشمول، الدفع عند الاستلام.
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

                const userName = currentUser?.name ? ` يا مستر ${currentUser.name}` : ' يا غالي';

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
                  assistantResponseText = `عذراً${userName}! 🚗\n\nلم نعثر على سيارات شاغرة حالياً في ${displayLocation} للفترة المحددة (${dFrom} إلى ${dTo}).\n\nتقدر تجرب تغيير التواريخ أو تختار وجهة أخرى:`;
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
      const userName = currentUser?.name ? ` يا عم ${currentUser.name}` : ' يا غالي';
      assistantResponseText = `يا مرحب بيك${userName}! 🚗✨ أنا صديقك ومساعدك في أوتورز. قولي تحب نسافر فين أو محتاج عربية في أي بلد وتاريخ؟`;
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

    return NextResponse.json({
      reply: assistantResponseText,
      vehicles: foundVehicles.slice(0, 5),
      searchCriteria,
      actionButtons,
      userMemory: learningResult.updatedUserMemory,
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
