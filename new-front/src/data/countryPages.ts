import { assets } from '@/config/assets';
export interface CountryPageData {
  slug: string;
  name: string;
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
      subtitle: "The Smart Way to Rent a Car Across the UAE. Book with trusted car rental companies and compare the best deals across Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Al Ain.",
      image: "countries/uae.webp",
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
      title: "Why Rent a Car in Egypt with Autours?",
      subtitle: "Experience Egypt beyond the guidebooks with the freedom of your own rental car. From the iconic Pyramids of Giza and the bustling streets of Cairo to the temples of Luxor, the Nile views of Aswan, and the Red Sea resorts of Hurghada, Sharm El Sheikh, Marsa Alam, and El Gouna, Autours helps you compare trusted airport car rental deals across Egypt in one place. Whether you're planning a business trip, a family holiday, or an unforgettable road trip, enjoy the flexibility to discover Egypt on your own schedule.",
      image: "countries/egypt.png",
      benefits: [
        {
          
          title: "Airport Pickup Across Egypt",
          description: "Pick up your rental car from major airports, including Cairo International Airport, Hurghada International Airport, Sharm El Sheikh International Airport, Alexandria Borg El Arab Airport, Luxor International Airport, Aswan International Airport, Marsa Alam International Airport, and other key locations nationwide."
        },
        {
          title: "Compare Egypt's Best Car Rental Deals",
          description: "Compare prices from trusted local and international suppliers to find the perfect vehicle for city breaks, business travel, family vacations, or long-distance road trips."
        },
        {
          title: "Free Cancellation on Most Bookings",
          description: "Book with confidence thanks to flexible cancellation policies available on most rentals, giving you complete peace of mind if your plans change."
        },
        {
          title: "Instant Confirmation",
          description: "Reserve your car online in minutes and receive instant confirmation before you land, so your vehicle is waiting when your journey begins."
        }
      ]
    },
    steps: [
      { title: "Search", description: "Enter your airport, dates, and times." },
      { title: "Compare", description: "Filter by price and car type." },
      { title: "Book & Drive", description: "Reserve online and hit the road." }
    ],
    documents: {
      items: [
        "Valid driving license",
        "International Driving Permit (if required)",
        "Passport",
        "Valid visa (if applicable)",
        "Credit card in the main driver's name"
      ]
    },
    faqs: [
      {
        q: "Do I need an International Driving Permit to rent a car in Egypt?",
        a: "Many visitors can rent a car using their national driving licence, but an International Driving Permit (IDP) is recommended and may be required by some rental companies depending on your country of residence."
      },
      {
        q: "Can tourists rent a car in Egypt?",
        a: "Yes. Tourists can easily rent a car by presenting a valid driving licence, passport, and a credit card in the main driver's name. Some suppliers may also request an International Driving Permit."
      },
      {
        q: "What documents do I need to rent a car in Egypt?",
        a: "You'll usually need: a valid driving licence, International Driving Permit (if required), passport, valid visa (if applicable), and a credit card in the main driver's name."
      },
      {
        q: "What is the minimum age to rent a car in Egypt?",
        a: "Most suppliers require drivers to be at least 21 years old, while luxury vehicles, premium SUVs, and larger cars may require drivers to be 25 or older."
      },
      {
        q: "Which airports can I pick up my rental car from?",
        a: "You can collect your vehicle from major airports across Egypt, including Cairo, Hurghada, Sharm El Sheikh, Alexandria, Luxor, Aswan, and Marsa Alam, depending on availability."
      },
      {
        q: "Can I drive from Cairo to Hurghada, Alexandria, Luxor, or Aswan?",
        a: "Yes. Egypt's modern highway network makes it easy to travel between major cities and tourist destinations. Many travelers choose to rent a car for flexible road trips across the country."
      },
      {
        q: "Is driving in Egypt safe for tourists?",
        a: "Yes. Driving is common in major cities and tourist areas. For the best experience, follow local traffic rules, avoid driving late at night in unfamiliar areas, and use GPS navigation."
      },
      {
        q: "What type of rental car is best for Egypt?",
        a: "Economy cars are perfect for city driving, while SUVs are ideal for families, longer road trips, and exploring destinations across Upper Egypt, the Red Sea coast, and desert regions."
      },
      {
        q: "Are unlimited mileage rentals available?",
        a: "Many suppliers include unlimited mileage, while others apply mileage limits. You'll always see the mileage policy before confirming your booking."
      },
      {
        q: "When is the best time to book a rental car in Egypt?",
        a: "For the lowest prices and the widest vehicle selection, book 2–4 weeks in advance, especially if you're travelling during winter, Christmas, New Year, Easter, or other peak tourist seasons."
      }
    ],
    partnersDescription: "Autours partners with leading car rental providers across Egypt. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Cairo, Alexandria, Sharm El Sheikh, Hurghada, Luxor, and Aswan.",
    ctaTitle: "Ready to Discover Egypt Your Way?",
    ctaDescription: "Compare airport car rental deals from trusted suppliers across Cairo, Giza, Alexandria, Luxor, Aswan, Hurghada, Sharm El Sheikh, Marsa Alam, El Gouna, and more. Book in minutes, enjoy competitive prices, free cancellation on most rentals, and instant confirmation—so you can spend less time waiting and more time exploring Egypt's world-famous landmarks.",
    ctaPrimaryText: "Search Cars Now",
    ctaSecondaryText: "Contact Support"
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
      image: "countries/saudi.png",
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
      title: "Why Rent a Car in Bahrain with Autours?",
      subtitle: "Discover Bahrain with the flexibility of your own rental car. Whether you're arriving at Bahrain International Airport, exploring the vibrant streets of Manama, relaxing in Amwaj Islands, shopping in Seef, or visiting Muharraq, Riffa, Isa Town, Sakhir, Zallaq, or Budaiya, Autours helps you compare trusted airport car rental deals from leading local and international suppliers. Whether you're visiting for business, a Formula 1 weekend, or a relaxing Gulf getaway, finding the right rental car is fast, simple, and affordable.",
      image: "countries/bahrain.png",
      benefits: [
        {
          title: "Convenient Airport Pickup",
          description: "Collect your rental car directly from Bahrain International Airport and start your trip as soon as you land."
        },
        {
          title: "Compare the Best Car Rental Deals",
          description: "Compare prices from trusted local and international rental companies to find the ideal vehicle for your journey across Bahrain."
        },
        {
          title: "Free Cancellation on Most Bookings",
          description: "Book with confidence thanks to flexible cancellation policies available on most rentals."
        },
        {
          title: "Instant Booking Confirmation",
          description: "Reserve online in minutes and receive instant confirmation before your arrival."
        }
      ]
    },
    steps: [
      { title: "Search", description: "Enter your airport, dates, and times." },
      { title: "Compare", description: "Filter by price and car type." },
      { title: "Book & Drive", description: "Reserve online and hit the road." }
    ],
    documents: {
      items: [
        "Valid driving license",
        "International Driving Permit (if required)",
        "Passport",
        "Valid visa or entry permit (if applicable)",
        "Credit card in the driver's name"
      ]
    },
    faqs: [
      {
        q: "Do I need an International Driving Permit in Bahrain?",
        a: "Many visitors can drive using their national driving licence, while others may need an International Driving Permit (IDP). Requirements depend on your nationality and the rental supplier."
      },
      {
        q: "Can tourists rent a car in Bahrain?",
        a: "Yes. Tourists can rent a car with a valid driving licence, passport, and a credit card in the main driver's name. Some nationalities may also need an International Driving Permit."
      },
      {
        q: "What documents do I need to rent a car in Bahrain?",
        a: "You'll usually need a valid driving licence, International Driving Permit (if required), passport, valid visa or entry permit (if applicable), and a credit card in the driver's name."
      },
      {
        q: "What is the minimum age to rent a car in Bahrain?",
        a: "Most suppliers require drivers to be at least 21 years old, while premium vehicles and luxury cars may require drivers to be 25 or older."
      },
      {
        q: "Can I pick up my rental car at Bahrain International Airport?",
        a: "Yes. Airport pickup is available, allowing you to collect your vehicle immediately after arrival and begin your journey without delay."
      },
      {
        q: "Is driving in Bahrain easy for tourists?",
        a: "Yes. Bahrain has modern roads, clear road signs in both Arabic and English, and relatively short driving distances, making it one of the easiest Gulf countries to explore by car."
      },
      {
        q: "What are the best places to visit with a rental car in Bahrain?",
        a: "A rental car makes it easy to explore Manama, Muharraq, Riffa, Seef, Amwaj Islands, Bahrain International Circuit, Tree of Life, Al Areen Wildlife Park, Bahrain Fort, and Zallaq Beach."
      },
      {
        q: "Can I drive a rental car to Saudi Arabia?",
        a: "Some suppliers allow travel across the King Fahd Causeway into Saudi Arabia with prior approval, additional insurance, and the required documentation. Always check the rental conditions before booking."
      },
      {
        q: "What type of rental car is best for Bahrain?",
        a: "Economy cars are perfect for city driving, while SUVs provide extra comfort for families, business travelers, and trips around the island."
      },
      {
        q: "When should I book my Bahrain car rental for the best price?",
        a: "Booking 2–4 weeks in advance usually offers the best prices and the widest choice of vehicles, especially during the Formula 1 Bahrain Grand Prix, public holidays, and peak travel seasons."
      }
    ],
    partnersDescription: "Autours partners with leading car rental providers across Bahrain. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Manama, Muharraq, Riffa, Seef, and Bahrain International Airport.",
    ctaTitle: "Ready to Explore Bahrain?",
    ctaDescription: "Compare airport car rental deals from trusted suppliers across Bahrain International Airport and enjoy the freedom to explore Manama, Muharraq, Riffa, Seef, Amwaj Islands, Sakhir, Zallaq, and more. Book in minutes with competitive prices, free cancellation on most rentals, and instant confirmation before you travel.",
    ctaPrimaryText: "Search Cars Now",
    ctaSecondaryText: "Contact Support"
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
      title: "Why Rent a Car in Jordan with Autours?",
      subtitle: "Discover Jordan with the freedom to travel at your own pace. Whether you're arriving at Queen Alia International Airport in Amman, exploring the ancient city of Petra, floating in the Dead Sea, diving in Aqaba, or visiting Wadi Rum, Jerash, Madaba, Mount Nebo, Irbid, or Ajloun, Autours lets you compare trusted car rental deals in one place.",
      image: "countries/jordan.png",
      benefits: [
        {
          title: "Airport Pickup Across Jordan",
          description: "Collect your rental car from major locations including Queen Alia International Airport, King Hussein International Airport (Aqaba), and selected city locations for a smooth start to your journey."
        },
        {
          title: "Compare the Best Prices",
          description: "Browse offers from leading local and international rental companies to find the right vehicle at a competitive price."
        },
        {
          title: "Free Cancellation on Most Bookings",
          description: "Travel with confidence thanks to flexible cancellation policies available on most rentals."
        },
        {
          title: "Instant Booking Confirmation",
          description: "Book online in minutes and receive instant confirmation before your arrival in Jordan."
        }
      ]
    },
    steps: [
      { title: "Search", description: "Enter your airport, dates, and times." },
      { title: "Compare", description: "Filter by price and car type." },
      { title: "Book & Drive", description: "Reserve online and hit the road." }
    ],
    documents: {
      items: [
        "Valid driving license",
        "International Driving Permit (if required)",
        "Passport",
        "Valid entry visa (when applicable)",
        "Credit card in the driver's name"
      ]
    },
    faqs: [
      {
        q: "Can I drive a rental car to Petra?",
        a: "Yes. Petra is easily accessible by car from Amman, Aqaba, and the Dead Sea. Renting a car is one of the most convenient ways to visit Jordan's top attractions."
      },
      {
        q: "Can tourists rent a car in Jordan?",
        a: "Yes. International visitors can rent a car with a valid driving licence. Many nationalities should also carry an International Driving Permit (IDP), depending on the rental company's requirements."
      },
      {
        q: "What documents do I need to rent a car in Jordan?",
        a: "You'll usually need a valid driving licence, International Driving Permit (if required), passport, valid entry visa (when applicable), and a credit card in the driver's name."
      },
      {
        q: "What is the minimum age to rent a car in Jordan?",
        a: "Most suppliers require drivers to be at least 21 years old. Luxury vehicles and larger SUVs may require drivers to be 25 or older."
      },
      {
        q: "Is a credit card required to collect the rental car?",
        a: "Yes. Most rental companies require a credit card in the primary driver's name for the refundable security deposit."
      },
      {
        q: "Can I pick up my rental car at Amman Airport?",
        a: "Yes. Airport pickup is available at Queen Alia International Airport (AMM), and rentals are also offered at King Hussein International Airport (AQJ) in Aqaba."
      },
      {
        q: "Is it easy to drive between Jordan's major attractions?",
        a: "Yes. Jordan has a well-developed road network connecting Amman, Petra, Dead Sea, Wadi Rum, Aqaba, Jerash, Madaba, and Mount Nebo, making self-drive travel a popular option."
      },
      {
        q: "Can I drive a rental car into Israel or Saudi Arabia?",
        a: "Cross-border travel is generally restricted or requires special approval, insurance, and documentation. Check your supplier's rental terms before booking."
      },
      {
        q: "What type of rental car is best for Jordan?",
        a: "Economy cars are ideal for city driving and highways, while SUVs offer extra comfort for families and longer trips to destinations like Wadi Rum or Dana Biosphere Reserve."
      },
      {
        q: "When should I book my Jordan car rental for the best price?",
        a: "Booking two to four weeks in advance usually provides better prices and a wider selection of vehicles, especially during spring, holidays, and peak tourist seasons."
      }
    ],
    partnersDescription: "Autours partners with leading car rental providers across Jordan. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Amman, Aqaba, and other major hubs.",
    ctaTitle: "Ready to Explore Jordan?",
    ctaDescription: "Compare airport car rental deals from trusted suppliers across Amman, Aqaba, and other major locations. Drive to Petra, Wadi Rum, the Dead Sea, Jerash, Madaba, and beyond with competitive prices, free cancellation on most bookings, and instant confirmation.",
    ctaPrimaryText: "Search Cars Now",
    ctaSecondaryText: "Contact Support"
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
      title: "Why Rent a Car in Kuwait with Autours?",
      subtitle: "Explore Kuwait with the freedom to travel on your own schedule. Whether you're arriving at Kuwait International Airport, visiting Kuwait City for business, relaxing in Salmiya, shopping in Hawally, or heading to Mahboula, Fahaheel, Farwaniya, Jahra, Mangaf, or Sabah Al Ahmad Sea City, Autours helps you compare the best airport car rental deals from trusted suppliers.",
      image: "countries/kuwait.png",
      benefits: [
        {
          title: "Convenient Airport Pickup",
          description: "Collect your rental car directly from Kuwait International Airport and start your journey without waiting for taxis or public transport."
        },
        {
          title: "Compare the Best Deals",
          description: "Compare prices from leading local and international car rental companies to find the perfect vehicle at a competitive rate."
        },
        {
          title: "Free Cancellation on Most Bookings",
          description: "Enjoy flexible travel plans with free cancellation available on most reservations."
        },
        {
          title: "Instant Booking Confirmation",
          description: "Reserve your vehicle online in minutes and receive instant confirmation."
        }
      ]
    },
    steps: [
      { title: "Search", description: "Enter your airport, dates, and times." },
      { title: "Compare", description: "Filter by price and car type." },
      { title: "Book & Drive", description: "Reserve online and hit the road." }
    ],
    documents: {
      items: [
        "Valid driving license",
        "Passport with valid entry visa (if required)",
        "Credit card in the main driver's name",
        "International Driving Permit (IDP) where applicable"
      ]
    },
    faqs: [
      {
        q: "What is the minimum age to rent a car in Kuwait?",
        a: "The standard minimum age is 21, though luxury categories may require the driver to be 25 years or older."
      },
      {
        q: "Do I need a credit card to rent a car in Kuwait?",
        a: "Yes. Most suppliers require a credit card in the main driver's name to hold the security deposit upon vehicle collection."
      },
      {
        q: "What documents do I need to rent a car in Kuwait?",
        a: "You will typically need a valid national driving license, passport, visa (if tourist), credit card, and an International Driving Permit (IDP) depending on your license origin."
      }
    ],
    partnersDescription: "Autours partners with leading car rental providers across Kuwait. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Kuwait City, Salmiya, Hawally, and Kuwait International Airport.",
    ctaTitle: "Ready to Explore Kuwait?",
    ctaDescription: "Compare car rental deals from trusted suppliers across Kuwait City, Salmiya, Kuwait International Airport, and other locations. Book in minutes, enjoy competitive rates, free cancellation on most rentals, and instant confirmation.",
    ctaPrimaryText: "Search Cars Now",
    ctaSecondaryText: "Contact Support"
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
      title: "Why Rent a Car in Oman with Autours?",
      subtitle: "Explore Oman on your own schedule with trusted airport car rentals from leading local and international suppliers. Whether you're arriving in Muscat for business, discovering the historic forts of Nizwa, relaxing on the beaches of Salalah, or planning an adventure to Jebel Akhdar, Jebel Shams, Sur, Sohar, Duqm, or Khasab, Autours helps you compare the best rental deals in one place.",
      image: "countries/oman.png",
      benefits: [
        {
          title: "Nationwide Airport Coverage",
          description: "Pick up your rental car from major Oman airports and enjoy easy access to Muscat, Salalah, Nizwa, Sohar, Sur, Bahla, Rustaq, Duqm, Khasab, Wahiba Sands, Wadi Shab, Wadi Bani Khalid, and more."
        },
        {
          title: "Compare the Best Prices",
          description: "Instantly compare offers from trusted local and international rental companies to find the right car at the best price."
        },
        {
          title: "Free Cancellation on Most Bookings",
          description: "Travel with confidence thanks to flexible cancellation policies available on most rentals."
        },
        {
          title: "Instant Booking Confirmation",
          description: "Reserve online in minutes and receive immediate confirmation, so your car is ready when you arrive."
        }
      ]
    },
    steps: [
      { title: "Search", description: "Enter your airport, dates, and times." },
      { title: "Compare", description: "Filter by price and car type." },
      { title: "Book & Drive", description: "Reserve online and hit the road." }
    ],
    documents: {
      items: [
        "Valid driving license",
        "Passport with valid entry visa (if required)",
        "Credit card in the main driver's name",
        "International Driving Permit (when applicable)"
      ]
    },
    faqs: [
      {
        q: "Do I need a 4x4 to explore Oman?",
        a: "Not always. A standard car is suitable for cities such as Muscat, Nizwa, Sohar, and Salalah. If you plan to visit Jebel Shams, Jebel Akhdar, Wadi Bani Awf, or remote desert areas, a 4WD vehicle is highly recommended."
      },
      {
        q: "Can tourists rent a car in Oman?",
        a: "Yes. Visitors can rent a car with a valid driving licence. Depending on your nationality, you may also need an International Driving Permit (IDP) together with your passport."
      },
      {
        q: "What is the minimum age to rent a car in Oman?",
        a: "Most suppliers require drivers to be at least 21 years old. Some premium vehicles and SUVs may require drivers to be 25 or older."
      },
      {
        q: "Is a credit card required when collecting the car?",
        a: "Yes. Most rental companies require a credit card in the main driver's name to cover the refundable security deposit."
      },
      {
        q: "What documents do I need to rent a car in Oman?",
        a: "You'll usually need a valid driving licence, passport, entry visa (if required), credit card in the driver's name, and an International Driving Permit (when applicable)."
      },
      {
        q: "Which airports can I rent a car from in Oman?",
        a: "Autours offers airport car rentals at major locations, including Muscat International Airport, Salalah International Airport, Sohar Airport, and Duqm Airport, with availability depending on your travel dates."
      },
      {
        q: "Are unlimited mileage rentals available?",
        a: "Many suppliers include unlimited mileage, while others apply daily or total mileage limits. The mileage policy is always displayed before you book."
      },
      {
        q: "Can I drive a rental car from Oman to the UAE?",
        a: "Some suppliers allow cross-border travel to the UAE with prior approval and additional insurance. Availability varies by rental company."
      },
      {
        q: "What type of car should I rent in Oman?",
        a: "Economy cars are ideal for city driving and highways, while SUVs and 4x4 vehicles are the best choice for mountain roads, desert trips, and destinations like Jebel Shams, Jebel Akhdar, and Wahiba Sands."
      },
      {
        q: "When is the best time to book a rental car in Oman?",
        a: "Booking at least two to four weeks before your trip usually gives you the widest vehicle selection and the best prices, especially during holidays and the Khareef season in Salalah."
      }
    ],
    partnersDescription: "Autours partners with leading car rental providers across Oman. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Muscat, Salalah, Sohar, Duqm, and major airports.",
    ctaTitle: "Ready to Explore Oman?",
    ctaDescription: "Compare car rental deals from trusted suppliers across Muscat, Salalah, Sohar, Duqm, and other major Oman airports. Book in minutes, enjoy competitive rates, free cancellation on most rentals, and instant confirmation before you travel.",
    ctaPrimaryText: "Search Cars Now",
    ctaSecondaryText: "Contact Support"
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
  },
  'turkey': {
    slug: 'turkey',
    name: 'Turkey',
    heroBadge: 'Autours Turkey Airport Car Rental',
    heroTitle: 'Book Your Airport Rental',
    heroHighlight: 'Across Turkey',
    heroLead: 'Search pickup availability from Istanbul, Antalya, Izmir, Ankara, and Dalaman airports — then choose the right car.',
    heroBottomTitle: 'Search by Turkey airport and land ready to drive.',
    travelInfo: {
      title: "Why Rent a Car in Turkey with Autours?",
      subtitle: "Discover Turkey with the freedom to travel beyond the tourist hotspots. Whether you're exploring the vibrant streets of Istanbul, the fairy chimneys of Cappadocia, the Mediterranean coast of Antalya, the beaches of Bodrum, or the historic cities of Izmir, Ankara, Fethiye, Marmaris, Kuşadası, Trabzon, or Pamukkale, Autours helps you compare trusted airport car rental deals from leading local and international suppliers.\n\nFrom city breaks and coastal escapes to scenic road trips across the Turkish Riviera, enjoy the flexibility to travel at your own pace.",
      image: "countries/turkey.png",
      benefits: [
        {
          title: "Airport Pickup Across Turkey",
          description: "Collect your rental car from major airports, including Istanbul Airport (IST), Sabiha Gökçen Airport (SAW), Antalya Airport (AYT), Izmir Adnan Menderes Airport (ADB), Ankara Esenboğa Airport (ESB), Dalaman Airport (DLM), Milas-Bodrum Airport (BJV), Kayseri Airport (ASR), and many more."
        },
        {
          title: "Compare the Best Car Rental Deals",
          description: "Compare prices from trusted local and international suppliers to find the right vehicle for your holiday, business trip, or road adventure across Turkey."
        },
        {
          title: "Free Cancellation on Most Bookings",
          description: "Enjoy flexible travel plans with free cancellation available on most reservations."
        },
        {
          title: "Instant Booking Confirmation",
          description: "Book your rental car online in minutes and receive instant confirmation before your flight."
        }
      ]
    },
    steps: [
      { title: "Search", description: "Enter your airport, dates, and times." },
      { title: "Compare", description: "Filter by price and car type." },
      { title: "Book & Drive", description: "Reserve online and hit the road." }
    ],
    documents: {
      items: [
        "Valid driving license",
        "Passport with valid entry visa (if required)",
        "Credit card in the main driver's name",
        "International Driving Permit (IDP) where applicable"
      ]
    },
    faqs: [
      {
        q: "What is the minimum age to rent a car in Turkey?",
        a: "Most rental companies require drivers to be at least 21 years old. Premium vehicles and luxury cars may require drivers to be 25 years or older."
      },
      {
        q: "Do I need a credit card to rent a car in Turkey?",
        a: "Yes. Most suppliers require a credit card in the main driver's name to cover the refundable security deposit."
      },
      {
        q: "What documents do I need to rent a car in Turkey?",
        a: "You'll usually need a valid driving licence, passport, credit card in the main driver's name, and an International Driving Permit (IDP), if required for your nationality."
      },
      {
        q: "Can tourists rent a car in Turkey?",
        a: "Yes. International visitors can rent a car with a valid driving licence. Some nationalities may also need an International Driving Permit."
      },
      {
        q: "Which airports can I pick up my rental car from?",
        a: "Autours offers airport car rentals at major Turkish airports, including Istanbul, Antalya, Izmir, Ankara, Dalaman, Bodrum, Kayseri, Trabzon, Gaziantep, and many more."
      },
      {
        q: "Is driving in Turkey easy for tourists?",
        a: "Yes. Turkey has an extensive motorway network connecting major cities and tourist destinations. Road signs are clear, and driving is generally straightforward for international visitors."
      },
      {
        q: "Can I drive from Istanbul to Cappadocia or Antalya?",
        a: "Yes. Renting a car is a popular way to explore Turkey. Many travelers enjoy road trips between Istanbul, Ankara, Cappadocia, Pamukkale, Antalya, Fethiye, Marmaris, Izmir, and Bodrum."
      },
      {
        q: "What type of rental car is best for Turkey?",
        a: "Economy cars are ideal for city driving, while SUVs offer extra comfort for mountain routes, family holidays, and longer road trips across the country."
      },
      {
        q: "Are unlimited mileage rentals available?",
        a: "Many suppliers offer unlimited mileage, while others have mileage limits. The mileage policy is always displayed before you complete your booking."
      },
      {
        q: "When should I book my Turkey car rental for the best price?",
        a: "Booking 2–4 weeks in advance usually gives you the best prices and the widest selection of vehicles, especially during the summer season, public holidays, and school vacations."
      }
    ],
    partnersDescription: "Autours partners with leading car rental providers across Turkey. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Istanbul, Antalya, Izmir, Ankara, and major airports.",
    ctaTitle: "Ready to Explore Turkey?",
    ctaDescription: "Compare airport car rental deals from trusted suppliers across Istanbul, Antalya, Cappadocia, Izmir, Ankara, Bodrum, Dalaman, Fethiye, Marmaris, Trabzon, and more. Book in minutes with competitive prices, free cancellation on most rentals, and instant confirmation—so you can start exploring Turkey the moment you arrive.",
    ctaPrimaryText: "Search Cars Now",
    ctaSecondaryText: "Contact Support"
  },
  'morocco': {
    slug: 'morocco',
    name: 'Morocco',
    heroBadge: 'Autours Morocco Airport Car Rental',
    heroTitle: 'Book Your Airport Rental',
    heroHighlight: 'Across Morocco',
    heroLead: 'Search pickup availability from Casablanca, Marrakech, Agadir, Fes, and Tangier airports — then choose the right car.',
    heroBottomTitle: 'Search by Morocco airport and land ready to drive.',
    travelInfo: {
      title: "Why Rent a Car in Morocco with Autours?",
      subtitle: "Experience Morocco with the freedom to explore beyond the usual tourist routes. Whether you're arriving in Casablanca, discovering the blue streets of Chefchaouen, wandering the vibrant souks of Marrakech, or visiting Fes, Tangier, Rabat, Essaouira, Ouarzazate, Merzouga, or the Atlas Mountains, Autours helps you compare trusted airport car rental deals from leading local and international suppliers.\n\nFrom coastal road trips to desert adventures and imperial city tours, renting a car gives you the flexibility to experience Morocco on your own schedule.",
      image: "countries/morocco.png",
      benefits: [
        {
          title: "Airport Pickup Across Morocco",
          description: "Collect your rental car from major airports, including Mohammed V International Airport (Casablanca), Marrakech Menara Airport, Agadir Al Massira Airport, Fès–Saïss Airport, Tangier Ibn Battuta Airport, Rabat–Salé Airport, Oujda Angads Airport, Nador Airport, and other key locations across Morocco."
        },
        {
          title: "Compare the Best Car Rental Deals",
          description: "Compare offers from trusted local and international rental companies to find the perfect vehicle for city breaks, business trips, family holidays, or scenic road trips across Morocco."
        },
        {
          title: "Free Cancellation on Most Bookings",
          description: "Book with confidence thanks to flexible cancellation policies available on most rentals."
        },
        {
          title: "Instant Booking Confirmation",
          description: "Reserve your rental car online in minutes and receive instant confirmation before you arrive."
        }
      ]
    },
    steps: [
      { title: "Search", description: "Enter your airport, dates, and times." },
      { title: "Compare", description: "Filter by price and car type." },
      { title: "Book & Drive", description: "Reserve online and hit the road." }
    ],
    documents: {
      items: [
        "Valid driving license",
        "Passport with valid entry visa (if required)",
        "Credit card in the main driver's name",
        "International Driving Permit (IDP) where applicable"
      ]
    },
    faqs: [
      {
        q: "What is the minimum age to rent a car in Morocco?",
        a: "Most rental companies require drivers to be at least 21 years old. Some premium vehicles and luxury SUVs may require drivers to be 25 years or older."
      },
      {
        q: "Do I need a credit card to rent a car in Morocco?",
        a: "Yes. Most suppliers require a credit card in the main driver's name to cover the refundable security deposit when collecting the vehicle."
      },
      {
        q: "What documents do I need to rent a car in Morocco?",
        a: "You'll usually need a valid driving licence, passport, credit card in the main driver's name, International Driving Permit (IDP) if required for your nationality, and a valid visa or entry permit (where applicable)."
      },
      {
        q: "Can tourists rent a car in Morocco?",
        a: "Yes. International visitors can rent a car using a valid driving licence. Depending on your nationality and the supplier's policy, an International Driving Permit may also be required."
      },
      {
        q: "Which airports can I collect my rental car from?",
        a: "Autours offers airport car rental at major Moroccan airports, including Casablanca, Marrakech, Agadir, Fes, Tangier, Rabat, Oujda, and other popular destinations."
      },
      {
        q: "Is driving in Morocco easy for tourists?",
        a: "Yes. Morocco has an extensive road network connecting major cities and tourist attractions. Modern highways make it easy to travel between destinations such as Casablanca, Rabat, Marrakech, Agadir, and Fes."
      },
      {
        q: "Can I drive from Casablanca to Marrakech or Chefchaouen?",
        a: "Yes. Renting a car is one of the best ways to explore Morocco. Popular road trips include Casablanca, Rabat, Chefchaouen, Fes, Marrakech, Essaouira, Agadir, Merzouga, and the Atlas Mountains."
      },
      {
        q: "What type of rental car is best for Morocco?",
        a: "Economy cars are ideal for city travel and highways, while SUVs are recommended for mountain roads, desert excursions, and longer journeys through the Atlas Mountains or to Merzouga."
      },
      {
        q: "Are unlimited mileage rentals available?",
        a: "Many suppliers offer unlimited mileage, while others apply mileage limits. You'll always see the mileage policy before confirming your reservation."
      },
      {
        q: "When should I book my Morocco car rental for the best price?",
        a: "Booking 2–4 weeks in advance usually gives you the best prices and the widest choice of vehicles, especially during spring, summer holidays, Christmas, and other peak travel seasons."
      }
    ],
    partnersDescription: "Autours partners with leading car rental providers across Morocco. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Casablanca, Marrakech, Agadir, Tangier, and major airports.",
    ctaTitle: "Ready to Explore Morocco?",
    ctaDescription: "Compare airport car rental deals from trusted suppliers across Casablanca, Marrakech, Agadir, Fes, Tangier, Rabat, Chefchaouen, Essaouira, Ouarzazate, and more. Book in minutes with competitive prices, free cancellation on most rentals, and instant confirmation—so you can start discovering Morocco the moment you arrive.",
    ctaPrimaryText: "Search Cars Now",
    ctaSecondaryText: "Contact Support"
  },

  georgia: {
    slug: 'georgia',
    name: 'Georgia',
    heroBadge: 'Autours Georgia Airport Car Rental',
    heroTitle: 'Book Your Airport Rental',
    heroHighlight: 'Across Georgia',
    heroLead: 'Discover the beauty of Georgia with the freedom to travel wherever your journey takes you. Compare trusted airport car rental deals from leading local and international suppliers across Tbilisi, Batumi, Kutaisi, Kazbegi, and beyond.',
    heroBottomTitle: 'Search by Georgia airport and start your adventure.',
    travelInfo: {
      title: 'Why Rent a Car in Georgia with Autours?',
      subtitle: 'Discover the beauty of Georgia with the freedom to travel wherever your journey takes you. Whether you\'re arriving in Tbilisi, exploring the mountain landscapes of Kazbegi, relaxing in Batumi on the Black Sea coast, visiting the vineyards of Kakheti, or discovering Kutaisi, Gudauri, Borjomi, Mtskheta, Sighnaghi, or Mestia — Autours helps you compare trusted airport car rental deals from leading local and international suppliers.',
      image: "countries/georgia.png",
      benefits: [
        {
          title: 'Airport Pickup Across Georgia',
          description: 'Collect your rental car from Tbilisi International Airport (TBS), Kutaisi International Airport (KUT), Batumi International Airport (BUS), and other convenient pickup locations across Georgia.',
        },
        {
          title: 'Compare the Best Car Rental Deals',
          description: 'Compare prices from trusted local and international suppliers to find the ideal vehicle for city driving, mountain adventures, business trips, or road trips across Georgia.',
        },
        {
          title: 'Free Cancellation on Most Bookings',
          description: 'Travel with confidence thanks to flexible cancellation policies available on most rentals.',
        },
        {
          title: 'Instant Booking Confirmation',
          description: 'Book your rental car online in minutes and receive instant confirmation before you arrive.',
        },
        {
          title: 'Wide Vehicle Selection',
          description: 'From compact economy cars for city driving to robust SUVs for mountain roads and ski resorts — find the right vehicle for every Georgia adventure.',
        },
      ],
    },
    steps: [
      {
        title: 'Search',
        description: 'Enter your Georgia airport or city, dates, and times to see available cars from trusted suppliers.',
      },
      {
        title: 'Compare',
        description: 'Filter by price, vehicle type, transmission, and supplier ratings to find the best deal.',
      },
      {
        title: 'Book & Drive',
        description: 'Reserve online in minutes, pick up your car at the airport, and start exploring Georgia.',
      },
    ],
    documents: {
      items: [
        'Valid driving licence',
        'Passport',
        'Credit card in the main driver\'s name',
        'International Driving Permit (IDP), if required',
        'Booking confirmation (digital or printed)',
      ],
    },
    faqs: [
      {
        q: 'What is the minimum age to rent a car in Georgia?',
        a: 'Most rental companies require drivers to be at least 21 years old. Some premium vehicles and SUVs may require drivers to be 25 years or older. The minimum age requirement for each vehicle is shown clearly before booking.',
      },
      {
        q: 'Can tourists rent a car in Georgia?',
        a: 'Yes. International visitors can rent a car using a valid driving licence. Some suppliers may also require an International Driving Permit (IDP), depending on your nationality. All requirements are displayed before you confirm your booking on Autours.',
      },
      {
        q: 'What documents do I need to rent a car in Georgia?',
        a: 'You\'ll usually need: a valid driving licence, passport, credit card in the main driver\'s name, and an International Driving Permit (IDP) if required by your nationality or the rental supplier.',
      },
      {
        q: 'Which airports can I pick up my rental car from?',
        a: 'Autours offers airport car rental at Tbilisi International Airport (TBS), Kutaisi International Airport (KUT), Batumi International Airport (BUS), and selected city locations across Georgia.',
      },
      {
        q: 'Is driving in Georgia easy for tourists?',
        a: 'Yes. Georgia has an expanding highway network connecting major cities and tourist destinations. Mountain roads are generally well maintained, although extra care is recommended during winter, especially in highland areas like Kazbegi and Gudauri.',
      },
      {
        q: 'Can I drive from Tbilisi to Kazbegi or Batumi?',
        a: 'Yes. Renting a car is one of the best ways to explore Georgia. Popular road trips include Tbilisi to Kazbegi (Stepantsminda), Gudauri, Batumi, Kutaisi, Borjomi, Mtskheta, Kakheti, Sighnaghi, and Mestia — all easily accessible by road.',
      },
      {
        q: 'Do I need a 4x4 in Georgia?',
        a: 'A standard car is suitable for most cities and highways. However, if you\'re visiting mountain regions such as Tusheti, Ushguli, or remote areas during winter, a 4WD vehicle is strongly recommended.',
      },
      {
        q: 'Can I drive a rental car across the border?',
        a: 'Cross-border travel is restricted by many suppliers or requires prior approval, additional insurance, and extra documentation. Always check the rental conditions before booking if you plan to travel beyond Georgia\'s borders.',
      },
      {
        q: 'What type of rental car is best for Georgia?',
        a: 'Economy cars are ideal for city driving and standard highways. SUVs are recommended for mountain roads, ski resorts, family holidays, and longer road trips across the Georgian countryside.',
      },
      {
        q: 'When should I book my Georgia car rental for the best price?',
        a: 'Booking 2–4 weeks in advance usually gives you the best prices and the widest choice of vehicles, especially during the summer season, ski season (December–March), and national holidays.',
      },
    ],
    partnersDescription: 'Autours partners with leading car rental providers across Georgia. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Tbilisi, Batumi, Kutaisi, and all major airports.',
    ctaTitle: 'Ready to Explore Georgia?',
    ctaDescription: 'Compare airport car rental deals from trusted suppliers across Tbilisi, Batumi, Kutaisi, Kazbegi, Gudauri, Borjomi, Kakheti, Mtskheta, Sighnaghi, Mestia, and more. Book in minutes with competitive prices, free cancellation on most rentals, and instant confirmation — so you can start exploring Georgia from the moment you land.',
    ctaPrimaryText: 'Search Cars Now',
    ctaSecondaryText: 'Contact Support',
  },
};

