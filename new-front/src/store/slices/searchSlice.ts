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
  driverAge?: number;
  driverAge25to70?: boolean;
  residenceCountry?: string;
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
  deposit: string[];
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
  currentPage: number;
  totalPages: number;
  perPage: number;
  cheapestVehicles: Record<string, Record<string, { car_name: string; supplier: string; price: number; currency: string }>>;
  isFetchingCheapest: boolean;
  cheapestError: string | null;
  currentRequestId?: string | null;
}

const initialState: SearchState = {
  searchParams: {
    location: '',
    dateFrom: null,
    dateTo: null,
    startTime: '10:00',
    endTime: '10:00',
    driverAge: 26,
    driverAge25to70: true,
    residenceCountry: 'Egypt',
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
    deposit: [],
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
  fetchedCurrency: 'EGP',
  currentPage: 1,
  totalPages: 1,
  perPage: 15,
  cheapestVehicles: {},
  isFetchingCheapest: false,
  cheapestError: null,
  currentRequestId: null,
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

function clearSavedExtrasSession() {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem('autours_selected_extras');
      sessionStorage.removeItem('autours_extras_vehicle_id');
    } catch {}
  }
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchParams: (state, action: PayloadAction<Partial<SearchParams>>) => {
      const prev = state.searchParams;
      const next = action.payload;
      const isCoreSearchChange =
        (next.location !== undefined && next.location !== prev.location) ||
        (next.dateFrom !== undefined && next.dateFrom !== prev.dateFrom) ||
        (next.dateTo !== undefined && next.dateTo !== prev.dateTo) ||
        (next.startTime !== undefined && next.startTime !== prev.startTime) ||
        (next.endTime !== undefined && next.endTime !== prev.endTime);

      state.searchParams = { ...state.searchParams, ...next };

      if (isCoreSearchChange) {
        clearSavedExtrasSession();
        state.hasSearched = false;
        state.vehicles = [];
        state.filteredCategories = [];
        state.filteredSuppliers = [];
        state.count = 0;
        state.isFiltering = true;
        state.filterError = null;
        state.currentPage = 1;
      }
    },
    startNewSearch: (state) => {
      clearSavedExtrasSession();
      state.hasSearched = false;
      state.vehicles = [];
      state.filteredCategories = [];
      state.filteredSuppliers = [];
      state.count = 0;
      state.isFiltering = true;
      state.filterError = null;
      state.currentPage = 1;
    },
    setFilterParams: (state, action: PayloadAction<Partial<FilterParams>>) => {
      state.filterParams = { ...state.filterParams, ...action.payload };
      state.currentPage = 1; // Reset to page 1 on filter change
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
      state.currentPage = 1; // Reset to page 1 on filter toggle
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    resetFilters: (state) => {
      state.filterParams = {
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
        deposit: [],
        rating: null,
        sortBy: 'price_low',
      };
      state.currentPage = 1;
    },
    resetForNewSearch: (state) => {
      clearSavedExtrasSession();
      state.hasSearched = false;
      state.isSearching = true;
      state.isFiltering = true;
      state.vehicles = [];
      state.filteredCategories = [];
      state.filteredSuppliers = [];
      state.count = 0;
      state.filterError = null;
      state.searchError = null;
    },
    resetSearch: () => {
      clearSavedExtrasSession();
      return initialState;
    },
    clearErrors: (state) => {
      state.searchError = null;
      state.filterError = null;
    },
    applyLocalFilters: () => {
      // الفلترة بالكامل اتقلت لصفحة الـ SearchPage عبر useMemo لأداء أسرع ومنع التضارب
    },
    restoreSearchSession: (
      state,
      action: PayloadAction<{
        searchParams?: Partial<SearchParams>;
        daysNumber?: number;
        vehicles?: Vehicle[];
        fetchedCurrency?: string;
      }>
    ) => {
      if (action.payload.searchParams) {
        state.searchParams = { ...state.searchParams, ...action.payload.searchParams };
      }
      if (action.payload.daysNumber !== undefined && action.payload.daysNumber > 0) {
        state.daysNumber = action.payload.daysNumber;
      }
      if (action.payload.vehicles && action.payload.vehicles.length > 0) {
        const curr = action.payload.fetchedCurrency || state.fetchedCurrency || 'EGP';
        state.vehicles = action.payload.vehicles.map((v: any) => ({
          ...v,
          price_currency: v.price_currency || curr,
        }));
        state.count = action.payload.vehicles.length;
      }
      if (action.payload.fetchedCurrency) {
        state.fetchedCurrency = action.payload.fetchedCurrency;
      }
      state.hasSearched = true;
      state.isSearching = false;
      state.isFiltering = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiateSearch.pending, (state) => {
        state.isSearching = true;
        state.hasSearched = false;
        state.vehicles = [];
        state.isFiltering = true;
        state.searchError = null;
        state.filterError = null;
      })
      .addCase(initiateSearch.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchParams.location = action.payload.pickupLoc;
        state.searchParams.dateFrom = action.payload.date_from;
        state.searchParams.dateTo = action.payload.date_to;
      })
      .addCase(initiateSearch.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.payload as string;
      })
      // تفعيل كود جلب البيانات وحل مشكلة الـ Hydration والإيرور (action: any)
      .addCase(fetchVehicles.pending, (state, action) => {
        state.isFiltering = true;
        state.filterError = null;
        state.currentRequestId = action.meta.requestId;
        // Don't clear state.vehicles to prevent lag and blank screens on filter changes
      })
      .addCase(fetchVehicles.fulfilled, (state, action: any) => {
        if (state.currentRequestId && state.currentRequestId !== action.meta.requestId) {
          // Stale response from a previous request — discard
          return;
        }
        state.isSearching = false;
        state.isFiltering = false;
        state.hasSearched = true;

        const searchCurr = action.meta?.arg?.currency || 'EGP';
        state.fetchedCurrency = searchCurr;

        const rawNewVehicles = action.payload.filteredVehicles || [];
        const newVehicles = rawNewVehicles.map((v: any) => ({
          ...v,
          price_currency: v.price_currency || searchCurr,
        }));
        const currentPage = action.payload.current_page || 1;

        if (currentPage === 1) {
          state.vehicles = newVehicles;
        } else {
          const existingIds = new Set(state.vehicles.map(v => v.id));
          const uniqueNewVehicles = newVehicles.filter((v: any) => !existingIds.has(v.id));
          state.vehicles = [...state.vehicles, ...uniqueNewVehicles];
        }

        state.count = action.payload.count;
        state.daysNumber = action.payload.daysNumber;
        state.maxPrice = action.payload.max;
        state.minPrice = action.payload.min;

        state.currentPage = action.payload.current_page || 1;
        state.totalPages = action.payload.last_page || Math.ceil(state.count / state.perPage) || 1;

        const hasActiveFilters =
          state.filterParams.category.length > 0 ||
          state.filterParams.supplier.length > 0 ||
          state.filterParams.locationType.length > 0 ||
          state.filterParams.paymentType.length > 0 ||
          state.filterParams.deposit.length > 0 ||
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
        if (state.currentRequestId && state.currentRequestId !== action.meta.requestId) {
          return;
        }
        state.isSearching = false;
        state.isFiltering = false;
        state.hasSearched = true;
        state.filterError = action.payload as string;
      })
      .addCase(fetchCheapestVehicles.pending, (state) => {
        state.isFetchingCheapest = true;
        state.cheapestError = null;
      })
      .addCase(fetchCheapestVehicles.fulfilled, (state, action) => {
        state.isFetchingCheapest = false;
        state.cheapestVehicles = action.payload.data || action.payload;
      })
      .addCase(fetchCheapestVehicles.rejected, (state, action) => {
        state.isFetchingCheapest = false;
        state.cheapestError = action.payload as string || 'Failed to fetch cheapest vehicles';
      });
  },
});

export const {
  setSearchParams,
  startNewSearch,
  resetForNewSearch,
  setFilterParams,
  toggleFilterParam,
  resetFilters,
  resetSearch,
  clearErrors,
  applyLocalFilters,
  setPage,
  restoreSearchSession,
} = searchSlice.actions;
export const fetchCheapestVehicles = createAsyncThunk(
  'search/fetchCheapestVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vehicleApi.getCheapestVehicles();
      // نعيد البيانات المسترجعة (data) لحفظها في المخزن
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch cheapest vehicles');
    }
  }
);


export default searchSlice.reducer;