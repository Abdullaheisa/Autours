 import { assets } from "@/config/assets"

 export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
}

export const PARTNERS: Partner[] = [
  { id: '1', name: 'Europcar', logoUrl: assets.suppliers.europcar },
  { id: '2', name: 'AVIS', logoUrl: assets.suppliers.avis },
  { id: '3', name: 'Alamo', logoUrl: assets.suppliers.alamo },
  { id: '4', name: 'SIXT', logoUrl: assets.suppliers.sixt },
  { id: '5', name: 'Hertz', logoUrl: assets.suppliers.hertz },
  { id: '6', name: 'Enterprise', logoUrl: assets.suppliers.enterprise },
  { id: '7', name: 'Budget', logoUrl: assets.suppliers.budget },
  { id: '8', name: 'thrifty', logoUrl: assets.suppliers.thrifty },
  { id: '9', name: 'national', logoUrl: assets.suppliers.national },
  { id: '10', name: 'dollar', logoUrl: assets.suppliers.dollar },
];