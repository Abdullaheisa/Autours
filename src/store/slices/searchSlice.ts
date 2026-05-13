import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { vehicleApi } from '@/services/api/vehicleApi';
import {
  SearchPayload,
  FilterPayload,
  FilterResponse,
  Vehicle,
} from '@/types';

// ─── Types ────────────────────────────────────────────
export interface SearchParams {
  location: string;
  dateFrom: string | null;
  dateTo: string | null;
  startTime: string;
  endTime: string;
}

export interface FilterParams {
  priceRange: [number, number] | null;
  category: string[];
  supplier: string[];
  locationType: string[];
  seats: string[];
  doors: string[];
  transmission: string[];
  fuelType: string[];
  airConditioning: string | null;
  suitcases: string[];
  paymentType: string[];
  rating: number | null;
  sortBy: 'price_low' | 'price_high' | 'rating' | 'popular';
}

interface SearchState {
  // Search parameters from hero / re-search form
  searchParams: SearchParams;

  // Filter parameters for sidebar
  filterParams: FilterParams;

  // API response data
  vehicles: Vehicle[];
  count: number;
  daysNumber: number;
  maxPrice: number;
  minPrice: number;
  filteredCategories: { id: number; name: string; vehicle_count: number }[];
  filteredSuppliers: { id: number; name: string; vehicle_count: number }[];

  // UI state
  isSearching: boolean;
  isFiltering: boolean;
  searchError: string | null;
  filterError: string | null;
  hasSearched: boolean;
}

const initialState: SearchState = {
  searchParams: {
    location: '',
    dateFrom: null,
    dateTo: null,
    startTime: '10:00',
    endTime: '10:00',
  },
  filterParams: {
    priceRange: null,
    category: [],
    supplier: [],
    locationType: [],
    seats: [],
    doors: [],
    transmission: [],
    fuelType: [],
    airConditioning: null,
    suitcases: [],
    paymentType: [],
    rating: null,
    sortBy: 'price_low',
  },
  vehicles: [],
  count: 0,
  daysNumber: 0,
  maxPrice: 0,
  minPrice: 0,
  filteredCategories: [],
  filteredSuppliers: [],
  isSearching: false,
  isFiltering: false,
  searchError: null,
  filterError: null,
  hasSearched: false,
};

// ─── Async Thunks ─────────────────────────────────────

/**
 * Initiate search from the hero section.
 * POSTs to /search/vehicles to save session on the backend.
 */
export const initiateSearch = createAsyncThunk(
  'search/initiateSearch',
  async (payload: SearchPayload, { rejectWithValue }) => {
    try {
      await vehicleApi.search(payload);
      return payload;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Search failed');
    }
  }
);

/**
 * Fetch vehicles from /filter/vehicles.
 * Called on results page load and whenever filters change.
 */
export const fetchVehicles = createAsyncThunk(
  'search/fetchVehicles',
  async (payload: FilterPayload, { rejectWithValue }) => {
    try {
      const response = await vehicleApi.filter(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch vehicles');
    }
  }
);

// ─── Slice ────────────────────────────────────────────

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchParams: (state, action: PayloadAction<Partial<SearchParams>>) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    setFilterParams: (state, action: PayloadAction<Partial<FilterParams>>) => {
      state.filterParams = { ...state.filterParams, ...action.payload };
    },
    toggleFilterParam: (state, action: PayloadAction<{ key: keyof FilterParams; value: string }>) => {
      const { key, value } = action.payload;
      const current = state.filterParams[key];
      
      if (Array.isArray(current)) {
        const arr = current as any[];
        if (arr.includes(value)) {
          (state.filterParams as any)[key] = arr.filter(v => v !== value);
        } else {
          (state.filterParams as any)[key] = [...arr, value];
        }
      }
    },
    resetFilters: (state) => {
      state.filterParams = initialState.filterParams;
    },
    resetSearch: () => initialState,
    clearErrors: (state) => {
      state.searchError = null;
      state.filterError = null;
    },
    applyLocalFilters: (state) => {
      // This is a placeholder for local filtering logic if needed.
      // Currently, filtering is handled by the fetchVehicles thunk.
    },
  },
  extraReducers: (builder) => {
    // ── initiateSearch ──
    builder
      .addCase(initiateSearch.pending, (state) => {
        state.isSearching = true;
        state.searchError = null;
      })
      .addCase(initiateSearch.fulfilled, (state, action) => {
        state.isSearching = false;
        state.hasSearched = true;
        // Save the search params from the payload
        state.searchParams.location = action.payload.pickupLoc;
        state.searchParams.dateFrom = action.payload.date_from;
        state.searchParams.dateTo = action.payload.date_to;
      })
      .addCase(initiateSearch.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.payload as string;
      });

    // ── fetchVehicles ──
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.isFiltering = true;
        state.filterError = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action: PayloadAction<FilterResponse>) => {
        state.isFiltering = false;
        state.hasSearched = true;
        state.vehicles = action.payload.filteredVehicles;
        state.count = action.payload.count;
        state.daysNumber = action.payload.daysNumber;
        state.maxPrice = action.payload.max;
        state.minPrice = action.payload.min;
        state.filteredCategories = action.payload.filteredCategories || [];
        state.filteredSuppliers = action.payload.filteredSuppliers || [];
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.isFiltering = false;
        state.filterError = action.payload as string;
      });
  },
});

export const {
  setSearchParams,
  setFilterParams,
  toggleFilterParam,
  resetFilters,
  resetSearch,
  clearErrors,
  applyLocalFilters,
} = searchSlice.actions;

export default searchSlice.reducer;
