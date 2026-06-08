import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { vehicleApi } from '@/services/api/vehicleApi';
import {
  SearchPayload,
  FilterPayload,
  FilterResponse,
  Vehicle,
} from '@/types';

export interface SearchParams {
  location: string;
  locationLabel?: string;
  dateFrom: string | null;
  dateTo: string | null;
  startTime: string;
  endTime: string;
}

export interface FilterParams {
  priceRange: [number, number] | null;
  category: string[]; // بيخزن الـ IDs كـ نصوص مثل ["1", "2"]
  supplier: string[]; // بيخزن الـ IDs كـ نصوص مثل ["5"]
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
  searchParams: SearchParams;
  filterParams: FilterParams;
  vehicles: Vehicle[]; // المصفوفة الأصلية اللي جاية من الباك إند بالكامل
  count: number;
  daysNumber: number;
  maxPrice: number;
  minPrice: number;
  filteredCategories: { id: number; name: string; vehicle_count: number; photo?: string }[];
  filteredSuppliers: { id: number; name: string; vehicle_count: number; logo?: string }[];
  isSearching: boolean;
  isFiltering: boolean;
  searchError: string | null;
  filterError: string | null;
  hasSearched: boolean;
  fetchedCurrency?: string;
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
  fetchedCurrency: 'AED',
};

export const initiateSearch = createAsyncThunk(
  'search/initiateSearch',
  async (payload: SearchPayload) => payload
);

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
    applyLocalFilters: () => {
      // الفلترة بالكامل اتقلت لصفحة الـ SearchPage عبر useMemo لأداء أسرع ومنع التضارب
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiateSearch.pending, (state) => {
        state.isSearching = true;
        state.searchError = null;
      })
      .addCase(initiateSearch.fulfilled, (state, action) => {
        state.isSearching = false;
        state.hasSearched = true;
        state.searchParams.location = action.payload.pickupLoc;
        state.searchParams.dateFrom = action.payload.date_from;
        state.searchParams.dateTo = action.payload.date_to;
      })
      .addCase(initiateSearch.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.payload as string;
      })
      // تفعيل كود جلب البيانات وحل مشكلة الـ Hydration والإيرور (action: any)
      .addCase(fetchVehicles.pending, (state) => {
        state.isFiltering = true;
        state.filterError = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action: any) => {
        state.isFiltering = false;
        state.hasSearched = true;
        state.vehicles = action.payload.filteredVehicles || [];
        state.count = action.payload.count;
        state.daysNumber = action.payload.daysNumber;
        state.maxPrice = action.payload.max;
        state.minPrice = action.payload.min;
        state.fetchedCurrency = action.meta?.arg?.currency || 'AED';

        const hasActiveFilters =
          state.filterParams.category.length > 0 ||
          state.filterParams.supplier.length > 0 ||
          state.filterParams.locationType.length > 0 ||
          state.filterParams.paymentType.length > 0 ||
          state.filterParams.priceRange !== null ||
          state.filterParams.seats.length > 0 ||
          state.filterParams.doors.length > 0 ||
          state.filterParams.transmission.length > 0 ||
          state.filterParams.fuelType.length > 0 ||
          state.filterParams.suitcases.length > 0 ||
          state.filterParams.airConditioning !== null ||
          state.filterParams.rating !== null;

        if (!hasActiveFilters) {
          state.filteredCategories = action.payload.filteredCategories || [];
          state.filteredSuppliers = action.payload.filteredSuppliers || [];
        }
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