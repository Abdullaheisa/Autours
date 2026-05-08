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

export const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED',
  SAR: 'SAR',
  EGP: 'EGP',
  QAR: 'QAR',
  KWD: 'KWD',
  OMR: 'OMR',
  BHD: 'BHD',
  MAD: 'MAD',
  JOD: 'JOD',
};

export const fallbackRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  SAR: 3.75,
  EGP: 48.0,
  QAR: 3.64,
  KWD: 0.31,
  OMR: 0.38,
  BHD: 0.38,
  MAD: 10.0,
  JOD: 0.71,
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
