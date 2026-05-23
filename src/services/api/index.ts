import { apiClient } from "./apiClient";

// Blog API - uses /api/blogs endpoints
export const blogApi = {
  getAll: () => apiClient.get("/api/blogs"),
  getPublished: () => apiClient.get("/api/blogs/published"),
  getById: (id: number) => apiClient.get(`/api/blogs/${id}`),
  getBySlug: (slug: string) => apiClient.get(`/api/blogs/slug/${slug}`),
  create: (data: unknown) => apiClient.post("/api/blogs-admin-store", data),
  update: (id: number, data: unknown) => apiClient.post(`/api/blogs-admin-update/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/blogs-admin-delete/${id}`),
  togglePublish: (id: number) => apiClient.patch(`/api/blogs/${id}/toggle-publish`, {}),
};

// Blog Category API
export const blogCategoryApi = {
  getAll: () => apiClient.get("/api/blog-categories"),
  getActive: () => apiClient.get("/api/blog-categories/active"),
  getById: (id: number) => apiClient.get(`/api/blog-categories/${id}`),
  create: (data: unknown) => apiClient.post("/api/blog-categories", data),
  update: (id: number, data: unknown) => apiClient.put(`/api/blog-categories/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/blog-categories/${id}`),
  toggleActivation: (id: number) => apiClient.patch(`/api/blog-categories/${id}/toggle-activation`, {}),
  getBlogsByCategory: (categoryId: number) => apiClient.get(`/api/blog-categories/${categoryId}/blogs`),
};

// Company API
export const companyApi = {
  getAll: () => apiClient.get("/get/companies"),
  getSuppliers: () => apiClient.get("/get/suppliers"),
  assignParent: (data: unknown) => apiClient.post("/assign-parent", data),
};

// Category API
export const categoryApi = {
  getAll: () => apiClient.get("/get/categories"),
  create: (data: unknown) => apiClient.post("/post/categories", data),
  update: (id: number, data: unknown) => apiClient.post("/update/categories", data),
  delete: (id: number) => apiClient.post("/delete/categories", { id }),
};

// Notification API
export const notificationApi = {
  getAll: () => apiClient.get("/notifications"),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`, {}),
  markAllRead: () => apiClient.patch("/notifications/read-all", {}),
};

// Banner / Background Settings API
export const bannerApi = {
  getAll: () => apiClient.get("/api/background-settings"),
  create: (data: unknown) => apiClient.post("/api/background-settings", data),
  update: (id: number, data: unknown) => apiClient.post(`/api/background-settings/${id}`, data),
  toggleVisibility: (id: number, isVisible: boolean) => apiClient.post(`/api/background-settings/${id}`, { is_visible: isVisible }),
  delete: (id: number) => apiClient.delete(`/api/background-settings/${id}`),
  reset: (id: number) => apiClient.post(`/api/background-settings/${id}/reset`, {}),
};

// Specifications API
export const specificationApi = {
  getAll: () => apiClient.get("/get/specifications"),
  create: (data: unknown) => apiClient.post("/post/specifications", data),
  update: (data: unknown) => apiClient.post("/specifications/update", data),
  delete: (id: number) => apiClient.post("/delete/specifications", { id }),
};

// Included (What's Included) API
export const includedApi = {
  getAll: () => apiClient.get("/get/included"),
  create: (data: unknown) => apiClient.post("/post/included", data),
  delete: (id: number) => apiClient.post("/delete/included", { id }),
};

// Rental Terms API
export const rentalTermsApi = {
  getAll: () => apiClient.get("/get/rental-terms"),
  create: (data: unknown) => apiClient.post("/post/rental-terms", data),
  show: (id: number) => apiClient.post("/show/rental-terms", { id }),
  update: (data: unknown) => apiClient.post("/edit/rental-terms", data),
  delete: (id: number) => apiClient.post("/delete/rental-terms", { id }),
  updateStatus: (data: unknown) => apiClient.post("/update/rental-terms/status", data),
  selectForSupplier: (data: unknown) => apiClient.post("/select-rental-terms", data),
};

// Fuel Policies API
export const fuelPolicyApi = {
  getAll: () => apiClient.get("/get/fuel-policies"),
};

// Location Types API
export const locationTypeApi = {
  getAll: () => apiClient.get("/get/location-types"),
};

// Customers API
export const customerApi = {
  getAll: () => apiClient.get("/get/customers"),
  delete: (data: unknown) => apiClient.post("/delete/customers", data),
};

// Subscribers API
export const subscriberApi = {
  getAll: () => apiClient.get("/get/subscribers"),
  delete: (id: number) => apiClient.post("/delete/subscribers", { id }),
  sendEmail: (data: unknown) => apiClient.post("/send-email", data),
};

// Rentals API
export const rentalApi = {
  getAll: () => apiClient.get("/get/rentals"),
  getAdmin: () => apiClient.get("/get/rentals/admin"),
  getDetails: (id: number) => apiClient.get(`/booking/${id}`),
  accept: (data: unknown) => apiClient.post("/accept/rentals", data),
  delete: (data: unknown) => apiClient.post("/delete/rentals", data),
  reconcile: (data: unknown) => apiClient.post("/rentals/reconcile", data),
  getInvoice: (id: number) => apiClient.get(`/invoice/booking/${id}`),
  getSupplierInvoice: () => apiClient.get("/get/supplier/invoice"),
  updateStatus: (params: string) => apiClient.get(`/booking/update-status?${params}`),
};

// Booking API
export const bookingApi = {
  create: (data: unknown) => apiClient.post("/book/vehicles", data),
  cancel: (data: unknown) => apiClient.post("/cancel/booking", data),
};

// Membership / Requests API
export const membershipApi = {
  getRequests: () => apiClient.get("/get/requests"),
  accept: (data: unknown) => apiClient.post("/accept/requests", data),
  delete: (data: unknown) => apiClient.post("/delete/requests", data),
  submit: (data: unknown) => apiClient.post("/post/request", data),
};

// Photos API
export const photoApi = {
  getAll: () => apiClient.get("/get/photos"),
  upload: (data: unknown) => apiClient.post("/post/photos", data),
  delete: (data: unknown) => apiClient.post("/delete/photos", data),
};

// Profit API
export const profitApi = {
  getAll: () => apiClient.get("/get/profit"),
  upload: (data: unknown) => apiClient.post("/profit/upload", data),
};

// Dashboard API
export const dashboardApi = {
  getAdmin: () => apiClient.get("/dashboard"),
  getSupplier: () => apiClient.get("/supplier-dashboard"),
};

// Reference Data API
export const referenceApi = {
  getCountries: () => apiClient.get("/get/countries"),
  getCurrencies: () => apiClient.get("/get/currencies"),
  getLogos: () => apiClient.get("/get/logos"),
  getBackgrounds: () => apiClient.get("/get/backgrounds"),
  getPhotos: () => apiClient.get("/get/photos"),
  getPriceTax: () => apiClient.get("/get/priceTax"),
  getRatingQuestions: () => apiClient.get("/get/rating/questions"),
  getLocations: () => apiClient.get("/get/locations"),
};

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) => apiClient.post("/login", data),
  logout: () => apiClient.get("/logout"),
  register: (data: unknown) => apiClient.post("/post/user/data", data),
  forgotPassword: (data: unknown) => apiClient.post("/forget-password", data),
  validateResetKey: (data: unknown) => apiClient.post("/validate-forget-password-key", data),
  saveNewPassword: (data: unknown) => apiClient.post("/save-new-password", data),
  getUser: () => apiClient.get("/get/user/data"),
  getUserRole: () => apiClient.get("/get/user/role"),
  getProfile: () => apiClient.get("/my-current-user-profile"),
};

// Branches API
export const branchApi = {
  getAll: () => apiClient.get("/get/branches"),
  create: (data: unknown) => apiClient.post("/upload/branch", data),
  getById: (id: number) => apiClient.get(`/branches/edit/${id}`),
  update: (data: unknown) => apiClient.post("/branches/update", data),
  delete: (data: unknown) => apiClient.post("/delete/branches", data),
};

// Vehicle Management API (Supplier)
export const vehicleManagementApi = {
  create: (data: unknown) => apiClient.post("/post/vehicles", data),
  getForEdit: (id: number) => apiClient.get(`/edit/vehicles/${id}`),
  updatePrice: (data: unknown) => apiClient.post("/edit-vehicle-price", data),
  toggleActivation: (data: unknown) => apiClient.post("/update/vehicles/activation", data),
  delete: (id: number) => apiClient.post(`/delete/vehicles/${id}`, {}),
  bulkUpload: (data: unknown) => apiClient.post("/vehicles/bulk-upload", data),
  getList: () => apiClient.get("/get/vehicles"),
};

// Payment Methods API
export const paymentMethodApi = {
  getAll: () => apiClient.get("/get/payment_methods"),
  store: (data: unknown) => apiClient.post("/payment_methods", data),
};

// Promos API
export const promoApi = {
  getAll: () => apiClient.get("/promo"),
  create: (data: unknown) => apiClient.post("/promo", data),
  delete: (id: number) => apiClient.delete(`/promo/${id}`),
};

// Rating API
export const ratingApi = {
  submit: (data: unknown) => apiClient.post("/rating", data),
  getRentalRate: (id: number) => apiClient.get(`/rental/rate/${id}`),
};

// Upload API
export const uploadApi = {
  uploadProfile: (data: unknown) => apiClient.post("/upload", data),
};
