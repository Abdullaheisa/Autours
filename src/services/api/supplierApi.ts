import { apiClient, cleanPayload } from './axiosClient';

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface ProfileResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  company_name?: string;
  integration?: boolean;
  webhook_url?: string;
  created_at?: string;
}

export interface VehicleListResponse {
  data: any[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface RentalListResponse {
  data: any[];
  current_page: number;
  last_page: number;
  total: number;
}

export const supplierApi = {
  login: (data: LoginRequest) => apiClient.post('/api/external/supplier/login', data),
  logout: () => apiClient.post('/api/external/supplier/logout', {}),

  getProfile: () => apiClient.get<ProfileResponse>('/api/external/supplier/profile'),

  updateIntegrationSettings: (data: { integration: boolean; webhook_url?: string }) =>
    apiClient.put('/api/external/supplier/integration-settings', data),

  getVehicles: (page: number = 1, perPage: number = 15) =>
    apiClient.get<VehicleListResponse>(`/api/external/supplier/vehicles?page=${page}&per_page=${perPage}`),

  createVehicle: (data: FormData | any) => {
    return apiClient.post('/api/external/supplier/vehicles', cleanPayload(data));
  },

  deleteVehicle: (id: number) => apiClient.delete(`/api/external/supplier/vehicles/${id}`),

  toggleVehicleActivation: (id: number, activation: boolean) => apiClient.post('/api/external/supplier/vehicles/toggle-activation', { vehicle_id: id, activation }),

  updateVehiclePrice: (vehicleId: number, data: { price?: number; week_price?: number; month_price?: number }) =>
    apiClient.put(`/api/external/supplier/vehicles/${vehicleId}/price`, cleanPayload(data)),

  getRentals: (page: number = 1, perPage: number = 15, hasReview?: boolean) => {
    let url = `/api/external/supplier/rentals?page=${page}&per_page=${perPage}`;
    if (hasReview) url += `&has_review=true`;
    return apiClient.get<RentalListResponse>(url);
  },
  getCategories: () => apiClient.get('/api/external/supplier/categories'),
  getBranches: () => apiClient.get('/api/external/supplier/branches'),
  getFuelPolicies: () => apiClient.get('/api/external/supplier/fuel-policies'),
  getLocationTypes: () => apiClient.get('/api/external/supplier/location-types'),
  getIncluded: () => apiClient.get('/api/external/supplier/included'),
  getRentalTerms: () => apiClient.get('/get/rental-terms'),
  selectRentalTerm: (rental_term_id: number) => apiClient.post('/select-rental-terms', { rental_term_id }),
  getPaymentMethods: () => apiClient.get('/get/payment_methods'),
  updatePaymentMethods: (payment_methods: number[]) => apiClient.post('/payment_methods', { selectedMethodId: payment_methods[0] }),
  getPromos: (includedId?: number) => {
    let url = '/promo';
    if (includedId !== undefined) {
      url += `?included_id=${includedId}`;
    }
    return apiClient.get(url);
  },
  createPromo: (data: { vehicle_id?: number, selected_vehicles?: string, included_id: number }) => apiClient.post('/promo', data),
  deletePromo: (id: number) => apiClient.delete(`/promo/${id}`),
  requestMembership: () => apiClient.post('/post/request', {}),
  getRole: () => apiClient.get<string>('/get/user/role'),
};
