import { assets } from "@/config/assets";

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
}

export const PARTNERS: Partner[] = [
  { id: '1', name: 'SurPrice', logoUrl: assets.suppliers.surprice },
  { id: '2', name: 'Green Motion', logoUrl: assets.suppliers.greenMotion },
  { id: '3', name: 'U-Save', logoUrl: assets.suppliers.usave },
  { id: '4', name: 'Street', logoUrl: assets.suppliers.street },
  { id: '5', name: 'Autowill', logoUrl: assets.suppliers.autowill },
  { id: '6', name: 'DRIVUS', logoUrl: assets.suppliers.drivus },
  { id: '7', name: 'XDrive Mobility', logoUrl: assets.suppliers.xdrive },
  { id: '8', name: 'Nissa Car Rental', logoUrl: assets.suppliers.nissa },
  { id: '9', name: 'North Car', logoUrl: assets.suppliers.northCar },
  { id: '10', name: 'Routes', logoUrl: assets.suppliers.routes },
];