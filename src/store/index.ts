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
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
