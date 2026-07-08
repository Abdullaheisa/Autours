import { apiClient, cleanPayload } from './axiosClient';
import { vehicleMapper } from '../mappers/vehicleMapper';
import { 
  Vehicle, 
  SearchPayload, 
  FilterPayload, 
  FilterResponse, 
  LocationBranch 
} from '@/types';

// Cache structures to prevent HTTP 429 Rate Limiting (Too Many Attempts)
let memoryLocationsCache: LocationBranch[] | null = null;
const memoryCountryLocationsCache: Record<string, LocationBranch[]> = {};

export const vehicleApi = {
  search: async (payload: SearchPayload) => {
    // تم إضافة as any لتخطي فحص التايب سكريبت هنا
    return apiClient.post('/search/vehicles', cleanPayload(payload as any));
  },

  filter: async (payload: FilterPayload): Promise<FilterResponse> => {
    // تم إضافة as any هنا أيضاً لتجنب نفس المشكلة
    const response = await apiClient.post<any>('/filter/vehicles', cleanPayload(payload as any));

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
      current_page: response.current_page || 1,
      last_page: response.last_page || response.total_pages || 1,
      total: response.total || response.count || 0,
    };
  },

  getLocations: async (): Promise<LocationBranch[]> => {
    try {
      if (memoryLocationsCache) {
        return memoryLocationsCache;
      }
      if (typeof window !== 'undefined') {
        const cached = sessionStorage.getItem('autours_locations');
        if (cached) {
          memoryLocationsCache = JSON.parse(cached);
          return memoryLocationsCache!;
        }
      }

      const data = await apiClient.get<any[]>('/get/locations');
      const mapped = (data || []).map((loc: any) => ({
        id: loc.id,
        name: loc.name || '',
        location: loc.location || '',
        country: loc.country || '',
        adresse: loc.adresse || loc.location_address || '',
        location_address: loc.location_address || loc.adresse || '',
        location_type: loc.location_type || '',
        abriviation: loc.abriviation || loc.abbreviation || '',
        min_price: loc.min_price != null ? Number(loc.min_price) : null,
        currency: loc.currency || '',
        airport_id: loc.airport_id || null,
        company: loc.company || null,
      }));

      memoryLocationsCache = mapped;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('autours_locations', JSON.stringify(mapped));
      }
      return mapped;
    } catch (err) {
      console.error('[LOCATIONS ERROR]', err);
      return [];
    }
  },

  getLocationsByCountry: async (country: string): Promise<LocationBranch[]> => {
    try {
      const countryKey = country.toLowerCase().trim();
      if (memoryCountryLocationsCache[countryKey]) {
        return memoryCountryLocationsCache[countryKey];
      }
      if (typeof window !== 'undefined') {
        const cached = sessionStorage.getItem(`autours_locations_${countryKey}`);
        if (cached) {
          memoryCountryLocationsCache[countryKey] = JSON.parse(cached);
          return memoryCountryLocationsCache[countryKey];
        }
      }

      const data = await apiClient.get<any[]>(`/get/locations/country/${country}`);
      const mapped = (data || []).map((loc: any) => ({
        id: loc.id,
        name: loc.name || '',
        location: loc.location || '',
        country: loc.country || '',
        adresse: loc.adresse || loc.location_address || '',
        location_address: loc.location_address || loc.adresse || '',
        location_type: loc.location_type || '',
        abriviation: loc.abriviation || loc.abbreviation || '',
        min_price: loc.min_price != null ? Number(loc.min_price) : null,
        currency: loc.currency || '',
        airport_id: loc.airport_id || null,
        company: loc.company || null,
      }));

      memoryCountryLocationsCache[countryKey] = mapped;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`autours_locations_${countryKey}`, JSON.stringify(mapped));
      }
      return mapped;
    } catch (err) {
      console.error('[LOCATIONS BY COUNTRY ERROR]', err);
      return [];
    }
  },

  getVehicleData: async (payload: { id: number; location: string; date_from: string; date_to: string; currency: string }) => {
    // تم إضافة as any هنا أيضاً
    const response = await apiClient.post<any>('/get/vehicle/data', cleanPayload(payload as any));
    return response;
  },
  getCheapestVehicles: async () => {
    // يستدعي الرابط /api/get/cheapest-vehicle ويحصل على البيانات
    const response = await apiClient.get<any>('/get/cheapest-vehicle');
    return response;
  },

};