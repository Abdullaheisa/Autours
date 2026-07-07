import { Status } from "./common";

export interface VehicleSupplier {
  [key: string]: any;
  id?: number;
  company: string;
  logo: string;
  rating?: number;
  reviews_count?: number;
  rentalTerms?: string;
  address?: string;
  lat?: number;
  lng?: number;
  instant_confirmation?: boolean | number; // تم التعديل لدعم الأرقام (0 أو 1) والمنطقي (true/false)
}

export interface VehicleSpecification {
  id?: number;
  name: string;
  option: string;
  icon?: string;
}

export interface Vehicle {
  [key: string]: any; // تم دمج الخصائص الديناميكية بشكل صحيح لمنع تعارض الـ Types
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
  baseCurrency?: string;
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
  rental_terms?: any[];
  instant_confirmation?: boolean | number; // تم إضافتها لحل الإيرور في الكومبوننت
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
  price_min?: number;
  price_max?: number;
  category?: number[];
  supplier?: number[];
  location_type_id?: number[];
  payment_methods?: number[];
  specifications?: { name: string; option: string[] }[];
  rating?: number;
  sortBy?: string;
  page?: number;
  per_page?: number;
}

export interface FilterResponse {
  filteredVehicles: Vehicle[];
  count: number;
  daysNumber: number;
  max: number;
  min: number;
  filteredCategories?: { id: number; name: string; vehicle_count: number; photo?: string }[];
  filteredSuppliers?: { id: number; name: string; vehicle_count: number; logo?: string }[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export interface LocationBranch {
  id: number;
  name: string;
  location: string;
  country: string;
  adresse?: string;
  location_address?: string;
  location_type?: string;
  abriviation?: string;
  min_price?: number | null;
  currency?: string;
  airport_id?: number | null;
  company?: { id: number; name: string; logo: string; company: string } | null;
}