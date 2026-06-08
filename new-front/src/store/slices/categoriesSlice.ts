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
  items: [],
  loading: false,
  error: null
};

const mapApiCategory = (raw: any): Category => ({
  id: raw.id,
  name: raw.name || "",
  image: raw.photo || raw.image || "",
  vehicles: raw.vehicles_count ?? 0,
  active: raw.active ?? true,
});

export const fetchCategories = createAsyncThunk("categories/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response: any = await categoryApi.getAll();
    const data = response?.data || response;
    return (Array.isArray(data) ? data : []).map(mapApiCategory);
  } catch (err: any) { return rejectWithValue(err.message); }
});

export const createCategory = createAsyncThunk(
  "categories/create",
  async (data: any, { dispatch, rejectWithValue }) => {
    try {
      const payload = new FormData();
      if (data.name) payload.append('name', data.name);
      // الدوكيومنتيشن بيقول اسمها photo
      if (data.photoFile) payload.append('photo', data.photoFile); 
      
      await categoryApi.create(payload);
      dispatch(fetchCategories());
      return true;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ id, data }: { id: number; data: any }, { dispatch, rejectWithValue }) => {
    try {
      const payload = new FormData();
      // الدوكيومنتيشن بيقول لازم نبعت الـ ID جوه البادي
      payload.append('id', id.toString()); 
      
      if (data.name) payload.append('name', data.name);
      if (data.photoFile) payload.append('photo', data.photoFile);
      
      // هنبعتها بدون الـ id في اللينك لأن الـ API بتاعك متظبط كده في ملف api.ts
      await categoryApi.update(id, payload);
      dispatch(fetchCategories());
      return true;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteCategory = createAsyncThunk("categories/delete", async (id: number, { rejectWithValue }) => {
  try { await categoryApi.delete(id); return id; }
  catch (err: any) { return rejectWithValue(err.message); }
});

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.loading = true; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchCategories.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      });
  },
});

export const { clearError } = categoriesSlice.actions;
export default categoriesSlice.reducer;
