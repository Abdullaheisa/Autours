import { Status } from "./common";

export interface Company {
  id: number;
  name: string;
  branchName: string;
  country: string;
  address: string;
  email: string;
  phone: string;
  parentCompany: string | null;
  role: string;
  vehicles: number;
  bookings: number;
  revenue: number;
  rating: number;
  status: Status;
  since: string;
  image: string;
}
