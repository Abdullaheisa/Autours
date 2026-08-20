import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchSupplierAnalytics, updateNegotiationStatusAPI } from "@/services/mock/supplierAnalytics.api";
import { SupplierComparison } from "@/data/supplierAnalytics";

interface SupplierAnalyticsState {
  data: SupplierComparison[];
  stats: {
    lowestPrice: number;
    highestPrice: number;
    averagePrice: number;
    cheapestSupplier: string;
    expensiveSupplier: string;
    totalSuppliers: number;
    totalCars: number;
  } | null;
  loading: boolean;
  error: string | null;
  filters: {
    country: string;
    city: string;
    category: string;
    carType: string;
    searchQuery: string;
    supplierStatus: string;
    page: number;
  };
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  } | null;
}

const initialState: SupplierAnalyticsState = {
  data: [],
  stats: null,
  loading: false,
  error: null,
  filters: {
    country: "All",
    city: "All",
    category: "All",
    carType: "All",
    searchQuery: "",
    supplierStatus: "active",
    page: 1,
  },
  pagination: null,
};

export const loadSupplierAnalytics = createAsyncThunk(
  "supplierAnalytics/load",
  async (filters: Record<string, any>) => {
    const response = await fetchSupplierAnalytics(filters);
    return response;
  }
);

export const updateNegotiation = createAsyncThunk(
  "supplierAnalytics/updateNegotiation",
  async ({ id, payload }: { id: string; payload: Partial<SupplierComparison> }) => {
    const response = await updateNegotiationStatusAPI(id, payload);
    return response.data;
  }
);

const supplierAnalyticsSlice = createSlice({
  name: "supplierAnalytics",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<SupplierAnalyticsState["filters"]>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSupplierAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSupplierAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.stats = action.payload.stats;
        state.pagination = action.payload.pagination || null;
      })
      .addCase(loadSupplierAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load data";
      })
      .addCase(updateNegotiation.fulfilled, (state, action) => {
        const { id, supplierId, ...updates } = action.payload;
        const targetId = id || supplierId;
        const index = state.data.findIndex(s => s.id === targetId);
        if (index !== -1) {
          state.data[index] = { ...state.data[index], ...updates };
        }
      });
  },
});

export const { setFilters } = supplierAnalyticsSlice.actions;
export default supplierAnalyticsSlice.reducer;
