import { apiClient, cleanPayload } from './apiClient';
import { vehicleMapper } from '../mappers/vehicleMapper';
import { 
  Vehicle, 
  SearchPayload, 
  FilterPayload, 
  FilterResponse, 
  LocationBranch 
} from '@/types';

export const vehicleApi = {
  search: async (payload: SearchPayload) => {
    return apiClient.post('/search/vehicles', cleanPayload(payload));
  },

  filter: async (payload: FilterPayload): Promise<FilterResponse> => {
    const response = await apiClient.post<any>('/filter/vehicles', cleanPayload(payload));

    return {
      filteredVehicles: vehicleMapper.toLocalList(response.filteredVehicles || []),
      count: response.count || 0,
      daysNumber: response.daysNumber || 0,
      max: response.max || 0,
      min: response.min || 0,
      filteredCategories: (response.filteredCategories || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        photo: c.photo || '',
        vehicle_count: c.vehicle_count ?? c.pivot?.vehicle_count ?? 0,
      })),
      filteredSuppliers: (response.filteredSuppliers || []).map((s: any) => ({
        id: s.id,
        name: s.company || s.name,
        logo: s.logo || '',
        vehicle_count: s.vehicle_count ?? 0,
      })),
    };
  },

  getLocations: async (): Promise<LocationBranch[]> => {
    try {
      const data = await apiClient.get<any[]>('/get/locations');
      return (data || []).map((loc: any) => ({
        id: loc.id,
        name: loc.name || '',
        location: loc.location || '',
        country: loc.country || '',
        adresse: loc.adresse || '',
        location_type: loc.location_type || '',
      }));
    } catch (err) {
      console.error('[LOCATIONS ERROR]', err);
      return [];
    }
  },

  getVehicleData: async (payload: { id: number; location: string; date_from: string; date_to: string; currency: string }) => {
    const response = await apiClient.post<any>('/get/vehicle/data', cleanPayload(payload));
    return response;
  },
};
