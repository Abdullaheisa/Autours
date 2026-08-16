import { assets } from '@/config/assets';

export interface CityPageData {
  slug: string;
  name: string;
  country: string;
  countrySlug: string;
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroLead: string;
  heroBottomTitle: string;
  travelInfo: {
    title: string;
    subtitle: string;
    benefits: {
      title: string;
      description: string;
    }[];
    image: string;
  };
  steps: {
    title: string;
    description: string;
  }[];
  documents: {
    items: string[];
  };
  faqs: {
    q: string;
    a: string;
  }[];
  highlights?: {
    title?: string;
    subtitle?: string;
    places: {
      name: string;
      description: string;
      image?: string;
      tags?: string[];
      attractions?: {
        name: string;
        description: string;
        image: string;
      }[];
    }[];
  };
  partnersDescription?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  ctaPrimaryText?: string;
  ctaSecondaryText?: string;
}

export const cityPagesData: Record<string, CityPageData> = {
  "dubai": {
    "slug": "dubai",
    "name": "Dubai",
    "country": "United Arab Emirates",
    "countrySlug": "uae",
    "heroBadge": "Autours Dubai Airport Car Rental",
    "heroTitle": "Book Your Airport Rental",
    "heroHighlight": "in Dubai",
    "heroLead": "Search pickup availability from Dubai International Airport (DXB) and Al Maktoum International Airport (DWC) — then choose the right car for your trip before you land.",
    "heroBottomTitle": "Search by Dubai airport and land ready to drive.",
    "travelInfo": {
      "title": "Why Choose Autours?",
      "subtitle": "The Smart Way to Rent a Car in Dubai. Book with trusted car rental companies and compare competitive Dubai car rental deals in one place. Whether you're arriving at Dubai International Airport or Al Maktoum International Airport, Autours makes it easy to find the right car for your trip.",
      "image": "countries/uae.png",
      "benefits": [
        {
          "title": "Airport Pickup in Dubai",
          "description": "Collect your rental car at Dubai International Airport (DXB) or Al Maktoum International Airport (DWC) and start your journey without unnecessary delays."
        },
        {
          "title": "Best Car Rental Rates in Dubai",
          "description": "Compare prices from leading international and local rental companies to find competitive rates for economy cars, SUVs, family vehicles, and luxury cars."
        },
        {
          "title": "Transparent Pricing",
          "description": "No hidden charges or unexpected fees. Review your rental details and total price before completing your booking."
        },
        {
          "title": "24/7 Customer Support",
          "description": "Our team is available around the clock to help with bookings, amendments, cancellations, or rental-related questions in Dubai."
        },
        {
          "title": "Free Cancellation",
          "description": "Enjoy flexible travel with free cancellation up to 24 hours before pickup on eligible bookings."
        }
      ]
    },
    "steps": [
      {
        "title": "Search",
        "description": "Enter your Dubai airport, dates, and pickup times to see available rental cars."
      },
      {
        "title": "Compare",
        "description": "Compare cars by price, vehicle type, transmission, and supplier."
      },
      {
        "title": "Book & Drive",
        "description": "Reserve your car online, pick it up at the airport, and hit the road."
      }
    ],
    "documents": {
      "items": [
        "Valid driving license (UAE or International)",
        "Passport or Emirates ID",
        "Credit card for security deposit",
        "Booking confirmation (digital or printed)"
      ]
    },
    "highlights": {
      "title": "Top Destinations in Dubai",
      "subtitle": "Explore Dubai's most iconic attractions and neighborhoods with the freedom of your own rental car — from Downtown Dubai and Palm Jumeirah to Dubai Marina, Jumeirah, and the desert.",
      "places": [
        {
          "name": "Downtown Dubai",
          "description": "Visit Burj Khalifa, Dubai Mall, and the vibrant heart of modern Dubai.",
          "tags": ["City Center", "Shopping", "Iconic"],
          "image": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80"
        },
        {
          "name": "Dubai Marina",
          "description": "Explore the waterfront, luxury yachts, fine dining, and pristine beaches.",
          "tags": ["Waterfront", "Dining", "Beach"],
          "image": "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80"
        },
        {
          "name": "Palm Jumeirah",
          "description": "Drive across Dubai's iconic palm-shaped island and discover luxury resorts.",
          "tags": ["Luxury", "Island", "Resorts"],
          "image": "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80"
        },
        {
          "name": "Jumeirah",
          "description": "Enjoy world-class beaches, coastal dining, and iconic landmarks like Burj Al Arab.",
          "tags": ["Beachside", "Restaurants", "Landmarks"],
          "image": "https://images.unsplash.com/photo-1526495124232-a04e1849168c?auto=format&fit=crop&w=800&q=80"
        },
        {
          "name": "Dubai Desert",
          "description": "Drive into the dunes for desert safaris, sunset views, and Arabian heritage.",
          "tags": ["Desert", "Adventure", "Nature"],
          "image": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=800&q=80"
        }
      ]
    },
    "faqs": [
      {
        "q": "What are the main car rental rules in Dubai?",
        "a": "To rent a car in Dubai, you generally need a valid driving license, passport or Emirates ID, and a payment card for the security deposit. Requirements can vary depending on the rental supplier."
      },
      {
        "q": "Can I rent a car in Dubai with an Indian license?",
        "a": "Visitors from certain countries may be able to drive in Dubai using their national driving license, while others may need an International Driving Permit. Always check the requirements applicable to your nationality and rental supplier before booking."
      },
      {
        "q": "What is the rent a car license cost in Dubai?",
        "a": "The cost of obtaining or using a driving permit depends on your nationality, residency status, and the type of license or permit required. Rental companies may also have their own documentation requirements."
      },
      {
        "q": "How does car rental in Dubai work?",
        "a": "Choose your pickup location and dates, compare available cars and suppliers, select your preferred vehicle, complete your booking, and collect the car at the agreed pickup location."
      },
      {
        "q": "Can I rent a car near me in Dubai?",
        "a": "Yes. Autours allows you to compare available rental cars at convenient pickup locations in Dubai, including Dubai International Airport and Al Maktoum International Airport."
      },
      {
        "q": "Is it possible to find cheap car rental in Dubai?",
        "a": "Yes. Dubai has a wide range of rental vehicles and suppliers, so comparing prices can help you find lower daily rates. Economy and compact vehicles are usually among the most affordable options."
      },
      {
        "q": "Can I rent a car at Dubai Airport?",
        "a": "Yes. You can compare rental cars available at Dubai International Airport (DXB) and Al Maktoum International Airport (DWC)."
      },
      {
        "q": "What documents are required for car rental in Dubai?",
        "a": "You will generally need a valid driving license, passport or Emirates ID, booking confirmation, and a credit card for the security deposit. Additional documents may apply depending on the supplier."
      },
      {
        "q": "Can I rent a car without a credit card in Dubai?",
        "a": "Some rental suppliers may offer alternative payment or deposit options, but this depends on the supplier and vehicle. Check the specific rental conditions before booking."
      },
      {
        "q": "What types of cars are available in Dubai?",
        "a": "You can find economy cars, compact cars, sedans, SUVs, minivans, and luxury vehicles depending on availability and supplier."
      },
      {
        "q": "Can I add an additional driver?",
        "a": "Additional drivers may be permitted depending on the rental company's policy. The additional driver usually needs to meet the same licensing and age requirements."
      },
      {
        "q": "How do I know my Dubai car rental booking is confirmed?",
        "a": "After completing your booking, you should receive a booking confirmation containing your rental details, pickup information, and reservation reference."
      },
      {
        "q": "What fuel policies are available?",
        "a": "Fuel policies vary by supplier. Common options include full-to-full and other supplier-specific fuel policies. Always check the rental conditions before pickup."
      },
      {
        "q": "How long can I rent a car in Dubai?",
        "a": "Rental periods can range from one day to several weeks or months, depending on the supplier and vehicle availability."
      },
      {
        "q": "What is included in my Dubai car rental booking?",
        "a": "The inclusions depend on the selected vehicle and supplier. Your booking details will show the included services, rental conditions, mileage policy, insurance information, and any additional fees before confirmation."
      }
    ],
    "partnersDescription": "Compare competitive rental rates from trusted car rental companies operating in Dubai. All suppliers are verified and available for instant booking.",
    "ctaTitle": "Book Your Dubai Airport Car Rental in Minutes",
    "ctaDescription": "Unlock competitive deals from trusted suppliers at Dubai's major airports. Compare prices, choose the right vehicle, enjoy transparent pricing and flexible cancellation options, and receive your booking confirmation online.",
    "ctaPrimaryText": "Compare Prices",
    "ctaSecondaryText": "Get Expert Help"
  }
};

export const getCitiesByCountrySlug = (countrySlug: string): CityPageData[] => {
  const normSlug = countrySlug.toLowerCase().replace(/_/g, '-');
  return Object.values(cityPagesData).filter(
    (c) => c.countrySlug.toLowerCase().replace(/_/g, '-') === normSlug
  );
};

export const getAllCityPages = (): CityPageData[] => Object.values(cityPagesData);

