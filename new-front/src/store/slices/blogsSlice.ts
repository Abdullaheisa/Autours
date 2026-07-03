import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { blogApi } from "@/services/api";
import { getBlogImageUrl } from "@/utils/getImageUrl";

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
  tags?: string;
  image_alt_text?: string;
  author_image?: string;
  author_linkedin?: string;
}

const mapApiBlog = (raw: any): Blog => {
  const created = raw.created_at ? new Date(raw.created_at) : new Date();
  const imageRaw = raw.image || '';
  const image = imageRaw ? getBlogImageUrl(imageRaw) : 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop';
  const author = raw.author || 'Unknown';

  // Backend returns: { ..., blog_category_id: 1, category: { id: 1, name: "..." } }
  const categoryName =
    raw.category?.name ||
    raw.category?.title ||
    raw.blog_category?.name ||
    raw.blog_category?.title ||
    raw.category_name ||
    (typeof raw.category === 'string' ? raw.category : null) ||
    'Uncategorized';

  let status: BlogStatus = 'draft';
  if (raw.is_published) {
    status = 'published';
  } else {
    const pubAt = raw.published_at || raw.publish_at || raw.scheduled_at;
    if (pubAt) {
      const pubDate = new Date(pubAt);
      if (pubDate > new Date()) {
        status = 'scheduled';
      } else {
        status = 'published'; // Time has passed!
      }
    }
  }

  return {
    id: raw.id,
    title: raw.title || '',
    slug: raw.slug,
    excerpt: raw.meta_description || raw.excerpt || '',
    content: raw.content,
    image,
    author,
    authorAvatar: author.charAt(0).toUpperCase(),
    category: categoryName,
    status,
    date: created.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: created.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    publishDate: raw.published_at || raw.publish_at || raw.scheduled_at,
    publishTime: raw.publish_time,
    views: raw.views ?? 0,
    tags: raw.tags || '',
    image_alt_text: raw.image_alt_text || '',
    author_image: raw.author_image || '',
    author_linkedin: raw.author_linkedin || '',
  };
};

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
    const response: any = await blogApi.getAll();
    // apiClient unwraps axios response.data, so response = { success, message, data: { data: [...], ... } }
    const paginated = response?.data;
    const list = Array.isArray(paginated?.data) ? paginated.data
      : Array.isArray(paginated) ? paginated
      : Array.isArray(response) ? response
      : [];
    return list.map(mapApiBlog);
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const createBlog = createAsyncThunk("blogs/create", async (data: Partial<Blog> & { imageFile?: File; authorImageFile?: File }, { rejectWithValue }) => {
  try {
    const payload = new FormData();
    if (data.title) payload.append('title', data.title);
    if (data.slug) payload.append('slug', data.slug);
    if (data.author) payload.append('author', data.author);
    if (data.category) payload.append('blog_category_id', String(data.category));
    payload.append('content', data.content || ' '); // content is required by backend
    if (data.excerpt) payload.append('meta_description', data.excerpt);
    payload.append('is_published', data.status === 'published' ? '1' : '0');
    if (data.status === 'scheduled' && data.publishDate && data.publishTime) {
      payload.append('published_at', `${data.publishDate} ${data.publishTime}`);
    } else {
      payload.append('published_at', '');
    }
    if (data.tags) payload.append('tags', data.tags);
    if (data.image_alt_text) payload.append('image_alt_text', data.image_alt_text);
    if (data.imageFile) payload.append('image', data.imageFile);
    if (data.author_linkedin) payload.append('author_linkedin', data.author_linkedin);
    if (data.authorImageFile) payload.append('author_image', data.authorImageFile);

    const response: any = await blogApi.create(payload);
    // response = { success, message, data: {...blog} }
    return mapApiBlog(response?.data || response);
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const updateBlog = createAsyncThunk("blogs/update", async ({ id, data }: { id: number; data: Partial<Blog> & { imageFile?: File; authorImageFile?: File } }, { rejectWithValue }) => {
  try {
    const payload = new FormData();
    payload.append('_method', 'PUT'); // Laravel requires this for FormData PUT requests
    if (data.title) payload.append('title', data.title);
    if (data.slug) payload.append('slug', data.slug);
    if (data.author) payload.append('author', data.author);
    if (data.category) payload.append('blog_category_id', String(data.category));
    if (data.content) payload.append('content', data.content);
    if (data.excerpt) payload.append('meta_description', data.excerpt);
    if (data.status) {
      payload.append('is_published', data.status === 'published' ? '1' : '0');
      if (data.status === 'scheduled' && data.publishDate && data.publishTime) {
        payload.append('published_at', `${data.publishDate} ${data.publishTime}`);
      } else {
        payload.append('published_at', '');
      }
    }
    if (data.tags !== undefined) payload.append('tags', data.tags);
    if (data.image_alt_text !== undefined) payload.append('image_alt_text', data.image_alt_text);
    if (data.imageFile) payload.append('image', data.imageFile);
    if (data.author_linkedin !== undefined) payload.append('author_linkedin', data.author_linkedin);
    if (data.authorImageFile) payload.append('author_image', data.authorImageFile);

    const response: any = await blogApi.update(id, payload);
    return mapApiBlog(response?.data || response);
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
