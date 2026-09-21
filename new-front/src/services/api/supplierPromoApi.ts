import { apiClient } from './axiosClient';

export const supplierPromoApi = {
  getFleet: () => apiClient.get<any[]>('/api/supplier/promo?fleet=1'),
};
