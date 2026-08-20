export interface SupplierComparison {
  id: string;
  name: string;
  logo: string;
  carName: string;
  carImage: string;
  category: string;
  transmission: string;
  fuel: string;
  seats: number;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  rating: number;
  availability: number;
  marketPosition: "Cheapest" | "Competitive" | "Expensive" | "Premium";
  negotiationStatus: "interested" | "contacted" | "negotiating" | "deal closed" | "rejected" | "maybe later" | "none";
  lastUpdated: string;
  branchLocations: string[];
  fleetSize: number;
  contactEmail: string;
  contactPhone: string;
  notes: string;
  negotiatedPrice?: number;
  targetPrice?: number;
  priority?: "Low" | "Medium" | "High";
  followUpDate?: string;
}
