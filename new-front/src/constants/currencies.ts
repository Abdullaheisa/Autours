export interface CurrencyInfo {
  code: string;
  symbol: string;
  flag: string;
  name: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", symbol: "$", flag: "us", name: "US Dollar" },
  { code: "EUR", symbol: "€", flag: "eu", name: "Euro" },
  { code: "GBP", symbol: "£", flag: "gb", name: "British Pound" },
  { code: "AED", symbol: "د.إ", flag: "ae", name: "UAE Dirham" },
  { code: "SAR", symbol: "ر.س", flag: "sa", name: "Saudi Riyal" },
  { code: "QAR", symbol: "ر.ق", flag: "qa", name: "Qatari Riyal" },
  { code: "KWD", symbol: "د.ك", flag: "kw", name: "Kuwaiti Dinar" },
  { code: "BHD", symbol: "د.ب", flag: "bh", name: "Bahraini Dinar" },
  { code: "OMR", symbol: "ر.ع", flag: "om", name: "Omani Rial" },
  { code: "JOD", symbol: "د.أ", flag: "jo", name: "Jordanian Dinar" },
  { code: "EGP", symbol: "ج.م", flag: "eg", name: "Egyptian Pound" },
  { code: "TRY", symbol: "₺", flag: "tr", name: "Turkish Lira" },
  { code: "CAD", symbol: "C$", flag: "ca", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", flag: "au", name: "Australian Dollar" },
];

export function getCurrencyItem(code: string): CurrencyInfo {
  if (!code) return CURRENCIES[0];
  const found = CURRENCIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
  return found || { code, symbol: code, flag: "un", name: code };
}
