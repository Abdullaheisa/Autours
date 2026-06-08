import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { notificationApi } from "@/services/api";
import { Notification } from "@/types";

interface NotificationsState {
  items: Notification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  items: [],
  loading: false,
  error: null,
};

const getReadIds = (): string[] => {
  if (typeof window !== "undefined") {
    try {
      return JSON.parse(localStorage.getItem("read_notif_ids") || "[]");
    } catch {
      return [];
    }
  }
  return [];
};

const saveReadId = (id: string) => {
  if (typeof window !== "undefined") {
    try {
      const readIds = getReadIds();
      if (!readIds.includes(id)) {
        readIds.push(id);
        localStorage.setItem("read_notif_ids", JSON.stringify(readIds));
      }
    } catch (e) {
      console.error("Failed to save read notification ID:", e);
    }
  }
};

const saveAllReadIds = (ids: string[]) => {
  if (typeof window !== "undefined") {
    try {
      const readIds = getReadIds();
      ids.forEach(id => {
        if (!readIds.includes(id)) readIds.push(id);
      });
      localStorage.setItem("read_notif_ids", JSON.stringify(readIds));
    } catch (e) {
      console.error("Failed to save all read notification IDs:", e);
    }
  }
};

export const fetchNotifications = createAsyncThunk("notifications/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await notificationApi.getAll() as Notification[];
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const markNotificationRead = createAsyncThunk("notifications/markRead", async (id: string, { rejectWithValue, dispatch }) => {
  try {
    await notificationApi.markRead(id);
    dispatch(markLocalRead(id));
    return id;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const markAllNotificationsRead = createAsyncThunk("notifications/markAllRead", async (_, { rejectWithValue, dispatch }) => {
  try {
    await notificationApi.markAllRead();
    dispatch(markAllLocalRead());
    return true;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addLocalNotification: (state, action: PayloadAction<Omit<Notification, "id" | "isRead">>) => {
      state.items.unshift({ ...action.payload, id: Date.now().toString(), isRead: false });
    },
    markLocalRead: (state, action: PayloadAction<string>) => {
      const n = state.items.find(notif => notif.id === action.payload);
      if (n) n.isRead = true;
      saveReadId(action.payload);
    },
    markAllLocalRead: (state) => {
      state.items.forEach(n => n.isRead = true);
      saveAllReadIds(state.items.map(n => n.id));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const readIds = getReadIds();
        state.items = (action.payload || []).map(notif => ({
          ...notif,
          isRead: notif.isRead || readIds.includes(notif.id)
        }));
      })
      .addCase(fetchNotifications.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { addLocalNotification, markLocalRead, markAllLocalRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;

