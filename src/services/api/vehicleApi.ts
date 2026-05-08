import { cars as mockCars } from '@/data/cars';
import { mockLocations } from '@/data/locations';
import { API_CONFIG } from '@/constants';
import { apiClient, cleanPayload } from './apiClient';
import { vehicleMapper } from '../mappers/vehicleMapper';
import { 
  Vehicle, 
  SearchPayload, 
  FilterPayload, 
  FilterResponse, 
  LocationBranch 
} from '@/types';

const USE_MOCK_DATA = API_CONFIG.USE_MOCK;

/**
 * Vehicle API Service
 * Handles all vehicle-related requests including searching, filtering, and location fetching.
 * Optimized for clean architecture with centralized mapping and mock support.
 */
export const vehicleApi = {
  /**
   * Search for vehicles based on dates and location.
   */
  search: async (payload: SearchPayload) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { status: true };
    }
    return apiClient.post('/api/search/vehicles', cleanPayload(payload));
  },

  /**
   * Filter and fetch vehicles based on sidebar criteria.
   */
  filter: async (payload: FilterPayload): Promise<FilterResponse> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock mapping logic using the centralized mapper
      const mappedVehicles = vehicleMapper.toLocalList(mockCars);

      return {
        filteredVehicles: mappedVehicles,
        count: mappedVehicles.length,
        daysNumber: 3, // Mock value
        max: 2000,
        min: 50,
      };
    }

    const response = await apiClient.post<any>('/api/filter/vehicles', cleanPayload(payload));
    
    // Map response to local domain model
    return {
      ...response,
      filteredVehicles: vehicleMapper.toLocalList(response.filteredVehicles)
    };
  },

  /**
   * Fetch available pickup/dropoff locations.
   */
  getLocations: async (): Promise<LocationBranch[]> => {
    if (USE_MOCK_DATA) {
      return mockLocations;
    }

    try {
      return apiClient.get<LocationBranch[]>('/get/locations');
    } catch (err) {
      console.error('[LOCATIONS ERROR]', err);
      return [];
    }
  },
};
