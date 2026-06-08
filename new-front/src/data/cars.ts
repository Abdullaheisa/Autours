import { assets } from '@/config/assets';

export interface SearchCar {
  id: string;
  name: string;
  type: string;
  image: string;
  transmission: string;
  fuelType: string;
  seats: number;
  doors: number;
  suitcases: string;
  ac: boolean;
  supplier: {
    name: string;
    logo: string;
    rating: number;
    reviewsCount: number;
    rentalTerms: string;
    instantConfirmation: boolean;
    lat: number;
    lng: number;
    address: string;
  };
  price: {
    amount: number;
    currency: string;
    totalDays: number;
  };
  price_in_usd: number;
  inclusions: string[];
  fuelPolicy: string;
  locationType: string;
  freeCancellation: boolean;
  category: string;
  brand: string;
}

export const cars: SearchCar[] = [
  {
    id: '1',
    name: 'Nissan Patrol',
    brand: 'Nissan',
    category: 'SUV',
    type: 'Luxury SUV',
    image: assets.vehicles.nissanPatrol,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 7,
    doors: 5,
    suitcases: '4 Large',
    ac: true,
    supplier: {
      name: 'MAHD Rent',
      logo: assets.suppliers.mahd,
      rating: 9.2,
      reviewsCount: 1500,
      rentalTerms: 'Full to Full fuel policy. Minimum age 25. Credit card required for deposit.',
      instantConfirmation: true,
      lat: 25.2048,
      lng: 55.2708,
      address: 'Dubai International Airport, Terminal 3',
    },
    price: { amount: 1500, currency: 'AED', totalDays: 3 },
    price_in_usd: 135,
    inclusions: [
      'Free Cancellation', 'Theft Waiver', 'Third Party Liability',
      'VAT', 'Collision Damage Waiver', '24/7 Roadside Assistance', 'Unlimited Mileage',
    ],
    fuelPolicy: 'Full to Full',
    locationType: 'Airport Shuttle',
    freeCancellation: true,
  },
  {
    id: '2',
    name: 'Toyota Camry',
    brand: 'Toyota',
    category: 'Full Size',
    type: 'Standard Sedan',
    image: assets.vehicles.toyotaCamry,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    doors: 4,
    suitcases: '2 Large, 1 Small',
    ac: true,
    supplier: {
      name: 'Highway',
      logo: assets.suppliers.highway,
      rating: 8.5,
      reviewsCount: 850,
      rentalTerms: 'Same to same fuel policy. Minimum age 21. International license required.',
      instantConfirmation: true,
      lat: 25.2532,
      lng: 55.3657,
      address: 'Dubai Marina Mall, Level G',
    },
    price: { amount: 450, currency: 'AED', totalDays: 3 },
    price_in_usd: 40,
    inclusions: [
      'Free Cancellation', 'Third Party Liability', 'VAT',
      'Collision Damage Waiver', '24/7 Roadside Assistance',
    ],
    fuelPolicy: 'Same to Same',
    locationType: 'Terminal Pickup',
    freeCancellation: true,
  },
  {
    id: '3',
    name: 'Kia Picanto',
    brand: 'Kia',
    category: 'Economy',
    type: 'Mini Hatchback',
    image: assets.vehicles.kiaPickanto,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 4,
    doors: 4,
    suitcases: '1 Small',
    ac: true,
    supplier: {
      name: 'KTC',
      logo: assets.suppliers.ktc,
      rating: 7.8,
      reviewsCount: 450,
      rentalTerms: 'Full to Full fuel policy. Minimum age 21. Credit card or debit card accepted.',
      instantConfirmation: false,
      lat: 25.1972,
      lng: 55.2744,
      address: 'Downtown Dubai, Sheikh Mohammed bin Rashid Blvd',
    },
    price: { amount: 180, currency: 'AED', totalDays: 3 },
    price_in_usd: 15,
    inclusions: ['VAT', 'Third Party Liability', '24/7 Roadside Assistance'],
    fuelPolicy: 'Full to Full',
    locationType: 'City Center',
    freeCancellation: false,
  },
  {
    id: '4',
    name: 'Hyundai Tucson',
    brand: 'Hyundai',
    category: 'Compact SUV',
    type: 'Compact SUV',
    image: assets.vehicles.hyundaiTucson,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    doors: 5,
    suitcases: '2 Large',
    ac: true,
    supplier: {
      name: 'GO RENTAL',
      logo: assets.suppliers.goRental,
      rating: 8.8,
      reviewsCount: 1200,
      rentalTerms: 'Full to Full. Minimum age 23. International license required.',
      instantConfirmation: true,
      lat: 29.3759,
      lng: 47.9774,
      address: 'Kuwait International Airport',
    },
    price: { amount: 350, currency: 'KWD', totalDays: 3 },
    price_in_usd: 95,
    inclusions: ['Free Cancellation', 'Third Party Liability', 'VAT', 'Collision Damage Waiver'],
    fuelPolicy: 'Full to Full',
    locationType: 'Airport',
    freeCancellation: true,
  },
  {
    id: '5',
    name: 'Mercedes C200',
    brand: 'Mercedes',
    category: 'Luxury',
    type: 'Luxury Sedan',
    image: assets.vehicles.mercedesC200,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    doors: 4,
    suitcases: '2 Large',
    ac: true,
    supplier: {
      name: 'RAMA',
      logo: assets.suppliers.rama,
      rating: 9.0,
      reviewsCount: 680,
      rentalTerms: 'Full to Full fuel policy. Minimum age 25. Credit card required.',
      instantConfirmation: true,
      lat: 30.0616,
      lng: 31.2497,
      address: 'Cairo International Airport, Terminal 2',
    },
    price: { amount: 2800, currency: 'EGP', totalDays: 3 },
    price_in_usd: 60,
    inclusions: [
      'Free Cancellation', 'Theft Waiver', 'Third Party Liability',
      'VAT', 'Collision Damage Waiver', '24/7 Roadside Assistance',
    ],
    fuelPolicy: 'Full to Full',
    locationType: 'Airport',
    freeCancellation: true,
  },
  {
    id: '6',
    name: 'GMC Yukon',
    brand: 'GMC',
    category: 'SUV',
    type: 'Full Size SUV',
    image: assets.vehicles.gmcYukon,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 8,
    doors: 5,
    suitcases: '5 Large',
    ac: true,
    supplier: {
      name: 'Royal Star',
      logo: assets.suppliers.royalStar,
      rating: 9.5,
      reviewsCount: 920,
      rentalTerms: 'Full to Full. Minimum age 25. International license required.',
      instantConfirmation: true,
      lat: 29.3759,
      lng: 47.9774,
      address: 'Kuwait City, Salmiya',
    },
    price: { amount: 500, currency: 'KWD', totalDays: 3 },
    price_in_usd: 150,
    inclusions: [
      'Free Cancellation', 'Theft Waiver', 'Third Party Liability',
      'VAT', 'Collision Damage Waiver', 'Unlimited Mileage',
    ],
    fuelPolicy: 'Full to Full',
    locationType: 'City Center',
    freeCancellation: true,
  },
];
