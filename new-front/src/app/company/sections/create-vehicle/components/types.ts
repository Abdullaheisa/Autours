export type PricingMode = 'standard' | 'granular' | 'dynamic';

export interface CustomPriceTier {
  id: string;
  minDays: number;
  maxDays: number;
  price: string;
}

export interface VehicleFormData {
  vehiclePhotoId: string;
  pickupLocationId: string;   // branch ID
  categoryId: string;          // category ID
  locationTypeId: string;      // location-type ID
  fuelPolicyId: string;        // fuel-policy ID
  reserveWithoutConfirmation: boolean;
  description: string;
  
  // Pricing mode & fields
  pricingMode: PricingMode;
  price12: string;            // 1-2 days (standard & granular)
  price37: string;            // 3-7 days (standard)
  price830: string;           // 8-30 days (standard)
  
  // Granular pricing fields
  price34: string;            // 3-4 days
  price57: string;            // 5-7 days
  price814: string;           // 8-14 days
  price1530: string;          // 15-30 days

  // Custom dynamic pricing tiers
  customPriceTiers: CustomPriceTier[];

  includedFeatures: number[];
  showIncludedDropdown: boolean;
  showVehicleDropdown: boolean;
  specifications: Record<string, string>;
}

export interface VehicleDynamicData {
  photos: any[];
  categories: any[];
  branches: any[];
  locationTypes: any[];
  fuelPolicies: any[];
  includedItems: any[];
  specifications: any[];
}
