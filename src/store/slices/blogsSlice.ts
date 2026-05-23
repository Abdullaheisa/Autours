import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { blogApi } from "@/services/api";

export type BlogStatus = "published" | "draft" | "scheduled";

export interface Blog {
  id: number;
  title: string;
  slug?: string;
  excerpt: string;
  content?: string;
  image: string;
  author: string;
  authorAvatar: string;
  category: string;
  status: BlogStatus;
  date: string;
  time: string;
  publishDate?: string;
  publishTime?: string;
  views?: number;
}

interface BlogsState {
  items: Blog[];
  selected: Blog | null;
  loading: boolean;
  error: string | null;
  filter: BlogStatus | "all";
}

const initialState: BlogsState = {
  items: [],
  selected: null,
  loading: false,
  error: null,
  filter: "all",
};

export const fetchBlogs = createAsyncThunk("blogs/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await blogApi.getAll() as Blog[];
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const createBlog = createAsyncThunk("blogs/create", async (data: Partial<Blog>, { rejectWithValue }) => {
  try {
    return await blogApi.create(data) as Blog;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const updateBlog = createAsyncThunk("blogs/update", async ({ id, data }: { id: number; data: Partial<Blog> }, { rejectWithValue }) => {
  try {
    return await blogApi.update(id, data) as Blog;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const deleteBlog = createAsyncThunk("blogs/delete", async (id: number, { rejectWithValue }) => {
  try {
    await blogApi.delete(id);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

const blogsSlice = createSlice({
  name: "blogs",
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<BlogStatus | "all">) => { state.filter = action.payload; },
    setSelected: (state, action: PayloadAction<Blog | null>) => { state.selected = action.payload; },
    // Local save (used before backend is connected)
    saveLocalBlog: (state, action: PayloadAction<Partial<Blog> & { id?: number }>) => {
      const data = action.payload;
      if (data.id) {
        const idx = state.items.findIndex((b) => b.id === data.id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...data };
      } else {
        const newBlog: Blog = {
          id: Date.now(), title: data.title || "", excerpt: data.excerpt || "",
          author: data.author || "", authorAvatar: (data.author || "A")[0].toUpperCase(),
          category: data.category || "", status: data.status || "draft",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          image: data.image || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop",
          publishDate: data.publishDate, publishTime: data.publishTime,
        };
        state.items.unshift(newBlog);
      }
    },
    deleteLocalBlog: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((b) => b.id !== action.payload);
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBlogs.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchBlogs.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createBlog.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateBlog.fulfilled, (state, action) => {
        const idx = state.items.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b.id !== action.payload);
      });
  },
});

export const { setFilter, setSelected, saveLocalBlog, deleteLocalBlog, clearError } = blogsSlice.actions;
export default blogsSlice.reducer;
