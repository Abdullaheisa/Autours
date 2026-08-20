// ─────────────────────────────────────────────────────────────────────────────
// Car Rental Brands Data
// ─────────────────────────────────────────────────────────────────────────────
// This file acts as the data layer for the /car-rental-brands pages.
// Replace the mock arrays with API calls when the backend is ready.
// ─────────────────────────────────────────────────────────────────────────────

export interface Branch {
  id: string;
  name: string;
  type: 'airport' | 'city';
  city: string;
  address?: string;
  phone?: string;
  openingHours?: string;
}

export interface BrandCountry {
  countrySlug: string;   // 'uae', 'saudi', etc.
  countryCode: string;   // 'AE', 'SA', etc.
  countryName: string;   // 'United Arab Emirates'
  countryFlag: string;   // emoji flag
  airportBranches: Branch[];
  cityBranches: Branch[];
}

export interface CarRentalBrand {
  id: string;            // slug: 'alamo', 'hertz'
  name: string;          // 'Alamo'
  displayName: string;   // 'Alamo Car Rental'
  logo: string;          // path from assets
  rating: number;        // 9.23
  reviewCount: number;   // 4174
  ratingLabel: string;   // 'Brilliant'
  description: string;   // multi-paragraph description
  countries: BrandCountry[];
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — Replace with API fetch when backend is ready
// ─────────────────────────────────────────────────────────────────────────────

export const carRentalBrands: CarRentalBrand[] = [
  {
    id: 'alamo',
    name: 'Alamo',
    displayName: 'Alamo Car Rental',
    logo: '/img/company_logos/alamo.webp',
    rating: 9.23,
    reviewCount: 4174,
    ratingLabel: 'Brilliant',
    description: `Alamo Rent A Car, established in 1974, has built a reputation for providing a seamless and efficient rental experience for travelers worldwide. With a presence in numerous countries across North America, South America, Europe, Asia, and Oceania, Alamo offers convenient access to rental services at major travel destinations.

Alamo's dedication to cleanliness and safety is exemplified by its Complete Clean Pledge, ensuring that every vehicle undergoes rigorous sanitization procedures. This commitment provides peace of mind to customers, knowing that their health and safety are prioritized.

As a subsidiary of Enterprise Holdings, Alamo benefits from the resources and support of one of the largest car rental companies globally. By choosing Alamo, travelers can expect a combination of convenience, safety, and exceptional customer service.`,
    countries: [
      {
        countrySlug: 'uae',
        countryCode: 'AE',
        countryName: 'United Arab Emirates',
        countryFlag: '🇦🇪',
        airportBranches: [
          { id: 'alamo-dxb', name: 'Dubai International Airport', type: 'airport', city: 'Dubai', address: 'Terminal 1, DXB Airport', openingHours: '24/7' },
          { id: 'alamo-auh', name: 'Abu Dhabi International Airport', type: 'airport', city: 'Abu Dhabi', address: 'Terminal 1, AUH Airport', openingHours: '24/7' },
          { id: 'alamo-shj', name: 'Sharjah International Airport', type: 'airport', city: 'Sharjah', address: 'Main Terminal, SHJ Airport', openingHours: '06:00 - 23:00' },
        ],
        cityBranches: [
          { id: 'alamo-dubai-marina', name: 'Dubai Marina Branch', type: 'city', city: 'Dubai', address: 'Marina Walk, Dubai Marina', openingHours: '08:00 - 22:00' },
          { id: 'alamo-deira', name: 'Deira City Center', type: 'city', city: 'Dubai', address: 'Deira City Center Mall', openingHours: '10:00 - 22:00' },
          { id: 'alamo-abudhabi-corniche', name: 'Abu Dhabi Corniche', type: 'city', city: 'Abu Dhabi', address: 'Corniche Road, Abu Dhabi', openingHours: '08:00 - 20:00' },
        ],
      },
      {
        countrySlug: 'saudi',
        countryCode: 'SA',
        countryName: 'Saudi Arabia',
        countryFlag: '🇸🇦',
        airportBranches: [
          { id: 'alamo-ruh', name: 'King Khalid International Airport', type: 'airport', city: 'Riyadh', address: 'Terminal 5, KKIA', openingHours: '24/7' },
          { id: 'alamo-jed', name: 'King Abdulaziz International Airport', type: 'airport', city: 'Jeddah', address: 'North Terminal, KAIA', openingHours: '24/7' },
          { id: 'alamo-dmm', name: 'King Fahd International Airport', type: 'airport', city: 'Dammam', address: 'Main Terminal, KFIA', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'alamo-riyadh-olaya', name: 'Riyadh Olaya Branch', type: 'city', city: 'Riyadh', address: 'Olaya Street, Riyadh', openingHours: '08:00 - 22:00' },
          { id: 'alamo-jeddah-corniche', name: 'Jeddah Corniche', type: 'city', city: 'Jeddah', address: 'King Fahd Corniche, Jeddah', openingHours: '09:00 - 22:00' },
        ],
      },
      {
        countrySlug: 'kuwait',
        countryCode: 'KW',
        countryName: 'Kuwait',
        countryFlag: '🇰🇼',
        airportBranches: [
          { id: 'alamo-kwi', name: 'Kuwait International Airport', type: 'airport', city: 'Kuwait City', address: 'Terminal 4, KWI Airport', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'alamo-kuwait-city', name: 'Kuwait City Branch', type: 'city', city: 'Kuwait City', address: 'Salem Al Mubarak St', openingHours: '08:00 - 21:00' },
          { id: 'alamo-salmiya', name: 'Salmiya Branch', type: 'city', city: 'Salmiya', address: 'Gulf Road, Salmiya', openingHours: '09:00 - 21:00' },
        ],
      },
      {
        countrySlug: 'bahrain',
        countryCode: 'BH',
        countryName: 'Bahrain',
        countryFlag: '🇧🇭',
        airportBranches: [
          { id: 'alamo-bah', name: 'Bahrain International Airport', type: 'airport', city: 'Muharraq', address: 'BAH Airport Terminal', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'alamo-manama', name: 'Manama City Center', type: 'city', city: 'Manama', address: 'Diplomatic Area, Manama', openingHours: '08:00 - 20:00' },
        ],
      },
      {
        countrySlug: 'egypt',
        countryCode: 'EG',
        countryName: 'Egypt',
        countryFlag: '🇪🇬',
        airportBranches: [
          { id: 'alamo-cai', name: 'Cairo International Airport', type: 'airport', city: 'Cairo', address: 'Terminal 2, CAI Airport', openingHours: '24/7' },
          { id: 'alamo-hbe', name: 'Borg El Arab Airport', type: 'airport', city: 'Alexandria', address: 'HBE Airport', openingHours: '06:00 - 23:00' },
        ],
        cityBranches: [
          { id: 'alamo-cairo-downtown', name: 'Cairo Downtown', type: 'city', city: 'Cairo', address: 'Tahrir Square Area, Cairo', openingHours: '09:00 - 21:00' },
          { id: 'alamo-nasr-city', name: 'Nasr City Branch', type: 'city', city: 'Cairo', address: 'Abbas El Akkad, Nasr City', openingHours: '09:00 - 21:00' },
        ],
      },
    ],
  },

  {
    id: 'avis',
    name: 'AVIS',
    displayName: 'AVIS Car Rental',
    logo: '/img/company_logos/avis.webp',
    rating: 8.95,
    reviewCount: 6821,
    ratingLabel: 'Excellent',
    description: `Avis Car Rental is one of the world's leading car rental brands, operating in more than 180 countries and territories worldwide. Founded in 1946, Avis has been at the forefront of the car rental industry, consistently delivering quality vehicles and exceptional customer service.

Avis is committed to providing a premium car rental experience with a diverse fleet of vehicles ranging from economy cars to luxury SUVs. Their innovative Avis App allows customers to manage their reservations, choose their preferred vehicle, and skip the counter entirely at many locations.

With a strong focus on corporate travel, Avis offers tailored solutions for business travelers, including preferred pricing, streamlined billing, and dedicated account management services.`,
    countries: [
      {
        countrySlug: 'uae',
        countryCode: 'AE',
        countryName: 'United Arab Emirates',
        countryFlag: '🇦🇪',
        airportBranches: [
          { id: 'avis-dxb', name: 'Dubai International Airport', type: 'airport', city: 'Dubai', address: 'Terminal 3, DXB Airport', openingHours: '24/7' },
          { id: 'avis-auh', name: 'Abu Dhabi International Airport', type: 'airport', city: 'Abu Dhabi', address: 'Terminal 1, AUH Airport', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'avis-jlt', name: 'JLT Branch', type: 'city', city: 'Dubai', address: 'Cluster T, JLT, Dubai', openingHours: '08:00 - 22:00' },
          { id: 'avis-dtwc', name: 'Downtown Dubai', type: 'city', city: 'Dubai', address: 'Emaar Boulevard, Downtown', openingHours: '10:00 - 22:00' },
          { id: 'avis-abudhabi-khalidiyah', name: 'Khalidiyah Branch', type: 'city', city: 'Abu Dhabi', address: 'Khalidiyah Street, Abu Dhabi', openingHours: '08:00 - 20:00' },
        ],
      },
      {
        countrySlug: 'saudi',
        countryCode: 'SA',
        countryName: 'Saudi Arabia',
        countryFlag: '🇸🇦',
        airportBranches: [
          { id: 'avis-ruh', name: 'King Khalid International Airport', type: 'airport', city: 'Riyadh', address: 'KKIA Main Terminal', openingHours: '24/7' },
          { id: 'avis-jed', name: 'King Abdulaziz International Airport', type: 'airport', city: 'Jeddah', address: 'KAIA North Terminal', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'avis-riyadh-tahlia', name: 'Tahlia Street Branch', type: 'city', city: 'Riyadh', address: 'Tahlia Street, Riyadh', openingHours: '08:00 - 22:00' },
        ],
      },
      {
        countrySlug: 'kuwait',
        countryCode: 'KW',
        countryName: 'Kuwait',
        countryFlag: '🇰🇼',
        airportBranches: [
          { id: 'avis-kwi', name: 'Kuwait International Airport', type: 'airport', city: 'Kuwait City', address: 'KWI Airport Arrivals', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'avis-avenues', name: 'The Avenues Mall', type: 'city', city: 'Kuwait City', address: 'The Avenues Mall, Kuwait', openingHours: '10:00 - 22:00' },
        ],
      },
      {
        countrySlug: 'jordan',
        countryCode: 'JO',
        countryName: 'Jordan',
        countryFlag: '🇯🇴',
        airportBranches: [
          { id: 'avis-amm', name: 'Queen Alia International Airport', type: 'airport', city: 'Amman', address: 'AMM Airport Terminal', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'avis-amman-shmeisani', name: 'Shmeisani Branch', type: 'city', city: 'Amman', address: 'Shmeisani, Amman', openingHours: '08:00 - 20:00' },
          { id: 'avis-aqaba', name: 'Aqaba Branch', type: 'city', city: 'Aqaba', address: 'Aqaba City Center', openingHours: '09:00 - 20:00' },
        ],
      },
    ],
  },

  {
    id: 'budget',
    name: 'Budget',
    displayName: 'Budget Car Rental',
    logo: '/img/company_logos/budget.webp',
    rating: 8.71,
    reviewCount: 5340,
    ratingLabel: 'Very Good',
    description: `Budget Car Rental has been serving customers worldwide since 1958, offering quality vehicles at competitive prices. As a subsidiary of Avis Budget Group, Budget operates over 3,300 locations across more than 120 countries.

Budget is known for providing exceptional value without compromising on quality. Their diverse fleet includes economy, compact, midsize, and full-size vehicles, as well as SUVs, minivans, and luxury cars to meet every traveler's needs and budget.

With user-friendly booking tools and flexible rental options, Budget makes it easy to find the perfect car at the best price, whether you're planning a short trip or an extended journey.`,
    countries: [
      {
        countrySlug: 'uae',
        countryCode: 'AE',
        countryName: 'United Arab Emirates',
        countryFlag: '🇦🇪',
        airportBranches: [
          { id: 'budget-dxb', name: 'Dubai International Airport', type: 'airport', city: 'Dubai', address: 'Terminal 1, DXB Airport', openingHours: '24/7' },
          { id: 'budget-dwc', name: 'Al Maktoum International Airport', type: 'airport', city: 'Dubai', address: 'DWC Airport', openingHours: '06:00 - 23:00' },
        ],
        cityBranches: [
          { id: 'budget-burdubai', name: 'Bur Dubai Branch', type: 'city', city: 'Dubai', address: 'Al Mankhool Rd, Bur Dubai', openingHours: '08:00 - 21:00' },
          { id: 'budget-deira', name: 'Deira Branch', type: 'city', city: 'Dubai', address: 'Al Rigga Street, Deira', openingHours: '08:00 - 21:00' },
        ],
      },
      {
        countrySlug: 'saudi',
        countryCode: 'SA',
        countryName: 'Saudi Arabia',
        countryFlag: '🇸🇦',
        airportBranches: [
          { id: 'budget-ruh', name: 'King Khalid International Airport', type: 'airport', city: 'Riyadh', address: 'KKIA Terminal', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'budget-riyadh-exit7', name: 'Riyadh Exit 7', type: 'city', city: 'Riyadh', address: 'Exit 7, Ring Road, Riyadh', openingHours: '08:00 - 22:00' },
          { id: 'budget-jeddah-malaz', name: 'Jeddah Al Malaz', type: 'city', city: 'Jeddah', address: 'Al Malaz District, Jeddah', openingHours: '09:00 - 21:00' },
        ],
      },
      {
        countrySlug: 'egypt',
        countryCode: 'EG',
        countryName: 'Egypt',
        countryFlag: '🇪🇬',
        airportBranches: [
          { id: 'budget-cai', name: 'Cairo International Airport', type: 'airport', city: 'Cairo', address: 'Terminal 3, CAI', openingHours: '24/7' },
          { id: 'budget-hrgada', name: 'Hurghada International Airport', type: 'airport', city: 'Hurghada', address: 'HRG Airport', openingHours: '06:00 - 23:00' },
        ],
        cityBranches: [
          { id: 'budget-maadi', name: 'Maadi Branch', type: 'city', city: 'Cairo', address: 'Road 9, Maadi, Cairo', openingHours: '09:00 - 21:00' },
        ],
      },
    ],
  },

  {
    id: 'enterprise',
    name: 'Enterprise',
    displayName: 'Enterprise Car Rental',
    logo: '/img/company_logos/enterprise.webp',
    rating: 9.10,
    reviewCount: 8920,
    ratingLabel: 'Brilliant',
    description: `Enterprise Rent-A-Car is the world's largest car rental brand by revenue, fleet size, and locations. Founded in 1957 in St. Louis, Missouri, Enterprise has grown to operate more than 10,000 locations across 100+ countries worldwide.

Enterprise's commitment to customer satisfaction is evident in its "We'll Pick You Up" service promise, which has been a hallmark of the brand for decades. The company's extensive fleet includes everything from economy cars and SUVs to luxury vehicles and commercial trucks.

With a strong focus on community involvement and environmental sustainability, Enterprise is committed to operating a greener fleet and reducing its carbon footprint. The company's Clean Fleet initiative aims to offer more fuel-efficient and alternative-fuel vehicles.`,
    countries: [
      {
        countrySlug: 'uae',
        countryCode: 'AE',
        countryName: 'United Arab Emirates',
        countryFlag: '🇦🇪',
        airportBranches: [
          { id: 'ent-dxb', name: 'Dubai International Airport', type: 'airport', city: 'Dubai', address: 'Terminal 1 & 3, DXB', openingHours: '24/7' },
          { id: 'ent-auh', name: 'Abu Dhabi International Airport', type: 'airport', city: 'Abu Dhabi', address: 'Terminal A, AUH', openingHours: '24/7' },
          { id: 'ent-shj', name: 'Sharjah International Airport', type: 'airport', city: 'Sharjah', address: 'SHJ Airport', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'ent-difc', name: 'DIFC Branch', type: 'city', city: 'Dubai', address: 'Gate Village, DIFC, Dubai', openingHours: '08:00 - 22:00' },
          { id: 'ent-mall-emirates', name: 'Mall of the Emirates', type: 'city', city: 'Dubai', address: 'Mall of the Emirates, Dubai', openingHours: '10:00 - 22:00' },
          { id: 'ent-yas-island', name: 'Yas Island', type: 'city', city: 'Abu Dhabi', address: 'Yas Island, Abu Dhabi', openingHours: '09:00 - 21:00' },
        ],
      },
      {
        countrySlug: 'saudi',
        countryCode: 'SA',
        countryName: 'Saudi Arabia',
        countryFlag: '🇸🇦',
        airportBranches: [
          { id: 'ent-ruh', name: 'King Khalid International Airport', type: 'airport', city: 'Riyadh', address: 'KKIA Terminal 5', openingHours: '24/7' },
          { id: 'ent-jed', name: 'King Abdulaziz International Airport', type: 'airport', city: 'Jeddah', address: 'KAIA', openingHours: '24/7' },
          { id: 'ent-mcd', name: 'Prince Mohammad bin Abdulaziz Airport', type: 'airport', city: 'Medina', address: 'MED Airport', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'ent-kingdom-tower', name: 'Kingdom Tower Branch', type: 'city', city: 'Riyadh', address: 'Kingdom Centre, Riyadh', openingHours: '09:00 - 22:00' },
          { id: 'ent-jeddah-balad', name: 'Al-Balad Historic Branch', type: 'city', city: 'Jeddah', address: 'Al-Balad District, Jeddah', openingHours: '09:00 - 21:00' },
        ],
      },
      {
        countrySlug: 'bahrain',
        countryCode: 'BH',
        countryName: 'Bahrain',
        countryFlag: '🇧🇭',
        airportBranches: [
          { id: 'ent-bah', name: 'Bahrain International Airport', type: 'airport', city: 'Muharraq', address: 'New Terminal, BAH', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'ent-seef', name: 'Seef District Branch', type: 'city', city: 'Manama', address: 'Seef Mall, Manama', openingHours: '10:00 - 22:00' },
        ],
      },
    ],
  },

  {
    id: 'hertz',
    name: 'Hertz',
    displayName: 'Hertz Car Rental',
    logo: '/img/company_logos/hertz.webp',
    rating: 8.85,
    reviewCount: 7612,
    ratingLabel: 'Excellent',
    description: `Hertz is one of the most recognized names in the car rental industry, with a history spanning over 100 years. Founded in 1918, Hertz has become synonymous with quality and reliability in vehicle rentals across the globe.

Operating in more than 150 countries with approximately 12,000 locations worldwide, Hertz offers one of the most extensive networks in the industry. The Hertz Gold Plus Rewards program provides frequent renters with exclusive benefits, including expedited service and free rental days.

Hertz's premium Ultimate Choice program allows members to choose any vehicle in their designated section, giving customers the freedom to select the exact car that meets their needs. With a commitment to innovation and sustainability, Hertz continues to expand its electric and hybrid vehicle offerings.`,
    countries: [
      {
        countrySlug: 'uae',
        countryCode: 'AE',
        countryName: 'United Arab Emirates',
        countryFlag: '🇦🇪',
        airportBranches: [
          { id: 'hertz-dxb', name: 'Dubai International Airport', type: 'airport', city: 'Dubai', address: 'All Terminals, DXB', openingHours: '24/7' },
          { id: 'hertz-auh', name: 'Abu Dhabi International Airport', type: 'airport', city: 'Abu Dhabi', address: 'AUH Airport', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'hertz-downtown', name: 'Downtown Dubai', type: 'city', city: 'Dubai', address: 'Burj Khalifa District, Dubai', openingHours: '08:00 - 22:00' },
          { id: 'hertz-palm', name: 'Palm Jumeirah', type: 'city', city: 'Dubai', address: 'The Pointe, Palm Jumeirah', openingHours: '09:00 - 22:00' },
          { id: 'hertz-abu-dhabi-raha', name: 'Al Raha Beach', type: 'city', city: 'Abu Dhabi', address: 'Al Raha Beach, Abu Dhabi', openingHours: '08:00 - 21:00' },
        ],
      },
      {
        countrySlug: 'saudi',
        countryCode: 'SA',
        countryName: 'Saudi Arabia',
        countryFlag: '🇸🇦',
        airportBranches: [
          { id: 'hertz-ruh', name: 'King Khalid International Airport', type: 'airport', city: 'Riyadh', address: 'KKIA', openingHours: '24/7' },
          { id: 'hertz-jed', name: 'King Abdulaziz International Airport', type: 'airport', city: 'Jeddah', address: 'KAIA', openingHours: '24/7' },
          { id: 'hertz-dmm', name: 'King Fahd International Airport', type: 'airport', city: 'Dammam', address: 'KFIA', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'hertz-riyadh-alhamra', name: 'Al Hamra District', type: 'city', city: 'Riyadh', address: 'Al Hamra, Riyadh', openingHours: '08:00 - 22:00' },
        ],
      },
      {
        countrySlug: 'kuwait',
        countryCode: 'KW',
        countryName: 'Kuwait',
        countryFlag: '🇰🇼',
        airportBranches: [
          { id: 'hertz-kwi', name: 'Kuwait International Airport', type: 'airport', city: 'Kuwait City', address: 'KWI Airport', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'hertz-360-mall', name: '360 Mall Branch', type: 'city', city: 'Kuwait City', address: '360 Mall, Al Zahraa', openingHours: '10:00 - 22:00' },
          { id: 'hertz-hawally', name: 'Hawally Branch', type: 'city', city: 'Hawally', address: 'Tunis Street, Hawally', openingHours: '08:00 - 21:00' },
        ],
      },
      {
        countrySlug: 'egypt',
        countryCode: 'EG',
        countryName: 'Egypt',
        countryFlag: '🇪🇬',
        airportBranches: [
          { id: 'hertz-cai', name: 'Cairo International Airport', type: 'airport', city: 'Cairo', address: 'Terminal 2, CAI', openingHours: '24/7' },
          { id: 'hertz-lxr', name: 'Luxor International Airport', type: 'airport', city: 'Luxor', address: 'LXR Airport', openingHours: '06:00 - 22:00' },
          { id: 'hertz-asw', name: 'Aswan International Airport', type: 'airport', city: 'Aswan', address: 'ASW Airport', openingHours: '06:00 - 22:00' },
        ],
        cityBranches: [
          { id: 'hertz-zamalek', name: 'Zamalek Branch', type: 'city', city: 'Cairo', address: 'Gezira Street, Zamalek', openingHours: '09:00 - 21:00' },
          { id: 'hertz-new-cairo', name: 'New Cairo Branch', type: 'city', city: 'Cairo', address: '5th Settlement, New Cairo', openingHours: '09:00 - 21:00' },
        ],
      },
    ],
  },

  {
    id: 'sixt',
    name: 'SIXT',
    displayName: 'SIXT Car Rental',
    logo: '/img/company_logos/sixt.webp',
    rating: 9.02,
    reviewCount: 5890,
    ratingLabel: 'Brilliant',
    description: `SIXT is a premium international car rental company headquartered in Germany, with over 100 years of experience in the mobility industry. Founded in 1912, SIXT has grown from a small Munich-based car rental service to a global leader operating in over 110 countries.

Known for its distinctive orange branding and premium vehicle fleet, SIXT offers some of the newest and most prestigious cars available for rental. The company's fleet includes luxury vehicles from brands such as Mercedes-Benz, BMW, Porsche, and Audi, as well as a comprehensive range of economy and midsize options.

SIXT's digital innovation has been a cornerstone of its growth strategy. The SIXT app provides customers with a seamless end-to-end experience, from booking to vehicle return, with features like contactless rental and real-time vehicle tracking.`,
    countries: [
      {
        countrySlug: 'uae',
        countryCode: 'AE',
        countryName: 'United Arab Emirates',
        countryFlag: '🇦🇪',
        airportBranches: [
          { id: 'sixt-dxb', name: 'Dubai International Airport', type: 'airport', city: 'Dubai', address: 'Terminal 3, DXB', openingHours: '24/7' },
          { id: 'sixt-auh', name: 'Abu Dhabi International Airport', type: 'airport', city: 'Abu Dhabi', address: 'AUH Airport', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'sixt-business-bay', name: 'Business Bay', type: 'city', city: 'Dubai', address: 'Bay Square, Business Bay', openingHours: '08:00 - 22:00' },
          { id: 'sixt-marina', name: 'Dubai Marina', type: 'city', city: 'Dubai', address: 'Marina Walk, Dubai Marina', openingHours: '09:00 - 22:00' },
        ],
      },
      {
        countrySlug: 'saudi',
        countryCode: 'SA',
        countryName: 'Saudi Arabia',
        countryFlag: '🇸🇦',
        airportBranches: [
          { id: 'sixt-ruh', name: 'King Khalid International Airport', type: 'airport', city: 'Riyadh', address: 'KKIA', openingHours: '24/7' },
          { id: 'sixt-jed', name: 'King Abdulaziz International Airport', type: 'airport', city: 'Jeddah', address: 'KAIA', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'sixt-riyadh-vip', name: 'Riyadh VIP Lounge', type: 'city', city: 'Riyadh', address: 'King Fahd Road, Riyadh', openingHours: '08:00 - 22:00' },
        ],
      },
    ],
  },

  {
    id: 'europcar',
    name: 'Europcar',
    displayName: 'Europcar Car Rental',
    logo: '/img/company_logos/europcar.webp',
    rating: 8.60,
    reviewCount: 4250,
    ratingLabel: 'Very Good',
    description: `Europcar is Europe's leading car rental company, operating in over 140 countries across the globe. Founded in France in 1949, Europcar has built a strong reputation for providing quality vehicles and reliable service to both leisure and business travelers.

Europcar's diverse fleet includes over 250,000 vehicles, ranging from compact city cars to spacious family SUVs and premium executive vehicles. The company's extensive network of over 3,500 stations ensures that customers can find a Europcar location at virtually every major airport, train station, and city center worldwide.

The Europcar Privilege loyalty program rewards frequent renters with exclusive benefits, including priority service, vehicle upgrades, and free rental days. Europcar's commitment to sustainable mobility is reflected in its growing fleet of electric and hybrid vehicles.`,
    countries: [
      {
        countrySlug: 'uae',
        countryCode: 'AE',
        countryName: 'United Arab Emirates',
        countryFlag: '🇦🇪',
        airportBranches: [
          { id: 'euro-dxb', name: 'Dubai International Airport', type: 'airport', city: 'Dubai', address: 'Terminal 1, DXB', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'euro-tecom', name: 'TECOM Branch', type: 'city', city: 'Dubai', address: 'Dubai Internet City, TECOM', openingHours: '08:00 - 21:00' },
          { id: 'euro-abu-dhabi-central', name: 'Abu Dhabi Central', type: 'city', city: 'Abu Dhabi', address: 'Central District, Abu Dhabi', openingHours: '08:00 - 20:00' },
        ],
      },
      {
        countrySlug: 'jordan',
        countryCode: 'JO',
        countryName: 'Jordan',
        countryFlag: '🇯🇴',
        airportBranches: [
          { id: 'euro-amm', name: 'Queen Alia International Airport', type: 'airport', city: 'Amman', address: 'AMM Airport', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'euro-amman-abdoun', name: 'Abdoun Branch', type: 'city', city: 'Amman', address: 'Abdoun Circle, Amman', openingHours: '08:00 - 21:00' },
        ],
      },
    ],
  },

  {
    id: 'national',
    name: 'National',
    displayName: 'National Car Rental',
    logo: '/img/company_logos/national.webp',
    rating: 9.15,
    reviewCount: 3890,
    ratingLabel: 'Brilliant',
    description: `National Car Rental is the premier car rental brand for business travelers, offering a unique combination of customer choice, speed of service, and convenience. As part of Enterprise Holdings, National benefits from one of the largest and most modern vehicle fleets in the industry.

National's Emerald Club loyalty program is a top choice for frequent business travelers, offering the exclusive Emerald Aisle experience where members can bypass the counter and choose any vehicle in the dedicated Emerald section. This personalized service is a hallmark of the National brand.

With locations at hundreds of airports worldwide and a focus on the needs of corporate travelers, National provides tailored solutions that make business travel more efficient and enjoyable.`,
    countries: [
      {
        countrySlug: 'uae',
        countryCode: 'AE',
        countryName: 'United Arab Emirates',
        countryFlag: '🇦🇪',
        airportBranches: [
          { id: 'nat-dxb', name: 'Dubai International Airport', type: 'airport', city: 'Dubai', address: 'Terminal 1, DXB', openingHours: '24/7' },
          { id: 'nat-auh', name: 'Abu Dhabi International Airport', type: 'airport', city: 'Abu Dhabi', address: 'AUH Airport', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'nat-baniyas', name: 'Baniyas Road', type: 'city', city: 'Dubai', address: 'Baniyas Road, Deira', openingHours: '08:00 - 21:00' },
        ],
      },
      {
        countrySlug: 'saudi',
        countryCode: 'SA',
        countryName: 'Saudi Arabia',
        countryFlag: '🇸🇦',
        airportBranches: [
          { id: 'nat-ruh', name: 'King Khalid International Airport', type: 'airport', city: 'Riyadh', address: 'KKIA', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'nat-riyadh-malaz', name: 'Al Malaz Branch', type: 'city', city: 'Riyadh', address: 'Al Malaz, Riyadh', openingHours: '08:00 - 21:00' },
        ],
      },
    ],
  },

  {
    id: 'dollar',
    name: 'Dollar',
    displayName: 'Dollar Car Rental',
    logo: '/img/company_logos/dollar.webp',
    rating: 8.45,
    reviewCount: 2980,
    ratingLabel: 'Very Good',
    description: `Dollar Car Rental has been providing affordable car rental solutions since 1965, making quality transportation accessible to travelers around the world. As part of the Hertz Global Holdings family, Dollar benefits from a vast network and resources while maintaining its reputation as a value-focused brand.

Dollar's commitment to providing economical rental options does not come at the expense of vehicle quality or customer service. The company offers a wide selection of well-maintained vehicles across multiple categories, ensuring customers find the right car at the right price.

With convenient locations at major airports and city centers, Dollar makes it easy for travelers to access reliable transportation without breaking the bank. The Dollar Express loyalty program rewards repeat customers with faster service and exclusive benefits.`,
    countries: [
      {
        countrySlug: 'uae',
        countryCode: 'AE',
        countryName: 'United Arab Emirates',
        countryFlag: '🇦🇪',
        airportBranches: [
          { id: 'dollar-dxb', name: 'Dubai International Airport', type: 'airport', city: 'Dubai', address: 'Terminal 2, DXB', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'dollar-al-quoz', name: 'Al Quoz Branch', type: 'city', city: 'Dubai', address: 'Al Quoz Industrial Area', openingHours: '08:00 - 20:00' },
          { id: 'dollar-mussafah', name: 'Mussafah Branch', type: 'city', city: 'Abu Dhabi', address: 'Mussafah Industrial, Abu Dhabi', openingHours: '08:00 - 20:00' },
        ],
      },
      {
        countrySlug: 'egypt',
        countryCode: 'EG',
        countryName: 'Egypt',
        countryFlag: '🇪🇬',
        airportBranches: [
          { id: 'dollar-cai', name: 'Cairo International Airport', type: 'airport', city: 'Cairo', address: 'Terminal 1, CAI', openingHours: '24/7' },
          { id: 'dollar-ssh', name: 'Sharm El Sheikh Airport', type: 'airport', city: 'Sharm El Sheikh', address: 'SSH Airport', openingHours: '06:00 - 23:00' },
        ],
        cityBranches: [
          { id: 'dollar-heliopolis', name: 'Heliopolis Branch', type: 'city', city: 'Cairo', address: 'Heliopolis, Cairo', openingHours: '09:00 - 21:00' },
        ],
      },
    ],
  },

  {
    id: 'thrifty',
    name: 'Thrifty',
    displayName: 'Thrifty Car Rental',
    logo: '/img/company_logos/thrifty.webp',
    rating: 8.30,
    reviewCount: 2150,
    ratingLabel: 'Good',
    description: `Thrifty Car Rental has been providing travelers with affordable car rental solutions since 1950. As a member of the Hertz Global Holdings family, Thrifty offers reliable vehicles and quality service at budget-friendly prices.

Thrifty's Blue Chip loyalty program provides frequent renters with expedited service, the ability to bypass the rental counter, and exclusive member discounts. The program is designed to make the rental process as quick and hassle-free as possible.

With a focus on value and convenience, Thrifty continues to be a popular choice for budget-conscious travelers who refuse to compromise on quality. The company's extensive network of locations at airports and off-airport sites makes it easy to rent a car wherever your journey takes you.`,
    countries: [
      {
        countrySlug: 'uae',
        countryCode: 'AE',
        countryName: 'United Arab Emirates',
        countryFlag: '🇦🇪',
        airportBranches: [
          { id: 'thrifty-dxb', name: 'Dubai International Airport', type: 'airport', city: 'Dubai', address: 'Terminal 2, DXB', openingHours: '06:00 - 23:00' },
        ],
        cityBranches: [
          { id: 'thrifty-karama', name: 'Karama Branch', type: 'city', city: 'Dubai', address: 'Al Karama, Dubai', openingHours: '08:00 - 21:00' },
        ],
      },
      {
        countrySlug: 'kuwait',
        countryCode: 'KW',
        countryName: 'Kuwait',
        countryFlag: '🇰🇼',
        airportBranches: [
          { id: 'thrifty-kwi', name: 'Kuwait International Airport', type: 'airport', city: 'Kuwait City', address: 'KWI Airport', openingHours: '24/7' },
        ],
        cityBranches: [
          { id: 'thrifty-jahra', name: 'Al Jahra Branch', type: 'city', city: 'Al Jahra', address: 'Al Jahra Road, Kuwait', openingHours: '08:00 - 20:00' },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────────────────────────────────────────

/** Get a single brand by its slug */
export function getBrandBySlug(slug: string): CarRentalBrand | undefined {
  return carRentalBrands.find((b) => b.id === slug);
}

/** Get a specific country data within a brand */
export function getBrandCountry(brandSlug: string, countrySlug: string): BrandCountry | undefined {
  const brand = getBrandBySlug(brandSlug);
  return brand?.countries.find((c) => c.countrySlug === countrySlug);
}

/** Total branch count for a brand in a country */
export function getTotalBranches(country: BrandCountry): number {
  return country.airportBranches.length + country.cityBranches.length;
}
