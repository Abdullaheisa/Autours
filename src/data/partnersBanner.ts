 import { assets } from "@/config/assets"

 export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
}

export const PARTNERS: Partner[] = [
  { id: '1', name: 'MAHD Rent', logoUrl: assets.suppliers.mahd },
  { id: '2', name: 'Highway', logoUrl: assets.suppliers.highway },
  { id: '3', name: 'KTC', logoUrl: assets.suppliers.ktc },
  { id: '4', name: 'RAMA', logoUrl: assets.suppliers.rama },
  { id: '5', name: 'GO RENTAL', logoUrl: assets.suppliers.goRental },
  { id: '6', name: 'Royal Star', logoUrl: assets.suppliers.royalStar },
  { id: '7', name: 'Europcar', logoUrl: assets.suppliers.europcar },
  { id: '8', name: 'AVIS', logoUrl: assets.suppliers.avis },
  { id: '9', name: 'Alamo', logoUrl: assets.suppliers.alamo },
  { id: '10', name: 'SIXT', logoUrl: assets.suppliers.sixt },
  { id: '11', name: 'Hertz', logoUrl: assets.suppliers.hertz },
  { id: '12', name: 'Enterprise', logoUrl: assets.suppliers.enterprise },
  { id: '13', name: 'Budget', logoUrl: assets.suppliers.budget },
  { id: '14', name: 'SOVOY', logoUrl: assets.suppliers.sovoy },
];