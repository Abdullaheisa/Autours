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

// Universal Arabic to English Destination Dictionary
export const ARABIC_DESTINATION_MAP: Record<string, string> = {
  // Gulf & Middle East
  'الكويت': 'Kuwait',
  'كويت': 'Kuwait',
  'الإمارات': 'United Arab Emirates',
  'الامارات': 'United Arab Emirates',
  'دبي': 'Dubai',
  'دبى': 'Dubai',
  'أبوظبي': 'Abu Dhabi',
  'ابوظبي': 'Abu Dhabi',
  'الشارقة': 'Sharjah',
  'البحرين': 'Bahrain',
  'المنامة': 'Manama',
  'الأردن': 'Jordan',
  'الاردن': 'Jordan',
  'عمان': 'Amman',
  'عمّان': 'Amman',
  'قطر': 'Qatar',
  'الدوحة': 'Doha',
  'سلطنة عمان': 'Oman',
  'سلطنه عمان': 'Oman',
  'مسقط': 'Muscat',

  // North Africa & Levant
  'مصر': 'Egypt',
  'القاهرة': 'Cairo',
  'الغردقة': 'Hurghada',
  'شرم الشيخ': 'Sharm El Sheikh',
  'المغرب': 'Morocco',
  'كازابلانكا': 'Casablanca',
  'الدار البيضاء': 'Casablanca',
  'مراكش': 'Marrakech',
  'طنجة': 'Tangier',
  'أكادير': 'Agadir',
  'فاس': 'Fez',

  // Europe & Mediterranean
  'تركيا': 'Turkey',
  'إسطنبول': 'Istanbul',
  'اسطنبول': 'Istanbul',
  'أنطاليا': 'Antalya',
  'انطاليا': 'Antalya',
  'أنقرة': 'Ankara',
  'انقرة': 'Ankara',
  'إزمير': 'Izmir',
  'طرابزون': 'Trabzon',
  'جورجيا': 'Georgia',
  'تبليسي': 'Tbilisi',
  'باتومي': 'Batumi',
  'قبرص': 'Cyprus',
  'اليونان': 'Greece',
  'أثينا': 'Athens',
  'إسبانيا': 'Spain',
  'مدريد': 'Madrid',
  'برشلونة': 'Barcelona',
  'البرتغال': 'Portugal',
  'لشبونة': 'Lisbon',
  'إيطاليا': 'Italy',
  'روما': 'Rome',
  'ميلانو': 'Milan',
  'ألبانيا': 'Albania',
  'كرواتيا': 'Croatia',
  'صربيا': 'Serbia',
  'الجبل الأسود': 'Montenegro',
  'المجر': 'Hungary',
  'بولندا': 'Poland',
  'مالطا': 'Malta',
  'أرمينيا': 'Armenia',

  // Americas & Asia-Pacific
  'الأرجنتين': 'Argentina',
  'المكسيك': 'Mexico',
  'تشيلي': 'Chile',
  'أمريكا': 'United States',
  'الولايات المتحدة': 'United States',
  'ميامي': 'Miami',
  'أورلاندو': 'Orlando',
  'كندا': 'Canada',
  'أستراليا': 'Australia',
  'اليابان': 'Japan',
  'إندونيسيا': 'Indonesia',
  'موريشيوس': 'Mauritius',
};

let cachedLocations: any[] | null = null;
let lastLocationsFetchTime = 0;

export async function fetchLocations(): Promise<any[]> {
  const now = Date.now();
  if (cachedLocations && cachedLocations.length > 0 && now - lastLocationsFetchTime < 300000) {
    return cachedLocations;
  }
  try {
    const url = typeof window !== 'undefined' ? '/api/backend/get/locations' : `${BACKEND_URL}/get/locations`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      cachedLocations = await res.json();
      lastLocationsFetchTime = now;
      return cachedLocations || [];
    }
  } catch (err) {
    console.warn('Could not fetch locations from backend:', err);
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
  if (!query || !Array.isArray(locations) || locations.length === 0) return null;
  const cleanQ = query.trim().toLowerCase();

  // 1. Check Arabic Map or English direct canonical match
  let canonicalName: string | null = null;
  for (const [ar, en] of Object.entries(ARABIC_DESTINATION_MAP)) {
    if (cleanQ.includes(ar.toLowerCase()) || ar.toLowerCase().includes(cleanQ)) {
      canonicalName = en;
      break;
    }
  }

  const searchTerm = (canonicalName || cleanQ).toLowerCase();

  // 2. Filter matching branches from DB
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

  // 3. Sort: prioritize Airport branches and active locations
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
  locations: any[] = [],
  currentUser?: any
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
   - تضع الوسم إذا حدد المستخدم التواريخ أو المدة مع الوجهة (مثلاً: "عربيات الكويت من بكرة لمدة 5 أيام" -> [SEARCH: Kuwait, ${tomorrowStr}, ${sixDaysStr}]).
   - 🧠 تتبع سياق المحادثة (Multi-turn Context): إذا كان المستخدم في الرسالة السابقة يتكلم عن وجهة معينة (مثلاً: "طب الكويت") وفي الرسالة الحالية قال فقط: "من بكرا لمدة خمس ايام"، تذكر فوراً أن الوجهة المقصودة هي (الكويت 'Kuwait') وضع الوسم فوراً: [SEARCH: Kuwait, ${tomorrowStr}, ${sixDaysStr}]!
   - إذا طلب صراحة "أرخص سيارة اقتصادية الأسبوع ده" بدون تحديد وجهة: اعتبر دبي 'Dubai' وجهة افتراضية للأيام القادمة من ${tomorrowStr} إلى ${fourDaysStr}.
   - اكتب اسم الوجهة في الوسم باللغة الإنجليزية كما هي موجودة في قاعدة البيانات (مثل Kuwait, Dubai, Turkey, Egypt, Morocco, Bahrain, Jordan, Georgia, Spain, Argentina).

3. لو المستخدم حيّاك أو رحب بيك (مثل "اهلا", "مرحبا", "سلام", "صباح الخير"): رحب بيه بلهجة مصرية لطيفة واسأله ناوي يسافر فين ومحتاج عربية في أي بلد.

4. لو طلب دولة غير متوفرة إطلاقاً في قاعدة البيانات: اعتذر بلباقة واقترح عليه بعض الوجهات المتاحة حالياً في قاعدة البيانات الحية. ولا تضع [SEARCH] على وجهة غير مدعومة.

5. مزايا المنصة: إلغاء مجاني 100% حتى قبل 24 ساعة، تأمين أساسي مشمول، الدفع عند الاستلام.
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

            let targetLoc = resolveTargetLocation(locQuery, locations);
            const userName = currentUser?.name ? ` يا مستر ${currentUser.name}` : ' يا غالي';

            // Multi-turn fallback: If locQuery didn't resolve directly, search previous user turns
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

            const pickupLocParam = targetLoc.id || targetLoc.name || targetLoc.location || targetLoc.city;

            let vehicles = await queryVehicles({
              locationIdOrName: pickupLocParam,
              dateFrom: dFrom,
              dateTo: dTo,
              currency,
            });

            // Fallback 1: If 0 vehicles found in this specific branch, search across country
            if ((!vehicles || vehicles.length === 0) && targetLoc.country) {
              const countryVehicles = await queryVehicles({
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
    actionButtons = getSmartActionButtons(latestUserMsg, locations, currentUser);
  }

  return {
    reply: assistantResponseText,
    vehicles: foundVehicles.slice(0, 5),
    searchCriteria,
    actionButtons,
  };
}
