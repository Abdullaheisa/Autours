import { Vehicle } from "@/types";

export const vehicleMapper = {
  toLocal: (raw: any): Vehicle => {
    const categoryName = typeof raw.category === 'object' ? raw.category?.name : (raw.category || '');
    const supplierRaw = (typeof raw.supplier === 'object' && raw.supplier !== null)
      ? raw.supplier
      : (raw.supplier_user || raw.supplierUser || raw.supplier_data || {});

    const supplierId = (typeof raw.supplier === 'number' || typeof raw.supplier === 'string')
      ? raw.supplier
      : (supplierRaw.id || raw.supplier_id || '');

    const supplierCompany = supplierRaw.company || supplierRaw.name || raw.supplier_name || '';
    const supplierLogo = supplierRaw.logo || raw.supplier_logo || '';

    const branch = raw.branch || (raw.available_branches && raw.available_branches[0]) || {};

    const specs = raw.specifications || [];
    const specMap: Record<string, string> = {};
    if (Array.isArray(specs)) {
      specs.forEach((s: any) => {
        const name = (s.name || '').toLowerCase();
        const val = s.pivot?.value || s.value || (Array.isArray(s.options) ? s.options[0] : '');
        if (val) specMap[name] = val;
      });
    }

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
      final_price:
        parseFloat(raw.final_price) ||
        parseFloat(raw.total_price) ||
        parseFloat(raw.total) ||
        0,
      price_in_usd: parseFloat(raw.price_in_usd) || 0,
      transmission: specMap['transmission'] || specMap['gear'] || raw.transmission || 'Automatic',
      fuelType: specMap['fuel'] || raw.fuel_type || raw.fuelType || 'Petrol',
      seats: parseInt(specMap['number of seats'] || specMap['seats']) || raw.seats || 5,
      suitcases: (() => {
        const val = specMap['suitcase'] || specMap['suitcases'] || specMap['luggage'] || specMap['number of luggages'] || raw.suitcases || '';
        if (!val || val === '0' || val === 0) return 'Medium';
        return val;
      })(),
      ac: specMap['air conditioner'] === 'Air Conditioning' || specMap['air conditioner'] === 'Yes' || !!(raw.ac),
      baseCurrency: branch.currency || 'AED',
      supplier: {
        id: supplierId,
        company: supplierCompany,
        name: supplierCompany,
        logo: supplierLogo,
        rating: raw.supplier_rate || supplierRaw.rating || supplierRaw.rate || 0,
        reviews_count: raw.supplier_number_of_reviews || supplierRaw.reviews_count || 0,
        rentalTerms: supplierRaw.terms || supplierRaw.rentalTerms || raw.rental_terms || '',
        instant_confirmation: !!(raw.instant_confirmation ?? supplierRaw.instant_confirmation),
        lat: parseFloat(branch.lat || supplierRaw.lat) || 0,
        lng: parseFloat(branch.lng || supplierRaw.lng) || 0,
        address: branch.address || branch.location_address || branch.adresse || supplierRaw.address || '',
      },
      included: (raw.included || raw.inclusions || []).map((inc: any, index: number) => {
        let what = typeof inc === 'string' ? inc : (inc.what_is_included || inc.name || '');
        let desc = typeof inc === 'string' ? '' : (inc.description || '');
        if (typeof inc === 'string') {
          try {
            const parsed = JSON.parse(inc);
            if (parsed && typeof parsed === 'object') {
              what = parsed.conditionName || parsed.rentalConditionName || parsed.name || parsed.what_is_included || what;
              desc = parsed.description || desc;
            }
          } catch (e) {}
        }
        return {
          id: inc.id || index,
          what_is_included: what,
          description: desc,
        };
      }),
      fuelPolicy: (
        (typeof raw.fuel_policy === 'object' ? (raw.fuel_policy?.name || raw.fuel_policy?.title) : null) ||
        (typeof raw.fuelPolicy === 'object' ? (raw.fuelPolicy?.name || raw.fuelPolicy?.title) : null) ||
        raw.fuel_policy ||
        raw.fuelPolicy ||
        'Full to Full'
      ),
      locationType: raw.location_type || branch.location_type || 'Airport',
      freeCancellation: !!raw.free_cancellation,
      specifications: mappedSpecs,
      rental_terms: raw.rental_terms || [],
      instant_confirmation: raw.instant_confirmation !== undefined
        ? !!raw.instant_confirmation
        : (supplierRaw.instant_confirmation !== undefined
          ? !!supplierRaw.instant_confirmation
          : true),
      promos: raw.promos || [],
      available_branches: raw.available_branches || [],
      branch_vehicle_ids: raw.branch_vehicle_ids || {},
      branch: branch,
      location: branch.name || branch.city || branch.country || '',
      pickup_loc: raw.pickup_loc || branch.id || '',
    };
  },

  toLocalList: (rawList: any[]): Vehicle[] => {
    if (!Array.isArray(rawList)) return [];
    return rawList.map(vehicleMapper.toLocal);
  }
};
