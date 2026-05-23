import { apiClient, cleanPayload } from './apiClient';

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
  
  updateVehiclePrice: (vehicleId: number, data: { price?: number; week_price?: number; month_price?: number }) => 
    apiClient.put(`/api/external/supplier/vehicles/${vehicleId}/price`, cleanPayload(data)),
    
  getRentals: (page: number = 1, perPage: number = 15) => 
    apiClient.get<RentalListResponse>(`/api/external/supplier/rentals?page=${page}&per_page=${perPage}`),
};
