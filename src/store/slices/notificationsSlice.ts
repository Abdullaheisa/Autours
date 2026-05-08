import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { notificationApi } from "@/services/api";
import { Notification } from "@/types";

interface NotificationsState {
  items: Notification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  items: [
    { id: "1", title: "New Booking", message: "Ahmed Hassan booked a Toyota Camry for 7 days", type: "booking", timestamp: "2 mins ago", isRead: false },
    { id: "2", title: "New Booking", message: "Sara Khalid booked a BMW X5 in Dubai", type: "booking", timestamp: "15 mins ago", isRead: false },
    { id: "3", title: "Blog Interaction", message: "Your post 'Daily vs Monthly...' received 5 new comments", type: "blog", timestamp: "1 hour ago", isRead: false },
    { id: "4", title: "Blog Scheduled", message: "Post 'Best Car Rental in Dubai' is scheduled for May 10", type: "blog", timestamp: "3 hours ago", isRead: true },
    { id: "5", title: "System Update", message: "Dashboard has been updated to v2.0", type: "system", timestamp: "1 day ago", isRead: true },
  ],
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk("notifications/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await notificationApi.getAll() as Notification[];
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const markNotificationRead = createAsyncThunk("notifications/markRead", async (id: string, { rejectWithValue }) => {
  try {
    await notificationApi.markRead(id);
    return id;
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
    },
    markAllLocalRead: (state) => {
      state.items.forEach(n => n.isRead = true);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchNotifications.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const n = state.items.find(notif => notif.id === action.payload);
        if (n) n.isRead = true;
      });
  },
});

export const { addLocalNotification, markLocalRead, markAllLocalRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
