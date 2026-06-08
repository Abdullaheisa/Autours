import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { bannerApi } from "@/services/api";

export interface Banner {
  id: number;
  image: string;
  altText?: string;
  isVisible: boolean;
  order?: number;
}

interface BannersState {
  items: Banner[];
  loading: boolean;
  error: string | null;
}

const initialState: BannersState = { items: [], loading: false, error: null };

export const fetchBanners = createAsyncThunk("banners/fetchAll", async (_, { rejectWithValue }) => {
  try { return await bannerApi.getAll() as Banner[]; }
  catch (err: any) { return rejectWithValue(err.message); }
});

export const createBanner = createAsyncThunk("banners/create", async (data: Partial<Banner>, { rejectWithValue }) => {
  try { return await bannerApi.create(data) as Banner; }
  catch (err: any) { return rejectWithValue(err.message); }
});

export const toggleBannerVisibility = createAsyncThunk("banners/toggle", async ({ id, isVisible }: { id: number; isVisible: boolean }, { rejectWithValue }) => {
  try { return await bannerApi.toggleVisibility(id, isVisible) as Banner; }
  catch (err: any) { return rejectWithValue(err.message); }
});

export const deleteBanner = createAsyncThunk("banners/delete", async (id: number, { rejectWithValue }) => {
  try { await bannerApi.delete(id); return id; }
  catch (err: any) { return rejectWithValue(err.message); }
});

const bannersSlice = createSlice({
  name: "banners",
  initialState,
  reducers: {
    addLocalBanner: (state, action: PayloadAction<{ image: string; altText?: string }>) => {
      state.items.push({ id: Date.now(), image: action.payload.image, altText: action.payload.altText, isVisible: true });
    },
    toggleLocalVisibility: (state, action: PayloadAction<number>) => {
      const b = state.items.find((b) => b.id === action.payload);
      if (b) b.isVisible = !b.isVisible;
    },
    deleteLocalBanner: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((b) => b.id !== action.payload);
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.pending, (state) => { state.loading = true; })
      .addCase(fetchBanners.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchBanners.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createBanner.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(toggleBannerVisibility.fulfilled, (state, action) => {
        const idx = state.items.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b.id !== action.payload);
      });
  },
});

export const { addLocalBanner, toggleLocalVisibility, deleteLocalBanner, clearError } = bannersSlice.actions;
export default bannersSlice.reducer;
