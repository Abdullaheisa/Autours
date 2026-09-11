import { Vehicle } from '@/types';
import { vehicleMapper } from '@/services/mappers/vehicleMapper';
import { BACKEND_URL } from '@/config/api';

export interface ActionButton {
  label: string;
  url?: string;
  actionType?: 'link' | 'prompt' | 'whatsapp' | 'call';
  promptText?: string;
}

export interface AssistantChatResult {
  reply: string;
  vehicles?: Vehicle[];
  searchCriteria?: any;
  actionButtons?: ActionButton[];
}

const FALLBACK_B64 = 'QVEuQWI4Uk42SmlGUWNnQjFCOWpUcHhKTXNsT19KMjJNNUlwWnV4LURGaFg4RnFIa1ZHTUE=';
const GEMINI_KEY_DIRECT =
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  (typeof window !== 'undefined' ? atob(FALLBACK_B64) : Buffer.from(FALLBACK_B64, 'base64').toString('utf8'));

const LOCATION_ALIASES: Record<string, string[]> = {
  // UAE
  'Dubai': ['دبي', 'دبى', 'dubai', 'dxb', 'مطار دبي', 'مطار دبي الدولي'],
  'Abu Dhabi': ['ابو ظبي', 'أبوظبي', 'أبو ظبي', 'ابوظبي', 'abu dhabi', 'auh', 'مطار ابو ظبي', 'البطين', 'الراحة'],
  'Sharjah': ['الشارقة', 'الشارقه', 'شارقة', 'sharjah', 'shj'],
  'United Arab Emirates': ['الإمارات', 'الامارات', 'uae', 'united arab emirates'],

  // Morocco
  'Casablanca': ['كازابلانكا', 'الدار البيضاء', 'الدارالبيضاء', 'casablanca', 'cmn', 'مطار كازابلانكا', 'محمد الخامس'],
  'Marrakech': ['مراكش', 'marrakech', 'marrakesh', 'rak', 'مطار مراكش'],
  'Tangier': ['طنجة', 'طنجه', 'tangier', 'tng', 'ابن بطوطة'],
  'Agadir': ['أكادير', 'اكادير', 'agadir', 'aga', 'المسيرة'],
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
  'Bahrain': ['البحرين', 'المنامة', 'المنامه', 'bahrain', 'manama', 'bah', 'مطار البحرين', 'مطار البحرين الدولي'],

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
  'Oman': ['عمان', 'سلطنة عمان', 'oman'],
};

let cachedLocations: any[] | null = null;
let lastLocationsFetchTime = 0;

async function fetchLocations(): Promise<any[]> {
  const now = Date.now();
  if (cachedLocations && now - lastLocationsFetchTime < 300000) {
    return cachedLocations;
  }
  try {
    // Try client proxy path or direct backend URL
    const url = typeof window !== 'undefined' ? '/api/backend/get/locations' : `${BACKEND_URL}/get/locations`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      cachedLocations = await res.json();
      lastLocationsFetchTime = now;
      return cachedLocations || [];
    }
  } catch (err) {
    console.warn('Could not fetch locations:', err);
  }
  return cachedLocations || [];
}

function resolveTargetLocation(query: string, locations: any[]): any | null {
  if (!query || !Array.isArray(locations) || locations.length === 0) return null;
  const cleanQ = query.trim().toLowerCase();

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

async function queryVehicles(params: {
  locationIdOrName: string | number;
  dateFrom: string;
  dateTo: string;
  currency: string;
}): Promise<Vehicle[]> {
  try {
    const url = typeof window !== 'undefined' ? '/api/backend/filter/vehicles' : `${BACKEND_URL}/filter/vehicles`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        pickupLoc: params.locationIdOrName,
        date_from: normalizeDateStr(params.dateFrom),
        date_to: normalizeDateStr(params.dateTo),
        time_from: '10:00',
        time_to: '10:00',
        currency: params.currency || 'AED',
        page: 1,
        per_page: 6,
      }),
    });

    if (!res.ok) return [];
    const data = await res.json();
    return vehicleMapper.toLocalList(data.filteredVehicles || []);
  } catch (err) {
    console.warn('Vehicle query failed:', err);
    return [];
  }
}

export function getSmartActionButtons(
  userText: string,
  currentUser?: any
): ActionButton[] {
  const clean = userText.toLowerCase();

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
  if (
    clean.includes('سعودي') ||
    clean.includes('saudi') ||
    clean.includes('ksa') ||
    clean.includes('رياض') ||
    clean.includes('جده') ||
    clean.includes('جدة')
  ) {
    return [
      { label: '🇦🇪 سيارات دبي (الإمارات)', promptText: 'عربيات مطار دبي من بكرة لمدة 3 أيام' },
      { label: '🇧🇭 سيارات البحرين', promptText: 'عربيات مطار البحرين الدولي من بكرة لمدة 3 أيام' },
      { label: '🇹🇷 سيارات تركيا', promptText: 'عربيات تركيا من بكرة لمدة 3 أيام' },
      { label: '🇲🇦 سيارات المغرب', promptText: 'عربيات المغرب من بكرة لمدة 3 أيام' },
      { label: '🇪🇬 سيارات مصر', promptText: 'عربيات مطار القاهرة من بكرة لمدة 3 أيام' },
    ];
  }
  if (clean.includes('تأمين') || clean.includes('تامين') || clean.includes('شروط') || clean.includes('إلغاء')) {
    return [
      { label: '💬 تواصل واتساب للدعم', url: 'https://wa.me/96560480382', actionType: 'whatsapp' },
      { label: '✈️ سيارات مطار دبي', promptText: 'عربيات مطار دبي من بكرة لمدة 3 أيام' },
    ];
  }
  if (clean.includes('حسابي') || clean.includes('تسجيل') || clean.includes('دخول')) {
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

  return [
    { label: '✈️ مطار دبي (3 أيام)', promptText: 'عربيات مطار دبي من بكرة لمدة 3 أيام' },
    { label: '⚡ أرخص سيارة اقتصادية', promptText: 'أرخص عربية اقتصادية متاحة الأسبوع ده' },
    { label: '🇧🇭 سيارات البحرين (3 أيام)', promptText: 'عربيات مطار البحرين الدولي من بكرة لمدة 3 أيام' },
  ];
}

export async function processChatWithGemini(params: {
  messages: { role: string; content: string }[];
  currency?: string;
  currentUser?: any;
}): Promise<AssistantChatResult> {
  const { messages, currency = 'AED', currentUser } = params;
  const latestUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  const fourDays = new Date(today);
  fourDays.setDate(fourDays.getDate() + 4);
  const fourDaysStr = `${fourDays.getFullYear()}-${String(fourDays.getMonth() + 1).padStart(2, '0')}-${String(fourDays.getDate()).padStart(2, '0')}`;

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
   - أو إذا طلب صراحة "أرخص سيارة اقتصادية الأسبوع ده" أو "عربية عائلية متاحة هذا الأسبوع" (هنا تعتبر دبي 'Dubai' وجهة افتراضية للأيام القادمة من ${tomorrowStr} إلى ${fourDaysStr}).

3. لو المستخدم حيّاك أو رحب بيك (مثل "اهلا", "مرحبا", "سلام", "صباح الخير"): رحب بيه بطريقة مختلفة ومرحة وودودة وخفيفة دم بالعامية المصرية واسأله ناوي يسافر فين أو محتاج عربية فين.

4. لو المستخدم سأل عن حسابه أو اسمه: جاوبه مباشرة باسمه وتفاصيل حسابه بلطافة.

5. لو طلب دولة أو مدينة لا نوفر بها سيارات (مثل فرنسا، ألمانيا، السعودية، لبنان، لندن، باريس...):
   - اعتذر بلباقة واقترح عليه الوجهات المدعومة (دبي والإمارات، تركيا، المغرب، مصر، البحرين، الأردن، جورجيا...). ولا تضع [SEARCH] على وجهة غير مدعومة.

6. مزايا المنصة: إلغاء مجاني 100% حتى قبل 24 ساعة، تأمين أساسي مشمول، الدفع عند الاستلام.
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
            const locQuery = searchMatch[1].trim();
            const dFrom = normalizeDateStr(searchMatch[2].trim());
            const dTo = normalizeDateStr(searchMatch[3].trim());

            rawText = rawText.replace(/\[SEARCH:[^\]]+\]/gi, '').trim();

            const locations = await fetchLocations();
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

            const pickupLocParam = targetLoc.id || targetLoc.name || targetLoc.location || targetLoc.city;

            let vehicles = await queryVehicles({
              locationIdOrName: pickupLocParam,
              dateFrom: dFrom,
              dateTo: dTo,
              currency,
            });

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
    const userName = currentUser?.name ? ` يا عم ${currentUser.name}` : ' يا غالي';
    assistantResponseText = `يا مرحب بيك${userName}! 🚗✨ أنا صديقك ومساعدك في أوتورز. قولي تحب نسافر فين أو محتاج عربية في أي بلد وتاريخ؟`;
  }

  if (actionButtons.length === 0) {
    actionButtons = getSmartActionButtons(latestUserMsg, currentUser);
  }

  return {
    reply: assistantResponseText,
    vehicles: foundVehicles.slice(0, 5),
    searchCriteria,
    actionButtons,
  };
}
