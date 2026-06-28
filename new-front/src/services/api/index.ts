import { apiClient } from "./axiosClient";

// Blog API - uses /api/blogs endpoints
export const blogApi = {
  getAll: () => apiClient.get("/api/blogs?per_page=1000"),
  getPublished: () => apiClient.get("/api/blogs/published?per_page=1000"),
  getById: (id: number) => apiClient.get(`/api/blogs/${id}`),
  getBySlug: (slug: string) => apiClient.get(`/api/blogs/slug/${slug}`),
  create: (data: unknown) => apiClient.post("/api/blogs", data),
  update: (id: number, data: unknown) => apiClient.post(`/api/blogs/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/blogs/${id}`),
  togglePublish: (id: number) => apiClient.patch(`/api/blogs/${id}/toggle-publish`, {}),
  uploadImage: (formData: FormData) => apiClient.post("/api/blogs/upload-image", formData),
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
  getAll: () => apiClient.get("/api/admin/get/companies"),
  getSuppliers: () => apiClient.get("/get/suppliers"),
  assignParent: (data: unknown) => apiClient.post("/assign-parent", data),
};

// Category API
export const categoryApi = {
  getAll: () => apiClient.get("/get/categories"),
  create: (data: unknown) => apiClient.post("/api/admin/post/categories", data),
  update: (id: number, data: unknown) => apiClient.post(`/api/admin/update/categories`, data),
  delete: (id: number) => apiClient.post("/api/admin/delete/categories", { id }),
};

// Notification API
export const notificationApi = {
  getAll: () => apiClient.get("/notifications"),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`, {}),
  markAllRead: () => apiClient.patch("/notifications/read-all", {}),
};

// Banner / Background Settings API
export const bannerApi = {
  getAll: () => apiClient.get("/api/admin/background-settings"),
  create: (data: unknown) => apiClient.post("/api/admin/background-settings", data),
  update: (id: number, data: unknown) => apiClient.post(`/api/admin/background-settings/${id}`, data),
  toggleVisibility: (id: number, isActive: boolean) => apiClient.post(`/api/admin/background-settings/${id}`, { is_active: isActive }),
  delete: (id: number) => apiClient.delete(`/api/admin/background-settings/${id}`),
  reset: (id: number) => apiClient.post(`/api/admin/background-settings/${id}/reset`, {}),
};

// Specifications API
export const specificationApi = {
  getAll: () => apiClient.get("/get/specifications"),
  create: (data: unknown) => apiClient.post("/api/admin/post/specifications", data),
  update: (data: unknown) => apiClient.post("/api/admin/specifications/update", data),
  delete: (id: number) => apiClient.post("/api/admin/delete/specifications", { id }),
};

// Included (What's Included) API
export const includedApi = {
  getAll: () => apiClient.get("/get/included"),
  create: (data: unknown) => apiClient.post("/api/admin/post/included", data),
  update: (data: { id: number; included: string; description?: string }) => apiClient.post("/api/admin/post/included/update", data),
  delete: (id: number) => apiClient.post("/api/admin/delete/included", { id }),
};

// Rental Terms API
export const rentalTermsApi = {
  getAll: () => apiClient.get("/api/supplier/get/rental-terms"),
  create: (data: unknown) => apiClient.post("/post/rental-terms", data),
  show: (id: number) => apiClient.post("/show/rental-terms", { id }),
  update: (data: unknown) => apiClient.post("/edit/rental-terms", data),
  delete: (id: number) => apiClient.post("/api/admin/delete/rental-terms", { id }),
  updateStatus: (data: unknown) => apiClient.post("/api/admin/update/rental-terms/status", data),
  selectForSupplier: (data: unknown) => apiClient.post("/api/supplier/select-rental-terms", data),
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
  getAll: () => apiClient.get("/api/admin/get/customers"),
  delete: (data: unknown) => apiClient.post("/api/admin/delete/customers", data),
};

// Subscribers API
export const subscriberApi = {
  getAll: () => apiClient.get("/api/admin/get/subscribers"),
  delete: (id: number) => apiClient.post("/api/admin/delete/subscribers", { id }),
  sendEmail: (data: unknown) => apiClient.post("/send-email", data),
};

// Rentals API
export const rentalApi = {
  getAll: (params?: any) => apiClient.get("/get/rentals", { params }),
  getAdmin: (params?: any) => apiClient.get("/api/admin/get/rentals/admin", { params }),
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
  getRequests: () => apiClient.get("/api/admin/get/requests"),
  accept: (data: unknown) => apiClient.post("/api/admin/accept/requests", data),
  delete: (data: unknown) => apiClient.post("/api/admin/delete/requests", data),
  submit: (data: unknown) => apiClient.post("/post/request", data),
};

// Photos API
export const photoApi = {
  getAll: () => apiClient.get("/get/photos"),
  upload: (data: unknown) => apiClient.post("/api/admin/post/photos", data),
  delete: (data: unknown) => apiClient.post("/api/admin/delete/photos", data),
};

// Profit API
export const profitApi = {
  getAll: (params?: any) => apiClient.get("/get/profit", { params }),
  upload: (data: unknown) => apiClient.post("/api/admin/profit/upload", data),
  getCountries: () => apiClient.get("/get/countries"),
  getSuppliers: (country?: string) => apiClient.get("/get/suppliers", { params: { country } }),
  getBranches: (company_id?: string, country?: string) => apiClient.get("/get/branches", { params: { company_id, country } }),
  getVehicles: (supplier?: string, branch_id?: string) => apiClient.get("/get/vehicles", { params: { supplier, branch_id } }),
  getCategories: () => apiClient.get("/get/categories"),
};

// Vehicle Inclusions API (Bulk Assign)
export const vehicleInclusionsApi = {
  getAll: (params?: any) => apiClient.get("/api/admin/vehicles/inclusions", { params }),
  bulkUpdate: (data: { selectedVehicles: string; included_ids: number[] }) =>
    apiClient.post("/api/admin/vehicles/inclusions/bulk", data),
  updateSingle: (data: { vehicle_id: number; included_ids: number[] }) =>
    apiClient.post("/api/admin/vehicles/inclusions/single", data),
};

// Rate API
export const rateApi = {
  getQuestions: (id: number) => apiClient.get("/get/rating/questions", { params: { id } }),
  submit: (data: unknown) => apiClient.post("/rating", data),
};

// Dashboard API
export const dashboardApi = {
  getAdmin: () => apiClient.get("/api/admin/dashboard"),
  getSupplier: () => apiClient.get("/api/supplier/dashboard"),
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
  login: (data: { email: string; password: string }) => apiClient.post("/api/auth/login", data),
  logout: () => apiClient.post("/api/auth/logout", {}),
  register: (data: unknown) => apiClient.post("/api/auth/register", data),
  forgotPassword: (data: unknown) => apiClient.post("/forget-password", data),
  validateResetKey: (data: unknown) => apiClient.post("/validate-forget-password-key", data),
  saveNewPassword: (data: unknown) => apiClient.post("/save-new-password", data),
  getUser: () => apiClient.get("/api/get/user/data"),
  getUserRole: () => apiClient.get("/api/get/user/role"),
  getProfile: () => apiClient.get("/api/my-current-user-profile"),
};

// Branches API
export const branchApi = {
  getAll: () => apiClient.get("/api/supplier/get/branches"),
  create: (data: unknown) => apiClient.post("/api/supplier/upload/branch", data),
  getById: (id: number) => apiClient.get(`/branches/edit/${id}`),
  update: (data: unknown) => apiClient.post("/branches/update", data),
  delete: (data: unknown) => apiClient.post("/api/supplier/delete/branches", data),
  toggleActivation: (id: number, activation: boolean) =>
    apiClient.post("/branches/update", { id, activation }),
};

// Vehicle Management API (Supplier)
export const vehicleManagementApi = {
  create: (data: unknown) => apiClient.post("/post/vehicles", data),
  getForEdit: (id: number) => apiClient.get(`/api/supplier/edit/vehicles/${id}`),
  updatePrice: (data: unknown) => apiClient.post("/edit-vehicle-price", data),
  toggleActivation: (data: unknown) => apiClient.post("/update/vehicles/activation", data),
  delete: (id: number) => apiClient.post(`/delete/vehicles/${id}`, {}),
  bulkUpload: (data: unknown) => apiClient.post("/vehicles/bulk-upload", data),
  getList: () => apiClient.get("/get/vehicles"),
};

// Payment Methods API
export const paymentMethodApi = {
  getAll: () => apiClient.get("/api/supplier/get/payment_methods"),
  store: (data: unknown) => apiClient.post("/api/supplier/payment_methods", data),
};

// Promos API
export const promoApi = {
  getAll: () => apiClient.get("/api/supplier/promo"),
  create: (data: unknown) => apiClient.post("/api/supplier/promo", data),
  delete: (id: number) => apiClient.delete(`/api/supplier/promo/${id}`),
  // Clean Promo Definitions (is_promo = 1)
  getDefinitions: () => apiClient.get("/api/get/promos/definitions"),
  suggest: (data: { included: string; description?: string }) => apiClient.post("/api/post/promos/definitions", data),
  updateStatus: (data: { id: number; status: string }) => apiClient.post("/api/admin/post/promos/definitions/status", data),
  update: (data: { id: number; included: string; description?: string }) => apiClient.post("/api/admin/post/promos/definitions/update", data),
  deleteDefinition: (id: number) => apiClient.post("/api/admin/delete/promos/definitions", { id }),
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

// Supplier Specific API
export const supplierApi = {
  getProfile: () => apiClient.get("/api/external/supplier/profile"),
  getRentals: (params?: any) => apiClient.get("/api/external/supplier/rentals", { params }),
  getIncluded: () => apiClient.get("/api/external/supplier/included"),
  getCategories: () => apiClient.get("/api/external/supplier/categories"),
  getFuelPolicies: () => apiClient.get("/api/external/supplier/fuel-policies"),
  getLocationTypes: () => apiClient.get("/api/external/supplier/location-types"),
  getBranches: () => apiClient.get("/api/external/supplier/branches"),
};
