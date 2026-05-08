import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { categoryApi } from "@/services/api";

export interface Category {
  id: number;
  name: string;
  image: string;
  vehicles: number;
  active: boolean;
}

interface CategoriesState {
  items: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  items: [
    { id: 1, name: "Sedan", image: "https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=400&h=300&fit=crop", vehicles: 45, active: true },
    { id: 2, name: "SUV", image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop", vehicles: 62, active: true },
    { id: 3, name: "Luxury", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop", vehicles: 28, active: true },
    { id: 4, name: "Sports", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop", vehicles: 15, active: true },
    { id: 5, name: "Van", image: "https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?w=400&h=300&fit=crop", vehicles: 22, active: false },
    { id: 6, name: "Truck", image: "https://images.unsplash.com/photo-1586191582056-a15cd11e29a2?w=400&h=300&fit=crop", vehicles: 12, active: true },
  ],
  loading: false,
  error: null
};

export const fetchCategories = createAsyncThunk("categories/fetchAll", async (_, { rejectWithValue }) => {
  try { return await categoryApi.getAll() as Category[]; }
  catch (err: any) { return rejectWithValue(err.message); }
});

export const createCategory = createAsyncThunk("categories/create", async (data: Partial<Category>, { rejectWithValue }) => {
  try { return await categoryApi.create(data) as Category; }
  catch (err: any) { return rejectWithValue(err.message); }
});

export const updateCategory = createAsyncThunk("categories/update", async ({ id, data }: { id: number; data: Partial<Category> }, { rejectWithValue }) => {
  try { return await categoryApi.update(id, data) as Category; }
  catch (err: any) { return rejectWithValue(err.message); }
});

export const deleteCategory = createAsyncThunk("categories/delete", async (id: number, { rejectWithValue }) => {
  try { await categoryApi.delete(id); return id; }
  catch (err: any) { return rejectWithValue(err.message); }
});

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    saveLocalCategory: (state, action: PayloadAction<Partial<Category> & { id?: number }>) => {
      const data = action.payload;
      if (data.id) {
        const idx = state.items.findIndex((c) => c.id === data.id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...data } as Category;
      } else {
        state.items.unshift({ id: Date.now(), name: data.name || "", image: data.image || "", vehicles: 0, active: data.active ?? true });
      }
    },
    deleteLocalCategory: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((c) => c.id !== action.payload);
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.loading = true; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchCategories.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createCategory.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      });
  },
});

export const { saveLocalCategory, deleteLocalCategory, clearError } = categoriesSlice.actions;
export default categoriesSlice.reducer;
