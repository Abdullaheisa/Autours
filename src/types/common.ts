export type Status = "active" | "inactive" | "pending" | "suspended" | "published" | "draft" | "scheduled";

export type Currency = 'USD' | 'EUR' | 'AED' | 'SAR' | 'EGP' | 'QAR' | 'KWD' | 'OMR' | 'BHD' | 'MAD' | 'JOD' | 'GBP';



export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  image: string;
  cities: string[];
}
