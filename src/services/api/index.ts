import { blogs, companies, categories, notifications } from "@/data/mockData";
import { API_CONFIG } from "@/constants";
import { apiClient } from "./apiClient";

const USE_MOCK = API_CONFIG.USE_MOCK;

// Mock request wrapper to maintain the same behavior for now
async function mockRequest<T>(endpoint: string): Promise<T> {
  console.log(`[MOCK API] ${endpoint}`);
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (endpoint.includes("/blogs")) return blogs as T;
  if (endpoint.includes("/companies")) return companies as T;
  if (endpoint.includes("/categories")) return categories as T;
  if (endpoint.includes("/notifications")) return notifications as T;
  
  return {} as T;
}

const api = {
  get: <T>(endpoint: string) => USE_MOCK ? mockRequest<T>(endpoint) : apiClient.get<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) => USE_MOCK ? mockRequest<T>(endpoint) : apiClient.post<T>(endpoint, data),
  put: <T>(endpoint: string, data: unknown) => USE_MOCK ? mockRequest<T>(endpoint) : apiClient.put<T>(endpoint, data),
  delete: <T>(endpoint: string) => USE_MOCK ? mockRequest<T>(endpoint) : apiClient.delete<T>(endpoint),
  patch: <T>(endpoint: string, data: unknown) => USE_MOCK ? mockRequest<T>(endpoint) : apiClient.patch<T>(endpoint, data),
};

// Blog API
export const blogApi = {
  getAll: () => api.get("/blogs"),
  getById: (id: number) => api.get(`/blogs/${id}`),
  create: (data: unknown) => api.post("/blogs", data),
  update: (id: number, data: unknown) => api.put(`/blogs/${id}`, data),
  delete: (id: number) => api.delete(`/blogs/${id}`),
  schedule: (id: number, date: string, time: string) =>
    api.patch(`/blogs/${id}/schedule`, { publishDate: date, publishTime: time }),
};

// Company API
export const companyApi = {
  getAll: () => api.get("/companies"),
  getById: (id: number) => api.get(`/companies/${id}`),
  create: (data: unknown) => api.post("/companies", data),
  update: (id: number, data: unknown) => api.put(`/companies/${id}`, data),
  delete: (id: number) => api.delete(`/companies/${id}`),
};

// Category API
export const categoryApi = {
  getAll: () => api.get("/categories"),
  create: (data: unknown) => api.post("/categories", data),
  update: (id: number, data: unknown) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

// Notification API
export const notificationApi = {
  getAll: () => api.get("/notifications"),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`, {}),
  markAllRead: () => api.patch("/notifications/read-all", {}),
};

// Banner API
export const bannerApi = {
  getAll: () => api.get("/banners"),
  create: (data: unknown) => api.post("/banners", data),
  toggleVisibility: (id: number, isVisible: boolean) => api.patch(`/banners/${id}/visibility`, { isVisible }),
  delete: (id: number) => api.delete(`/banners/${id}`),
};
