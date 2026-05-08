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
  items: [
    { id: 1, name: "GO RENTAL", branchName: "GO RENTAL", country: "Jordan", address: "Amman, Jordan", email: "info@easycarjordan.com", phone: "+962 7 9012 3456", parentCompany: null, role: "active_supplier", vehicles: 24, bookings: 456, revenue: 128000, rating: 4.6, status: "active", since: "2021", image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=200&fit=crop" },
    { id: 2, name: "Royal Star", branchName: "Royal Star", country: "Kuwait", address: "Kuwait City, Kuwait", email: "ucarkuwait@gmail.com", phone: "+965 5 123 4567", parentCompany: null, role: "active_supplier", vehicles: 38, bookings: 892, revenue: 245000, rating: 4.8, status: "active", since: "2019", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=200&fit=crop" },
    { id: 3, name: "Auto Nation", branchName: "Auto Nation", country: "Jordan", address: "Amman, Jordan", email: "info@autonationrentacar.com", phone: "+962 7 8123 4567", parentCompany: null, role: "active_supplier", vehicles: 31, bookings: 678, revenue: 189000, rating: 4.4, status: "active", since: "2020", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop" },
    { id: 4, name: "sovoycars", branchName: "sovoycars", country: "Morocco", address: "Casablanca, Morocco", email: "booking@sovoycars.com", phone: "+212 5 22 34 56 78", parentCompany: null, role: "active_supplier", vehicles: 45, bookings: 1234, revenue: 356000, rating: 4.7, status: "active", since: "2018", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=200&fit=crop" },
    { id: 5, name: "STREET", branchName: "STREET", country: "United Arab Emirates", address: "Dubai, UAE", email: "bookings@streetrentacar.com", phone: "+971 4 123 4567", parentCompany: null, role: "active_supplier", vehicles: 52, bookings: 1567, revenue: 489000, rating: 4.9, status: "active", since: "2017", image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=200&fit=crop" },
    { id: 6, name: "European", branchName: "European", country: "Jordan", address: "Jourden, Jordan", email: "sales@u-save-jo.com", phone: "+962 7 7234 5678", parentCompany: "RAMA", role: "active_supplier", vehicles: 18, bookings: 345, revenue: 98000, rating: 4.2, status: "active", since: "2022", image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop" },
    { id: 7, name: "Desert Line", branchName: "Desert Line", country: "Saudi Arabia", address: "Riyadh, Saudi Arabia", email: "info@desertline.sa", phone: "+966 11 234 5678", parentCompany: null, role: "active_supplier", vehicles: 67, bookings: 2134, revenue: 678000, rating: 4.5, status: "pending", since: "2019", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=200&fit=crop" },
    { id: 8, name: "Nile Motors", branchName: "Nile Motors", country: "Egypt", address: "Cairo, Egypt", email: "contact@nilemotors.eg", phone: "+20 2 1234 5678", parentCompany: null, role: "active_supplier", vehicles: 42, bookings: 987, revenue: 234000, rating: 4.3, status: "active", since: "2020", image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=200&fit=crop" },
    { id: 9, name: "Doha Wheels", branchName: "Doha Wheels", country: "Qatar", address: "Doha, Qatar", email: "book@dohawheels.qa", phone: "+974 4 123 4567", parentCompany: null, role: "active_supplier", vehicles: 28, bookings: 756, revenue: 345000, rating: 4.7, status: "active", since: "2021", image: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=400&h=200&fit=crop" },
    { id: 10, name: "Kuwait Ride", branchName: "Kuwait Ride", country: "Kuwait", address: "Kuwait City, Kuwait", email: "info@kuwaitride.com", phone: "+965 2 345 6789", parentCompany: null, role: "active_supplier", vehicles: 33, bookings: 654, revenue: 278000, rating: 4.4, status: "suspended", since: "2020", image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=200&fit=crop" },
  ],
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

export const fetchCompanyById = createAsyncThunk("companies/fetchById", async (id: number, { rejectWithValue }) => {
  try {
    return await companyApi.getById(id) as Company;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const createCompany = createAsyncThunk("companies/create", async (data: Partial<Company>, { rejectWithValue }) => {
  try {
    return await companyApi.create(data) as Company;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const updateCompany = createAsyncThunk("companies/update", async ({ id, data }: { id: number; data: Partial<Company> }, { rejectWithValue }) => {
  try {
    return await companyApi.update(id, data) as Company;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const deleteCompany = createAsyncThunk("companies/delete", async (id: number, { rejectWithValue }) => {
  try {
    await companyApi.delete(id);
    return id;
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
      .addCase(fetchCompanyById.fulfilled, (state, action) => { state.selected = action.payload; })
      .addCase(createCompany.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateCompany.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      });
  },
});

export const { setSelected, clearError } = companiesSlice.actions;
export default companiesSlice.reducer;
