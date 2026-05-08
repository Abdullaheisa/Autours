import { Vehicle } from "@/types";

/**
 * Mappers are used to transform raw API responses into the application's domain models.
 * This ensures that if the backend API structure changes, only the mapper needs to be updated.
 */

export const vehicleMapper = {
  /**
   * Maps a raw vehicle object from the API to the local Vehicle type.
   */
  toLocal: (raw: any): Vehicle => {
    return {
      id: raw.id?.toString() || '',
      name: raw.name || raw.car_name || 'Car',
      brand: raw.brand || raw.make || '',
      category: raw.category || raw.vehicle_type || '',
      type: raw.type || raw.class || '',
      photo: raw.image || raw.photo || raw.car_photo || '',
      image: raw.image || raw.photo || raw.car_photo || '',
      transmission: raw.transmission || raw.gearbox || raw.shifter || 'Automatic',
      fuelType: raw.fuel_type || raw.fuel || raw.engine_type || raw.fuelType || 'Petrol',
      seats: raw.seats || raw.passenger_count || 5,
      doors: raw.doors || raw.door_count || 4,
      suitcases: raw.suitcases || raw.bags || '',
      ac: !!(raw.ac || raw.air_conditioning),
      supplier: {
        company: raw.supplier?.name || raw.company_name || raw.supplier?.company || 'Supplier',
        logo: raw.supplier?.logo || raw.company_logo || '',
        rating: raw.supplier?.rating || 0,
        reviews_count: raw.supplier?.reviews_count || 0,
        rentalTerms: raw.supplier?.terms || 'Standard terms apply.',
        instant_confirmation: !!(raw.supplier?.instant_confirmation),
        lat: raw.supplier?.lat || 0,
        lng: raw.supplier?.lng || 0,
        address: raw.supplier?.address || '',
      },
      price_in_usd: raw.price_in_usd || raw.price || 0,
      included: (raw.inclusions || raw.included || []).map((inc: any, index: number) => ({
        id: index,
        what_is_included: typeof inc === 'string' ? inc : (inc.what_is_included || ''),
      })),
      fuelPolicy: raw.fuel_policy || 'Full to Full',
      locationType: raw.location_type || 'Airport',
      freeCancellation: !!raw.free_cancellation,
      specifications: raw.specifications || [],
    };
  },

  /**
   * Maps an array of raw vehicles.
   */
  toLocalList: (rawList: any[]): Vehicle[] => {
    if (!Array.isArray(rawList)) return [];
    return rawList.map(vehicleMapper.toLocal);
  }
};
