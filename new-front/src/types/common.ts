export type Status = "active" | "inactive" | "pending" | "suspended" | "published" | "draft" | "scheduled";

export type KnownCurrency = 
  | 'USD' | 'EUR' | 'GBP'
  | 'AED' | 'SAR' | 'QAR' | 'KWD' | 'OMR' | 'BHD' | 'EGP' | 'JOD' | 'MAD'
  | 'LBP' | 'IQD' | 'DZD' | 'TND' | 'LYD' | 'SDG' | 'YER' | 'SYP' | 'MRU'
  | 'TRY' | 'GEL' | 'AZN' | 'BAM' | 'CHF' | 'SEK' | 'NOK' | 'DKK' | 'PLN'
  | 'CZK' | 'HUF' | 'RON' | 'BGN' | 'RSD' | 'ALL' | 'MKD' | 'MDL' | 'UAH'
  | 'RUB' | 'AMD' | 'CAD' | 'AUD' | 'NZD' | 'JPY' | 'CNY' | 'INR' | 'PKR'
  | 'IDR' | 'MYR' | 'SGD' | 'THB' | 'PHP' | 'KRW' | 'HKD' | 'BRL' | 'MXN'
  | 'ARS' | 'CLP' | 'COP' | 'ZAR' | 'KES' | 'MUR' | 'UZS';

export type Currency = KnownCurrency | (string & {});



export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  avatar?: string;
  logo?: string;
  phone_num?: string;
  country?: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  image: string;
  cities: string[];
}
