export interface CountryPageData {
  slug: string;
  name: string;
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroLead: string;
  heroBottomTitle: string;
  airports?: {
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
  gallery?: {
    big: string;
    small1: string;
    small2: string;
    label: string;
  };
  faqs: {
    q: string;
    a: string;
  }[];
  partnersDescription?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  ctaPrimaryText?: string;
  ctaSecondaryText?: string;
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
    travelInfo: {
      title: "Why Choose Autours?",
      subtitle: "The Smart Way to Rent a Car Across the UAE",
      image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80",
      benefits: [
        {
          title: "Airport Pickup Across the UAE",
          description: "Collect your car at Dubai International Airport (DXB), Abu Dhabi International Airport (AUH), Sharjah Airport (SHJ), and other major airport locations."
        },
        {
          title: "Best Rates in Dubai, Abu Dhabi & Beyond",
          description: "Compare prices from leading international and local rental companies to secure the best value for your trip."
        },
        {
          title: "Transparent Pricing",
          description: "No hidden charges or unexpected fees. See the total price before you book."
        },
        {
          title: "24/7 Customer Support",
          description: "Our team is available around the clock to help with bookings, changes, or roadside assistance anywhere in the UAE."
        },
        {
          title: "Free Cancellation",
          description: "Enjoy flexible travel with free cancellation up to 24 hours before pickup."
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
    ],
    partnersDescription: "Autours partners with leading car rental providers across the UAE, including Auto Rent, KTC, Drivus, Highway, Routes, Surprice, and Street Rent a Car. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, and Fujairah.",
    ctaTitle: "Book Your UAE Airport Car Rental in Minutes",
    ctaDescription: "Unlock exclusive deals from 50+ trusted suppliers at all major UAE airports. Enjoy transparent pricing, free cancellation, and instant booking confirmation.",
    ctaPrimaryText: "Compare Prices",
    ctaSecondaryText: "Get Expert Help"
  },
  egypt: {
    slug: 'egypt',
    name: 'Egypt',
    heroBadge: 'Autours Egypt Airport Car Rental',
    heroTitle: 'Book Your Airport Rental',
    heroHighlight: 'Across Egypt',
    heroLead: 'Search pickup availability from Cairo, Alexandria, Sharm El Sheikh, Hurghada, and Luxor airports — then choose the right car for your trip before you land.',
    heroBottomTitle: 'Search by Egypt airport and land ready to drive.',
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
    travelInfo: {
      title: "Why Autours",
      subtitle: "Saudi Arabia's Trusted Car Rental & Travel Partner. Partnering with top-rated brands to deliver seamless, fast, and reliable airport pickup experiences right at the terminal.",
      image: "https://images.unsplash.com/photo-1551041777-ed277b8dd348?auto=format&fit=crop&w=800&q=80",
      benefits: [
        { 
          title: "Airport Pickup", 
          description: "Instant collection directly from the terminal with zero waiting time." 
        },
        { 
          title: "Wide Selection", 
          description: "From budget-friendly economy cars to premium luxury SUVs for every journey." 
        },
        {
          title: "Extra Benefits",
          description: "No hidden fees — transparent pricing you can trust, with 24/7 customer support whenever you need assistance."
        }
      ]
    },
    steps: [
      { 
        title: "Search Instantly", 
        description: "Enter your airport, pickup date, and drop-off time in seconds." 
      },
      { 
        title: "Compare Smartly", 
        description: "Browse top deals and filter by price, car type, and travel needs." 
      },
      { 
        title: "Book & Drive", 
        description: "Confirm your booking online and pick up your car right at the terminal." 
      }
    ],
    documents: {
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
      items: [
        "Valid driving license",
        "Passport and Visa or Iqama",
        "Credit card for deposit or payment"
      ]
    },
    faqs: [
      {
        q: "What do I need to rent a car?",
        a: "Just a valid driving license, passport/Iqama, and a credit card."
      },
      {
        q: "Can I pick up my car at the airport?",
        a: "Yes — instant airport pickup directly at the terminal, no waiting."
      },
      {
        q: "Are there hidden fees?",
        a: "No hidden fees. Transparent pricing from booking to drop-off."
      },
      {
        q: "Is support available if I need help?",
        a: "Yes — 24/7 customer support anytime during your trip."
      },
      {
        q: "What cars can I book?",
        a: "Economy, family cars, SUVs, and luxury vehicles available instantly."
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
    heroLead: 'Search pickup availability from Kuwait International Airport — then choose the right car.',
    heroBottomTitle: 'Search by Kuwait airport and land ready to drive.',
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
    heroLead: 'Compare the best car rental deals from trusted local and international suppliers across Doha, Hamad International Airport (DOH), Lusail, Al Wakrah, and major destinations throughout Qatar. Enjoy transparent pricing, fast booking, and reliable service every time.',
    heroBottomTitle: 'Search by Qatar airport and land ready to drive.',
    travelInfo: {
      title: "Why Choose Autours?",
      subtitle: "Qatar's Trusted Car Rental Partner",
      image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80",
      benefits: [
        {
          title: "Airport Pickup",
          description: "Pick up your rental car within minutes of landing at Hamad International Airport (DOH) and start your journey without delays."
        },
        {
          title: "Best Price Guarantee",
          description: "Compare offers from trusted car rental companies to secure the best value for your trip across Qatar."
        },
        {
          title: "No Hidden Fees",
          description: "Transparent pricing with no unexpected charges and basic insurance included."
        },
        {
          title: "24/7 Customer Support",
          description: "Our dedicated support team is available around the clock to assist you before, during, and after your rental."
        }
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
    faqs: [
      {
        q: "Can tourists rent a car in Qatar?",
        a: "Yes. Most visitors can rent a car in Qatar using a valid driving license. Depending on your nationality, you may also need an International Driving Permit (IDP). Always check the supplier's requirements before booking."
      },
      {
        q: "What documents do I need to rent a car in Qatar?",
        a: "You'll typically need a valid passport, driving license, credit card in the main driver's name, and, where required, an International Driving Permit."
      },
      {
        q: "Can I rent a car at Hamad International Airport (DOH)?",
        a: "Yes. Many leading car rental companies operate at Hamad International Airport (DOH), allowing you to collect your vehicle shortly after arrival."
      },
      {
        q: "How much does it cost to rent a car in Qatar?",
        a: "Prices vary depending on the season, vehicle type, rental duration, and supplier. Economy cars are usually the most affordable, while SUVs and luxury vehicles cost more."
      },
      {
        q: "Is insurance included with my rental?",
        a: "Most rentals include basic insurance. Additional coverage options, such as Collision Damage Waiver (CDW) or full protection, can usually be added during the booking process."
      },
      {
        q: "Are there any hidden fees?",
        a: "No. Autours displays transparent pricing so you can review the total cost before confirming your booking. Optional extras and supplier-specific policies are shown during checkout."
      },
      {
        q: "Can I cancel my booking for free?",
        a: "Yes. Many suppliers offer free cancellation up to 24 hours before pickup. Check the cancellation policy shown for your selected vehicle before completing your reservation."
      },
      {
        q: "Can I drive from Qatar to another country with a rental car?",
        a: "Cross-border travel is generally not permitted unless explicitly approved by the rental company. Always check the supplier's terms before making travel plans."
      },
      {
        q: "What is the minimum age to rent a car in Qatar?",
        a: "Most rental companies require drivers to be at least 21 years old, while some vehicle categories may require drivers to be 25 or older."
      },
      {
        q: "Which cities can I rent a car in Qatar?",
        a: "You can book rental cars in Doha, at Hamad International Airport (DOH), and other major locations across Qatar, depending on supplier availability."
      }
    ],
    partnersDescription: "Autours partners with leading car rental providers across Qatar. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Doha, Lusail, Al Wakrah, and Hamad International Airport (DOH).",
    ctaTitle: "Find Your Perfect Car Rental in Qatar",
    ctaDescription: "Whether you're arriving at Hamad International Airport or exploring Doha, Lusail, or Al Wakrah, compare prices from trusted suppliers and book with confidence. Free cancellation, transparent pricing, and instant confirmation included.",
    ctaPrimaryText: "Find the Best Deal",
    ctaSecondaryText: "Get Support"
  }
};
