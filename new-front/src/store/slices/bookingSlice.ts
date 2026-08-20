import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Car } from '../../types';

interface BookingState {
  searchParams: {
    country: string;
    city: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  };
  availableCars: Car[];
  loading: boolean;
}

const initialState: BookingState = {
  searchParams: {
    country: '',
    city: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
  },
  availableCars: [],
  loading: false,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setSearchParams: (state, action: PayloadAction<Partial<BookingState['searchParams']>>) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    setAvailableCars: (state, action: PayloadAction<Car[]>) => {
      state.availableCars = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    resetBooking: (state) => {
      state.searchParams = initialState.searchParams;
      state.availableCars = [];
    },
  },
});

export const { setSearchParams, setAvailableCars, setLoading, resetBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
