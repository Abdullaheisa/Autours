import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/config/api';
import { vehicleMapper } from '@/services/mappers/vehicleMapper';

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
  if (cachedLocations && now - lastLocationsFetchTime < 300000) {
    return cachedLocations;
  }
  try {
    const res = await fetch(`${BACKEND_URL}/get/locations`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      cachedLocations = await res.json();
      lastLocationsFetchTime = now;
      return cachedLocations || [];
    }
  } catch {
    // fallback
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

// ── Location Resolution & Alias Dictionary ───────────────────────────────────
const LOCATION_ALIASES: Record<string, string[]> = {
  // Kuwait
  'Kuwait': ['الكويت', 'الكويتيه', 'كويت', 'kuwait', 'kwi', 'مطار الكويت', 'مطار الكويت الدولي', 'الفروانية', 'حولي', 'الري', 'al rai', 'العاصمة'],

  // UAE
  'Dubai': ['دبي', 'دبى', 'dubai', 'dxb', 'مطار دبي', 'مطار دبي الدولي'],
  'Abu Dhabi': ['ابو ظبي', 'أبوظبي', 'أبو ظبي', 'ابوظبي', 'abu dhabi', 'auh', 'مطار ابو ظبي', 'البطين', 'al bateen', 'الراحة', 'al raha'],
  'Sharjah': ['الشارقة', 'الشارقه', 'شارقة', 'sharjah', 'shj'],
  'United Arab Emirates': ['الإمارات', 'الامارات', 'uae', 'united arab emirates'],

  // Morocco
  'Casablanca': ['كازابلانكا', 'الدار البيضاء', 'الدارالبيضاء', 'casablanca', 'cmn', 'مطار كازابلانكا', 'محمد الخامس'],
  'Marrakech': ['مراكش', 'marrakech', 'marrakesh', 'rak', 'مطار مراكش'],
  'Tangier': ['طنجة', 'طنجه', 'tangier', 'tng', 'ابن بطوطة', 'ابن بطوطه'],
  'Agadir': ['أكادير', 'اكادير', 'agadir', 'aga', 'المسيرة', 'المسيره'],
  'Fez': ['فاس', 'fez', 'fes'],
  'Morocco': ['المغرب', 'موروكو', 'morocco', 'maroc'],

  // Egypt
  'Cairo': ['القاهرة', 'القاهره', 'cairo', 'cai', 'مطار القاهرة'],
  'Hurghada': ['الغردقة', 'الغردقه', 'hurghada', 'hrg'],
  'Sharm El Sheikh': ['شرم الشيخ', 'شرم', 'sharm', 'sharm el sheikh', 'ssh'],
  'Egypt': ['مصر', 'egypt'],

  // Turkey
  'Istanbul': ['اسطنبول', 'إسطنبول', 'istanbul', 'ist', 'saw', 'صبيحة', 'مطار اسطنبول'],
  'Antalya': ['أنطاليا', 'انطاليا', 'antalya', 'ayt'],
  'Izmir': ['إزمير', 'ازمير', 'izmir', 'adb'],
  'Trabzon': ['طرابزون', 'trabzon', 'tzx'],
  'Turkey': ['تركيا', 'turkey', 'türkiye'],

  // Bahrain
  'Bahrain': ['البحرين', 'المنامة', 'المنامه', 'bahrain', 'manama', 'bah', 'مطار البحرين'],

  // Jordan
  'Amman': ['عمان', 'عمّان', 'amman', 'amm', 'الملكة علياء', 'الملكه علياء'],
  'Jordan': ['الأردن', 'الاردن', 'jordan'],

  // Georgia
  'Tbilisi': ['تبليسي', 'tbilisi', 'tbs'],
  'Batumi': ['باتومي', 'batumi', 'bus'],
  'Georgia': ['جورجيا', 'georgia'],

  // Qatar
  'Doha': ['الدوحة', 'الدوحه', 'doha', 'doh', 'مطار حمد'],
  'Qatar': ['قطر', 'qatar'],

  // Oman
  'Muscat': ['مسقط', 'muscat'],
  'Oman': ['عمان', 'سلطنة عمان', 'سلطنه عمان', 'oman'],

  // USA
  'Miami': ['ميامي', 'miami', 'mia'],
  'Orlando': ['اورلاندو', 'أورلاندو', 'orlando', 'mco'],
  'United States': ['أمريكا', 'امريكا', 'usa', 'united states'],

  // Mexico
  'Cancun': ['كانكون', 'cancun'],
  'Mexico': ['المكسيك', 'mexico'],

  // Europe & Others
  'Cyprus': ['قبرص', 'cyprus', 'لارنكا', 'larnaca'],
  'Greece': ['اليونان', 'greece', 'أثينا', 'اثينا', 'athens'],
  'Spain': ['إسبانيا', 'اسبانيا', 'spain', 'مدريد', 'madrid', 'برشلونة', 'barcelona'],
  'Italy': ['إيطاليا', 'ايطاليا', 'italy', 'روما', 'rome', 'ميلانو', 'milan'],
  'Portugal': ['البرتغال', 'portugal', 'لشبونة', 'lisbon'],
  'Australia': ['أستراليا', 'استراليا', 'australia', 'بيرث', 'perth'],
  'Argentina': ['الأرجنتين', 'الارجنتين', 'argentina', 'بوينس آيرس', 'buenos aires'],
  'Chile': ['تشيلي', 'chile', 'سانتياغو', 'santiago'],
  'Armenia': ['أرمينيا', 'ارمينيا', 'armenia', 'يريفان', 'yerevan'],
  'Albania': ['ألبانيا', 'البانيا', 'albania', 'تيرانا', 'tirana'],
  'Mauritius': ['موريشيوس', 'mauritius'],
};

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
  if (!query || !Array.isArray(locations) || locations.length === 0) return null;
  const cleanQ = query.trim().toLowerCase();

  // 1. Check known aliases
  let canonicalName: string | null = null;
  for (const [key, aliases] of Object.entries(LOCATION_ALIASES)) {
    if (
      key.toLowerCase() === cleanQ ||
      aliases.some((a) => cleanQ.includes(a.toLowerCase()) || a.toLowerCase().includes(cleanQ))
    ) {
      canonicalName = key;
      break;
    }
  }

  const searchTerm = (canonicalName || cleanQ).toLowerCase();

  // 2. Filter matching locations
  const matches = locations.filter((l: any) => {
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

  if (matches.length === 0) return null;

  // 3. Sort matches to prioritize Airports and active/main branches first!
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

    // Active locations first
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
  try {
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

    const res = await fetch(`${BACKEND_URL}/filter/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return [];
    const data = await res.json();
    return vehicleMapper.toLocalList(data.filteredVehicles || []);
  } catch (err) {
    console.error('Fast vehicle query error:', err);
    return [];
  }
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
  for (const [key, aliases] of Object.entries(LOCATION_ALIASES)) {
    if (
      key.toLowerCase() === clean ||
      aliases.some((a) => clean.includes(a.toLowerCase()) || a.toLowerCase().includes(clean))
    ) {
      matchedCountry = key;
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
    const { messages, currency = 'AED', currentUser, currentSearchParams, customerToken } = body;

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
أنت "مساعد وصديق أوتورز الذكي" (Autours AI Assistant) لتأجير السيارات. رد بلهجة مصرية مرحة وودودة وخفيفة دم وموجزة جداً وسريعة ومباشرة.

👤 ${userInfoSummary}
📅 تاريخ اليوم: ${todayStr}

🎯 بيانات وقواعد المنصة الحية (مستخرجة مباشرة ولحظياً من قاعدة بيانات النظام):
- عدد البلدان والوجهات المتوفرة فعلياً في قاعدة البيانات الحية: ${dbContext.totalCountries} دولة
- قائمة البلدان والمطارات المتوفرة حالياً في السيستم:
${dbContext.summaryStr}

🎯 القواعد الصارمة للتعامل مع قاعدة البيانات:
1. ⚠️ عندما يطلب المستخدم أو يسأل عن دولة أو وجهة من قاعدة البيانات أعلاه دون تحديد التواريخ (مثلاً: "طب الكويت", "الكويت", "عايز عربية في مصر", "تركيا", "المغرب", "عربيات دبي", "جورجيا", "البحرين", "الأرجنتين"):
   - ⛔ إياك أن تضع [SEARCH] أو تخترع تواريخ عشوائية من عندك!
   - ⛔ إياك أن تقول إن الدولة غير مدعومة طالما هي موجودة في قاعدة البيانات الحية أعلاه!
   - رحب به بحماس واسأله بوضوح ولطافة عن تاريخ الاستلام والمدة والمدينة/المطار المفضل في تلك الدولة.

2. ✅ متى تضع وسم [SEARCH: Location, DateFrom, DateTo]؟
   - تضع الوسم إذا حدد المستخدم التواريخ أو المدة مع الوجهة (مثلاً: "عربيات الكويت من بكرة لمدة 5 أيام" -> [SEARCH: Kuwait, ${formatDate(addDays(new Date(), 1))}, ${formatDate(addDays(new Date(), 6))}]).
   - 🧠 تتبع سياق المحادثة (Multi-turn Context): إذا كان المستخدم في الرسالة السابقة يتكلم عن وجهة معينة (مثلاً: "طب الكويت") وفي الرسالة الحالية قال فقط: "من بكرا لمدة خمس ايام"، تذكر فوراً أن الوجهة المقصودة هي (الكويت 'Kuwait') وضع الوسم فوراً: [SEARCH: Kuwait, ${formatDate(addDays(new Date(), 1))}, ${formatDate(addDays(new Date(), 6))}]!
   - إذا طلب صراحة "أرخص سيارة اقتصادية الأسبوع ده" بدون تحديد وجهة: اعتبر دبي 'Dubai' وجهة افتراضية للأيام القادمة من ${formatDate(addDays(new Date(), 1))} إلى ${formatDate(addDays(new Date(), 4))}.
   - اكتب اسم الوجهة في الوسم باللغة الإنجليزية كما هي موجودة في قاعدة البيانات (مثل Kuwait, Dubai, Turkey, Egypt, Morocco, Bahrain, Jordan, Georgia, Spain, Argentina).

3. لو المستخدم حيّاك أو رحب بيك (مثل "اهلا", "مرحبا", "سلام", "صباح الخير"): رحب بيه بلهجة مصرية لطيفة واسأله ناوي يسافر فين ومحتاج عربية في أي بلد.

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

                let targetLoc = resolveTargetLocation(locQuery, locations);
                const userName = currentUser?.name ? ` يا مستر ${currentUser.name}` : ' يا غالي';

                // Multi-turn Context fallback: If locQuery didn't match directly, check previous messages
                if (!targetLoc) {
                  for (const m of [...messages].reverse()) {
                    const prevMatch = resolveTargetLocation(m.content, locations);
                    if (prevMatch) {
                      targetLoc = prevMatch;
                      locQuery = prevMatch.name || prevMatch.city || prevMatch.country || locQuery;
                      break;
                    }
                  }
                }

                if (!targetLoc) {
                  assistantResponseText = `عذراً${userName}! 🚗\n\nحالياً لا تتوفر سيارات متاحة للحجز في "${locQuery}".\n\nتقدر تختار من أكثر الوجهات المتوفرة والأكثر طلباً على منصتنا:`;
                  actionButtons = getSmartActionButtons('', locations, currentUser);
                  foundVehicles = [];
                  searchCriteria = null;
                  break;
                }

                const pickupLocParam =
                  targetLoc.id || targetLoc.name || targetLoc.location || targetLoc.city;

                let vehicles = await queryAutoursVehicles({
                  locationIdOrName: pickupLocParam,
                  dateFrom: dFrom,
                  dateTo: dTo,
                  currency,
                });

                // Fallback 1: If 0 vehicles in specific downtown branch, search by country name or country fallback
                if ((!vehicles || vehicles.length === 0) && targetLoc.country) {
                  const countryVehicles = await queryAutoursVehicles({
                    locationIdOrName: targetLoc.country,
                    dateFrom: dFrom,
                    dateTo: dTo,
                    currency,
                  });
                  if (countryVehicles && countryVehicles.length > 0) {
                    vehicles = countryVehicles;
                  }
                }

                if (!vehicles || vehicles.length === 0) {
                  assistantResponseText = `عذراً${userName}! 🚗\n\nلم نعثر على سيارات شاغرة حالياً في ${targetLoc.name || targetLoc.city || locQuery} للفترة المحددة (${dFrom} إلى ${dTo}).\n\nتقدر تجرب تغيير التواريخ أو تختار وجهة أخرى:`;
                  actionButtons = getSmartActionButtons(locQuery, locations, currentUser);
                  foundVehicles = [];
                  searchCriteria = null;
                  break;
                }

                searchCriteria = {
                  location: targetLoc.id || targetLoc.name || targetLoc.location,
                  locationName: targetLoc.name || `${targetLoc.city || ''}, ${targetLoc.country || ''}`.trim(),
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

    return NextResponse.json({
      reply: assistantResponseText,
      vehicles: foundVehicles.slice(0, 5),
      searchCriteria,
      actionButtons,
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
