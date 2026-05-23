import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { companyApi } from "@/services/api";

export interface Company {
  id: number;
  name: string;
  branchName: string;
  country: string;
  address: string;
  email: string;
  phone: string;
  parentCompany: string | null;
  role: string;
  vehicles: number;
  bookings: number;
  revenue: number;
  rating: number;
  status: "active" | "pending" | "suspended" | "inactive";
  since: string;
  image: string;
  description?: string;
}

interface CompaniesState {
  items: Company[];
  selected: Company | null;
  loading: boolean;
  error: string | null;
}

const initialState: CompaniesState = {
  items: [],
  selected: null,
  loading: false,
  error: null,
};

// --- Async Thunks ---
export const fetchCompanies = createAsyncThunk("companies/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await companyApi.getAll() as Company[];
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});



// --- Slice ---
const companiesSlice = createSlice({
  name: "companies",
  initialState,
  reducers: {
    setSelected: (state, action: PayloadAction<Company | null>) => {
      state.selected = action.payload;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCompanies.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchCompanies.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
;
  },
});

export const { setSelected, clearError } = companiesSlice.actions;
export default companiesSlice.reducer;
