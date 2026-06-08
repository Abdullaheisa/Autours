import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { companyApi } from "@/services/api";
import { getLogoUrl } from "@/utils/getImageUrl";

const mapUserToCompany = (user: Record<string, any>): Company => {
  const role = user.role || 'supplier';
  let status: Company['status'] = 'active';
  if (role === 'under_review') status = 'pending';
  else if (role === 'suspended') status = 'suspended';
  else if (role === 'inactive') status = 'inactive';
  else if (role === 'active_supplier' || role === 'supplier') status = 'active';

  const sinceDate = user.created_at ? new Date(user.created_at) : new Date();

  return {
    id: user.id,
    name: user.company || user.name || 'Unknown',
    branchName: user.name || '',
    country: user.country || '',
    address: user.address || user.adresse || '',
    email: user.email || '',
    phone: user.phone_num || user.phone || '',
    parentCompany: user.parent_company || user.parentCompany || null,
    role,
    vehicles: user.vehicles_count ?? user.vehicles ?? 0,
    bookings: user.bookings_count ?? user.bookings ?? 0,
    revenue: user.revenue ?? 0,
    rating: user.rating ?? 0,
    status,
    since: sinceDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    image: getLogoUrl(user.logo),
    description: user.description,
  };
};

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

export const fetchCompanies = createAsyncThunk("companies/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await companyApi.getAll() as { data?: any[] | { data: any[] } };
    console.log("FETCH COMPANIES RESPONSE:", response?.data);
    const users = Array.isArray(response?.data) ? response.data : ((response?.data && 'data' in response.data) ? response.data.data : []);
    console.log("FETCH COMPANIES PARSED USERS:", users);
    return users.map(mapUserToCompany);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("FETCH COMPANIES ERROR:", error);
    return rejectWithValue(error.message);
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
      .addCase(fetchCompanies.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload as string; 
        console.warn("API Error, using mock data for companies:", action.payload);
        state.items = [
          {
            id: 1,
            name: "MAHD Rent",
            branchName: "MAHD Cars",
            country: "UAE",
            address: "Dubai Marina",
            email: "bdm@mahdcars.com",
            phone: "98986565",
            parentCompany: null,
            role: "active_supplier",
            vehicles: 38,
            bookings: 142,
            revenue: 12450,
            rating: 4.8,
            status: "active",
            since: "Apr 2026",
            image: ""
          }
        ];
      });
  },
});

export const { setSelected, clearError } = companiesSlice.actions;
export default companiesSlice.reducer;
