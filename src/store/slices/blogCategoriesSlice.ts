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

const blogCategoriesSlice = createSlice({
  name: "blogCategories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogCategories.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBlogCategories.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchBlogCategories.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export default blogCategoriesSlice.reducer;
