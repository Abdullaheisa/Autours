import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Currency } from '@/types';

// Re-export for any files that still import Currency from this slice
export type { Currency };

interface CurrencyState {
  code: Currency;
  symbol: string;
  rate: number;
  allRates: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export const currencySymbols: Record<string, string> = {
  // Global Major
  USD: '$',
  EUR: '€',
  GBP: '£',

  // Arab Countries & GCC & MENA
  AED: 'AED',
  AFN: 'AFN',
  SAR: 'SAR',
  QAR: 'QAR',
  KWD: 'KWD',
  OMR: 'OMR',
  BHD: 'BHD',
  EGP: 'EGP',
  JOD: 'JOD',
  MAD: 'MAD',
  LBP: 'LBP',
  IQD: 'IQD',
  DZD: 'DZD',
  TND: 'TND',
  LYD: 'LYD',
  SDG: 'SDG',
  YER: 'YER',
  SYP: 'SYP',
  MRU: 'MRU',
  DJF: 'DJF',
  KMF: 'KMF',
  SOS: 'SOS',

  // Key Travel Destinations & Europe
  TRY: 'TRY',
  GEL: 'GEL',
  AZN: 'AZN',
  BAM: 'BAM',
  CHF: 'CHF',
  SEK: 'SEK',
  NOK: 'NOK',
  DKK: 'DKK',
  PLN: 'PLN',
  CZK: 'CZK',
  HUF: 'HUF',
  RON: 'RON',
  BGN: 'BGN',
  RSD: 'RSD',
  ALL: 'ALL',
  MKD: 'MKD',
  MDL: 'MDL',
  UAH: 'UAH',
  RUB: 'RUB',
  AMD: 'AMD',
  ISK: 'ISK',
  BYN: 'BYN',

  // Americas & Asia-Pacific & Africa
  CAD: 'CA$',
  AUD: 'AU$',
  NZD: 'NZ$',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  PKR: 'PKR',
  BDT: 'BDT',
  LKR: 'LKR',
  NPR: 'NPR',
  IDR: 'IDR',
  MYR: 'MYR',
  SGD: 'SG$',
  THB: '฿',
  PHP: '₱',
  KRW: '₩',
  HKD: 'HK$',
  TWD: 'NT$',
  VND: '₫',
  KZT: 'KZT',
  UZS: 'UZS',
  KGS: 'KGS',
  TJS: 'TJS',
  TMT: 'TMT',
  BRL: 'R$',
  MXN: 'Mex$',
  ARS: 'ARS',
  CLP: 'CLP',
  COP: 'COP',
  PEN: 'PEN',
  CRC: 'CRC',
  DOP: 'DOP',
  GTQ: 'GTQ',
  HNL: 'HNL',
  NIO: 'NIO',
  PAB: 'PAB',
  BOB: 'BOB',
  PYG: 'PYG',
  UYU: 'UYU',
  VES: 'VES',
  JMD: 'JMD',
  TTD: 'TTD',
  BSD: 'BSD',
  BBD: 'BBD',
  BZD: 'BZD',
  BMD: 'BMD',
  KYD: 'KYD',
  XCD: 'XCD',
  ZAR: 'ZAR',
  KES: 'KES',
  NGN: 'NGN',
  GHS: 'GHS',
  TZS: 'TZS',
  UGX: 'UGX',
  ETB: 'ETB',
  MUR: 'MUR',
  NAD: 'NAD',
  BWP: 'BWP',
  ZMW: 'ZMW',
  MZN: 'MZN',
  AOA: 'AOA',
  RWF: 'RWF',
  XOF: 'XOF',
  XAF: 'XAF',
  MGA: 'MGA',
  MWK: 'MWK',
  SCR: 'SCR',
  SZL: 'SZL',
  LSL: 'LSL',
  BND: 'BND',
  KHR: 'KHR',
  LAK: 'LAK',
  MMK: 'MMK',
  MNT: 'MNT',
  MOP: 'MOP',
  MVR: 'MVR',
  PGK: 'PGK',
  FJD: 'FJD',
  WST: 'WST',
  TOP: 'TOP',
  SBD: 'SBD',
  VUV: 'VUV',
};

export const fallbackRates: Record<string, number> = {
  // Global Major
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,

  // Arab Countries & GCC & MENA
  AED: 3.67,
  AFN: 70.5,
  SAR: 3.75,
  QAR: 3.64,
  KWD: 0.31,
  OMR: 0.38,
  BHD: 0.38,
  EGP: 48.5,
  JOD: 0.71,
  MAD: 10.0,
  LBP: 89500,
  IQD: 1310,
  DZD: 134,
  TND: 3.1,
  LYD: 4.85,
  SDG: 600,
  YER: 250,
  SYP: 13000,
  MRU: 39.5,
  DJF: 177,
  KMF: 450,
  SOS: 571,

  // Key Travel Destinations & Europe
  TRY: 34.0,
  GEL: 2.7,
  AZN: 1.7,
  BAM: 1.8,
  CHF: 0.88,
  SEK: 10.5,
  NOK: 10.8,
  DKK: 6.9,
  PLN: 3.95,
  CZK: 23.2,
  HUF: 360,
  RON: 4.6,
  BGN: 1.8,
  RSD: 108,
  ALL: 92,
  MKD: 56.5,
  MDL: 17.8,
  UAH: 41.2,
  RUB: 90,
  AMD: 388,
  ISK: 138,
  BYN: 3.27,

  // Americas & Asia-Pacific & Africa
  CAD: 1.36,
  AUD: 1.52,
  NZD: 1.64,
  JPY: 155,
  CNY: 7.25,
  INR: 84.0,
  PKR: 278,
  BDT: 120,
  LKR: 300,
  NPR: 134,
  IDR: 15800,
  MYR: 4.45,
  SGD: 1.34,
  THB: 35.5,
  PHP: 57.5,
  KRW: 1380,
  HKD: 7.8,
  TWD: 32.0,
  VND: 25000,
  KZT: 480,
  UZS: 12700,
  KGS: 86,
  TJS: 10.7,
  TMT: 3.5,
  BRL: 5.5,
  MXN: 19.5,
  ARS: 950,
  CLP: 940,
  COP: 4100,
  PEN: 3.75,
  CRC: 515,
  DOP: 60,
  GTQ: 7.7,
  HNL: 24.8,
  NIO: 36.8,
  PAB: 1.0,
  BOB: 6.9,
  PYG: 7700,
  UYU: 41.0,
  VES: 36.5,
  JMD: 157,
  TTD: 6.75,
  BSD: 1.0,
  BBD: 2.0,
  BZD: 2.0,
  BMD: 1.0,
  KYD: 0.83,
  XCD: 2.7,
  ZAR: 18.0,
  KES: 129,
  NGN: 1600,
  GHS: 15.5,
  TZS: 2700,
  UGX: 3700,
  ETB: 120,
  MUR: 46.5,
  NAD: 18.0,
  BWP: 13.5,
  ZMW: 26.5,
  MZN: 63.8,
  AOA: 915,
  RWF: 1350,
  XOF: 605,
  XAF: 605,
  MGA: 4550,
  MWK: 1735,
  SCR: 13.8,
  SZL: 18.0,
  LSL: 18.0,
  BND: 1.34,
  KHR: 4050,
  LAK: 21800,
  MMK: 2100,
  MNT: 3400,
  MOP: 8.0,
  MVR: 15.4,
  PGK: 3.9,
  FJD: 2.25,
  WST: 2.75,
  TOP: 2.35,
  SBD: 8.45,
  VUV: 119,
};

const CACHE_KEY = 'currency_rates_cache';
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

export const fetchExchangeRates = createAsyncThunk(
  'currency/fetchRates',
  async (force: boolean = false, { getState, rejectWithValue }) => {
    const state = (getState() as any).currency as CurrencyState;
    const now = Date.now();

    // Check cache unless force refresh is requested
    if (!force && state.lastUpdated && (now - state.lastUpdated < CACHE_EXPIRY)) {
      return state.allRates;
    }

    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (!response.ok) throw new Error('Failed to fetch exchange rates');
      const data = await response.json();
      
      const rates = data.rates;
      if (typeof window !== 'undefined') {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          rates,
          timestamp: now
        }));
      }
      return rates;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const initialState: CurrencyState = {
  code: 'EGP',
  symbol: 'EGP',
  rate: 48.5,
  allRates: fallbackRates,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<Currency>) => {
      const code = action.payload;
      if (currencySymbols[code]) {
        state.code = code;
        state.symbol = currencySymbols[code];
        state.rate = state.allRates[code] ?? fallbackRates[code] ?? 1;
        if (typeof window !== 'undefined') {
          localStorage.setItem('selected_currency', code);
        }
      }
    },
    initCurrency: (state) => {
      if (typeof window !== 'undefined') {
        // 1. Restore selected currency
        const savedCurrency = localStorage.getItem('selected_currency') as Currency;
        if (savedCurrency && currencySymbols[savedCurrency]) {
          state.code = savedCurrency;
          state.symbol = currencySymbols[savedCurrency];
        } else {
          state.code = 'EGP';
          state.symbol = 'EGP';
          localStorage.setItem('selected_currency', 'EGP');
        }

        // 2. Restore cached rates
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const { rates, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_EXPIRY) {
              state.allRates = rates;
              state.lastUpdated = timestamp;
              state.rate = rates[state.code] ?? fallbackRates[state.code] ?? 1;
            }
          } catch (e) {
            console.error('Failed to parse currency cache');
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allRates = action.payload;
        state.lastUpdated = Date.now();
        state.rate = action.payload[state.code] ?? fallbackRates[state.code] ?? 1;
      })
      .addCase(fetchExchangeRates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrency, initCurrency } = currencySlice.actions;
export default currencySlice.reducer;
