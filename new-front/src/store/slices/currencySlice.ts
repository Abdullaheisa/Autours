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

  // Americas & Asia-Pacific & Africa
  CAD: 'CA$',
  AUD: 'AU$',
  NZD: 'NZ$',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  PKR: 'PKR',
  IDR: 'IDR',
  MYR: 'MYR',
  SGD: 'SG$',
  THB: '฿',
  PHP: '₱',
  KRW: '₩',
  HKD: 'HK$',
  BRL: 'R$',
  MXN: 'Mex$',
  ARS: 'ARS',
  CLP: 'CLP',
  COP: 'COP',
  ZAR: 'ZAR',
  KES: 'KES',
  MUR: 'MUR',
  UZS: 'UZS',
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

  // Americas & Asia-Pacific & Africa
  CAD: 1.36,
  AUD: 1.52,
  NZD: 1.64,
  JPY: 155,
  CNY: 7.25,
  INR: 84.0,
  PKR: 278,
  IDR: 15800,
  MYR: 4.45,
  SGD: 1.34,
  THB: 35.5,
  PHP: 57.5,
  KRW: 1380,
  HKD: 7.8,
  BRL: 5.5,
  MXN: 19.5,
  ARS: 950,
  CLP: 940,
  COP: 4100,
  ZAR: 18.0,
  KES: 129,
  MUR: 46.5,
  UZS: 12700,
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
  code: 'AED',
  symbol: 'AED',
  rate: 3.67,
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
