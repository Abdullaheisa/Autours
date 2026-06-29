import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { dashboardApi } from '@/services/api';

interface Booking {
  id: string;
  carId: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  totalPrice: number;
}

export interface DashboardRawData {
  supplierRevenue?: any[];
  numberOfRentalsMonthly?: { done?: any[]; cancelled?: any[] };
  NumberOfActiveSuppliers?: { currentYear?: any[] };
  customerTransactions?: any[];
  latestRentalsTransactions?: any[];
  latestVehicles?: any[];
  [key: string]: any;
}

interface DashboardState {
  bookings: Booking[];
  stats: {
    totalRevenue: number;
    activeBookings: number;
    newUsers: number;
    totalCars: number;
  };
  rawData: DashboardRawData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  bookings: [],
  stats: {
    totalRevenue: 0,
    activeBookings: 0,
    newUsers: 0,
    totalCars: 0,
  },
  rawData: null,
  isLoading: false,
  error: null,
};

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getAdmin() as { data?: DashboardRawData } | DashboardRawData;
      return response;
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message || 'Failed to fetch dashboard');
    }
  }
);

export const fetchSupplierDashboard = createAsyncThunk(
  'dashboard/fetchSupplier',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getSupplier() as DashboardRawData;
      return response;
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message || 'Failed to fetch supplier dashboard');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateBookingStatus: (state, action: PayloadAction<{ id: string; status: Booking['status'] }>) => {
      const booking = state.bookings.find(b => b.id === action.payload.id);
      if (booking) {
        booking.status = action.payload.status;
      }
    },
    addBooking: (state, action: PayloadAction<Booking>) => {
      state.bookings.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        const raw = action.payload as { data?: DashboardRawData } | DashboardRawData;
        const data = ('data' in raw ? raw.data : raw) as DashboardRawData | undefined;

        if (data) {
          const mapStatus = (status: number | string) => {
            const statusNum = Number(status);
            if (statusNum === 7) return "completed";
            if (statusNum === 2) return "active";
            if (statusNum === 3 || statusNum === 5) return "cancelled";
            return "pending"; // 1, 4, 6
          };

          // 1. Map Stats
          const supplierRevenue = data.supplierRevenue || [];
          const numberOfRentalsMonthly = data.numberOfRentalsMonthly || {};
          const NumberOfActiveSuppliers = data.NumberOfActiveSuppliers || {};
          
          const totalRevenue = data.real_total_revenue !== undefined ? Number(data.real_total_revenue) : supplierRevenue.reduce((acc: number, curr: any) => acc + Number(curr.profit || 0), 0);
          const totalBookings = data.real_total_bookings !== undefined ? Number(data.real_total_bookings) : ((numberOfRentalsMonthly.done || []).reduce((acc: number, curr: any) => acc + Number(curr.count || 0), 0) + 
                                (numberOfRentalsMonthly.cancelled || []).reduce((acc: number, curr: any) => acc + Number(curr.count || 0), 0));
          const totalCompanies = data.real_total_companies !== undefined ? Number(data.real_total_companies) : (supplierRevenue.length || NumberOfActiveSuppliers.currentYear?.[0]?.count || 0);
          const totalCars = data.real_total_cars !== undefined ? Number(data.real_total_cars) : ((data.latestVehicles || []).length || 0);
          const avgRating = data.real_avg_rating !== undefined ? String(data.real_avg_rating) : "4.8";
          
          state.stats.totalRevenue = totalRevenue;
          state.stats.activeBookings = totalBookings;
          state.stats.newUsers = totalCompanies;
          state.stats.totalCars = totalCars;

          // 2. Map Recent Bookings
          const recentBookings = (data.customerTransactions || data.latestRentalsTransactions || []).map((booking: any) => ({
            id: booking.order_number || `BK-${booking.id}`,
            customer: booking.customer?.name || "Unknown Customer",
            vehicle: booking.vehicle?.name || `${booking.vehicle?.brand || ""} ${booking.vehicle?.model || ""}`.trim() || "Unknown Vehicle",
            company: booking.supplier?.name || "Unknown Company",
            country: booking.vehicle?.branch?.country || "UAE",
            amount: Number(booking.price || 0),
            status: mapStatus(booking.order_status),
          }));

          // 3. Map Monthly Bookings Trend
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const monthlyBookingsMapped = monthNames.map((name, index) => {
            const monthStr = String(index + 1).padStart(2, '0');
            const doneItem = (numberOfRentalsMonthly.done || []).find((d: any) => d.month === monthStr);
            const cancelItem = (numberOfRentalsMonthly.cancelled || []).find((c: any) => c.month === monthStr);
            const doneCount = doneItem ? Number(doneItem.count || 0) : 0;
            const cancelCount = cancelItem ? Number(cancelItem.count || 0) : 0;
            return {
              month: name,
              bookings: doneCount + cancelCount,
            };
          });

          // 4. Map Bookings By Country — use real API data directly
          const bookingsByCountry = data.bookingsByCountry || data.bookings_by_country || [];

          // 5. Map Top Vehicles — use real API data directly
          const topVehicles = (data.topVehicles || data.top_vehicles || []).map((v: any) => ({
            name: v.name || "Vehicle",
            bookings: Number(v.bookings || 0),
          }));

          // 6. Country Locations & Vehicle Categories — use API data directly, no fake fallback
          const countryLocationsStats = data.country_locations_stats || null;
          const vehicleCategoriesStats = data.vehicle_categories_stats || null;

          const companyPerformance = (data.supplierRevenue || []).map((item: any) => ({
            name: item.supplier_name || item.name || "Company",
            bookings: Number(item.bookings || 0),
            profit: Number(item.profit || 0),
          }));

          // Store mapped rawData — spread raw data first, then overwrite with processed camelCase keys
          state.rawData = {
            ...data,                                          // raw API fields (snake_case)
            totalCompanies,
            avgRating,
            recentBookings,
            monthlyBookings: monthlyBookingsMapped,
            bookingsByCountry,
            topVehicles,
            companyPerformance,
            rentalSummaryStats:     data.rental_summary_stats     ?? null,
            countryLocationsStats:  data.country_locations_stats  ?? null,
            vehicleCategoriesStats: data.vehicle_categories_stats ?? null,
          };
        }
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        console.warn("API Error for admin dashboard stats:", action.payload);
      })
      .addCase(fetchSupplierDashboard.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchSupplierDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rawData = action.payload;
      })
      .addCase(fetchSupplierDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        console.warn("API Error for supplier dashboard:", action.payload);
      });
  },
});

export const { updateBookingStatus, addBooking } = dashboardSlice.actions;
export default dashboardSlice.reducer;
