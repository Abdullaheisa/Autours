/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SUPPLIER INTELLIGENCE API — Dual-mode: Real API  ↔  Mock fallback
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Set  NEXT_PUBLIC_USE_REAL_API=true  in .env.local to switch to the real
 * backend.  While the backend is not ready, the mock layer runs automatically.
 *
 * Real endpoints (base: NEXT_PUBLIC_API_BASE_URL):
 *   GET    /api/admin/supplier-intelligence?country=&city=&category=&carType=&search=&page=1&per_page=20
 *   PATCH  /api/admin/supplier-intelligence/:supplierId/negotiation
 *   GET    /api/admin/supplier-intelligence/export   → binary xlsx
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { cars } from '@/data/cars';
import { SupplierComparison } from '@/data/supplierAnalytics';
import { apiClient } from '@/services/api/apiClient';

// ── Environment ───────────────────────────────────────────────────────────────
const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API === 'true';
const SUPPLIER_INTEL_BASE = '/api/admin/supplier-intelligence';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface SupplierIntelligenceFilters {
  country?: string;
  city?: string;
  category?: string;
  carType?: string;
  searchQuery?: string;
  page?: number;
  per_page?: number;
}

export interface SupplierIntelligenceResponse {
  data: SupplierComparison[];
  stats: {
    lowestPrice: number;
    highestPrice: number;
    averagePrice: number;
    cheapestSupplier: string;
    expensiveSupplier: string;
    totalSuppliers: number;
    totalCars: number;
  };
  pagination?: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

export type NegotiationUpdatePayload = Partial<SupplierComparison>;

// ─────────────────────────────────────────────────────────────────────────────
// MOCK IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────

const mockFetchSupplierAnalytics = async (
  filters: SupplierIntelligenceFilters
): Promise<SupplierIntelligenceResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let baseCars = [...cars];

      // Extend mock dataset for realistic multi-car-per-supplier display
      if (baseCars.length > 0) {
        const extraCar1 = { ...baseCars[0], id: 'ex1', name: 'Kia Carnival', category: 'Family', price: { amount: 80, currency: 'KWD', totalDays: 1 } };
        const extraCar2 = { ...baseCars[1], id: 'ex2', name: 'Hyundai Staria', category: 'Family', price: { amount: 90, currency: 'KWD', totalDays: 1 }, supplier: baseCars[0].supplier };
        const extraCar3 = { ...baseCars[2], id: 'ex3', name: 'Toyota Innova', category: 'Family', price: { amount: 100, currency: 'KWD', totalDays: 1 }, supplier: baseCars[0].supplier };
        const extraCar4 = { ...baseCars[3], id: 'ex4', name: 'Toyota Innova', category: 'Family', price: { amount: 110, currency: 'KWD', totalDays: 1 }, supplier: baseCars[1].supplier };
        baseCars = [...baseCars, extraCar1, extraCar2, extraCar3, extraCar4];
      }

      let filteredCars = baseCars;

      if (filters?.category && filters.category !== 'All') {
        filteredCars = filteredCars.filter(
          (car) => car.category.toLowerCase() === filters.category!.toLowerCase()
        );
      }

      if (filters?.carType && filters.carType !== 'All') {
        filteredCars = filteredCars.filter(
          (car) => car.fuelType.toLowerCase() === filters.carType!.toLowerCase()
        );
      }

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const query = filters.searchQuery.toLowerCase().trim();
        filteredCars = filteredCars.filter(
          (car) =>
            car.supplier.name.toLowerCase().includes(query) ||
            car.name.toLowerCase().includes(query)
        );
      }

      const data: SupplierComparison[] = filteredCars.map((car) => ({
        id: `sup-${car.id}`,
        name: car.supplier.name,
        logo: car.supplier.logo,
        carName: car.name,
        carImage: car.image,
        category: car.category,
        transmission: car.transmission,
        fuel: car.fuelType,
        seats: car.seats,
        dailyPrice: car.price.amount,
        weeklyPrice: car.price.amount * 7,
        monthlyPrice: car.price.amount * 30,
        rating: car.supplier.rating,
        availability: Math.floor(Math.random() * 20) + 1,
        marketPosition:
          car.price.amount > 1000
            ? 'Premium'
            : car.price.amount > 400
            ? 'Expensive'
            : car.price.amount < 200
            ? 'Cheapest'
            : 'Competitive',
        negotiationStatus: 'none',
        lastUpdated: new Date().toISOString().split('T')[0],
        branchLocations: [car.supplier.address],
        fleetSize: car.supplier.reviewsCount,
        contactEmail: `contact@${car.supplier.name.replace(/\s+/g, '').toLowerCase()}.com`,
        contactPhone: '+971 0000000',
        notes: '',
        priority: 'Medium',
      }));

      const prices = data.map((d) => d.dailyPrice);
      const lowestPrice = prices.length ? Math.min(...prices) : 0;
      const highestPrice = prices.length ? Math.max(...prices) : 0;
      const averagePrice = prices.length
        ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        : 0;

      resolve({
        data,
        stats: {
          lowestPrice,
          highestPrice,
          averagePrice,
          cheapestSupplier: data.find((d) => d.dailyPrice === lowestPrice)?.name || 'N/A',
          expensiveSupplier: data.find((d) => d.dailyPrice === highestPrice)?.name || 'N/A',
          totalSuppliers: new Set(data.map((d) => d.name)).size,
          totalCars: data.length,
        },
      });
    }, 800);
  });
};

const mockUpdateNegotiation = async (
  supplierId: string,
  payload: NegotiationUpdatePayload
): Promise<{ success: boolean; data: any }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: { supplierId, ...payload } });
    }, 500);
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// REAL API IMPLEMENTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/supplier-intelligence
 * Query params: country, city, category, carType, search, page, per_page
 * Response: SupplierIntelligenceResponse
 */
const realFetchSupplierAnalytics = async (
  filters: SupplierIntelligenceFilters
): Promise<SupplierIntelligenceResponse> => {
  const params = new URLSearchParams();
  if (filters.country && filters.country !== 'All') params.set('country', filters.country);
  if (filters.city && filters.city !== 'All') params.set('city', filters.city);
  if (filters.category && filters.category !== 'All') params.set('category', filters.category);
  if (filters.carType && filters.carType !== 'All') params.set('carType', filters.carType);
  if (filters.searchQuery) params.set('search', filters.searchQuery);
  params.set('page', String(filters.page ?? 1));
  params.set('per_page', String(filters.per_page ?? 20));

  return apiClient.get<SupplierIntelligenceResponse>(
    `${SUPPLIER_INTEL_BASE}?${params.toString()}`
  );
};

/**
 * PATCH /api/admin/supplier-intelligence/:supplierId/negotiation
 * Body:    NegotiationUpdatePayload
 * Response: { success: boolean; data: SupplierComparison }
 */
const realUpdateNegotiation = async (
  supplierId: string,
  payload: NegotiationUpdatePayload
): Promise<{ success: boolean; data: any }> => {
  return apiClient.patch<{ success: boolean; data: any }>(
    `${SUPPLIER_INTEL_BASE}/${supplierId}/negotiation`,
    payload
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API — consumers always call these
// ─────────────────────────────────────────────────────────────────────────────

export const fetchSupplierAnalytics = (
  filters: SupplierIntelligenceFilters
): Promise<SupplierIntelligenceResponse> =>
  USE_REAL_API ? realFetchSupplierAnalytics(filters) : mockFetchSupplierAnalytics(filters);

export const updateNegotiationStatusAPI = (
  supplierId: string,
  payload: NegotiationUpdatePayload
): Promise<{ success: boolean; data: any }> =>
  USE_REAL_API
    ? realUpdateNegotiation(supplierId, payload)
    : mockUpdateNegotiation(supplierId, payload);
