import { configureStore } from "@reduxjs/toolkit";
import companiesReducer from "./slices/companiesSlice";
import blogsReducer from "./slices/blogsSlice";
import categoriesReducer from "./slices/categoriesSlice";
import bannersReducer from "./slices/bannersSlice";
import notificationsReducer from "./slices/notificationsSlice";
import bookingReducer from "./slices/bookingSlice";
import uiReducer from "./slices/uiSlice";
import authReducer from "./slices/authSlice";
import contentReducer from "./slices/contentSlice";
import currencyReducer from "./slices/currencySlice";
import searchReducer from "./slices/searchSlice";
import dashboardReducer from "./slices/dashboardSlice";
import supplierAnalyticsReducer from "./slices/supplierAnalyticsSlice";
import contestReducer from "./slices/contestSlice";
import blogCategoriesReducer from "./slices/blogCategoriesSlice";
import { axiosClient } from "@/services/api/axiosClient";

// ── Eagerly restore Bearer token ─────────────────────────────────────────────
// Set the Authorization header IMMEDIATELY when the store is created (module
// load time). This ensures that any API request fired from a useEffect on the
// first render already carries the token — eliminating the 401 race condition
// that happened when fetchDashboard / fetchNotifications fired before the
// restoreAuth action had a chance to run.
if (typeof window !== "undefined") {
  let token = null;
  if (sessionStorage.getItem("isImpersonated") === "true") {
    token = sessionStorage.getItem("token");
  }
  if (!token) {
    token = localStorage.getItem("token") || sessionStorage.getItem("token");
  }
  if (token) {
    axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}

export const store = configureStore({
  reducer: {
    companies: companiesReducer,
    blogs: blogsReducer,
    categories: categoriesReducer,
    banners: bannersReducer,
    notifications: notificationsReducer,
    booking: bookingReducer,
    ui: uiReducer,
    auth: authReducer,
    content: contentReducer,
    currency: currencyReducer,
    search: searchReducer,
    dashboard: dashboardReducer,
    supplierAnalytics: supplierAnalyticsReducer,
    contest: contestReducer,
    blogCategories: blogCategoriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
