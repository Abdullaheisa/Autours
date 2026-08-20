import { assets } from '@/config/assets';

export interface Category {
  id: string;
  name: string;
  image: string;
  count?: number;
}

export const categories: Category[] = [
  { id: 'mini', name: 'Mini', image: assets.categories.mini, count: 10 },
  { id: 'small', name: 'Small', image: assets.categories.small, count: 18 },
  { id: 'standard', name: 'Standard', image: assets.categories.standard, count: 14 },
  { id: 'economy', name: 'Economy', image: assets.categories.economy, count: 24 },
  { id: 'full-size', name: 'Full Size', image: assets.categories.fullSize, count: 8 },
  { id: 'compact-suv', name: 'Compact SUV', image: assets.categories.compactSUV, count: 12 },
  { id: 'suv', name: 'SUV', image: assets.categories.suv, count: 20 },
  { id: 'minivan', name: 'Minivan', image: assets.categories.minivan, count: 5 },
  { id: 'family', name: 'Family', image: assets.categories.family, count: 9 },
  { id: 'luxury', name: 'Luxury', image: assets.categories.luxury, count: 15 },
];