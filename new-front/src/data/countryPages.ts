export interface CountryPageData {
  slug: string;
  name: string;
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroLead: string;
  heroBottomTitle: string;
  airports: {
    name: string;
    code: string;
    location: string;
    description: string;
    image: string;
    minPrice: number;
  }[];
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
    image: string;
    items: string[];
  };
  gallery: {
    big: string;
    small1: string;
    small2: string;
    label: string;
  };
  faqs: {
    q: string;
    a: string;
  }[];
}

export const countryPagesData: Record<string, CountryPageData> = {
  uae: {
    slug: 'uae',
    name: 'United Arab Emirates',
    heroBadge: 'Autours UAE Airport Car Rental',
    heroTitle: 'Book Your Airport Rental',
    heroHighlight: 'Across the UAE',
    heroLead: 'Search pickup availability from Dubai, Abu Dhabi, Sharjah, Al Maktoum, Ras Al Khaimah, and Fujairah airports — then choose the right car for your trip before you land.',
    heroBottomTitle: 'Search by UAE airport and land ready to drive.',
    airports: [
      {
        name: 'Dubai International',
        code: 'DXB',
        location: 'United Arab Emirates',
        description: "World's busiest airport for international travel. Pick up your rental right after baggage claim.",
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
        minPrice: 120,
      },
      {
        name: 'Abu Dhabi International',
        code: 'AUH',
        location: 'United Arab Emirates',
        description: 'Gateway to the capital. Premium and economy rentals available 24/7.',
        image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=600&q=80',
        minPrice: 110,
      },
      {
        name: 'Sharjah International',
        code: 'SHJ',
        location: 'United Arab Emirates',
        description: 'Budget-friendly options with quick access to Dubai and the northern emirates.',
        image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=600&q=80',
        minPrice: 90,
      },
      {
        name: "Al Maktoum Int'l",
        code: 'DWC',
        location: 'United Arab Emirates',
        description: "Dubai's second airport, ideal for Expo City and Dubai South business travelers.",
        image: 'https://images.unsplash.com/photo-1542296332-2e44a0f94e9a?auto=format&fit=crop&w=600&q=80',
        minPrice: 100,
      },
      {
        name: 'Ras Al Khaimah',
        code: 'RKT',
        location: 'United Arab Emirates',
        description: 'Explore the northern emirates, mountains, and beaches with a convenient pickup.',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=600&q=80',
        minPrice: 95,
      },
      {
        name: 'Fujairah International',
        code: 'FJR',
        location: 'United Arab Emirates',
        description: 'East coast gateway. Perfect for beach getaways and mountain drives.',
        image: 'https://images.unsplash.com/photo-1520340356584-462675fb9fbf?auto=format&fit=crop&w=600&q=80',
        minPrice: 85,
      }
    ],
    travelInfo: {
      title: "The UAE's Trusted Car Rental Partner",
      subtitle: "We partner with top international and local brands to bring you the best rates, newest vehicles, and seamless pickup experience across all major UAE airports.",
      image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80",
      benefits: [
        {
          title: "Airport Pickup",
          description: "Collect your car minutes after landing at any major UAE airport terminal."
        },
        {
          title: "No Hidden Fees",
          description: "What you see is what you pay. Transparent pricing with full insurance included."
        },
        {
          title: "24/7 Support",
          description: "Roadside assistance and customer service available around the clock."
        },
        {
          title: "Free Cancellation",
          description: "Plans change. Cancel up to 24 hours before pickup with no charge."
        }
      ]
    },
    steps: [
      {
        title: "Search",
        description: "Enter your airport, dates, and times to see available cars."
      },
      {
        title: "Compare",
        description: "Filter by price, car type, transmission, and supplier ratings."
      },
      {
        title: "Book & Drive",
        description: "Reserve online, pick up at the airport, and hit the road."
      }
    ],
    documents: {
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
      items: [
        "Valid driving license (UAE or International)",
        "Passport or Emirates ID",
        "Credit card for security deposit",
        "Booking confirmation (digital or printed)"
      ]
    },
    gallery: {
      big: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
      small1: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=600&q=80",
      small2: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
      label: "SUVs & 4x4s"
    },
    faqs: [
      {
        q: 'What are the main rent a car rules in UAE?',
        a: 'To rent a car in the UAE, you typically need a valid driving license, passport or Emirates ID, and to meet the minimum age requirement, usually 21+. Rules may vary depending on the supplier, but all conditions are clearly shown before booking on Autours.'
      },
      {
        q: 'Can I rent a car in Dubai with an Indian license?',
        a: 'Yes — in some cases. Tourists can rent a car in Dubai with an Indian driving license if it meets UAE regulations, or they may need an International Driving Permit (IDP). You can always check the exact requirements for each car directly on Autours before booking.'
      },
      {
        q: 'What is the rent a car license cost in Dubai?',
        a: 'If you\'re a tourist, you don’t need to pay for a UAE license. However, if required, an International Driving Permit may cost between $20–$50 depending on your country. Residents need a UAE driving license, which has its own cost depending on the emirate.'
      },
      {
        q: 'How does car rental in UAE work?',
        a: 'Car rental in UAE is simple with Autours: enter your location, compare cars from multiple suppliers, choose the best deal, and book instantly online — without visiting multiple websites.'
      },
      {
        q: 'Can I rent a car near me in UAE?',
        a: 'Yes. With Autours, you can easily find rent a car near me options across all major UAE cities and airports.'
      },
      {
        q: 'Is it possible to find cheap rent a car in Dubai?',
        a: 'Absolutely. Autours helps you compare hundreds of offers, so you can find the cheapest car rental in Dubai based on your budget.'
      },
      {
        q: 'Can I rent a car at Dubai Airport?',
        a: 'Yes — many suppliers offer rent a car Dubai Airport services. You can book in advance through Autours and pick up your car immediately after landing.'
      },
      {
        q: 'What documents are required for car rental in Dubai?',
        a: 'You’ll usually need a driving license, passport or ID, and a credit card in most cases. All requirements are clearly shown before booking.'
      },
      {
        q: 'Can I rent a car without a credit card?',
        a: 'Some suppliers allow alternative payment methods, but most require a credit card for the security deposit. You can filter available options on Autours.'
      },
      {
        q: 'What types of cars are available in UAE?',
        a: 'You can find economy cars, SUVs, luxury cars, and business class vehicles. Autours offers options for every budget and lifestyle.'
      },
      {
        q: 'Can I add an additional driver?',
        a: 'Yes. Most suppliers allow adding an additional driver for an extra fee, and the details are shown during booking.'
      },
      {
        q: 'How do I know my booking is confirmed?',
        a: 'Once you complete your booking, you’ll receive instant confirmation, a booking reference, and supplier details.'
      },
      {
        q: 'What fuel policies are available?',
        a: 'Common fuel policies include Full-to-Full, which is the most popular, and prepaid fuel. All options are displayed clearly before booking.'
      },
      {
        q: 'How long can I rent a car for?',
        a: 'You can rent a car daily, weekly, or monthly, with flexible options depending on your needs.'
      },
      {
        q: 'What is included in my car rental booking?',
        a: 'Most bookings include basic insurance, mileage options, and taxes in most cases. You can see the full details before confirming your booking.'
      }
    ]
  },
  egypt: {
    slug: 'egypt',
    name: 'Egypt',
    heroBadge: 'Autours Egypt Airport Car Rental',
    heroTitle: 'Book Your Airport Rental',
    heroHighlight: 'Across Egypt',
    heroLead: 'Search pickup availability from Cairo, Alexandria, Sharm El Sheikh, Hurghada, and Luxor airports — then choose the right car for your trip before you land.',
    heroBottomTitle: 'Search by Egypt airport and land ready to drive.',
    airports: [
      {
        name: 'Cairo International',
        code: 'CAI',
        location: 'Egypt',
        description: 'The main gateway to Egypt. Pick up your rental right after baggage claim.',
        image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=600&q=80',
        minPrice: 900,
      }
    ],
    travelInfo: {
      title: "Egypt's Trusted Car Rental Partner",
      subtitle: "We partner with top international and local brands to bring you the best rates across all major Egyptian airports.",
      image: "https://images.unsplash.com/photo-1539664030485-a936c7d29c6e?auto=format&fit=crop&w=800&q=80",
      benefits: [
        { title: "Airport Pickup", description: "Collect your car minutes after landing." },
        { title: "No Hidden Fees", description: "Transparent pricing with basic insurance included." }
      ]
    },
    steps: [
      { title: "Search", description: "Enter your airport, dates, and times." },
      { title: "Compare", description: "Filter by price and car type." },
      { title: "Book & Drive", description: "Reserve online and hit the road." }
    ],
    documents: {
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
      items: [
        "Valid driving license (International permit required)",
        "Passport with valid entry visa",
        "Credit card in driver's name"
      ]
    },
    gallery: {
      big: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
      small1: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=600&q=80",
      small2: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
      label: "Comfort & Economy"
    },
    faqs: [
      {
        q: 'Do I need an International Driving Permit in Egypt?',
        a: 'Yes, if your driving license is not issued in Egypt, an International Driving Permit (IDP) is required by law.'
      }
    ]
  },
  'saudi': {
    slug: 'saudi',
    name: 'Saudi Arabia',
    heroBadge: 'Autours Saudi Arabia Car Rental',
    heroTitle: 'Book Your Airport Rental',
    heroHighlight: 'Across Saudi Arabia',
    heroLead: 'Search pickup availability from Riyadh, Jeddah, Dammam, and Medina airports — then choose the right car for your trip before you land.',
    heroBottomTitle: 'Search by Saudi airport and land ready to drive.',
    airports: [
      {
        name: 'King Khalid International',
        code: 'RUH',
        location: 'Saudi Arabia',
        description: 'The main gateway to Riyadh. Excellent fleets available 24/7.',
        image: 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?auto=format&fit=crop&w=600&q=80',
        minPrice: 150,
      }
    ],
    travelInfo: {
      title: "Saudi Arabia's Trusted Partner",
      subtitle: "Partnering with top brands to bring you seamless airport pickups.",
      image: "https://images.unsplash.com/photo-1551041777-ed277b8dd348?auto=format&fit=crop&w=800&q=80",
      benefits: [
        { title: "Airport Pickup", description: "Quick collection directly from the terminal." },
        { title: "Wide Selection", description: "From economy cars to luxury SUVs." }
      ]
    },
    steps: [
      { title: "Search", description: "Enter your airport, dates, and times." },
      { title: "Compare", description: "Filter by price and car type." },
      { title: "Book & Drive", description: "Reserve online and hit the road." }
    ],
    documents: {
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
      items: [
        "Valid driving license",
        "Passport and Visa / Iqama",
        "Credit card"
      ]
    },
    gallery: {
      big: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
      small1: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=600&q=80",
      small2: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
      label: "Family SUVs"
    },
    faqs: [
      {
        q: 'Can women rent and drive cars in Saudi Arabia?',
        a: 'Yes, women can rent and drive cars in Saudi Arabia provided they meet the minimum age and hold a valid driving license.'
      }
    ]
  },
  'bahrain': {
    slug: 'bahrain',
    name: 'Bahrain',
    heroBadge: 'Autours Bahrain Airport Car Rental',
    heroTitle: 'Book Your Airport Rental',
    heroHighlight: 'Across Bahrain',
    heroLead: 'Search pickup availability from Bahrain International Airport — then choose the right car for your trip before you land.',
    heroBottomTitle: 'Search by Bahrain airport and land ready to drive.',
    airports: [
      {
        name: 'Bahrain International',
        code: 'BAH',
        location: 'Bahrain',
        description: 'Bahrain\'s premier gateway. Find top-tier rentals 24/7.',
        image: 'https://images.unsplash.com/photo-1544085311-11a028465b03?auto=format&fit=crop&w=600&q=80',
        minPrice: 120,
      }
    ],
    travelInfo: {
      title: "Bahrain's Trusted Car Rental Partner",
      subtitle: "We partner with top international and local brands to bring you the best rates across Bahrain.",
      image: "https://images.unsplash.com/photo-1544085311-11a028465b03?auto=format&fit=crop&w=800&q=80",
      benefits: [
        { title: "Airport Pickup", description: "Collect your car right after landing." },
        { title: "No Hidden Fees", description: "Transparent pricing with basic insurance included." }
      ]
    },
    steps: [
      { title: "Search", description: "Enter your airport, dates, and times." },
      { title: "Compare", description: "Filter by price and car type." },
      { title: "Book & Drive", description: "Reserve online and hit the road." }
    ],
    documents: {
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
      items: [
        "Valid driving license (International permit required)",
        "Passport with valid entry visa",
        "Credit card in driver's name"
      ]
    },
    gallery: {
      big: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
      small1: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=600&q=80",
      small2: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
      label: "Comfort & Economy"
    },
    faqs: [
      {
        q: 'Do I need an International Driving Permit in Bahrain?',
        a: 'Tourists generally need an International Driving Permit (IDP) along with their national driving license to rent a car in Bahrain.'
      }
    ]
  },
  'jordan': {
    slug: 'jordan',
    name: 'Jordan',
    heroBadge: 'Autours Jordan Airport Car Rental',
    heroTitle: 'Book Your Airport Rental',
    heroHighlight: 'Across Jordan',
    heroLead: 'Search pickup availability from Queen Alia International Airport — then choose the right car for your trip before you land.',
    heroBottomTitle: 'Search by Jordan airport and land ready to drive.',
    airports: [
      {
        name: 'Queen Alia International',
        code: 'AMM',
        location: 'Jordan',
        description: 'Located in Amman. Premium and budget car rentals available 24/7.',
        image: 'https://images.unsplash.com/photo-1549180030-48bbe079fb36?auto=format&fit=crop&w=600&q=80',
        minPrice: 130,
      }
    ],
    travelInfo: {
      title: "Jordan's Trusted Car Rental Partner",
      subtitle: "We partner with top brands to bring you the best rates across all major Jordanian hubs.",
      image: "https://images.unsplash.com/photo-1549180030-48bbe079fb36?auto=format&fit=crop&w=800&q=80",
      benefits: [
        { title: "Airport Pickup", description: "Collect your car right after landing." },
        { title: "No Hidden Fees", description: "Transparent pricing with basic insurance included." }
      ]
    },
    steps: [
      { title: "Search", description: "Enter your airport, dates, and times." },
      { title: "Compare", description: "Filter by price and car type." },
      { title: "Book & Drive", description: "Reserve online and hit the road." }
    ],
    documents: {
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
      items: [
        "Valid driving license (International permit required)",
        "Passport with valid entry visa",
        "Credit card in driver's name"
      ]
    },
    gallery: {
      big: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
      small1: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=600&q=80",
      small2: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
      label: "Comfort & Economy"
    },
    faqs: [
      {
        q: 'Can I drive a rental car to Petra?',
        a: 'Yes! Driving is one of the best ways to explore Jordan, including Petra and the Dead Sea. All cars are equipped for long distance journeys.'
      }
    ]
  },
  'kuwait': {
    slug: 'kuwait',
    name: 'Kuwait',
    heroBadge: 'Autours Kuwait Airport Car Rental',
    heroTitle: 'Book Your Airport Rental',
    heroHighlight: 'Across Kuwait',
    heroLead: 'Search pickup availability from Kuwait International Airport — then choose the right car for your trip.',
    heroBottomTitle: 'Search by Kuwait airport and land ready to drive.',
    airports: [
      {
        name: 'Kuwait International',
        code: 'KWI',
        location: 'Kuwait',
        description: 'Kuwait\'s primary airport. Grab premium sedan and SUV deals.',
        image: 'https://images.unsplash.com/photo-1541417901255-6d30f1c53958?auto=format&fit=crop&w=600&q=80',
        minPrice: 140,
      }
    ],
    travelInfo: {
      title: "Kuwait's Trusted Car Rental Partner",
      subtitle: "We partner with top brands to bring you the best rates across all major Kuwaiti hubs.",
      image: "https://images.unsplash.com/photo-1541417901255-6d30f1c53958?auto=format&fit=crop&w=800&q=80",
      benefits: [
        { title: "Airport Pickup", description: "Collect your car right after landing." },
        { title: "No Hidden Fees", description: "Transparent pricing with basic insurance included." }
      ]
    },
    steps: [
      { title: "Search", description: "Enter your airport, dates, and times." },
      { title: "Compare", description: "Filter by price and car type." },
      { title: "Book & Drive", description: "Reserve online and hit the road." }
    ],
    documents: {
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
      items: [
        "Valid driving license",
        "Passport with valid entry visa",
        "Credit card in driver's name"
      ]
    },
    gallery: {
      big: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
      small1: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=600&q=80",
      small2: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
      label: "Comfort & Economy"
    },
    faqs: [
      {
        q: 'What is the minimum age to rent a car in Kuwait?',
        a: 'The standard minimum age is 21, though luxury categories may require the driver to be 25 years or older.'
      }
    ]
  },
  'oman': {
    slug: 'oman',
    name: 'Oman',
    heroBadge: 'Autours Oman Airport Car Rental',
    heroTitle: 'Book Your Airport Rental',
    heroHighlight: 'Across Oman',
    heroLead: 'Search pickup availability from Muscat and Salalah airports — then choose the right car.',
    heroBottomTitle: 'Search by Oman airport and land ready to drive.',
    airports: [
      {
        name: 'Muscat International',
        code: 'MCT',
        location: 'Oman',
        description: 'Muscat\'s main hub. Perfect for exploring Omani wadis and beaches.',
        image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80',
        minPrice: 110,
      }
    ],
    travelInfo: {
      title: "Oman's Trusted Car Rental Partner",
      subtitle: "We partner with top brands to bring you the best rates across all major Omani hubs.",
      image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80",
      benefits: [
        { title: "Airport Pickup", description: "Collect your car right after landing." },
        { title: "No Hidden Fees", description: "Transparent pricing with basic insurance included." }
      ]
    },
    steps: [
      { title: "Search", description: "Enter your airport, dates, and times." },
      { title: "Compare", description: "Filter by price and car type." },
      { title: "Book & Drive", description: "Reserve online and hit the road." }
    ],
    documents: {
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
      items: [
        "Valid driving license",
        "Passport with valid entry visa",
        "Credit card in driver's name"
      ]
    },
    gallery: {
      big: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
      small1: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=600&q=80",
      small2: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
      label: "Comfort & Economy"
    },
    faqs: [
      {
        q: 'Do I need a 4x4 to explore Oman?',
        a: 'While standard sedans are fine for cities, a 4x4 is highly recommended if you plan to explore wadis, deserts, or mountain areas.'
      }
    ]
  },
  'qatar': {
    slug: 'qatar',
    name: 'Qatar',
    heroBadge: 'Autours Qatar Airport Car Rental',
    heroTitle: 'Book Your Airport Rental',
    heroHighlight: 'Across Qatar',
    heroLead: 'Search pickup availability from Hamad International Airport — then choose the right car.',
    heroBottomTitle: 'Search by Qatar airport and land ready to drive.',
    airports: [
      {
        name: 'Hamad International',
        code: 'DOH',
        location: 'Qatar',
        description: 'Award-winning airport in Doha. Access premium car rentals right after landing.',
        image: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=600&q=80',
        minPrice: 125,
      }
    ],
    travelInfo: {
      title: "Qatar's Trusted Car Rental Partner",
      subtitle: "We partner with top brands to bring you the best rates across all major Qatari hubs.",
      image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80",
      benefits: [
        { title: "Airport Pickup", description: "Collect your car right after landing." },
        { title: "No Hidden Fees", description: "Transparent pricing with basic insurance included." }
      ]
    },
    steps: [
      { title: "Search", description: "Enter your airport, dates, and times." },
      { title: "Compare", description: "Filter by price and car type." },
      { title: "Book & Drive", description: "Reserve online and hit the road." }
    ],
    documents: {
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
      items: [
        "Valid driving license",
        "Passport with valid entry visa",
        "Credit card in driver's name"
      ]
    },
    gallery: {
      big: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
      small1: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=600&q=80",
      small2: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
      label: "Comfort & Economy"
    },
    faqs: [
      {
        q: 'Is insurance included in Qatar car rentals?',
        a: 'Basic third-party liability insurance is always included in the price. CDW upgrades are available at checkout.'
      }
    ]
  }
};
