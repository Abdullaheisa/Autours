import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { blogCategoryApi } from "@/services/api";

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  blogs_count?: number;
}

interface BlogCategoriesState {
  items: BlogCategory[];
  loading: boolean;
  error: string | null;
}

const initialState: BlogCategoriesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchBlogCategories = createAsyncThunk("blogCategories/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response: any = await blogCategoryApi.getAll();
    const paginated = response?.data;
    const list = Array.isArray(paginated) ? paginated
      : Array.isArray(response?.data?.data) ? response.data.data
      : Array.isArray(response) ? response
      : [];
    
    // Map backend 'title' to frontend 'name', and 'activation' to 'is_active'
    return list.map((item: any) => ({
      id: item.id,
      name: item.title || item.name || '',
      slug: item.slug || '',
      is_active: !!(item.activation ?? item.is_active),
      blogs_count: item.blogs_count,
    }));
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const createBlogCategory = createAsyncThunk("blogCategories/create", async (data: { title: string, activation: boolean }, { rejectWithValue }) => {
  try {
    const response: any = await blogCategoryApi.create(data);
    const item = response?.data?.data || response?.data;
    return {
      id: item.id,
      name: item.title || item.name || '',
      slug: item.slug || '',
      is_active: !!(item.activation ?? item.is_active),
      blogs_count: item.blogs_count || 0,
    };
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const updateBlogCategory = createAsyncThunk("blogCategories/update", async ({ id, data }: { id: number, data: { title: string, activation: boolean } }, { rejectWithValue }) => {
  try {
    const response: any = await blogCategoryApi.update(id, data);
    const item = response?.data?.data || response?.data;
    return {
      id: item.id,
      name: item.title || item.name || '',
      slug: item.slug || '',
      is_active: !!(item.activation ?? item.is_active),
      blogs_count: item.blogs_count,
    };
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const deleteBlogCategory = createAsyncThunk("blogCategories/delete", async (id: number, { rejectWithValue }) => {
  try {
    await blogCategoryApi.delete(id);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const toggleBlogCategoryActivation = createAsyncThunk("blogCategories/toggleActivation", async (id: number, { rejectWithValue }) => {
  try {
    const response: any = await blogCategoryApi.toggleActivation(id);
    const item = response?.data?.data || response?.data;
    return {
      id: item.id,
      is_active: !!(item.activation ?? item.is_active),
    };
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

const blogCategoriesSlice = createSlice({
  name: "blogCategories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogCategories.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBlogCategories.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchBlogCategories.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      
      .addCase(createBlogCategory.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateBlogCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      })
      .addCase(deleteBlogCategory.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.payload);
      })
      .addCase(toggleBlogCategoryActivation.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.items[index].is_active = action.payload.is_active;
        }
      });
  },
});

export default blogCategoriesSlice.reducer;
