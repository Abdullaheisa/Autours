import { Vehicle } from "@/types";

export const vehicleMapper = {
  toLocal: (raw: any): Vehicle => {
    const categoryName = typeof raw.category === 'object' ? raw.category?.name : (raw.category || '');
    const supplierData = raw.supplier || {};
    const specs = raw.specifications || [];
    const specMap: Record<string, string> = {};
    if (Array.isArray(specs)) {
      specs.forEach((s: any) => {
        const name = (s.name || '').toLowerCase();
        const val = s.pivot?.value || s.value || (Array.isArray(s.options) ? s.options[0] : '');
        if (val) specMap[name] = val;
      });
    }

    const branch = raw.branch || (raw.available_branches && raw.available_branches[0]) || {};

    const mappedSpecs = Array.isArray(specs)
      ? specs.map((s: any) => ({
          id: s.id,
          name: s.name || '',
          option: s.pivot?.value || s.value || '',
          icon: s.icon || '',
        }))
      : [];

    return {
      id: raw.id?.toString() || '',
      name: raw.name || '',
      brand: raw.brand || raw.make || '',
      category: categoryName,
      type: raw.type || categoryName,
      photo: raw.photo || raw.image || '',
      image: raw.photo || raw.image || '',
      final_price: parseFloat(raw.final_price) || 0,
      price_in_usd: parseFloat(raw.price) || parseFloat(raw.price_in_usd) || 0,
      transmission: specMap['transmission'] || specMap['gear'] || raw.transmission || 'Automatic',
      fuelType: specMap['fuel'] || raw.fuel_type || raw.fuelType || 'Petrol',
      seats: parseInt(specMap['number of seats'] || specMap['seats']) || raw.seats || 5,
      doors: parseInt(specMap['doors']) || raw.doors || 4,
      suitcases: specMap['suitcase'] || specMap['suitcases'] || specMap['luggage'] || raw.suitcases || '',
      ac: specMap['air conditioner'] === 'Air Conditioning' || !!(raw.ac),
      supplier: {
        id: supplierData.id,
        company: supplierData.company || supplierData.name || '',
        logo: supplierData.logo || '',
        rating: raw.supplier_rate || supplierData.rating || 0,
        reviews_count: raw.supplier_number_of_reviews || supplierData.reviews_count || 0,
        rentalTerms: supplierData.terms || '',
        instant_confirmation: !!(raw.instant_confirmation ?? supplierData.instant_confirmation),
        lat: parseFloat(branch.lat || supplierData.lat) || 0,
        lng: parseFloat(branch.lng || supplierData.lng) || 0,
        address: branch.adresse || supplierData.address || '',
      },
      included: (raw.included || raw.inclusions || []).map((inc: any, index: number) => ({
        id: inc.id || index,
        what_is_included: typeof inc === 'string' ? inc : (inc.what_is_included || inc.name || ''),
        description: inc.description || '',
      })),
      fuelPolicy: (typeof raw.fuel_policy === 'object' ? raw.fuel_policy?.name : raw.fuel_policy) || 'Full to Full',
      locationType: raw.location_type || branch.location_type || 'Airport',
      freeCancellation: !!raw.free_cancellation,
      specifications: mappedSpecs,
    };
  },

  toLocalList: (rawList: any[]): Vehicle[] => {
    if (!Array.isArray(rawList)) return [];
    return rawList.map(vehicleMapper.toLocal);
  }
};
