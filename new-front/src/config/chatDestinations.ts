// Structured destinations, official ISO flag codes, airports, and city branches for Autours AI Assistant

export interface AirportDestination {
  iata: string;
  nameAr: string;
  nameEn: string;
  searchLabel: string;
  aliases: string[];
}

export interface CityDestination {
  key: string;
  nameAr: string;
  nameEn: string;
  searchLabel: string;
  aliases: string[];
}

export interface CountryDestination {
  key: string;
  iso: string; // 2-letter ISO code for FlagCDN official images
  flagEmoji: string;
  nameAr: string;
  nameEn: string;
  aliases: string[];
  airports: AirportDestination[];
  cities: CityDestination[];
}

export const COUNTRY_DESTINATIONS: CountryDestination[] = [
  {
    key: 'uae',
    iso: 'ae',
    flagEmoji: '🇦🇪',
    nameAr: 'الإمارات',
    nameEn: 'UAE',
    aliases: ['الإمارات', 'الامارات', 'uae', 'united arab emirates', 'امارات', 'دولة الامارات'],
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
    cities: [
      {
        key: 'dubai_city',
        nameAr: 'دبي (وسط المدينة / ديرة / مارينا)',
        nameEn: 'Downtown Dubai / Marina',
        searchLabel: 'Dubai',
        aliases: ['دبي مدينة', 'وسط دبي', 'مارينا', 'ديرة', 'بر دبي', 'downtown dubai', 'dubai marina'],
      },
      {
        key: 'abudhabi_city',
        nameAr: 'أبوظبي (المدينة / الكورنيش)',
        nameEn: 'Abu Dhabi City Center',
        searchLabel: 'Abu Dhabi',
        aliases: ['أبوظبي مدينة', 'مدينة ابوظبي', 'abu dhabi city'],
      },
      {
        key: 'sharjah_city',
        nameAr: 'الشارقة (المدينة)',
        nameEn: 'Sharjah City Center',
        searchLabel: 'Sharjah',
        aliases: ['الشارقة مدينة', 'مدينة الشارقة', 'sharjah city'],
      },
      {
        key: 'rak_city',
        nameAr: 'رأس الخيمة (المدينة)',
        nameEn: 'Ras Al Khaimah City',
        searchLabel: 'Ras Al Khaimah',
        aliases: ['راس الخيمة مدينة', 'مدينة راس الخيمة'],
      },
    ],
  },
  {
    key: 'saudi',
    iso: 'sa',
    flagEmoji: '🇸🇦',
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
    ],
    cities: [
      {
        key: 'riyadh_city',
        nameAr: 'الرياض (وسط المدينة / العليا)',
        nameEn: 'Riyadh City Center',
        searchLabel: 'Riyadh',
        aliases: ['الرياض مدينة', 'وسط الرياض', 'العليا'],
      },
      {
        key: 'jeddah_city',
        nameAr: 'جدة (المدينة / الكورنيش)',
        nameEn: 'Jeddah City Center',
        searchLabel: 'Jeddah',
        aliases: ['جدة مدينة', 'كورنيش جدة'],
      },
      {
        key: 'dammam_city',
        nameAr: 'الدمام والخبر (المدينة)',
        nameEn: 'Dammam & Khobar City',
        searchLabel: 'Dammam',
        aliases: ['الدمام مدينة', 'الخبر'],
      },
      {
        key: 'makkah_city',
        nameAr: 'مكة المكرمة',
        nameEn: 'Makkah',
        searchLabel: 'Makkah',
        aliases: ['مكة', 'مكه'],
      },
    ],
  },
  {
    key: 'qatar',
    iso: 'qa',
    flagEmoji: '🇶🇦',
    nameAr: 'قطر',
    nameEn: 'Qatar',
    aliases: ['قطر', 'qatar', 'الدوحة', 'الدوحه', 'doha'],
    airports: [
      {
        iata: 'DOH',
        nameAr: 'مطار حمد الدولي DOH',
        nameEn: 'Hamad International Airport DOH',
        searchLabel: 'Hamad International Airport - DOH',
        aliases: ['حمد', 'مطار حمد', 'hamad', 'doh', 'hamad airport'],
      },
    ],
    cities: [
      {
        key: 'doha_city',
        nameAr: 'الدوحة (وسط المدينة / الخليج الغربي / لوسيل)',
        nameEn: 'Doha City Center / Lusail',
        searchLabel: 'Doha',
        aliases: ['الدوحة مدينة', 'لوسيل', 'الخليج الغربي', 'doha city', 'west bay'],
      },
    ],
  },
  {
    key: 'kuwait',
    iso: 'kw',
    flagEmoji: '🇰🇼',
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
    cities: [
      {
        key: 'kuwait_city',
        nameAr: 'مدينة الكويت (السالمية / حولي / الفروانية)',
        nameEn: 'Kuwait City / Salmiya',
        searchLabel: 'Kuwait',
        aliases: ['السالمية', 'حولي', 'الفروانية', 'مدينة الكويت'],
      },
    ],
  },
  {
    key: 'bahrain',
    iso: 'bh',
    flagEmoji: '🇧🇭',
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
    cities: [
      {
        key: 'manama_city',
        nameAr: 'المنامة (السيف / الجفير)',
        nameEn: 'Manama City Center / Seef',
        searchLabel: 'Manama',
        aliases: ['المنامة', 'السيف', 'الجفير', 'manama city'],
      },
    ],
  },
  {
    key: 'oman',
    iso: 'om',
    flagEmoji: '🇴🇲',
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
    cities: [
      {
        key: 'muscat_city',
        nameAr: 'مسقط (الخوير / السيب)',
        nameEn: 'Muscat City Center',
        searchLabel: 'Muscat',
        aliases: ['مسقط مدينة', 'الخوير', 'السيب', 'muscat city'],
      },
      {
        key: 'salalah_city',
        nameAr: 'صلالة (المدينة)',
        nameEn: 'Salalah City',
        searchLabel: 'Salalah',
        aliases: ['صلالة مدينة', 'مدينة صلالة'],
      },
    ],
  },
  {
    key: 'turkey',
    iso: 'tr',
    flagEmoji: '🇹🇷',
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
    ],
    cities: [
      {
        key: 'istanbul_city',
        nameAr: 'إسطنبول (تقسيم / الفاتح / شيشلي)',
        nameEn: 'Istanbul City (Taksim / Sisli)',
        searchLabel: 'Istanbul',
        aliases: ['تقسيم', 'الفاتح', 'شيشلي', 'taksim', 'istanbul city'],
      },
      {
        key: 'trabzon_city',
        nameAr: 'طرابزون (المدينة / الميدان)',
        nameEn: 'Trabzon City Center',
        searchLabel: 'Trabzon',
        aliases: ['طرابزون مدينة', 'ميدان طرابزون'],
      },
      {
        key: 'antalya_city',
        nameAr: 'أنطاليا (المدينة / لارا)',
        nameEn: 'Antalya City Center',
        searchLabel: 'Antalya',
        aliases: ['أنطاليا مدينة', 'لارا أنطاليا'],
      },
      {
        key: 'bursa_city',
        nameAr: 'بورصة',
        nameEn: 'Bursa',
        searchLabel: 'Bursa',
        aliases: ['بورصه', 'bursa'],
      },
    ],
  },
  {
    key: 'egypt',
    iso: 'eg',
    flagEmoji: '🇪🇬',
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
        nameAr: 'مطار برج العرب (الإسكندرية) HBE',
        nameEn: 'Borg El Arab Airport (Alexandria) HBE',
        searchLabel: 'Borg El Arab International Airport - HBE',
        aliases: ['برج العرب', 'الإسكندرية', 'الاسكندرية', 'alexandria', 'hbe'],
      },
    ],
    cities: [
      {
        key: 'cairo_city',
        nameAr: 'القاهرة (وسط البلد / المعادي / التجمع)',
        nameEn: 'Cairo City / New Cairo / Maadi',
        searchLabel: 'Cairo',
        aliases: ['القاهرة مدينة', 'وسط البلد', 'المعادي', 'التجمع', 'مدينة نصر'],
      },
      {
        key: 'alex_city',
        nameAr: 'الإسكندرية (المدينة / الكورنيش)',
        nameEn: 'Alexandria City Center',
        searchLabel: 'Alexandria',
        aliases: ['الاسكندرية مدينة', 'كورنيش الاسكندرية'],
      },
      {
        key: 'sharm_city',
        nameAr: 'شرم الشيخ (المدينة / خليج نعمة)',
        nameEn: 'Sharm El Sheikh City',
        searchLabel: 'Sharm El Sheikh',
        aliases: ['خليج نعمة', 'شرم مدينة'],
      },
      {
        key: 'hurghada_city',
        nameAr: 'الغردقة (المدينة / الممشى)',
        nameEn: 'Hurghada City',
        searchLabel: 'Hurghada',
        aliases: ['الغردقة مدينة', 'ممشى الغردقة'],
      },
    ],
  },
  {
    key: 'jordan',
    iso: 'jo',
    flagEmoji: '🇯🇴',
    nameAr: 'الأردن',
    nameEn: 'Jordan',
    aliases: ['الأردن', 'الاردن', 'jordan', 'اردن'],
    airports: [
      {
        iata: 'AMM',
        nameAr: 'مطار الملكة علياء الدولي AMM',
        nameEn: 'Queen Alia International Airport AMM',
        searchLabel: 'Queen Alia International Airport - AMM',
        aliases: ['عمان', 'عمّان', 'الملكة علياء', 'amman', 'amm'],
      },
      {
        iata: 'AQJ',
        nameAr: 'مطار الملك حسين الدولي AQJ',
        nameEn: 'King Hussein International Airport AQJ',
        searchLabel: 'King Hussein International Airport - AQJ',
        aliases: ['العقبة', 'العقبه', 'aqaba', 'aqj', 'الملك حسين'],
      },
    ],
    cities: [
      {
        key: 'amman_city',
        nameAr: 'عمان (العبدلي / الشميساني)',
        nameEn: 'Amman City Center / Abdali',
        searchLabel: 'Amman',
        aliases: ['عمان مدينة', 'العبدلي', 'الشميساني'],
      },
      {
        key: 'aqaba_city',
        nameAr: 'العقبة (المدينة)',
        nameEn: 'Aqaba City',
        searchLabel: 'Aqaba',
        aliases: ['العقبة مدينة'],
      },
    ],
  },
  {
    key: 'georgia',
    iso: 'ge',
    flagEmoji: '🇬🇪',
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
    ],
    cities: [
      {
        key: 'tbilisi_city',
        nameAr: 'تبليسي (وسط المدينة)',
        nameEn: 'Tbilisi City Center',
        searchLabel: 'Tbilisi',
        aliases: ['تبليسي مدينة', 'وسط تبليسي'],
      },
      {
        key: 'batumi_city',
        nameAr: 'باتومي (الكورنيش)',
        nameEn: 'Batumi City Center',
        searchLabel: 'Batumi',
        aliases: ['باتومي مدينة'],
      },
    ],
  },
  {
    key: 'morocco',
    iso: 'ma',
    flagEmoji: '🇲🇦',
    nameAr: 'المغرب',
    nameEn: 'Morocco',
    aliases: ['المغرب', 'المغريب', 'morocco', 'maroc'],
    airports: [
      {
        iata: 'CMN',
        nameAr: 'مطار محمد الخامس الدولي CMN',
        nameEn: 'Mohammed V International Airport CMN',
        searchLabel: 'Mohammed V International Airport - CMN',
        aliases: ['الدار البيضاء', 'كازابلانكا', 'محمد الخامس', 'casablanca', 'cmn'],
      },
      {
        iata: 'RAK',
        nameAr: 'مطار مراكش المنارة RAK',
        nameEn: 'Marrakesh Menara Airport RAK',
        searchLabel: 'Marrakesh Menara Airport - RAK',
        aliases: ['مراكش', 'marrakech', 'marrakesh', 'rak'],
      },
      {
        iata: 'AGA',
        nameAr: 'مطار أكادير المسيرة AGA',
        nameEn: 'Agadir Al Massira Airport AGA',
        searchLabel: 'Agadir Al Massira Airport - AGA',
        aliases: ['أكادير', 'اكادير', 'agadir', 'aga'],
      },
    ],
    cities: [
      {
        key: 'casablanca_city',
        nameAr: 'الدار البيضاء (كازابلانكا)',
        nameEn: 'Casablanca City',
        searchLabel: 'Casablanca',
        aliases: ['كازا', 'الدار البيضاء مدينة'],
      },
      {
        key: 'marrakech_city',
        nameAr: 'مراكش (المدينة / جيليز)',
        nameEn: 'Marrakech City',
        searchLabel: 'Marrakech',
        aliases: ['مراكش مدينة', 'جيليز'],
      },
      {
        key: 'tangier_city',
        nameAr: 'طنجة (المدينة)',
        nameEn: 'Tangier City',
        searchLabel: 'Tangier',
        aliases: ['طنجة مدينة', 'طنجه'],
      },
    ],
  },
  {
    key: 'spain',
    iso: 'es',
    flagEmoji: '🇪🇸',
    nameAr: 'إسبانيا',
    nameEn: 'Spain',
    aliases: ['إسبانيا', 'اسبانيا', 'spain', 'españa'],
    airports: [
      {
        iata: 'MAD',
        nameAr: 'مطار مدريد باراخاس MAD',
        nameEn: 'Madrid–Barajas Airport MAD',
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
    cities: [
      {
        key: 'madrid_city',
        nameAr: 'مدريد (المدينة)',
        nameEn: 'Madrid City Center',
        searchLabel: 'Madrid',
        aliases: ['مدريد مدينة', 'وسط مدريد'],
      },
      {
        key: 'barcelona_city',
        nameAr: 'برشلونة (المدينة)',
        nameEn: 'Barcelona City Center',
        searchLabel: 'Barcelona',
        aliases: ['برشلونة مدينة', 'وسط برشلونة'],
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

// Generate country flag action buttons - NO text abbreviations, with official flagIso for rendering real flag image!
export function getCountryFlagButtons(isEnglish: boolean) {
  return COUNTRY_DESTINATIONS.map((c) => ({
    label: isEnglish ? c.nameEn : c.nameAr,
    promptText: isEnglish ? c.nameEn : c.nameAr,
    flagIso: c.iso,
    actionType: 'prompt' as const,
  }));
}

// Check if a message matches any country
export function matchCountry(query: string): CountryDestination | null {
  if (!query) return null;
  const q = query.trim().toLowerCase();

  for (const c of COUNTRY_DESTINATIONS) {
    if (q === c.nameAr.toLowerCase() || q === c.nameEn.toLowerCase() || q === c.iso.toLowerCase()) {
      return c;
    }
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

export interface MatchedDestination {
  type: 'airport' | 'city';
  nameAr: string;
  nameEn: string;
  searchLabel: string;
  iata?: string;
  country: CountryDestination;
}

// Check if a message matches any specific airport OR city
export function matchLocationOrAirport(query: string): MatchedDestination | null {
  if (!query) return null;
  const q = query.trim().toLowerCase();

  // 1. Check IATA codes exact token match (e.g. DXB, SHJ, AUH, DOH, KWI, etc.)
  for (const c of COUNTRY_DESTINATIONS) {
    for (const a of c.airports) {
      const iata = a.iata.toLowerCase();
      const iataRegex = new RegExp(`(^|[^a-zA-Z0-9])${iata}([^a-zA-Z0-9]|$)`, 'i');
      if (iataRegex.test(q)) {
        return {
          type: 'airport',
          nameAr: a.nameAr,
          nameEn: a.nameEn,
          searchLabel: a.searchLabel,
          iata: a.iata,
          country: c,
        };
      }
    }
  }

  // 2. Check full city branch names (e.g. "Doha City Center / Lusail", "دبي (وسط المدينة)", "Downtown Dubai")
  for (const c of COUNTRY_DESTINATIONS) {
    for (const city of c.cities) {
      if (
        q.includes(city.nameAr.toLowerCase()) ||
        q.includes(city.nameEn.toLowerCase()) ||
        (city.searchLabel && q.includes(city.searchLabel.toLowerCase()))
      ) {
        return {
          type: 'city',
          nameAr: city.nameAr,
          nameEn: city.nameEn,
          searchLabel: city.searchLabel,
          country: c,
        };
      }
    }
  }

  // 3. Check full airport names (e.g. "مطار دبي الدولي DXB", "Hamad International Airport")
  for (const c of COUNTRY_DESTINATIONS) {
    for (const a of c.airports) {
      if (
        q.includes(a.nameAr.toLowerCase()) ||
        q.includes(a.nameEn.toLowerCase()) ||
        q.includes(a.searchLabel.toLowerCase())
      ) {
        return {
          type: 'airport',
          nameAr: a.nameAr,
          nameEn: a.nameEn,
          searchLabel: a.searchLabel,
          iata: a.iata,
          country: c,
        };
      }
    }
  }

  // 4. Check city aliases
  for (const c of COUNTRY_DESTINATIONS) {
    for (const city of c.cities) {
      for (const alias of city.aliases) {
        if (alias.length >= 3 && q.includes(alias.toLowerCase())) {
          return {
            type: 'city',
            nameAr: city.nameAr,
            nameEn: city.nameEn,
            searchLabel: city.searchLabel,
            country: c,
          };
        }
      }
    }
  }

  // 5. Check airport aliases
  for (const c of COUNTRY_DESTINATIONS) {
    for (const a of c.airports) {
      for (const alias of a.aliases) {
        if (alias.length >= 3 && q.includes(alias.toLowerCase())) {
          return {
            type: 'airport',
            nameAr: a.nameAr,
            nameEn: a.nameEn,
            searchLabel: a.searchLabel,
            iata: a.iata,
            country: c,
          };
        }
      }
    }
  }

  return null;
}

// Format the organized list containing BOTH Airports AND Cities!
export function formatLocationsAndAirportsText(country: CountryDestination, isEnglish: boolean): string {
  if (isEnglish) {
    let text = `Great! Here are the available pickup locations in ${country.nameEn}:\n\n`;

    text += `✈️ International Airports:\n`;
    text += country.airports.map((a, idx) => `${idx + 1}- ${a.nameEn}`).join('\n');

    if (country.cities && country.cities.length > 0) {
      const offset = country.airports.length;
      text += `\n\n🏙️ Available Cities & Branches:\n`;
      text += country.cities.map((city, idx) => `${offset + idx + 1}- ${city.nameEn}`).join('\n');
    }

    text += `\n\nPlease select your preferred airport or city to proceed:`;
    return text;
  }

  let text = `ممتاز! إليك أهم وجهات وفروع الاستلام المتاحة في ${country.nameAr}:\n\n`;

  text += `✈️ المطارات المتاحة:\n`;
  text += country.airports.map((a, idx) => `${toArabicNumber(idx + 1)}- ${a.nameAr}`).join('\n');

  if (country.cities && country.cities.length > 0) {
    const offset = country.airports.length;
    text += `\n\n🏙️ المدن وفروع الاستلام:\n`;
    text += country.cities.map((city, idx) => `${toArabicNumber(offset + idx + 1)}- ${city.nameAr}`).join('\n');
  }

  text += `\n\nيرجى اختيار المطار أو المدينة المناسبة لك:`;
  return text;
}

// Generate action buttons for BOTH airports and cities
export function getLocationsAndAirportsButtons(country: CountryDestination, isEnglish: boolean) {
  const buttons: { label: string; promptText: string; actionType: 'prompt' }[] = [];

  // 1. Airports
  for (const a of country.airports) {
    buttons.push({
      label: `✈️ ${isEnglish ? a.nameEn : a.nameAr}`,
      promptText: isEnglish ? a.nameEn : a.nameAr,
      actionType: 'prompt',
    });
  }

  // 2. Cities
  for (const city of country.cities) {
    buttons.push({
      label: `🏙️ ${isEnglish ? city.nameEn : city.nameAr}`,
      promptText: isEnglish ? city.nameEn : city.nameAr,
      actionType: 'prompt',
    });
  }

  return buttons;
}
