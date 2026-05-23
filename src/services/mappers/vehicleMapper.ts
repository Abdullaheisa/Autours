import { Vehicle } from "@/types";

export const vehicleMapper = {
  toLocal: (raw: any): Vehicle => {
    const categoryName = typeof raw.category === 'object' ? raw.category?.name : (raw.category || '');
    const supplierData = raw.supplier || {};
    const price = parseFloat(raw.price) || parseFloat(raw.price_in_usd) || 0;
    const specs = raw.specifications || [];
    const specMap: Record<string, string> = {};
    if (Array.isArray(specs)) {
      specs.forEach((s: any) => {
        const name = (s.name || '').toLowerCase();
        const val = s.pivot?.value || s.value || (Array.isArray(s.options) ? s.options[0] : '');
        specMap[name] = val;
      });
    }

    return {
      id: raw.id?.toString() || '',
      name: raw.name || '',
      brand: raw.brand || raw.make || '',
      category: categoryName,
      type: raw.type || categoryName,
      photo: raw.photo || raw.image || '',
      image: raw.photo || raw.image || '',
      transmission: specMap['transmission'] || specMap['gear'] || raw.transmission || 'Automatic',
      fuelType: specMap['fuel'] || raw.fuel_type || raw.fuelType || 'Petrol',
      seats: parseInt(specMap['number of seats'] || specMap['seats']) || raw.seats || 5,
      doors: parseInt(specMap['doors']) || raw.doors || 4,
      suitcases: specMap['suitcases'] || specMap['luggage'] || raw.suitcases || '',
      ac: specMap['air conditioner'] === 'Air Conditioning' || !!(raw.ac),
      supplier: {
        company: supplierData.name || supplierData.company || '',
        logo: supplierData.logo || '',
        rating: supplierData.rating || 0,
        reviews_count: supplierData.reviews_count || 0,
        rentalTerms: supplierData.terms || '',
        instant_confirmation: !!(supplierData.instant_confirmation),
        lat: parseFloat(supplierData.lat) || 0,
        lng: parseFloat(supplierData.lng) || 0,
        address: supplierData.address || '',
      },
      price_in_usd: price,
      included: (raw.included || raw.inclusions || []).map((inc: any, index: number) => ({
        id: inc.id || index,
        what_is_included: typeof inc === 'string' ? inc : (inc.what_is_included || inc.name || ''),
      })),
      fuelPolicy: raw.fuel_policy?.name || raw.fuel_policy || 'Full to Full',
      locationType: raw.location_type || 'Airport',
      freeCancellation: !!raw.free_cancellation,
      specifications: specs,
    };
  },

  toLocalList: (rawList: any[]): Vehicle[] => {
    if (!Array.isArray(rawList)) return [];
    return rawList.map(vehicleMapper.toLocal);
  }
};
