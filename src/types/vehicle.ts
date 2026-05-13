import { Status } from "./common";

export interface VehicleSupplier {
  id?: number;
  company: string;
  logo: string;
  rating?: number;
  reviews_count?: number;
  rentalTerms?: string;
  address?: string;
  lat?: number;
  lng?: number;
  instant_confirmation?: boolean;
}

export interface VehicleSpecification {
  id?: number;
  name: string;
  option: string;
  icon?: string;
}

export interface Vehicle {
  id: number | string;
  name: string;
  brand?: string;
  category?: string;
  type?: string;
  photo: string;
  image?: string; // Compatibility
  final_price?: number;
  price_in_usd: number;
  transmission?: string;
  fuelType?: string;
  seats?: number | string;
  doors?: number | string;
  suitcases?: string;
  ac?: boolean;
  supplier: VehicleSupplier;
  specifications: VehicleSpecification[];
  included: {
    id: number;
    what_is_included: string;
    description?: string;
    pivot?: any;
  }[];
  fuelPolicy?: string;
  locationType?: string;
  freeCancellation?: boolean;
}

export interface Car {
  id: string;
  name: string;
  model: string;
  type: "small" | "standard" | "full-size" | "luxury" | "suv";
  image: string;
  pricePerDay: number;
  currency: string;
  features: string[];
  transmission: "automatic" | "manual";
  fuelType: string;
  passengers: number;
  suitcases: number;
  rating: number;
  reviewsCount: number;
  supplierId: string;
  supplierName: string;
}

export interface Booking {
  id: string;
  carId: string;
  userId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
}

export interface Rental {
  id: string;
  bookingNumber: string;
  vehicle: string;
  customerName: string;
  country: string;
  totalPrice: string;
  profit: string;
  supplierPrice: string;
  supplierName: string;
  rentalStatus: "confirmed" | "cancelled" | "pending";
  startedAt: string;
  endedAt: string;
  duration: number;
}

export interface SearchPayload {
  pickupLoc: string;
  date_from: string;
  date_to: string;
  time_from?: string;
  time_to?: string;
  currency: string;
}

export interface FilterPayload extends SearchPayload {
  priceRange?: number;
  category?: string[];
  supplier?: string[];
  location_type_id?: string[];
  payment_methods?: string[];
  specifications?: { name: string; option: string[] }[];
  rating?: number;
  sortBy?: string;
}

export interface FilterResponse {
  filteredVehicles: Vehicle[];
  count: number;
  daysNumber: number;
  max: number;
  min: number;
  filteredCategories?: { id: number; name: string; vehicle_count: number }[];
  filteredSuppliers?: { id: number; name: string; vehicle_count: number }[];
}

export interface LocationBranch {
  id: number;
  name: string;
  location: string;
  country: string;
  adresse?: string;
  location_type?: string;
}
