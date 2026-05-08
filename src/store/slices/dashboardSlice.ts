import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  isLoading: boolean;
}

const initialState: DashboardState = {
  bookings: [
    { id: 'BK-001', carId: '1', userId: 'USR-123', startDate: '2026-05-10', endDate: '2026-05-15', status: 'Confirmed', totalPrice: 2500 },
    { id: 'BK-002', carId: '2', userId: 'USR-456', startDate: '2026-05-12', endDate: '2026-05-14', status: 'Pending', totalPrice: 400 },
  ],
  stats: {
    totalRevenue: 45000,
    activeBookings: 12,
    newUsers: 156,
    totalCars: 48,
  },
  isLoading: false,
};

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
});

export const { updateBookingStatus, addBooking } = dashboardSlice.actions;
export default dashboardSlice.reducer;
