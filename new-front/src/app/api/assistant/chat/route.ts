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

  // Kuwait
  'Kuwait': ['الكويت', 'kuwait', 'kwi'],

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

function getDestinationActionButtons(text: string): ActionButton[] {
  const clean = text.toLowerCase();
  if (clean.includes('بحرين') || clean.includes('bahrain') || clean.includes('المنام')) {
    return [
      { label: '✈️ مطار البحرين الدولي (3 أيام)', promptText: 'عربيات مطار البحرين الدولي من بكرة لمدة 3 أيام' },
      { label: '🏢 المنامة (3 أيام)', promptText: 'عربيات المنامة من بكرة لمدة 3 أيام' },
    ];
  }
  if (clean.includes('تركيا') || clean.includes('turkey') || clean.includes('اسطنبول') || clean.includes('إسطنبول') || clean.includes('انطاليا')) {
    return [
      { label: '✈️ مطار إسطنبول (3 أيام)', promptText: 'عربيات مطار اسطنبول من بكرة لمدة 3 أيام' },
      { label: '✈️ مطار صبيحة (3 أيام)', promptText: 'عربيات مطار صبيحة من بكرة لمدة 3 أيام' },
      { label: '✈️ مطار أنطاليا (3 أيام)', promptText: 'عربيات مطار انطاليا من بكرة لمدة 3 أيام' },
    ];
  }
  if (clean.includes('مصر') || clean.includes('egypt') || clean.includes('قاهر') || clean.includes('غردق') || clean.includes('شرم')) {
    return [
      { label: '✈️ مطار القاهرة (3 أيام)', promptText: 'عربيات مطار القاهرة من بكرة لمدة 3 أيام' },
      { label: '🏖️ مطار الغردقة (3 أيام)', promptText: 'عربيات مطار الغردقة من بكرة لمدة 3 أيام' },
      { label: '🏖️ شرم الشيخ (3 أيام)', promptText: 'عربيات شرم الشيخ من بكرة لمدة 3 أيام' },
    ];
  }
  if (clean.includes('مغرب') || clean.includes('morocco') || clean.includes('كازا') || clean.includes('مراكش') || clean.includes('طنج')) {
    return [
      { label: '✈️ مطار كازابلانكا (3 أيام)', promptText: 'عربيات مطار كازابلانكا من بكرة لمدة 3 أيام' },
      { label: '✈️ مطار مراكش (3 أيام)', promptText: 'عربيات مطار مراكش من بكرة لمدة 3 أيام' },
      { label: '✈️ مطار طنجة (3 أيام)', promptText: 'عربيات مطار طنجة من بكرة لمدة 3 أيام' },
    ];
  }
  if (clean.includes('دبي') || clean.includes('dubai') || clean.includes('امارات') || clean.includes('إمارات') || clean.includes('أبوظبي') || clean.includes('ابوظبي')) {
    return [
      { label: '✈️ مطار دبي الدولي (3 أيام)', promptText: 'عربيات مطار دبي من بكرة لمدة 3 أيام' },
      { label: '✈️ مطار أبوظبي (3 أيام)', promptText: 'عربيات مطار ابو ظبي من بكرة لمدة 3 أيام' },
    ];
  }
  if (clean.includes('جورجيا') || clean.includes('georgia') || clean.includes('تبليسي') || clean.includes('باتومي')) {
    return [
      { label: '✈️ مطار تبليسي (3 أيام)', promptText: 'عربيات مطار تبليسي من بكرة لمدة 3 أيام' },
      { label: '✈️ مطار باتومي (3 أيام)', promptText: 'عربيات مطار باتومي من بكرة لمدة 3 أيام' },
    ];
  }
  if (clean.includes('أردن') || clean.includes('اردن') || clean.includes('jordan') || clean.includes('عمان') || clean.includes('عمّان')) {
    return [
      { label: '✈️ مطار الملكة علياء (3 أيام)', promptText: 'عربيات مطار الملكة علياء من بكرة لمدة 3 أيام' },
    ];
  }
  return [];
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

// ── Instant Smart NLP Matcher (0-15ms Response Time) ──────────────────────────
function tryInstantMatch(
  userText: string,
  currentUser: CurrentUser | null | undefined,
  todayStr: string
): { reply: string; actionButtons?: ActionButton[] } | null {
  const text = userText.trim().toLowerCase().replace(/[؟?!.,]/g, '');

  // 1. Identity / User Name Check
  if (
    text.match(/(اسمي|اسمى|مين انا|عارف اسمي|عارفني|انا مين|بتعرف اسمي)/i) &&
    !text.includes('عربية') &&
    !text.includes('سيارة')
  ) {
    if (currentUser?.name) {
      return {
        reply: `يا هلا والله يا عم **${currentUser.name}** يا غالي! 😍 منور الدنيا ومنور "أوتورز" دايماً يا كبير. قولي بقى ناوي على فسحة أو سفرية فين النهاردة؟ 🚗✨`,
        actionButtons: [
          { label: '🚗 حجز سيارة في دبي', promptText: 'عربيات مطار دبي من بكرة لمدة 3 أيام' },
          { label: '⚡ أرخص سيارة متاحة', promptText: 'أرخص عربية اقتصادية متاحة الأسبوع ده' },
        ],
      };
    } else {
      return {
        reply: `يا هلا بيك يا غالي! أنت منورنا ومشرفنا في أوتورز، بس لسه مسجلتش دخول في الموقع عشان أعرف اسمك الكريم. تحب أساعدك تسجل دخول أو تفتح حساب جديد في ثواني؟ ✨`,
        actionButtons: [
          { label: '👤 تسجيل الدخول', url: '/login', actionType: 'link' },
          { label: '📝 إنشاء حساب جديد', url: '/register', actionType: 'link' },
        ],
      };
    }
  }

  // 2. Account Details Check
  if (
    text.match(/(حسابي|حسابى|الحساب بتاعي|الحساب بتاعى|نوع حسابي|نوع حسابى|بيانات حسابي|ايميلي|إيميلي)/i)
  ) {
    if (currentUser?.name) {
      const roleLabel =
        currentUser.role === 'customer'
          ? 'عميل (Customer) ⭐'
          : currentUser.role === 'admin'
          ? 'إدارة المنصة (Admin) 🛡️'
          : 'شركة موردة (Supplier) 🏢';

      return {
        reply: `بص يا سيدي، تفاصيل حسابك عندي متبثثة ومظبوطة:
• **الاسم:** ${currentUser.name}
• **البريد الإلكتروني:** ${currentUser.email || 'غير مسجل'}
• **نوع الحساب:** ${roleLabel}
• **رقم الهاتف:** ${currentUser.phone || 'غير مسجل'}
• **البلد:** ${currentUser.country || 'غير محدد'}

حسابك جاهز تماماً لطلب وتأكيد أي عربية في ثواني! 🚗💨`,
        actionButtons: [
          { label: '👤 صفحتي الشخصية', url: '/profile', actionType: 'link' },
          { label: '🚗 حجز سيارة الآن', promptText: 'عربيات مطار دبي من بكرة لمدة 3 أيام' },
        ],
      };
    } else {
      return {
        reply: `أنت مسجل حالياً كـ **زائر**. تقدر تسجل دخول أو تنشئ حساب عميل في ثواني عشان تتابع حجوزاتك وتستمتع بخصومات أوتورز الحصرية!`,
        actionButtons: [
          { label: '👤 تسجيل الدخول', url: '/login', actionType: 'link' },
          { label: '📝 إنشاء حساب عميل', url: '/register', actionType: 'link' },
        ],
      };
    }
  }

  // 3. Greetings & Friendly Flirt / Humour
  if (text.match(/^(مرحبا|اهلا|أهلاً|هلا|سلام|هاي|صباح الخير|مساء الخير|السلام عليكم)$/i)) {
    const namePart = currentUser?.name ? ` يا عم ${currentUser.name}` : ' يا غالي';
    return {
      reply: `يا مرحب بيك${namePart}! 🚗✨ نورت أوتورز. أنا صديقك ومساعدك الشخصي، قولي تحب نسافر فين أو محتاج عربية في أي مدينة؟`,
      actionButtons: [
        { label: '✈️ مطار دبي (3 أيام)', promptText: 'عربيات مطار دبي من بكرة لمدة 3 أيام' },
        { label: '⚡ أرخص سيارة اقتصادية', promptText: 'أرخص عربية اقتصادية متاحة الأسبوع ده' },
      ],
    };
  }

  if (text.includes('بحبك') || text.includes('حبيبي') || text.includes('تسلم')) {
    return {
      reply: `حبيبي تسلملي يا ذوق! ❤️ ده أنا اللي بحبك وبحب أخدمك في كل مشوار. اؤمرني بأي عربية وأنا أظبطهالك على الفرازة وبأحسن سعر! 🚗💨`,
      actionButtons: [
        { label: '🚗 تصفح سيارات دبي', promptText: 'عربيات مطار دبي من بكرة لمدة 3 أيام' },
      ],
    };
  }

  // 4. Platform Policies & FAQs
  if (text.includes('تأمين') || text.includes('تامين') || text.includes('شروط')) {
    return {
      reply: `🛡️ **شروط وضمانات أوتورز الذهبية:**
• **إلغاء مجاني:** متاح حتى قبل موعد الاستلام بأكثر من 24 ساعة (لا يمكن الإلغاء إذا تبقى يوم أو أقل على موعد الاستلام).
• **تأمين أساسي مشمول:** كل عربياتنا مؤمنة بالكامل ضد الحوادث.
• **شفافية تامة:** الأسعار شاملة الضرائب والتأمين بدون أي مصاريف خفية.
• **الدفع عند الاستلام:** كاش أو بالفيزا بعد ما تفحص عربيتك وتستلم المفتاح! 🔑`,
      actionButtons: [
        { label: '💬 تواصل واتساب للدعم', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
      ],
    };
  }

  // 5. Unsupported Countries Check (e.g. Saudi Arabia, France, Germany, etc.)
  if (
    text.includes('سعودي') ||
    text.includes('saudi') ||
    text.includes('ksa') ||
    text.includes('رياض') ||
    text.includes('جده') ||
    text.includes('جدة') ||
    text.includes('دمام') ||
    text.includes('مكه') ||
    text.includes('مكة') ||
    text.includes('فرنسا') ||
    text.includes('المانيا') ||
    text.includes('ألمانيا')
  ) {
    const namePart = currentUser?.name ? ` يا مستر ${currentUser.name}` : ' يا غالي';
    return {
      reply: `عذراً${namePart}! 🚗✨\n\nخدمة تأجير السيارات في المملكة العربية السعودية غير متاحة حالياً على منصتنا، وقريباً جداً هنتوسع هناك بإذن الله! 🇸🇦\n\nتقدر تختار وتحجز سيارتك بأفضل الأسعار في الوجهات المتاحة حالياً على أوتورز:`,
      actionButtons: [
        { label: '🇦🇪 سيارات دبي (الإمارات)', promptText: 'عربيات مطار دبي من بكرة لمدة 3 أيام' },
        { label: '🇧🇭 سيارات البحرين', promptText: 'عربيات مطار البحرين الدولي من بكرة لمدة 3 أيام' },
        { label: '🇹🇷 سيارات تركيا', promptText: 'عربيات تركيا من بكرة لمدة 3 أيام' },
        { label: '🇲🇦 سيارات المغرب', promptText: 'عربيات المغرب من بكرة لمدة 3 أيام' },
        { label: '🇪🇬 سيارات مصر', promptText: 'عربيات مطار القاهرة من بكرة لمدة 3 أيام' },
      ],
    };
  }

  return null;
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

    // ⚡ 2. Try Instant 0ms Matcher for greetings / account details / identity
    const instant = tryInstantMatch(latestUserMsg, currentUser, todayStr);
    if (instant) {
      return NextResponse.json({
        reply: instant.reply,
        vehicles: [],
        searchCriteria: null,
        actionButtons: instant.actionButtons || [],
        timestamp: new Date().toISOString(),
      });
    }

    // ⚡ 3. AI Generation via ultra-fast Gemini 3.5 Flash Lite
    const locations = await getCachedLocations();
    const geminiApiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    let assistantResponseText = '';
    let foundVehicles: any[] = [];
    let searchCriteria: any = null;
    let actionButtons: ActionButton[] = [];

      const userInfoSummary = currentUser?.name
      ? `المستخدم مسجل: الاسم (${currentUser.name})، نوع الحساب (${currentUser.role})، الإيميل (${currentUser.email || 'غير متوفر'}).`
      : `المستخدم زائر لم يسجل دخوله بعد.`;

    const systemPrompt = `
أنت "مساعد وصديق أوتورز الذكي" لتأجير السيارات. رد بلهجة مصرية مرحة وودودة وموجزة جداً وسريعة وبدون تطويل ممل.

👤 ${userInfoSummary}
📅 تاريخ اليوم: ${todayStr}

🎯 القواعد الصارمة والأساسية:
1. ⚠️ عندما يطلب المستخدم دولة أو وجهة عامة فقط دون تحديد التواريخ أو المطار (مثلاً: "هات البحرين", "عايز عربية في مصر", "تركيا", "المغرب", "عربيات دبي", "جورجيا", "البحرين"):
   - ⛔ إياك أن تضع [SEARCH] أو تخترع تواريخ ومطارات عشوائية من عندك!
   - رحب به بحماس واسأله بوضوح ولطافة:
     1. تاريخ الاستلام المطلوب والمدة (أو من يوم كام ليوم كام).
     2. المطار أو المدينة المحددة التي يفضل الاستلام منها في تلك الدولة (مثل المطار الدولي أو وسط المدينة).

2. ✅ متى تضع وسم [SEARCH: Location, DateFrom, DateTo]؟
   - تضع الوسم فقط إذا حدد المستخدم التواريخ أو المدة بوضوح مع الوجهة (مثلاً: "عربيات مطار دبي من بكرة لمدة 3 أيام", "البحرين من 15 سبتمبر لـ 20 سبتمبر", "تركيا الأسبوع الجاي لمدة 5 أيام").
   - أو إذا طلب صراحة "أرخص سيارة اقتصادية الأسبوع ده" أو "عربية عائلية متاحة هذا الأسبوع" (هنا تعتبر دبي 'Dubai' وجهة افتراضية للأيام القادمة من ${formatDate(addDays(new Date(), 1))} إلى ${formatDate(addDays(new Date(), 4))}).

3. لو المستخدم سأل عن حسابه أو اسمه: جاوبه مباشرة باسمه وتفاصيل حسابه بلطافة.

4. لو طلب دولة أو مدينة لا نوفر بها سيارات (مثل فرنسا، ألمانيا، السعودية، لبنان، لندن، باريس...):
   - اعتذر بلباقة واقترح عليه الوجهات المدعومة (دبي والإمارات، تركيا، المغرب، مصر، البحرين، الأردن، جورجيا...). ولا تضع [SEARCH] على وجهة غير مدعومة.

5. مزايا المنصة: إلغاء مجاني 100% حتى قبل 24 ساعة، تأمين أساسي مشمول، الدفع عند الاستلام.
`;

    if (geminiApiKey) {
      const modelsToTry = [
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
        'gemini-flash-lite-latest',
        'gemini-3.7-flash',
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
                  maxOutputTokens: 220,
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
                const locQuery = searchMatch[1].trim();
                const dFrom = normalizeDateStr(searchMatch[2].trim());
                const dTo = normalizeDateStr(searchMatch[3].trim());

                rawText = rawText.replace(/\[SEARCH:[^\]]+\]/gi, '').trim();

                let targetLoc = resolveTargetLocation(locQuery, locations);
                const userName = currentUser?.name ? ` يا مستر ${currentUser.name}` : ' يا غالي';

                if (!targetLoc) {
                  assistantResponseText = `عذراً${userName}! 🚗\n\nحالياً لا تتوفر سيارات متاحة للحجز في "${locQuery}".\n\nتقدر تختار من أكثر الوجهات المتوفرة والأكثر طلباً على منصتنا:`;
                  actionButtons = [
                    { label: '🇦🇪 سيارات دبي (الإمارات)', promptText: 'عربيات مطار دبي من بكرة لمدة 3 أيام' },
                    { label: '🇹🇷 سيارات تركيا', promptText: 'عربيات تركيا من بكرة لمدة 3 أيام' },
                    { label: '🇲🇦 سيارات المغرب', promptText: 'عربيات المغرب من بكرة لمدة 3 أيام' },
                    { label: '🇪🇬 سيارات مصر', promptText: 'عربيات مطار القاهرة من بكرة لمدة 3 أيام' },
                    { label: '🇧🇭 سيارات البحرين', promptText: 'عربيات البحرين من بكرة لمدة 3 أيام' },
                  ];
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

                // Fallback: If 0 vehicles in specific downtown branch, try matching by country/city or airport in that country
                if ((!vehicles || vehicles.length === 0) && targetLoc.country) {
                  const countryFallback = locations.find((l: any) =>
                    (l.country || '').toLowerCase() === targetLoc.country.toLowerCase() &&
                    l.id !== targetLoc.id
                  );
                  if (countryFallback) {
                    const fallbackVehicles = await queryAutoursVehicles({
                      locationIdOrName: countryFallback.id || countryFallback.name || targetLoc.country,
                      dateFrom: dFrom,
                      dateTo: dTo,
                      currency,
                    });
                    if (fallbackVehicles && fallbackVehicles.length > 0) {
                      vehicles = fallbackVehicles;
                      targetLoc = countryFallback;
                    }
                  }
                }

                if (!vehicles || vehicles.length === 0) {
                  assistantResponseText = `عذراً${userName}! 🚗\n\nلم نعثر على سيارات شاغرة حالياً في ${targetLoc.name || targetLoc.city || locQuery} للفترة المحددة (${dFrom} إلى ${dTo}).\n\nتقدر تجرب تغيير التواريخ أو تختار وجهة أخرى:`;
                  actionButtons = [
                    { label: '🇦🇪 سيارات دبي', promptText: 'عربيات مطار دبي من بكرة لمدة 3 أيام' },
                    { label: '🇹🇷 سيارات تركيا', promptText: 'عربيات تركيا من بكرة لمدة 3 أيام' },
                    { label: '🇲🇦 سيارات المغرب', promptText: 'عربيات المغرب من بكرة لمدة 3 أيام' },
                    { label: '🇪🇬 سيارات مصر', promptText: 'عربيات مطار القاهرة من بكرة لمدة 3 أيام' },
                  ];
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
                // User asked about a destination without dates -> attach destination quick buttons
                if (actionButtons.length === 0) {
                  const destButtons = getDestinationActionButtons(latestUserMsg);
                  if (destButtons.length > 0) {
                    actionButtons = destButtons;
                  }
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
      assistantResponseText = `يا هلا بيك في **Autours**! 🚗✨ أنا صديقك ومساعدك الشخصي. قولي تحب تسافر فين أو محتاج عربية في أي مدينة وتاريخ، وأنا تحت أمرك فوراً!`;
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
