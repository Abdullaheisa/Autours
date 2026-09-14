// Structured destinations, flags, and sorted airports for Autours AI Assistant

export interface AirportDestination {
  iata: string;
  nameAr: string;
  nameEn: string;
  searchLabel: string; // Used to match InChatSearchWidget locations and database
  aliases: string[];
}

export interface CountryDestination {
  key: string;
  flag: string;
  nameAr: string;
  nameEn: string;
  aliases: string[];
  airports: AirportDestination[];
}

export const COUNTRY_DESTINATIONS: CountryDestination[] = [
  {
    key: 'uae',
    flag: '🇦🇪',
    nameAr: 'الإمارات',
    nameEn: 'UAE',
    aliases: ['الإمارات', 'الامارات', 'uae', 'united arab emirates', 'امارات'],
    airports: [
      {
        iata: 'DXB',
        nameAr: 'مطار دبي الدولي DXB',
        nameEn: 'Dubai International Airport DXB',
        searchLabel: 'Dubai International Airport - DXB',
        aliases: ['دبي', 'dubai', 'dxb', 'مطار دبي', 'دبي الدولي'],
      },
      {
        iata: 'SHJ',
        nameAr: 'مطار الشارقة الدولي SHJ',
        nameEn: 'Sharjah International Airport SHJ',
        searchLabel: 'Sharjah International Airport - SHJ',
        aliases: ['الشارقة', 'الشارقه', 'sharjah', 'shj', 'مطار الشارقة', 'مطار الشارقه'],
      },
      {
        iata: 'AUH',
        nameAr: 'مطار أبوظبي الدولي AUH',
        nameEn: 'Abu Dhabi / Zayed International Airport AUH',
        searchLabel: 'Zayed International Airport - AUH',
        aliases: ['أبوظبي', 'ابوظبي', 'أبو ظبي', 'ابو ظبي', 'abu dhabi', 'auh', 'زايد الدولي', 'مطار ابوظبي'],
      },
      {
        iata: 'DWC',
        nameAr: 'مطار آل مكتوم الدولي DWC',
        nameEn: 'Al Maktoum International Airport DWC',
        searchLabel: 'Al Maktoum International Airport - DWC',
        aliases: ['آل مكتوم', 'ال مكتوم', 'dwc', 'al maktoum', 'مطار ال مكتوم'],
      },
      {
        iata: 'RKT',
        nameAr: 'مطار رأس الخيمة الدولي RKT',
        nameEn: 'Ras Al Khaimah International Airport RKT',
        searchLabel: 'Ras Al Khaimah International Airport - RKT',
        aliases: ['رأس الخيمة', 'راس الخيمه', 'rkt', 'ras al khaimah'],
      },
    ],
  },
  {
    key: 'saudi',
    flag: '🇸🇦',
    nameAr: 'السعودية',
    nameEn: 'Saudi Arabia',
    aliases: ['السعودية', 'السعوديه', 'saudi arabia', 'ksa', 'المملكة', 'سعودية'],
    airports: [
      {
        iata: 'JED',
        nameAr: 'مطار الملك عبدالعزيز الدولي (جدة) JED',
        nameEn: 'King Abdulaziz International Airport (Jeddah) JED',
        searchLabel: 'King Abdulaziz International Airport - JED',
        aliases: ['جدة', 'جده', 'jeddah', 'jed', 'الملك عبدالعزيز', 'مطار جدة'],
      },
      {
        iata: 'RUH',
        nameAr: 'مطار الملك خالد الدولي (الرياض) RUH',
        nameEn: 'King Khalid International Airport (Riyadh) RUH',
        searchLabel: 'King Khalid International Airport - RUH',
        aliases: ['الرياض', 'riyadh', 'ruh', 'الملك خالد', 'مطار الرياض'],
      },
      {
        iata: 'DMM',
        nameAr: 'مطار الملك فهد الدولي (الدمام) DMM',
        nameEn: 'King Fahd International Airport (Dammam) DMM',
        searchLabel: 'King Fahd International Airport - DMM',
        aliases: ['الدمام', 'dammam', 'dmm', 'الملك فهد', 'مطار الدمام', 'الخبر'],
      },
      {
        iata: 'MED',
        nameAr: 'مطار الأمير محمد بن عبدالعزيز (المدينة) MED',
        nameEn: 'Prince Mohammad Bin Abdulaziz Airport (Madinah) MED',
        searchLabel: 'Prince Mohammad Bin Abdulaziz Airport - MED',
        aliases: ['المدينة', 'المدينه', 'المدينة المنورة', 'madinah', 'medina', 'med'],
      },
      {
        iata: 'AHB',
        nameAr: 'مطار أبها الدولي AHB',
        nameEn: 'Abha International Airport AHB',
        searchLabel: 'Abha International Airport - AHB',
        aliases: ['أبها', 'ابها', 'abha', 'ahb'],
      },
      {
        iata: 'TIF',
        nameAr: 'مطار الطائف الدولي TIF',
        nameEn: 'Taif International Airport TIF',
        searchLabel: 'Taif International Airport - TIF',
        aliases: ['الطائف', 'الطايف', 'taif', 'tif'],
      },
      {
        iata: 'ULH',
        nameAr: 'مطار العلا الدولي ULH',
        nameEn: 'AlUla International Airport ULH',
        searchLabel: 'AlUla International Airport - ULH',
        aliases: ['العلا', 'alula', 'ulh', 'العُلا'],
      },
    ],
  },
  {
    key: 'qatar',
    flag: '🇶🇦',
    nameAr: 'قطر',
    nameEn: 'Qatar',
    aliases: ['قطر', 'qatar', 'الدوحة', 'الدوحه', 'doha'],
    airports: [
      {
        iata: 'DOH',
        nameAr: 'مطار حمد الدولي DOH',
        nameEn: 'Hamad International Airport DOH',
        searchLabel: 'Hamad International Airport - DOH',
        aliases: ['حمد', 'مطار حمد', 'hamad', 'doh', 'doha', 'الدوحة', 'قطر'],
      },
    ],
  },
  {
    key: 'kuwait',
    flag: '🇰🇼',
    nameAr: 'الكويت',
    nameEn: 'Kuwait',
    aliases: ['الكويت', 'كويت', 'kuwait', 'kwi'],
    airports: [
      {
        iata: 'KWI',
        nameAr: 'مطار الكويت الدولي KWI',
        nameEn: 'Kuwait International Airport KWI',
        searchLabel: 'Kuwait International Airport - KWI',
        aliases: ['الكويت', 'مطار الكويت', 'kuwait airport', 'kwi'],
      },
    ],
  },
  {
    key: 'bahrain',
    flag: '🇧🇭',
    nameAr: 'البحرين',
    nameEn: 'Bahrain',
    aliases: ['البحرين', 'بحرين', 'bahrain', 'bah', 'المنامة'],
    airports: [
      {
        iata: 'BAH',
        nameAr: 'مطار البحرين الدولي BAH',
        nameEn: 'Bahrain International Airport BAH',
        searchLabel: 'Bahrain International Airport - BAH',
        aliases: ['البحرين', 'مطار البحرين', 'bahrain airport', 'bah', 'المنامة'],
      },
    ],
  },
  {
    key: 'oman',
    flag: '🇴🇲',
    nameAr: 'سلطنة عُمان',
    nameEn: 'Oman',
    aliases: ['سلطنة عمان', 'سلطنة عُمان', 'عمان', 'عُمان', 'oman'],
    airports: [
      {
        iata: 'MCT',
        nameAr: 'مطار مسقط الدولي MCT',
        nameEn: 'Muscat International Airport MCT',
        searchLabel: 'Muscat International Airport - MCT',
        aliases: ['مسقط', 'muscat', 'mct', 'مطار مسقط'],
      },
      {
        iata: 'SLL',
        nameAr: 'مطار صلالة الدولي SLL',
        nameEn: 'Salalah Airport SLL',
        searchLabel: 'Salalah Airport - SLL',
        aliases: ['صلالة', 'صلاله', 'salalah', 'sll'],
      },
    ],
  },
  {
    key: 'turkey',
    flag: '🇹🇷',
    nameAr: 'تركيا',
    nameEn: 'Turkey',
    aliases: ['تركيا', 'ترركيا', 'توركيا', 'turkey', 'turkiye', 'türkiye'],
    airports: [
      {
        iata: 'IST',
        nameAr: 'مطار إسطنبول الدولي IST',
        nameEn: 'Istanbul Airport IST',
        searchLabel: 'Istanbul Airport - IST',
        aliases: ['إسطنبول', 'اسطنبول', 'istanbul', 'ist', 'مطار اسطنبول'],
      },
      {
        iata: 'SAW',
        nameAr: 'مطار صبيحة كوكجن الدولي SAW',
        nameEn: 'Sabiha Gökçen Airport SAW',
        searchLabel: 'Sabiha Gökçen International Airport - SAW',
        aliases: ['صبيحة', 'صبيحه', 'sabiha', 'saw'],
      },
      {
        iata: 'AYT',
        nameAr: 'مطار أنطاليا الدولي AYT',
        nameEn: 'Antalya Airport AYT',
        searchLabel: 'Antalya Airport - AYT',
        aliases: ['أنطاليا', 'انطاليا', 'antalya', 'ayt'],
      },
      {
        iata: 'TZX',
        nameAr: 'مطار طرابزون الدولي TZX',
        nameEn: 'Trabzon Airport TZX',
        searchLabel: 'Trabzon Airport - TZX',
        aliases: ['طرابزون', 'ترابزون', 'trabzon', 'tzx'],
      },
      {
        iata: 'ESB',
        nameAr: 'مطار أنقرة إيسنبوغا ESB',
        nameEn: 'Ankara Esenboğa Airport ESB',
        searchLabel: 'Ankara Esenboğa Airport - ESB',
        aliases: ['أنقرة', 'انقرة', 'ankara', 'esb'],
      },
      {
        iata: 'ADB',
        nameAr: 'مطار إزمير عدنان مندريس ADB',
        nameEn: 'Adnan Menderes Airport (Izmir) ADB',
        searchLabel: 'Adnan Menderes Airport - ADB',
        aliases: ['إزمير', 'ازمير', 'izmir', 'adb'],
      },
      {
        iata: 'DLM',
        nameAr: 'مطار دالامان الدولي DLM',
        nameEn: 'Dalaman Airport DLM',
        searchLabel: 'Dalaman Airport - DLM',
        aliases: ['دالامان', 'dalaman', 'dlm'],
      },
      {
        iata: 'BJV',
        nameAr: 'مطار ميلاس بودروم BJV',
        nameEn: 'Milas-Bodrum Airport BJV',
        searchLabel: 'Milas-Bodrum Airport - BJV',
        aliases: ['بودروم', 'bodrum', 'bjv'],
      },
    ],
  },
  {
    key: 'egypt',
    flag: '🇪🇬',
    nameAr: 'مصر',
    nameEn: 'Egypt',
    aliases: ['مصر', 'egypt', 'أم الدنيا', 'ام الدنيا', 'misr'],
    airports: [
      {
        iata: 'CAI',
        nameAr: 'مطار القاهرة الدولي CAI',
        nameEn: 'Cairo International Airport CAI',
        searchLabel: 'Cairo International Airport - CAI',
        aliases: ['القاهرة', 'القاهره', 'cairo', 'cai', 'مطار القاهرة'],
      },
      {
        iata: 'SPX',
        nameAr: 'مطار سفنكس الدولي SPX',
        nameEn: 'Sphinx International Airport SPX',
        searchLabel: 'Sphinx International Airport - SPX',
        aliases: ['سفنكس', 'sphinx', 'spx'],
      },
      {
        iata: 'SSH',
        nameAr: 'مطار شرم الشيخ الدولي SSH',
        nameEn: 'Sharm El Sheikh Airport SSH',
        searchLabel: 'Sharm El Sheikh International Airport - SSH',
        aliases: ['شرم الشيخ', 'شرم', 'sharm', 'ssh'],
      },
      {
        iata: 'HRG',
        nameAr: 'مطار الغردقة الدولي HRG',
        nameEn: 'Hurghada International Airport HRG',
        searchLabel: 'Hurghada International Airport - HRG',
        aliases: ['الغردقة', 'الغردقه', 'hurghada', 'hrg'],
      },
      {
        iata: 'HBE',
        nameAr: 'مطار برج العرب الدولي (الإسكندرية) HBE',
        nameEn: 'Borg El Arab Airport (Alexandria) HBE',
        searchLabel: 'Borg El Arab International Airport - HBE',
        aliases: ['برج العرب', 'الإسكندرية', 'الاسكندرية', 'alexandria', 'hbe'],
      },
      {
        iata: 'LXR',
        nameAr: 'مطار الأقصر الدولي LXR',
        nameEn: 'Luxor International Airport LXR',
        searchLabel: 'Luxor International Airport - LXR',
        aliases: ['الأقصر', 'الاقصر', 'luxor', 'lxr'],
      },
      {
        iata: 'ASW',
        nameAr: 'مطار أسوان الدولي ASW',
        nameEn: 'Aswan International Airport ASW',
        searchLabel: 'Aswan International Airport - ASW',
        aliases: ['أسوان', 'اسوان', 'aswan', 'asw'],
      },
    ],
  },
  {
    key: 'jordan',
    flag: '🇯🇴',
    nameAr: 'الأردن',
    nameEn: 'Jordan',
    aliases: ['الأردن', 'الاردن', 'jordan', 'اردن'],
    airports: [
      {
        iata: 'AMM',
        nameAr: 'مطار الملكة علياء الدولي (عمان) AMM',
        nameEn: 'Queen Alia International Airport (Amman) AMM',
        searchLabel: 'Queen Alia International Airport - AMM',
        aliases: ['عمان', 'عمّان', 'الملكة علياء', 'amman', 'amm'],
      },
      {
        iata: 'AQJ',
        nameAr: 'مطار الملك حسين الدولي (العقبة) AQJ',
        nameEn: 'King Hussein International Airport (Aqaba) AQJ',
        searchLabel: 'King Hussein International Airport - AQJ',
        aliases: ['العقبة', 'العقبه', 'aqaba', 'aqj', 'الملك حسين'],
      },
    ],
  },
  {
    key: 'georgia',
    flag: '🇬🇪',
    nameAr: 'جورجيا',
    nameEn: 'Georgia',
    aliases: ['جورجيا', 'georgia'],
    airports: [
      {
        iata: 'TBS',
        nameAr: 'مطار تبليسي الدولي TBS',
        nameEn: 'Tbilisi International Airport TBS',
        searchLabel: 'Tbilisi International Airport - TBS',
        aliases: ['تبليسي', 'tbilisi', 'tbs'],
      },
      {
        iata: 'BUS',
        nameAr: 'مطار باتومي الدولي BUS',
        nameEn: 'Batumi International Airport BUS',
        searchLabel: 'Batumi International Airport - BUS',
        aliases: ['باتومي', 'batumi', 'bus'],
      },
      {
        iata: 'KUT',
        nameAr: 'مطار كوتايسي الدولي KUT',
        nameEn: 'Kutaisi International Airport KUT',
        searchLabel: 'Kutaisi International Airport - KUT',
        aliases: ['كوتايسي', 'kutaisi', 'kut'],
      },
    ],
  },
  {
    key: 'morocco',
    flag: '🇲🇦',
    nameAr: 'المغرب',
    nameEn: 'Morocco',
    aliases: ['المغرب', 'المغريب', 'morocco', 'maroc'],
    airports: [
      {
        iata: 'CMN',
        nameAr: 'مطار محمد الخامس الدولي (الدار البيضاء) CMN',
        nameEn: 'Mohammed V International Airport (Casablanca) CMN',
        searchLabel: 'Mohammed V International Airport - CMN',
        aliases: ['الدار البيضاء', 'كازابلانكا', 'محمد الخامس', 'casablanca', 'cmn'],
      },
      {
        iata: 'RAK',
        nameAr: 'مطار مراكش المنارة الدولي RAK',
        nameEn: 'Marrakesh Menara Airport RAK',
        searchLabel: 'Marrakesh Menara Airport - RAK',
        aliases: ['مراكش', 'marrakech', 'marrakesh', 'rak', 'المنارة'],
      },
      {
        iata: 'AGA',
        nameAr: 'مطار أكادير المسيرة الدولي AGA',
        nameEn: 'Agadir Al Massira Airport AGA',
        searchLabel: 'Agadir Al Massira Airport - AGA',
        aliases: ['أكادير', 'اكادير', 'agadir', 'aga'],
      },
      {
        iata: 'TNG',
        nameAr: 'مطار طنجة ابن بطوطة الدولي TNG',
        nameEn: 'Tangier Ibn Battouta Airport TNG',
        searchLabel: 'Tangier Ibn Battouta Airport - TNG',
        aliases: ['طنجة', 'طنجه', 'ابن بطوطة', 'tangier', 'tng'],
      },
    ],
  },
  {
    key: 'spain',
    flag: '🇪🇸',
    nameAr: 'إسبانيا',
    nameEn: 'Spain',
    aliases: ['إسبانيا', 'اسبانيا', 'spain', 'españa'],
    airports: [
      {
        iata: 'MAD',
        nameAr: 'مطار مدريد باراخاس الدولي MAD',
        nameEn: 'Adolfo Suárez Madrid–Barajas Airport MAD',
        searchLabel: 'Madrid-Barajas Airport - MAD',
        aliases: ['مدريد', 'madrid', 'mad', 'باراخاس'],
      },
      {
        iata: 'BCN',
        nameAr: 'مطار برشلونة الدولي BCN',
        nameEn: 'Barcelona–El Prat Airport BCN',
        searchLabel: 'Barcelona-El Prat Airport - BCN',
        aliases: ['برشلونة', 'برشلونه', 'barcelona', 'bcn'],
      },
      {
        iata: 'AGP',
        nameAr: 'مطار ملقة الدولي AGP',
        nameEn: 'Málaga Airport AGP',
        searchLabel: 'Málaga Airport - AGP',
        aliases: ['ملقة', 'ملقه', 'malaga', 'agp'],
      },
    ],
  },
];

// Arabic numerals helper
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
export function toArabicNumber(num: number): string {
  return String(num)
    .split('')
    .map((d) => ARABIC_DIGITS[parseInt(d, 10)] || d)
    .join('');
}

// Generate country flag action buttons for initial welcome
export function getCountryFlagButtons(isEnglish: boolean) {
  return COUNTRY_DESTINATIONS.map((c) => ({
    label: `${c.flag} ${isEnglish ? c.nameEn : c.nameAr}`,
    promptText: isEnglish ? c.nameEn : c.nameAr,
  }));
}

// Check if a message matches any country
export function matchCountry(query: string): CountryDestination | null {
  if (!query) return null;
  const q = query.trim().toLowerCase();

  for (const c of COUNTRY_DESTINATIONS) {
    if (q.includes(c.nameAr.toLowerCase()) || q.includes(c.nameEn.toLowerCase())) {
      return c;
    }
    for (const alias of c.aliases) {
      if (q.includes(alias.toLowerCase())) {
        return c;
      }
    }
  }
  return null;
}

// Check if a message matches any specific airport
export function matchAirport(query: string): { airport: AirportDestination; country: CountryDestination } | null {
  if (!query) return null;
  const q = query.trim().toLowerCase();

  // First check IATA codes exact token match (e.g. DXB, SHJ, AUH, DOH, KWI, etc.)
  for (const c of COUNTRY_DESTINATIONS) {
    for (const a of c.airports) {
      const iata = a.iata.toLowerCase();
      // Match IATA as distinct word or token
      const iataRegex = new RegExp(`(^|[^a-zA-Z0-9])${iata}([^a-zA-Z0-9]|$)`, 'i');
      if (iataRegex.test(q)) {
        return { airport: a, country: c };
      }
    }
  }

  // Next check specific airport names and aliases
  for (const c of COUNTRY_DESTINATIONS) {
    for (const a of c.airports) {
      if (q.includes(a.nameAr.toLowerCase()) || q.includes(a.nameEn.toLowerCase()) || q.includes(a.searchLabel.toLowerCase())) {
        return { airport: a, country: c };
      }
      for (const alias of a.aliases) {
        if (alias.length >= 3 && q.includes(alias.toLowerCase())) {
          return { airport: a, country: c };
        }
      }
    }
  }

  return null;
}

// Format the organized and numbered airport list
export function formatAirportsText(country: CountryDestination, isEnglish: boolean): string {
  if (isEnglish) {
    const list = country.airports
      .map((a, idx) => `${idx + 1}- ${a.nameEn}`)
      .join('\n');
    return `Great! Here are the available airports in **${country.nameEn}** ${country.flag}:\n\n${list}\n\nPlease select your airport to proceed:`;
  }

  const list = country.airports
    .map((a, idx) => `${toArabicNumber(idx + 1)}- ${a.nameAr}`)
    .join('\n');
  return `ممتاز! إليك المطارات المتاحة في **${country.nameAr}** ${country.flag}:\n\n${list}\n\nيرجى اختيار المطار المناسب لك:`;
}

// Generate action buttons for airports in a country
export function getAirportButtons(country: CountryDestination, isEnglish: boolean) {
  return country.airports.map((a) => ({
    label: `✈️ ${isEnglish ? a.nameEn : a.nameAr}`,
    promptText: isEnglish ? a.nameEn : a.nameAr,
  }));
}
