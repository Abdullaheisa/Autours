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

interface DashboardState {
  bookings: Booking[];
  stats: {
    totalRevenue: number;
    activeBookings: number;
    newUsers: number;
    totalCars: number;
  };
  rawData: any;
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
      const response: any = await dashboardApi.getAdmin();
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch dashboard');
    }
  }
);

export const fetchSupplierDashboard = createAsyncThunk(
  'dashboard/fetchSupplier',
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await dashboardApi.getSupplier();
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch supplier dashboard');
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
        state.rawData = action.payload;
        const data = action.payload?.data || action.payload;
        if (data) {
          state.stats.totalRevenue = data.totalRevenue || data.total_revenue || 0;
          state.stats.activeBookings = data.activeBookings || data.active_bookings || 0;
          state.stats.newUsers = data.newUsers || data.new_users || 0;
          state.stats.totalCars = data.totalCars || data.total_cars || 0;
        }
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSupplierDashboard.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchSupplierDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rawData = action.payload;
      })
      .addCase(fetchSupplierDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateBookingStatus, addBooking } = dashboardSlice.actions;
export default dashboardSlice.reducer;
