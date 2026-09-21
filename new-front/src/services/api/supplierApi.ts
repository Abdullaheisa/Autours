import { supplierApi as baseSupplierApi } from './index';

/**
 * The external supplier vehicles endpoint returns a Laravel paginator:
 * { status: true, data: { data: [...] } }.
 * The company promos screen expects the vehicle list in response.data.
 * Normalize it here so the screen works with both paginated and plain arrays.
 */
export const supplierApi = {
  ...baseSupplierApi,
  getVehicles: async (page: number = 1, perPage: number = 15, filters?: {
    branch_id?: string;
    country?: string;
    search?: string;
    address?: string;
  }) => {
    const response: any = await baseSupplierApi.getVehicles(page, perPage, filters);
    const vehicles = Array.isArray(response?.data?.data)
      ? response.data.data
      : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

    return {
      ...response,
      data: vehicles.map((vehicle: any) => ({
        ...vehicle,
        id: Number(vehicle.id),
      })),
    };
  },
};

export type {
  LoginRequest,
  ProfileResponse,
  VehicleListResponse,
  RentalListResponse,
} from './index';
