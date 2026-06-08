import { 
  Car, 
  Settings, 
  Zap, 
  Crown, 
  Wind, 
  Smartphone,
  Navigation,
  ShieldCheck,
  Fuel,
  Users,
  LayoutGrid,
  Box,
  Truck,
  Baby
} from 'lucide-react';

export interface CarCategory {
  id: string;
  name: string;
  icon: any;
}

export const carCategories: CarCategory[] = [
  { id: 'all', name: 'All Cars', icon: LayoutGrid },
  { id: 'economy', name: 'Economy', icon: Fuel },
  { id: 'luxury', name: 'Luxury', icon: Crown },
  { id: 'suv', name: 'SUV', icon: Navigation },
  { id: 'compact-suv', name: 'Compact SUV', icon: Box },
  { id: 'full-size', name: 'Full Size', icon: Car },
  { id: 'mini', name: 'Mini', icon: Zap },
  { id: 'minivan', name: 'Minivan', icon: Users },
  { id: 'small', name: 'Small', icon: Smartphone },
  { id: 'standard', name: 'Standard', icon: Settings },
  { id: 'luxury-suv', name: 'Luxury SUV', icon: Crown },
  { id: 'family', name: 'Family', icon: Baby },
  { id: 'sport', name: 'Sport', icon: Zap },
  { id: 'convertible', name: 'Convertible', icon: Wind },
  { id: 'van', name: 'Vans', icon: Truck },
];

export const carFeatures = [
  { id: 'automatic', name: 'Automatic', icon: Settings },
  { id: 'bluetooth', name: 'Bluetooth', icon: Smartphone },
  { id: 'gps', name: 'GPS', icon: Navigation },
  { id: 'insurance', name: 'Full Insurance', icon: ShieldCheck },
];
