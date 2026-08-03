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

export const countryPagesData: Record<string, CountryPageData> = {
  "uae": {
    "slug": "uae",
    "name": "United Arab Emirates",
    "heroBadge": "Autours UAE Airport Car Rental",
    "heroTitle": "Book Your Airport Rental",
    "heroHighlight": "Across the UAE",
    "heroLead": "Search pickup availability from Dubai, Abu Dhabi, Sharjah, Al Maktoum, Ras Al Khaimah, and Fujairah airports — then choose the right car for your trip before you land.",
    "heroBottomTitle": "Search by UAE airport and land ready to drive.",
    "travelInfo": {
      "title": "Why Choose Autours?",
      "subtitle": "The Smart Way to Rent a Car Across the UAE. Book with trusted car rental companies and compare the best deals across Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Al Ain.",
      "image": "countries/uae.png",
      "benefits": [
        {
          "title": "Airport Pickup Across the UAE",
          "description": "Collect your car at Dubai International Airport (DXB), Abu Dhabi International Airport (AUH), Sharjah Airport (SHJ), and other major airport locations."
        },
        {
          "title": "Best Rates in Dubai, Abu Dhabi & Beyond",
          "description": "Compare prices from leading international and local rental companies to secure the best value for your trip."
        },
        {
          "title": "Transparent Pricing",
          "description": "No hidden charges or unexpected fees. See the total price before you book."
        },
        {
          "title": "24/7 Customer Support",
          "description": "Our team is available around the clock to help with bookings, changes, or roadside assistance anywhere in the UAE."
        },
        {
          "title": "Free Cancellation",
          "description": "Enjoy flexible travel with free cancellation up to 24 hours before pickup."
        }
      ]
    },
    "steps": [
      {
        "title": "Search",
        "description": "Enter your airport, dates, and times to see available cars."
      },
      {
        "title": "Compare",
        "description": "Filter by price, car type, transmission, and supplier ratings."
      },
      {
        "title": "Book & Drive",
        "description": "Reserve online, pick up at the airport, and hit the road."
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
    "faqs": [
      {
        "q": "What are the main rent a car rules in UAE?",
        "a": "To rent a car in the UAE, you typically need a valid driving license, passport or Emirates ID, and to meet the minimum age requirement, usually 21+. Rules may vary depending on the supplier, but all conditions are clearly shown before booking on Autours."
      },
      {
        "q": "Can I rent a car in Dubai with an Indian license?",
        "a": "Yes — in some cases. Tourists can rent a car in Dubai with an Indian driving license if it meets UAE regulations, or they may need an International Driving Permit (IDP). You can always check the exact requirements for each car directly on Autours before booking."
      },
      {
        "q": "What is the rent a car license cost in Dubai?",
        "a": "If you're a tourist, you don’t need to pay for a UAE license. However, if required, an International Driving Permit may cost between $20–$50 depending on your country. Residents need a UAE driving license, which has its own cost depending on the emirate."
      },
      {
        "q": "How does car rental in UAE work?",
        "a": "Car rental in UAE is simple with Autours: enter your location, compare cars from multiple suppliers, choose the best deal, and book instantly online — without visiting multiple websites."
      },
      {
        "q": "Can I rent a car near me in UAE?",
        "a": "Yes. With Autours, you can easily find rent a car near me options across all major UAE cities and airports."
      },
      {
        "q": "Is it possible to find cheap rent a car in Dubai?",
        "a": "Absolutely. Autours helps you compare hundreds of offers, so you can find the cheapest car rental in Dubai based on your budget."
      },
      {
        "q": "Can I rent a car at Dubai Airport?",
        "a": "Yes — many suppliers offer rent a car Dubai Airport services. You can book in advance through Autours and pick up your car immediately after landing."
      },
      {
        "q": "What documents are required for car rental in Dubai?",
        "a": "You’ll usually need a driving license, passport or ID, and a credit card in most cases. All requirements are clearly shown before booking."
      },
      {
        "q": "Can I rent a car without a credit card?",
        "a": "Some suppliers allow alternative payment methods, but most require a credit card for the security deposit. You can filter available options on Autours."
      },
      {
        "q": "What types of cars are available in UAE?",
        "a": "You can find economy cars, SUVs, luxury cars, and business class vehicles. Autours offers options for every budget and lifestyle."
      },
      {
        "q": "Can I add an additional driver?",
        "a": "Yes. Most suppliers allow adding an additional driver for an extra fee, and the details are shown during booking."
      },
      {
        "q": "How do I know my booking is confirmed?",
        "a": "Once you complete your booking, you’ll receive instant confirmation, a booking reference, and supplier details."
      },
      {
        "q": "What fuel policies are available?",
        "a": "Common fuel policies include Full-to-Full, which is the most popular, and prepaid fuel. All options are displayed clearly before booking."
      },
      {
        "q": "How long can I rent a car for?",
        "a": "You can rent a car daily, weekly, or monthly, with flexible options depending on your needs."
      },
      {
        "q": "What is included in my car rental booking?",
        "a": "Most bookings include basic insurance, mileage options, and taxes in most cases. You can see the full details before confirming your booking."
      }
    ],
    "highlights": {
      "title": "Top Destinations in the UAE",
      "subtitle": "Explore the UAE's most iconic cities and landmarks with the freedom of your own rental car — from dazzling skyscrapers to serene desert landscapes.",
      "places": [
        {
          "name": "Dubai",
          "description": "Dubai is a world-famous destination where futuristic architecture, luxury shopping, stunning beaches, and unforgettable attractions create one of the most exciting travel experiences in the world.",
          "image": "countries/uae.webp",
          "tags": [
            "Luxury",
            "Shopping",
            "Beaches"
          ],
          "attractions": [
            {
              "name": "Burj Khalifa",
              "description": "Standing at 828 meters, Burj Khalifa is the tallest building in the world and Dubai's most iconic landmark. Visitors can enjoy breathtaking panoramic views from its observation decks and experience the city's spectacular skyline from above.",
              "image": "https://images.pexels.com/photos/13324659/pexels-photo-13324659.jpeg?auto=compress&cs=tinysrgb&w=800"
            },
            {
              "name": "Dubai Mall",
              "description": "One of the world's largest shopping destinations, Dubai Mall offers luxury brands, fine dining, family attractions, an aquarium, and endless entertainment, making it a must-visit for every traveler.",
              "image": "https://images.pexels.com/photos/18669645/pexels-photo-18669645.jpeg?auto=compress&cs=tinysrgb&w=800"
            }
          ]
        },
        {
          "name": "Abu Dhabi",
          "description": "Abu Dhabi combines rich Emirati heritage with world-class architecture, cultural landmarks, luxury experiences, and beautiful waterfronts.",
          "image": "https://images.pexels.com/photos/28448972/pexels-photo-28448972.jpeg?auto=compress&cs=tinysrgb&w=800",
          "tags": [
            "Culture",
            "Family",
            "Theme Parks"
          ],
          "attractions": [
            {
              "name": "Sheikh Zayed Grand Mosque",
              "description": "One of the world's most beautiful mosques, Sheikh Zayed Grand Mosque is famous for its white marble architecture, massive chandeliers, intricate mosaics, and peaceful atmosphere.",
              "image": "https://images.pexels.com/photos/8244190/pexels-photo-8244190.jpeg?auto=compress&cs=tinysrgb&w=800"
            },
            {
              "name": "Louvre Abu Dhabi",
              "description": "Louvre Abu Dhabi is an award-winning museum showcasing masterpieces from civilizations around the world beneath its spectacular floating dome.",
              "image": "https://images.pexels.com/photos/29766947/pexels-photo-29766947.jpeg?auto=compress&cs=tinysrgb&w=800"
            }
          ]
        },
        {
          "name": "Sharjah",
          "description": "Sharjah is the cultural capital of the UAE, offering museums, heritage districts, beautiful waterfronts, and authentic Arabian architecture.",
          "image": "https://images.pexels.com/photos/8319477/pexels-photo-8319477.jpeg?auto=compress&cs=tinysrgb&w=800",
          "tags": [
            "Culture",
            "Museums",
            "Heritage"
          ],
          "attractions": [
            {
              "name": "Sharjah Museum of Islamic Civilization",
              "description": "One of the finest Islamic art and civilisation museums in the Arab world, housed in the beautifully restored Souk Al Majarrah. The museum displays over 5,000 artefacts covering 1,400 years of Islamic heritage.",
              "image": "https://images.pexels.com/photos/11122257/pexels-photo-11122257.jpeg?auto=compress&cs=tinysrgb&w=800"
            },
            {
              "name": "Al Noor Island",
              "description": "A magical island of art and nature in Khalid Lagoon, featuring a stunning butterfly house, sculpture installations, and illuminated garden pathways that transform into a luminous wonderland after dark.",
              "image": "https://images.pexels.com/photos/10555687/pexels-photo-10555687.jpeg?auto=compress&cs=tinysrgb&w=800"
            }
          ]
        }
      ]
    },
    "partnersDescription": "Autours partners with leading car rental providers across the UAE, including Auto Rent, KTC, Drivus, Highway, Routes, Surprice, and Street Rent a Car. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, and Fujairah.",
    "ctaTitle": "Book Your UAE Airport Car Rental in Minutes",
    "ctaDescription": "Unlock exclusive deals from 50+ trusted suppliers at all major UAE airports. Enjoy transparent pricing, free cancellation, and instant booking confirmation.",
    "ctaPrimaryText": "Compare Prices",
    "ctaSecondaryText": "Get Expert Help"
  },
  "egypt": {
    "slug": "egypt",
    "name": "Egypt",
    "heroBadge": "Autours Egypt Airport Car Rental",
    "heroTitle": "Book Your Airport Rental",
    "heroHighlight": "Across Egypt",
    "heroLead": "Search pickup availability from Cairo, Alexandria, Sharm El Sheikh, Hurghada, and Luxor airports — then choose the right car for your trip before you land.",
    "heroBottomTitle": "Search by Egypt airport and land ready to drive.",
    "travelInfo": {
      "title": "Why Rent a Car in Egypt with Autours?",
      "subtitle": "Experience Egypt beyond the guidebooks with the freedom of your own rental car. From the iconic Pyramids of Giza and the bustling streets of Cairo to the temples of Luxor, the Nile views of Aswan, and the Red Sea resorts of Hurghada, Sharm El Sheikh, Marsa Alam, and El Gouna, Autours helps you compare trusted airport car rental deals across Egypt in one place. Whether you're planning a business trip, a family holiday, or an unforgettable road trip, enjoy the flexibility to discover Egypt on your own schedule.",
      "image": "countries/egypt.png",
      "benefits": [
        {
          "title": "Airport Pickup Across Egypt",
          "description": "Pick up your rental car from major airports, including Cairo International Airport, Hurghada International Airport, Sharm El Sheikh International Airport, Alexandria Borg El Arab Airport, Luxor International Airport, Aswan International Airport, Marsa Alam International Airport, and other key locations nationwide."
        },
        {
          "title": "Compare Egypt's Best Car Rental Deals",
          "description": "Compare prices from trusted local and international suppliers to find the perfect vehicle for city breaks, business travel, family vacations, or long-distance road trips."
        },
        {
          "title": "Free Cancellation on Most Bookings",
          "description": "Book with confidence thanks to flexible cancellation policies available on most rentals, giving you complete peace of mind if your plans change."
        },
        {
          "title": "Instant Confirmation",
          "description": "Reserve your car online in minutes and receive instant confirmation before you land, so your vehicle is waiting when your journey begins."
        }
      ]
    },
    "steps": [
      {
        "title": "Search",
        "description": "Enter your airport, dates, and times."
      },
      {
        "title": "Compare",
        "description": "Filter by price and car type."
      },
      {
        "title": "Book & Drive",
        "description": "Reserve online and hit the road."
      }
    ],
    "documents": {
      "items": [
        "Valid driving license",
        "International Driving Permit (if required)",
        "Passport",
        "Valid visa (if applicable)",
        "Credit card in the main driver's name"
      ]
    },
    "faqs": [
      {
        "q": "Do I need an International Driving Permit to rent a car in Egypt?",
        "a": "Many visitors can rent a car using their national driving licence, but an International Driving Permit (IDP) is recommended and may be required by some rental companies depending on your country of residence."
      },
      {
        "q": "Can tourists rent a car in Egypt?",
        "a": "Yes. Tourists can easily rent a car by presenting a valid driving licence, passport, and a credit card in the main driver's name. Some suppliers may also request an International Driving Permit."
      },
      {
        "q": "What documents do I need to rent a car in Egypt?",
        "a": "You'll usually need: a valid driving licence, International Driving Permit (if required), passport, valid visa (if applicable), and a credit card in the main driver's name."
      },
      {
        "q": "What is the minimum age to rent a car in Egypt?",
        "a": "Most suppliers require drivers to be at least 21 years old, while luxury vehicles, premium SUVs, and larger cars may require drivers to be 25 or older."
      },
      {
        "q": "Which airports can I pick up my rental car from?",
        "a": "You can collect your vehicle from major airports across Egypt, including Cairo, Hurghada, Sharm El Sheikh, Alexandria, Luxor, Aswan, and Marsa Alam, depending on availability."
      },
      {
        "q": "Can I drive from Cairo to Hurghada, Alexandria, Luxor, or Aswan?",
        "a": "Yes. Egypt's modern highway network makes it easy to travel between major cities and tourist destinations. Many travelers choose to rent a car for flexible road trips across the country."
      },
      {
        "q": "Is driving in Egypt safe for tourists?",
        "a": "Yes. Driving is common in major cities and tourist areas. For the best experience, follow local traffic rules, avoid driving late at night in unfamiliar areas, and use GPS navigation."
      },
      {
        "q": "What type of rental car is best for Egypt?",
        "a": "Economy cars are perfect for city driving, while SUVs are ideal for families, longer road trips, and exploring destinations across Upper Egypt, the Red Sea coast, and desert regions."
      },
      {
        "q": "Are unlimited mileage rentals available?",
        "a": "Many suppliers include unlimited mileage, while others apply mileage limits. You'll always see the mileage policy before confirming your booking."
      },
      {
        "q": "When is the best time to book a rental car in Egypt?",
        "a": "For the lowest prices and the widest vehicle selection, book 2–4 weeks in advance, especially if you're travelling during winter, Christmas, New Year, Easter, or other peak tourist seasons."
      }
    ],
    "highlights": {
      "title": "Top Destinations in Egypt",
      "subtitle": "From ancient wonders to stunning Red Sea resorts, explore Egypt's most iconic destinations at your own pace with a rental car.",
      "places": [
        {
          "name": "Giza",
          "description": "Home to the world's greatest ancient wonders, Giza is where Egypt's legendary history comes to life through breathtaking monuments that have fascinated travelers for thousands of years.",
          "image": "countries/egypt.webp",
          "tags": [
            "History",
            "UNESCO",
            "Wonders"
          ],
          "attractions": [
            {
              "name": "Pyramids of Giza",
              "description": "The Great Pyramids of Giza are the last remaining Wonder of the Ancient World and Egypt's most famous attraction. Built over 4,500 years ago, these magnificent monuments continue to amaze millions of visitors.",
              "image": "https://images.pexels.com/photos/18651379/pexels-photo-18651379.jpeg?auto=compress&cs=tinysrgb&w=800"
            },
            {
              "name": "Great Sphinx of Giza",
              "description": "Standing beside the pyramids, the Great Sphinx is one of the world's most recognizable monuments. Its mysterious appearance and impressive size have made it a symbol of Ancient Egypt for centuries.",
              "image": "https://images.pexels.com/photos/33678760/pexels-photo-33678760.jpeg?auto=compress&cs=tinysrgb&w=800"
            }
          ]
        },
        {
          "name": "Cairo",
          "description": "Egypt's vibrant capital combines ancient Islamic heritage, lively streets, world-famous museums, and unforgettable cultural experiences.",
          "image": "https://images.pexels.com/photos/26964130/pexels-photo-26964130.jpeg?auto=compress&cs=tinysrgb&w=800",
          "tags": [
            "Capital",
            "Islamic",
            "Culture"
          ],
          "attractions": [
            {
              "name": "Cairo Tower",
              "description": "The iconic Cairo Tower provides breathtaking 360-degree panoramic views of the entire city and the Nile River from one of Egypt's tallest landmarks.",
              "image": "https://images.pexels.com/photos/26964130/pexels-photo-26964130.jpeg?auto=compress&cs=tinysrgb&w=800"
            },
            {
              "name": "Khan El Khalili",
              "description": "A world-famous medieval bazaar filled with traditional shops, aromatic spices, handmade lanterns, jewelry, and bustling outdoor cafés.",
              "image": "https://images.pexels.com/photos/27730299/pexels-photo-27730299.jpeg?auto=compress&cs=tinysrgb&w=800"
            }
          ]
        },
        {
          "name": "Luxor",
          "description": "Often called the world's greatest open-air museum, Luxor preserves the magnificent temples and royal tombs of Ancient Egypt.",
          "image": "https://images.pexels.com/photos/18991560/pexels-photo-18991560.jpeg?auto=compress&cs=tinysrgb&w=800",
          "tags": [
            "History",
            "Temples",
            "UNESCO"
          ],
          "attractions": [
            {
              "name": "Karnak Temple",
              "description": "The largest religious complex ever built, Karnak Temple is famous for its giant columns, obelisks, and beautifully carved hieroglyphics.",
              "image": "https://images.pexels.com/photos/18991560/pexels-photo-18991560.jpeg?auto=compress&cs=tinysrgb&w=800"
            },
            {
              "name": "Luxor Temple",
              "description": "Located in the city center, Luxor Temple is renowned for its monumental statues, elegant architecture, and magical atmosphere after sunset.",
              "image": "https://images.pexels.com/photos/35549842/pexels-photo-35549842.jpeg?auto=compress&cs=tinysrgb&w=800"
            }
          ]
        }
      ]
    },
    "partnersDescription": "Autours partners with leading car rental providers across Egypt. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Cairo, Alexandria, Sharm El Sheikh, Hurghada, Luxor, and Aswan.",
    "ctaTitle": "Ready to Discover Egypt Your Way?",
    "ctaDescription": "Compare airport car rental deals from trusted suppliers across Cairo, Giza, Alexandria, Luxor, Aswan, Hurghada, Sharm El Sheikh, Marsa Alam, El Gouna, and more. Book in minutes, enjoy competitive prices, free cancellation on most rentals, and instant confirmation—so you can spend less time waiting and more time exploring Egypt's world-famous landmarks.",
    "ctaPrimaryText": "Search Cars Now",
    "ctaSecondaryText": "Contact Support"
  },
  "saudi": {
    "slug": "saudi",
    "name": "Saudi Arabia",
    "heroBadge": "Autours Saudi Arabia Car Rental",
    "heroTitle": "Book Your Airport Rental",
    "heroHighlight": "Across Saudi Arabia",
    "heroLead": "Search pickup availability from Riyadh, Jeddah, Dammam, and Medina airports — then choose the right car for your trip before you land.",
    "heroBottomTitle": "Search by Saudi airport and land ready to drive.",
    "travelInfo": {
      "title": "Why Autours",
      "subtitle": "Saudi Arabia's Trusted Car Rental & Travel Partner. Partnering with top-rated brands to deliver seamless, fast, and reliable airport pickup experiences right at the terminal.",
      "image": "countries/saudi.png",
      "benefits": [
        {
          "title": "Airport Pickup",
          "description": "Instant collection directly from the terminal with zero waiting time."
        },
        {
          "title": "Wide Selection",
          "description": "From budget-friendly economy cars to premium luxury SUVs for every journey."
        },
        {
          "title": "Extra Benefits",
          "description": "No hidden fees — transparent pricing you can trust, with 24/7 customer support whenever you need assistance."
        }
      ]
    },
    "steps": [
      {
        "title": "Search Instantly",
        "description": "Enter your airport, pickup date, and drop-off time in seconds."
      },
      {
        "title": "Compare Smartly",
        "description": "Browse top deals and filter by price, car type, and travel needs."
      },
      {
        "title": "Book & Drive",
        "description": "Confirm your booking online and pick up your car right at the terminal."
      }
    ],
    "documents": {
      "items": [
        "Valid driving license",
        "Passport and Visa or Iqama",
        "Credit card for deposit or payment"
      ]
    },
    "faqs": [
      {
        "q": "What do I need to rent a car?",
        "a": "Just a valid driving license, passport/Iqama, and a credit card."
      },
      {
        "q": "Can I pick up my car at the airport?",
        "a": "Yes — instant airport pickup directly at the terminal, no waiting."
      },
      {
        "q": "Are there hidden fees?",
        "a": "No hidden fees. Transparent pricing from booking to drop-off."
      },
      {
        "q": "Is support available if I need help?",
        "a": "Yes — 24/7 customer support anytime during your trip."
      },
      {
        "q": "What cars can I book?",
        "a": "Economy, family cars, SUVs, and luxury vehicles available instantly."
      }
    ],
    "highlights": {
      "title": "Top Destinations in Saudi Arabia",
      "subtitle": "Explore Saudi Arabia's breathtaking landscapes, ancient heritage sites, and modern cities with the freedom of your own rental car.",
      "places": [
        {
          "name": "Riyadh",
          "description": "Saudi Arabia's modern capital blends rich heritage with futuristic architecture, luxury shopping, and world-class cultural attractions.",
          "image": "https://images.pexels.com/photos/5625713/pexels-photo-5625713.jpeg?auto=compress&cs=tinysrgb&w=800",
          "attractions": [
            {
              "name": "Kingdom Centre Tower",
              "description": "One of Riyadh's most iconic skyscrapers, offering spectacular panoramic views of the city from its famous Sky Bridge.",
              "image": "https://images.pexels.com/photos/15839821/pexels-photo-15839821.jpeg?auto=compress&cs=tinysrgb&w=800"
            },
            {
              "name": "Masmak Fortress",
              "description": "A historic mud-brick fortress that played a key role in the unification of Saudi Arabia and remains one of Riyadh's top heritage sites.",
              "image": "https://images.pexels.com/photos/17261869/pexels-photo-17261869.jpeg?auto=compress&cs=tinysrgb&w=800"
            }
          ]
        },
        {
          "name": "Makkah",
          "description": "Makkah is the holiest city in Islam, welcoming millions of Muslims every year to perform Hajj and Umrah at the Grand Mosque.",
          "image": "https://images.pexels.com/photos/26436662/pexels-photo-26436662.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "attractions": [
            {
              "name": "Masjid al-Haram",
              "description": "The largest mosque in the world, surrounding the Holy Kaaba, serving as the spiritual center for Muslims worldwide.",
              "image": "https://images.pexels.com/photos/36573970/pexels-photo-36573970.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Abraj Al Bait (Clock Tower)",
              "description": "A landmark skyscraper complex overlooking the Grand Mosque, featuring one of the largest clock faces in the world.",
              "image": "https://images.pexels.com/photos/27291499/pexels-photo-27291499.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        },
        {
          "name": "Madinah",
          "description": "Madinah is the second holiest city in Islam, renowned for its serene atmosphere, rich Islamic history, and beautiful sacred sites.",
          "image": "https://images.pexels.com/photos/33169789/pexels-photo-33169789.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "attractions": [
            {
              "name": "Al-Masjid an-Nabawi",
              "description": "The Prophet's Mosque, established by Prophet Muhammad, famous for its iconic Green Dome and expansive marble courtyards.",
              "image": "https://images.pexels.com/photos/20277839/pexels-photo-20277839.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Quba Mosque",
              "description": "The first mosque built in Islamic history, holding immense spiritual and historical significance for visitors from around the world.",
              "image": "https://images.pexels.com/photos/15856480/pexels-photo-15856480.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        }
      ]
    }
  },
  "bahrain": {
    "slug": "bahrain",
    "name": "Bahrain",
    "heroBadge": "Autours Bahrain Airport Car Rental",
    "heroTitle": "Book Your Airport Rental",
    "heroHighlight": "Across Bahrain",
    "heroLead": "Search pickup availability from Bahrain International Airport — then choose the right car for your trip before you land.",
    "heroBottomTitle": "Search by Bahrain airport and land ready to drive.",
    "travelInfo": {
      "title": "Why Rent a Car in Bahrain with Autours?",
      "subtitle": "Discover Bahrain with the flexibility of your own rental car. Whether you're arriving at Bahrain International Airport, exploring the vibrant streets of Manama, relaxing in Amwaj Islands, shopping in Seef, or visiting Muharraq, Riffa, Isa Town, Sakhir, Zallaq, or Budaiya, Autours helps you compare trusted airport car rental deals from leading local and international suppliers. Whether you're visiting for business, a Formula 1 weekend, or a relaxing Gulf getaway, finding the right rental car is fast, simple, and affordable.",
      "image": "countries/bahrain.png",
      "benefits": [
        {
          "title": "Convenient Airport Pickup",
          "description": "Collect your rental car directly from Bahrain International Airport and start your trip as soon as you land."
        },
        {
          "title": "Compare the Best Car Rental Deals",
          "description": "Compare prices from trusted local and international rental companies to find the ideal vehicle for your journey across Bahrain."
        },
        {
          "title": "Free Cancellation on Most Bookings",
          "description": "Book with confidence thanks to flexible cancellation policies available on most rentals."
        },
        {
          "title": "Instant Booking Confirmation",
          "description": "Reserve online in minutes and receive instant confirmation before your arrival."
        }
      ]
    },
    "steps": [
      {
        "title": "Search",
        "description": "Enter your airport, dates, and times."
      },
      {
        "title": "Compare",
        "description": "Filter by price and car type."
      },
      {
        "title": "Book & Drive",
        "description": "Reserve online and hit the road."
      }
    ],
    "documents": {
      "items": [
        "Valid driving license",
        "International Driving Permit (if required)",
        "Passport",
        "Valid visa or entry permit (if applicable)",
        "Credit card in the driver's name"
      ]
    },
    "faqs": [
      {
        "q": "Do I need an International Driving Permit in Bahrain?",
        "a": "Many visitors can drive using their national driving licence, while others may need an International Driving Permit (IDP). Requirements depend on your nationality and the rental supplier."
      },
      {
        "q": "Can tourists rent a car in Bahrain?",
        "a": "Yes. Tourists can rent a car with a valid driving licence, passport, and a credit card in the main driver's name. Some nationalities may also need an International Driving Permit."
      },
      {
        "q": "What documents do I need to rent a car in Bahrain?",
        "a": "You'll usually need a valid driving licence, International Driving Permit (if required), passport, valid visa or entry permit (if applicable), and a credit card in the driver's name."
      },
      {
        "q": "What is the minimum age to rent a car in Bahrain?",
        "a": "Most suppliers require drivers to be at least 21 years old, while premium vehicles and luxury cars may require drivers to be 25 or older."
      },
      {
        "q": "Can I pick up my rental car at Bahrain International Airport?",
        "a": "Yes. Airport pickup is available, allowing you to collect your vehicle immediately after arrival and begin your journey without delay."
      },
      {
        "q": "Is driving in Bahrain easy for tourists?",
        "a": "Yes. Bahrain has modern roads, clear road signs in both Arabic and English, and relatively short driving distances, making it one of the easiest Gulf countries to explore by car."
      },
      {
        "q": "What are the best places to visit with a rental car in Bahrain?",
        "a": "A rental car makes it easy to explore Manama, Muharraq, Riffa, Seef, Amwaj Islands, Bahrain International Circuit, Tree of Life, Al Areen Wildlife Park, Bahrain Fort, and Zallaq Beach."
      },
      {
        "q": "Can I drive a rental car to Saudi Arabia?",
        "a": "Some suppliers allow travel across the King Fahd Causeway into Saudi Arabia with prior approval, additional insurance, and the required documentation. Always check the rental conditions before booking."
      },
      {
        "q": "What type of rental car is best for Bahrain?",
        "a": "Economy cars are perfect for city driving, while SUVs provide extra comfort for families, business travelers, and trips around the island."
      },
      {
        "q": "When should I book my Bahrain car rental for the best price?",
        "a": "Booking 2–4 weeks in advance usually offers the best prices and the widest choice of vehicles, especially during the Formula 1 Bahrain Grand Prix, public holidays, and peak travel seasons."
      }
    ],
    "highlights": {
      "title": "Top Destinations in Bahrain",
      "subtitle": "Discover Bahrain's rich mix of ancient history, modern luxury, and Gulf charm with the freedom of your own rental car.",
      "places": [
        {
          "name": "Manama",
          "description": "The vibrant capital of Bahrain combines modern skyscrapers, historic forts, luxury shopping, and a rich Arabian heritage.",
          "image": "https://images.pexels.com/photos/6188071/pexels-photo-6188071.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "tags": [
            "Capital",
            "Culture",
            "Shopping"
          ],
          "attractions": [
            {
              "name": "Al Fateh Grand Mosque",
              "description": "One of the largest mosques in the world, admired for its impressive dome, elegant Islamic architecture, and welcoming atmosphere.",
              "image": "https://images.pexels.com/photos/35322576/pexels-photo-35322576.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Bahrain Fort (Qal'at al-Bahrain)",
              "description": "A UNESCO World Heritage Site that preserves the remains of the ancient Dilmun civilization and offers stunning views of the coastline.",
              "image": "https://images.pexels.com/photos/37387066/pexels-photo-37387066.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        },
        {
          "name": "Muharraq",
          "description": "Muharraq is Bahrain's historic capital, celebrated for its pearl-diving heritage, traditional architecture, and cultural landmarks.",
          "image": "https://images.pexels.com/photos/37387066/pexels-photo-37387066.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "tags": [
            "UNESCO",
            "Heritage",
            "History"
          ],
          "attractions": [
            {
              "name": "Pearling Path",
              "description": "A UNESCO World Heritage Site telling the story of Bahrain's famous pearl-diving industry through historic buildings and restored houses.",
              "image": "https://images.pexels.com/photos/14722289/pexels-photo-14722289.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Sheikh Isa Bin Ali House",
              "description": "One of Bahrain's finest examples of traditional Gulf architecture, featuring beautiful courtyards and intricate wooden details.",
              "image": "https://images.pexels.com/photos/8484847/pexels-photo-8484847.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        },
        {
          "name": "Hawar Islands",
          "description": "A peaceful island paradise famous for crystal-clear waters, wildlife, and beautiful sandy beaches.",
          "image": "https://images.pexels.com/photos/37943870/pexels-photo-37943870.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "tags": [
            "Islands",
            "Nature",
            "Beaches"
          ],
          "attractions": [
            {
              "name": "Hawar Beaches",
              "description": "Relax on untouched beaches surrounded by turquoise waters and peaceful natural scenery.",
              "image": "https://images.pexels.com/photos/11435608/pexels-photo-11435608.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Marine Wildlife",
              "description": "The islands are home to dolphins, rare birds, and diverse marine life, making them a paradise for nature lovers.",
              "image": "https://images.pexels.com/photos/4621386/pexels-photo-4621386.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        }
      ]
    },
    "partnersDescription": "Autours partners with leading car rental providers across Bahrain. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Manama, Muharraq, Riffa, Seef, and Bahrain International Airport.",
    "ctaTitle": "Ready to Explore Bahrain?",
    "ctaDescription": "Compare airport car rental deals from trusted suppliers across Bahrain International Airport and enjoy the freedom to explore Manama, Muharraq, Riffa, Seef, Amwaj Islands, Sakhir, Zallaq, and more. Book in minutes with competitive prices, free cancellation on most rentals, and instant confirmation before you travel.",
    "ctaPrimaryText": "Search Cars Now",
    "ctaSecondaryText": "Contact Support"
  },
  "jordan": {
    "slug": "jordan",
    "name": "Jordan",
    "heroBadge": "Autours Jordan Airport Car Rental",
    "heroTitle": "Book Your Airport Rental",
    "heroHighlight": "Across Jordan",
    "heroLead": "Search pickup availability from Queen Alia International Airport — then choose the right car for your trip before you land.",
    "heroBottomTitle": "Search by Jordan airport and land ready to drive.",
    "travelInfo": {
      "title": "Why Rent a Car in Jordan with Autours?",
      "subtitle": "Discover Jordan with the freedom to travel at your own pace. Whether you're arriving at Queen Alia International Airport in Amman, exploring the ancient city of Petra, floating in the Dead Sea, diving in Aqaba, or visiting Wadi Rum, Jerash, Madaba, Mount Nebo, Irbid, or Ajloun, Autours lets you compare trusted car rental deals in one place.",
      "image": "countries/jordan.png",
      "benefits": [
        {
          "title": "Airport Pickup Across Jordan",
          "description": "Collect your rental car from major locations including Queen Alia International Airport, King Hussein International Airport (Aqaba), and selected city locations for a smooth start to your journey."
        },
        {
          "title": "Compare the Best Prices",
          "description": "Browse offers from leading local and international rental companies to find the right vehicle at a competitive price."
        },
        {
          "title": "Free Cancellation on Most Bookings",
          "description": "Travel with confidence thanks to flexible cancellation policies available on most rentals."
        },
        {
          "title": "Instant Booking Confirmation",
          "description": "Book online in minutes and receive instant confirmation before your arrival in Jordan."
        }
      ]
    },
    "steps": [
      {
        "title": "Search",
        "description": "Enter your airport, dates, and times."
      },
      {
        "title": "Compare",
        "description": "Filter by price and car type."
      },
      {
        "title": "Book & Drive",
        "description": "Reserve online and hit the road."
      }
    ],
    "documents": {
      "items": [
        "Valid driving license",
        "International Driving Permit (if required)",
        "Passport",
        "Valid entry visa (when applicable)",
        "Credit card in the driver's name"
      ]
    },
    "faqs": [
      {
        "q": "Can I drive a rental car to Petra?",
        "a": "Yes. Petra is easily accessible by car from Amman, Aqaba, and the Dead Sea. Renting a car is one of the most convenient ways to visit Jordan's top attractions."
      },
      {
        "q": "Can tourists rent a car in Jordan?",
        "a": "Yes. International visitors can rent a car with a valid driving licence. Many nationalities should also carry an International Driving Permit (IDP), depending on the rental company's requirements."
      },
      {
        "q": "What documents do I need to rent a car in Jordan?",
        "a": "You'll usually need a valid driving licence, International Driving Permit (if required), passport, valid entry visa (when applicable), and a credit card in the driver's name."
      },
      {
        "q": "What is the minimum age to rent a car in Jordan?",
        "a": "Most suppliers require drivers to be at least 21 years old. Luxury vehicles and larger SUVs may require drivers to be 25 or older."
      },
      {
        "q": "Is a credit card required to collect the rental car?",
        "a": "Yes. Most rental companies require a credit card in the primary driver's name for the refundable security deposit."
      },
      {
        "q": "Can I pick up my rental car at Amman Airport?",
        "a": "Yes. Airport pickup is available at Queen Alia International Airport (AMM), and rentals are also offered at King Hussein International Airport (AQJ) in Aqaba."
      },
      {
        "q": "Is it easy to drive between Jordan's major attractions?",
        "a": "Yes. Jordan has a well-developed road network connecting Amman, Petra, Dead Sea, Wadi Rum, Aqaba, Jerash, Madaba, and Mount Nebo, making self-drive travel a popular option."
      },
      {
        "q": "Can I drive a rental car into Israel or Saudi Arabia?",
        "a": "Cross-border travel is generally restricted or requires special approval, insurance, and documentation. Check your supplier's rental terms before booking."
      },
      {
        "q": "What type of rental car is best for Jordan?",
        "a": "Economy cars are ideal for city driving and highways, while SUVs offer extra comfort for families and longer trips to destinations like Wadi Rum or Dana Biosphere Reserve."
      },
      {
        "q": "When should I book my Jordan car rental for the best price?",
        "a": "Booking two to four weeks in advance usually provides better prices and a wider selection of vehicles, especially during spring, holidays, and peak tourist seasons."
      }
    ],
    "highlights": {
      "title": "Top Destinations in Jordan",
      "subtitle": "From the ancient city of Petra to the magical desert of Wadi Rum, explore Jordan's extraordinary treasures with the freedom of your own rental car.",
      "places": [
        {
          "name": "Petra",
          "description": "Petra, the legendary Rose City, is one of the New Seven Wonders of the World and Jordan's most iconic destination.",
          "image": "https://images.pexels.com/photos/31831562/pexels-photo-31831562.jpeg?auto=compress&cs=tinysrgb&w=800",
          "tags": [
            "UNESCO",
            "Wonder",
            "Ancient"
          ],
          "attractions": [
            {
              "name": "The Treasury (Al-Khazneh)",
              "description": "Petra's most famous landmark, carved directly into pink sandstone cliffs, is one of the world's greatest archaeological masterpieces.",
              "image": "https://images.pexels.com/photos/18717341/pexels-photo-18717341.jpeg?auto=compress&cs=tinysrgb&w=800"
            },
            {
              "name": "The Siq",
              "description": "A dramatic narrow canyon that serves as the breathtaking entrance to the ancient city of Petra.",
              "image": "https://images.pexels.com/photos/5484876/pexels-photo-5484876.jpeg?auto=compress&cs=tinysrgb&w=800"
            }
          ]
        },
        {
          "name": "Amman",
          "description": "Jordan's capital blends ancient history with modern culture, offering impressive Roman ruins, lively markets, and authentic Middle Eastern experiences.",
          "image": "https://images.pexels.com/photos/18717579/pexels-photo-18717579.jpeg?auto=compress&cs=tinysrgb&w=800",
          "tags": [
            "Capital",
            "History",
            "Culture"
          ],
          "attractions": [
            {
              "name": "Amman Citadel",
              "description": "A historic hilltop site featuring ancient temples, palaces, and panoramic views overlooking the city.",
              "image": "https://images.pexels.com/photos/18717593/pexels-photo-18717593.jpeg?auto=compress&cs=tinysrgb&w=800"
            },
            {
              "name": "Roman Theatre",
              "description": "A beautifully preserved Roman amphitheater that remains one of Jordan's most important historical landmarks.",
              "image": "https://images.pexels.com/photos/37340519/pexels-photo-37340519.jpeg?auto=compress&cs=tinysrgb&w=800"
            }
          ]
        }
      ]
    },
    "partnersDescription": "Autours partners with leading car rental providers across Jordan. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Amman, Aqaba, and other major hubs.",
    "ctaTitle": "Ready to Explore Jordan?",
    "ctaDescription": "Compare airport car rental deals from trusted suppliers across Amman, Aqaba, and other major locations. Drive to Petra, Wadi Rum, the Dead Sea, Jerash, Madaba, and beyond with competitive prices, free cancellation on most bookings, and instant confirmation.",
    "ctaPrimaryText": "Search Cars Now",
    "ctaSecondaryText": "Contact Support"
  },
  "kuwait": {
    "slug": "kuwait",
    "name": "Kuwait",
    "heroBadge": "Autours Kuwait Airport Car Rental",
    "heroTitle": "Book Your Airport Rental",
    "heroHighlight": "Across Kuwait",
    "heroLead": "Search pickup availability from Kuwait International Airport — then choose the right car.",
    "heroBottomTitle": "Search by Kuwait airport and land ready to drive.",
    "travelInfo": {
      "title": "Why Rent a Car in Kuwait with Autours?",
      "subtitle": "Explore Kuwait with the freedom to travel on your own schedule. Whether you're arriving at Kuwait International Airport, visiting Kuwait City for business, relaxing in Salmiya, shopping in Hawally, or heading to Mahboula, Fahaheel, Farwaniya, Jahra, Mangaf, or Sabah Al Ahmad Sea City, Autours helps you compare the best airport car rental deals from trusted suppliers.",
      "image": "countries/kuwait.png",
      "benefits": [
        {
          "title": "Convenient Airport Pickup",
          "description": "Collect your rental car directly from Kuwait International Airport and start your journey without waiting for taxis or public transport."
        },
        {
          "title": "Compare the Best Deals",
          "description": "Compare prices from leading local and international car rental companies to find the perfect vehicle at a competitive rate."
        },
        {
          "title": "Free Cancellation on Most Bookings",
          "description": "Enjoy flexible travel plans with free cancellation available on most reservations."
        },
        {
          "title": "Instant Booking Confirmation",
          "description": "Reserve your vehicle online in minutes and receive instant confirmation."
        }
      ]
    },
    "steps": [
      {
        "title": "Search",
        "description": "Enter your airport, dates, and times."
      },
      {
        "title": "Compare",
        "description": "Filter by price and car type."
      },
      {
        "title": "Book & Drive",
        "description": "Reserve online and hit the road."
      }
    ],
    "documents": {
      "items": [
        "Valid driving license",
        "Passport with valid entry visa (if required)",
        "Credit card in the main driver's name",
        "International Driving Permit (IDP) where applicable"
      ]
    },
    "faqs": [
      {
        "q": "What is the minimum age to rent a car in Kuwait?",
        "a": "The standard minimum age is 21, though luxury categories may require the driver to be 25 years or older."
      },
      {
        "q": "Do I need a credit card to rent a car in Kuwait?",
        "a": "Yes. Most suppliers require a credit card in the main driver's name to hold the security deposit upon vehicle collection."
      },
      {
        "q": "What documents do I need to rent a car in Kuwait?",
        "a": "You will typically need a valid national driving license, passport, visa (if tourist), credit card, and an International Driving Permit (IDP) depending on your license origin."
      }
    ],
    "highlights": {
      "title": "Top Destinations in Kuwait",
      "subtitle": "Explore Kuwait's blend of modernity, Arabian heritage, and Gulf coastline with the convenience of your own rental car.",
      "places": [
        {
          "name": "Kuwait City",
          "description": "Kuwait City blends modern architecture, rich Arabian heritage, and beautiful waterfront attractions along the Arabian Gulf.",
          "image": "https://images.pexels.com/photos/17348004/pexels-photo-17348004.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "attractions": [
            {
              "name": "Kuwait Towers",
              "description": "The country's most famous landmark, featuring panoramic viewing spheres overlooking Kuwait City and the Gulf.",
              "image": "https://images.pexels.com/photos/38707730/pexels-photo-38707730.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Grand Mosque",
              "description": "The largest mosque in Kuwait, renowned for its magnificent Islamic architecture, grand prayer hall, and detailed craftsmanship.",
              "image": "https://images.pexels.com/photos/36225674/pexels-photo-36225674.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        },
        {
          "name": "Salmiya",
          "description": "A major commercial and cultural hub famous for vibrant shopping districts, seaside promenades, and family attractions.",
          "image": "https://images.pexels.com/photos/6720242/pexels-photo-6720242.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "attractions": [
            {
              "name": "The Scientific Center",
              "description": "A world-class educational facility featuring one of the largest aquariums in the Middle East, IMAX theater, and dhow harbor.",
              "image": "https://images.pexels.com/photos/26902990/pexels-photo-26902990.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Marina Mall & Beach",
              "description": "A premier shopping and entertainment destination with a picturesque marina, seaside dining, and sandy beach promenade.",
              "image": "https://images.pexels.com/photos/11062557/pexels-photo-11062557.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        },
        {
          "name": "Al Ahmadi",
          "description": "Located in southern Kuwait, Al Ahmadi is known for its beautiful parks, modern coastal developments, and tranquil beach resorts.",
          "image": "https://images.pexels.com/photos/1154498/pexels-photo-1154498.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "attractions": [
            {
              "name": "Al Kout Mall & Waterfront",
              "description": "Kuwait's largest waterfront retail and leisure destination, featuring dancing fountains, traditional souks, and marina views.",
              "image": "https://images.pexels.com/photos/34456311/pexels-photo-34456311.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Al Khiran Resort",
              "description": "A popular coastal getaway offering luxury chalets, water sports, pristine beaches, and family relaxation along the Gulf.",
              "image": "https://images.pexels.com/photos/32277097/pexels-photo-32277097.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        }
      ]
    },
    "partnersDescription": "Autours partners with leading car rental providers across Kuwait. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Kuwait City, Salmiya, Hawally, and Kuwait International Airport.",
    "ctaTitle": "Ready to Explore Kuwait?",
    "ctaDescription": "Compare car rental deals from trusted suppliers across Kuwait City, Salmiya, Kuwait International Airport, and other locations. Book in minutes, enjoy competitive rates, free cancellation on most rentals, and instant confirmation.",
    "ctaPrimaryText": "Search Cars Now",
    "ctaSecondaryText": "Contact Support"
  },
  "oman": {
    "slug": "oman",
    "name": "Oman",
    "heroBadge": "Autours Oman Airport Car Rental",
    "heroTitle": "Book Your Airport Rental",
    "heroHighlight": "Across Oman",
    "heroLead": "Search pickup availability from Muscat and Salalah airports — then choose the right car.",
    "heroBottomTitle": "Search by Oman airport and land ready to drive.",
    "travelInfo": {
      "title": "Why Rent a Car in Oman with Autours?",
      "subtitle": "Explore Oman on your own schedule with trusted airport car rentals from leading local and international suppliers. Whether you're arriving in Muscat for business, discovering the historic forts of Nizwa, relaxing on the beaches of Salalah, or planning an adventure to Jebel Akhdar, Jebel Shams, Sur, Sohar, Duqm, or Khasab, Autours helps you compare the best rental deals in one place.",
      "image": "countries/oman.png",
      "benefits": [
        {
          "title": "Nationwide Airport Coverage",
          "description": "Pick up your rental car from major Oman airports and enjoy easy access to Muscat, Salalah, Nizwa, Sohar, Sur, Bahla, Rustaq, Duqm, Khasab, Wahiba Sands, Wadi Shab, Wadi Bani Khalid, and more."
        },
        {
          "title": "Compare the Best Prices",
          "description": "Instantly compare offers from trusted local and international rental companies to find the right car at the best price."
        },
        {
          "title": "Free Cancellation on Most Bookings",
          "description": "Travel with confidence thanks to flexible cancellation policies available on most rentals."
        },
        {
          "title": "Instant Booking Confirmation",
          "description": "Reserve online in minutes and receive immediate confirmation, so your car is ready when you arrive."
        }
      ]
    },
    "steps": [
      {
        "title": "Search",
        "description": "Enter your airport, dates, and times."
      },
      {
        "title": "Compare",
        "description": "Filter by price and car type."
      },
      {
        "title": "Book & Drive",
        "description": "Reserve online and hit the road."
      }
    ],
    "documents": {
      "items": [
        "Valid driving license",
        "Passport with valid entry visa (if required)",
        "Credit card in the main driver's name",
        "International Driving Permit (when applicable)"
      ]
    },
    "faqs": [
      {
        "q": "Do I need a 4x4 to explore Oman?",
        "a": "Not always. A standard car is suitable for cities such as Muscat, Nizwa, Sohar, and Salalah. If you plan to visit Jebel Shams, Jebel Akhdar, Wadi Bani Awf, or remote desert areas, a 4WD vehicle is highly recommended."
      },
      {
        "q": "Can tourists rent a car in Oman?",
        "a": "Yes. Visitors can rent a car with a valid driving licence. Depending on your nationality, you may also need an International Driving Permit (IDP) together with your passport."
      },
      {
        "q": "What is the minimum age to rent a car in Oman?",
        "a": "Most suppliers require drivers to be at least 21 years old. Some premium vehicles and SUVs may require drivers to be 25 or older."
      },
      {
        "q": "Is a credit card required when collecting the car?",
        "a": "Yes. Most rental companies require a credit card in the main driver's name to cover the refundable security deposit."
      },
      {
        "q": "What documents do I need to rent a car in Oman?",
        "a": "You'll usually need a valid driving licence, passport, entry visa (if required), credit card in the driver's name, and an International Driving Permit (when applicable)."
      },
      {
        "q": "Which airports can I rent a car from in Oman?",
        "a": "Autours offers airport car rentals at major locations, including Muscat International Airport, Salalah International Airport, Sohar Airport, and Duqm Airport, with availability depending on your travel dates."
      },
      {
        "q": "Are unlimited mileage rentals available?",
        "a": "Many suppliers include unlimited mileage, while others apply daily or total mileage limits. The mileage policy is always displayed before you book."
      },
      {
        "q": "Can I drive a rental car from Oman to the UAE?",
        "a": "Some suppliers allow cross-border travel to the UAE with prior approval and additional insurance. Availability varies by rental company."
      },
      {
        "q": "What type of car should I rent in Oman?",
        "a": "Economy cars are ideal for city driving and highways, while SUVs and 4x4 vehicles are the best choice for mountain roads, desert trips, and destinations like Jebel Shams, Jebel Akhdar, and Wahiba Sands."
      },
      {
        "q": "When is the best time to book a rental car in Oman?",
        "a": "Booking at least two to four weeks before your trip usually gives you the widest vehicle selection and the best prices, especially during holidays and the Khareef season in Salalah."
      }
    ],
    "highlights": {
      "title": "Top Destinations in Oman",
      "subtitle": "Discover Oman's stunning blend of dramatic wadis, ancient fortresses, golden deserts, and pristine coastline with a rental car.",
      "places": [
        {
          "name": "Muscat",
          "description": "Muscat blends traditional Arabian charm with stunning coastal scenery, historic forts, elegant mosques, and vibrant local markets.",
          "image": "https://images.pexels.com/photos/27222917/pexels-photo-27222917.jpeg?auto=compress&cs=tinysrgb&w=800",
          "tags": [
            "Capital",
            "Culture",
            "Heritage"
          ],
          "attractions": [
            {
              "name": "Sultan Qaboos Grand Mosque",
              "description": "One of the most beautiful mosques in the Middle East, featuring magnificent Islamic architecture, a massive prayer hall, and one of the world's largest handmade carpets.",
              "image": "https://images.pexels.com/photos/37417544/pexels-photo-37417544.jpeg?auto=compress&cs=tinysrgb&w=800"
            },
            {
              "name": "Al Jalali Fort",
              "description": "Overlooking Muscat Harbor, Al Jalali Fort is a historic Portuguese fortress offering spectacular coastal views and a glimpse into Oman's rich history.",
              "image": "https://images.pexels.com/photos/10602398/pexels-photo-10602398.jpeg?auto=compress&cs=tinysrgb&w=800"
            }
          ]
        },
        {
          "name": "Nizwa",
          "description": "Nizwa is one of Oman's oldest cities, known for its historic forts, traditional markets, and breathtaking mountain scenery.",
          "image": "https://images.pexels.com/photos/38036757/pexels-photo-38036757.jpeg?auto=compress&cs=tinysrgb&w=800",
          "tags": [
            "History",
            "Forts",
            "Heritage"
          ],
          "attractions": [
            {
              "name": "Nizwa Fort",
              "description": "One of Oman's most famous landmarks, Nizwa Fort features a massive circular tower and offers panoramic views of the surrounding oasis.",
              "image": "https://images.pexels.com/photos/38036752/pexels-photo-38036752.jpeg?auto=compress&cs=tinysrgb&w=800"
            },
            {
              "name": "Nizwa Souq",
              "description": "A lively traditional market where visitors can shop for silver jewelry, pottery, dates, spices, and handcrafted souvenirs.",
              "image": "https://images.pexels.com/photos/34404318/pexels-photo-34404318.jpeg?auto=compress&cs=tinysrgb&w=800"
            }
          ]
        },
        {
          "name": "Salalah",
          "description": "Salalah is famous for its tropical landscapes, beautiful beaches, waterfalls, and lush greenery during the annual Khareef season.",
          "image": "https://images.pexels.com/photos/33113407/pexels-photo-33113407.jpeg?auto=compress&cs=tinysrgb&w=800",
          "tags": [
            "Nature",
            "Beaches",
            "Monsoon"
          ],
          "attractions": [
            {
              "name": "Al Mughsail Beach",
              "description": "A stunning white-sand beach known for dramatic cliffs, crystal-clear waters, and natural blowholes.",
              "image": "https://images.pexels.com/photos/27860738/pexels-photo-27860738.jpeg?auto=compress&cs=tinysrgb&w=800"
            }
          ]
        }
      ]
    },
    "partnersDescription": "Autours partners with leading car rental providers across Oman. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Muscat, Salalah, Sohar, Duqm, and major airports.",
    "ctaTitle": "Ready to Explore Oman?",
    "ctaDescription": "Compare car rental deals from trusted suppliers across Muscat, Salalah, Sohar, Duqm, and other major Oman airports. Book in minutes, enjoy competitive rates, free cancellation on most rentals, and instant confirmation before you travel.",
    "ctaPrimaryText": "Search Cars Now",
    "ctaSecondaryText": "Contact Support"
  },
  "qatar": {
    "slug": "qatar",
    "name": "Qatar",
    "heroBadge": "Autours Qatar Airport Car Rental",
    "heroTitle": "Book Your Airport Rental",
    "heroHighlight": "Across Qatar",
    "heroLead": "Compare the best car rental deals from trusted local and international suppliers across Doha, Hamad International Airport (DOH), Lusail, Al Wakrah, and major destinations throughout Qatar. Enjoy transparent pricing, fast booking, and reliable service every time.",
    "heroBottomTitle": "Search by Qatar airport and land ready to drive.",
    "travelInfo": {
      "title": "Why Choose Autours?",
      "subtitle": "Qatar's Trusted Car Rental Partner",
      "image": "countries/qatar.png",
      "benefits": [
        {
          "title": "Airport Pickup",
          "description": "Pick up your rental car within minutes of landing at Hamad International Airport (DOH) and start your journey without delays."
        },
        {
          "title": "Best Price Guarantee",
          "description": "Compare offers from trusted car rental companies to secure the best value for your trip across Qatar."
        },
        {
          "title": "No Hidden Fees",
          "description": "Transparent pricing with no unexpected charges and basic insurance included."
        },
        {
          "title": "24/7 Customer Support",
          "description": "Our dedicated support team is available around the clock to assist you before, during, and after your rental."
        }
      ]
    },
    "steps": [
      {
        "title": "Search",
        "description": "Enter your airport, dates, and times."
      },
      {
        "title": "Compare",
        "description": "Filter by price and car type."
      },
      {
        "title": "Book & Drive",
        "description": "Reserve online and hit the road."
      }
    ],
    "documents": {
      "items": [
        "Valid driving license",
        "Passport with valid entry visa",
        "Credit card in driver's name"
      ]
    },
    "faqs": [
      {
        "q": "Can tourists rent a car in Qatar?",
        "a": "Yes. Most visitors can rent a car in Qatar using a valid driving license. Depending on your nationality, you may also need an International Driving Permit (IDP). Always check the supplier's requirements before booking."
      },
      {
        "q": "What documents do I need to rent a car in Qatar?",
        "a": "You'll typically need a valid passport, driving license, credit card in the main driver's name, and, where required, an International Driving Permit."
      },
      {
        "q": "Can I rent a car at Hamad International Airport (DOH)?",
        "a": "Yes. Many leading car rental companies operate at Hamad International Airport (DOH), allowing you to collect your vehicle shortly after arrival."
      },
      {
        "q": "How much does it cost to rent a car in Qatar?",
        "a": "Prices vary depending on the season, vehicle type, rental duration, and supplier. Economy cars are usually the most affordable, while SUVs and luxury vehicles cost more."
      },
      {
        "q": "Is insurance included with my rental?",
        "a": "Most rentals include basic insurance. Additional coverage options, such as Collision Damage Waiver (CDW) or full protection, can usually be added during the booking process."
      },
      {
        "q": "Are there any hidden fees?",
        "a": "No. Autours displays transparent pricing so you can review the total cost before confirming your booking. Optional extras and supplier-specific policies are shown during checkout."
      },
      {
        "q": "Can I cancel my booking for free?",
        "a": "Yes. Many suppliers offer free cancellation up to 24 hours before pickup. Check the cancellation policy shown for your selected vehicle before completing your reservation."
      },
      {
        "q": "Can I drive from Qatar to another country with a rental car?",
        "a": "Cross-border travel is generally not permitted unless explicitly approved by the rental company. Always check the supplier's terms before making travel plans."
      },
      {
        "q": "What is the minimum age to rent a car in Qatar?",
        "a": "Most rental companies require drivers to be at least 21 years old, while some vehicle categories may require drivers to be 25 or older."
      },
      {
        "q": "Which cities can I rent a car in Qatar?",
        "a": "You can book rental cars in Doha, at Hamad International Airport (DOH), and other major locations across Qatar, depending on supplier availability."
      }
    ],
    "highlights": {
      "title": "Top Destinations in Qatar",
      "subtitle": "Discover Qatar's extraordinary blend of futuristic architecture, rich Islamic heritage, and stunning desert landscapes with the freedom of your own rental car.",
      "places": [
        {
          "name": "Doha",
          "description": "Doha is a modern waterfront city where futuristic skyscrapers meet traditional Arabian heritage, world-class museums, and luxury shopping.",
          "image": "https://images.pexels.com/photos/19748320/pexels-photo-19748320.jpeg?auto=compress&cs=tinysrgb&w=800",
          "tags": [
            "Capital",
            "Modern",
            "Culture"
          ],
          "attractions": [
            {
              "name": "Museum of Islamic Art",
              "description": "One of the world's finest museums, displaying extraordinary Islamic art from across centuries and civilizations.",
              "image": "https://images.pexels.com/photos/19748320/pexels-photo-19748320.jpeg?auto=compress&cs=tinysrgb&w=800"
            },
            {
              "name": "Doha Corniche",
              "description": "A scenic waterfront promenade offering spectacular views of Doha's skyline and the Arabian Gulf.",
              "image": "https://images.pexels.com/photos/35158205/pexels-photo-35158205.jpeg?auto=compress&cs=tinysrgb&w=800"
            }
          ]
        }
      ]
    },
    "partnersDescription": "Autours partners with leading car rental providers across Qatar. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Doha, Lusail, Al Wakrah, and Hamad International Airport (DOH).",
    "ctaTitle": "Find Your Perfect Car Rental in Qatar",
    "ctaDescription": "Whether you're arriving at Hamad International Airport or exploring Doha, Lusail, or Al Wakrah, compare prices from trusted suppliers and book with confidence. Free cancellation, transparent pricing, and instant confirmation included.",
    "ctaPrimaryText": "Find the Best Deal",
    "ctaSecondaryText": "Get Support"
  },
  "turkey": {
    "slug": "turkey",
    "name": "Turkey",
    "heroBadge": "Autours Turkey Airport Car Rental",
    "heroTitle": "Book Your Airport Rental",
    "heroHighlight": "Across Turkey",
    "heroLead": "Search pickup availability from Istanbul, Antalya, Izmir, Ankara, and Dalaman airports — then choose the right car.",
    "heroBottomTitle": "Search by Turkey airport and land ready to drive.",
    "travelInfo": {
      "title": "Why Rent a Car in Turkey with Autours?",
      "subtitle": "Discover Turkey with the freedom to travel beyond the tourist hotspots. Whether you're exploring the vibrant streets of Istanbul, the fairy chimneys of Cappadocia, the Mediterranean coast of Antalya, the beaches of Bodrum, or the historic cities of Izmir, Ankara, Fethiye, Marmaris, Kuşadası, Trabzon, or Pamukkale, Autours helps you compare trusted airport car rental deals from leading local and international suppliers.\n\nFrom city breaks and coastal escapes to scenic road trips across the Turkish Riviera, enjoy the flexibility to travel at your own pace.",
      "image": "countries/turkey.png",
      "benefits": [
        {
          "title": "Airport Pickup Across Turkey",
          "description": "Collect your rental car from major airports, including Istanbul Airport (IST), Sabiha Gökçen Airport (SAW), Antalya Airport (AYT), Izmir Adnan Menderes Airport (ADB), Ankara Esenboğa Airport (ESB), Dalaman Airport (DLM), Milas-Bodrum Airport (BJV), Kayseri Airport (ASR), and many more."
        },
        {
          "title": "Compare the Best Car Rental Deals",
          "description": "Compare prices from trusted local and international suppliers to find the right vehicle for your holiday, business trip, or road adventure across Turkey."
        },
        {
          "title": "Free Cancellation on Most Bookings",
          "description": "Enjoy flexible travel plans with free cancellation available on most reservations."
        },
        {
          "title": "Instant Booking Confirmation",
          "description": "Book your rental car online in minutes and receive instant confirmation before your flight."
        }
      ]
    },
    "steps": [
      {
        "title": "Search",
        "description": "Enter your airport, dates, and times."
      },
      {
        "title": "Compare",
        "description": "Filter by price and car type."
      },
      {
        "title": "Book & Drive",
        "description": "Reserve online and hit the road."
      }
    ],
    "documents": {
      "items": [
        "Valid driving license",
        "Passport with valid entry visa (if required)",
        "Credit card in the main driver's name",
        "International Driving Permit (IDP) where applicable"
      ]
    },
    "faqs": [
      {
        "q": "What is the minimum age to rent a car in Turkey?",
        "a": "Most rental companies require drivers to be at least 21 years old. Premium vehicles and luxury cars may require drivers to be 25 years or older."
      },
      {
        "q": "Do I need a credit card to rent a car in Turkey?",
        "a": "Yes. Most suppliers require a credit card in the main driver's name to cover the refundable security deposit."
      },
      {
        "q": "What documents do I need to rent a car in Turkey?",
        "a": "You'll usually need a valid driving licence, passport, credit card in the main driver's name, and an International Driving Permit (IDP), if required for your nationality."
      },
      {
        "q": "Can tourists rent a car in Turkey?",
        "a": "Yes. International visitors can rent a car with a valid driving licence. Some nationalities may also need an International Driving Permit."
      },
      {
        "q": "Which airports can I pick up my rental car from?",
        "a": "Autours offers airport car rentals at major Turkish airports, including Istanbul, Antalya, Izmir, Ankara, Dalaman, Bodrum, Kayseri, Trabzon, Gaziantep, and many more."
      },
      {
        "q": "Is driving in Turkey easy for tourists?",
        "a": "Yes. Turkey has an extensive motorway network connecting major cities and tourist destinations. Road signs are clear, and driving is generally straightforward for international visitors."
      },
      {
        "q": "Can I drive from Istanbul to Cappadocia or Antalya?",
        "a": "Yes. Renting a car is a popular way to explore Turkey. Many travelers enjoy road trips between Istanbul, Ankara, Cappadocia, Pamukkale, Antalya, Fethiye, Marmaris, Izmir, and Bodrum."
      },
      {
        "q": "What type of rental car is best for Turkey?",
        "a": "Economy cars are ideal for city driving, while SUVs offer extra comfort for mountain routes, family holidays, and longer road trips across the country."
      },
      {
        "q": "Are unlimited mileage rentals available?",
        "a": "Many suppliers offer unlimited mileage, while others have mileage limits. The mileage policy is always displayed before you complete your booking."
      },
      {
        "q": "When should I book my Turkey car rental for the best price?",
        "a": "Booking 2–4 weeks in advance usually gives you the best prices and the widest selection of vehicles, especially during the summer season, public holidays, and school vacations."
      }
    ],
    "highlights": {
      "title": "Top Destinations in Turkey",
      "subtitle": "From Istanbul's legendary skyline to the fairy chimneys of Cappadocia and the turquoise shores of the Turkish Riviera, Turkey rewards every type of traveler.",
      "places": [
        {
          "name": "Istanbul",
          "description": "A timeless city where Europe meets Asia, Istanbul is famous for its rich history, magnificent architecture, vibrant bazaars, and breathtaking views along the Bosphorus.",
          "image": "https://images.pexels.com/photos/20577444/pexels-photo-20577444.jpeg?auto=compress&cs=tinysrgb&w=800",
          "tags": [
            "History",
            "Culture",
            "UNESCO"
          ],
          "attractions": [
            {
              "name": "Hagia Sophia",
              "description": "One of the world's greatest architectural masterpieces, Hagia Sophia has served as a cathedral, mosque, and museum throughout its remarkable history. Its massive dome and stunning mosaics make it a must-visit landmark.",
              "image": "https://images.pexels.com/photos/18435934/pexels-photo-18435934.jpeg?auto=compress&cs=tinysrgb&w=800"
            },
            {
              "name": "Blue Mosque",
              "description": "Officially known as the Sultan Ahmed Mosque, this iconic landmark is admired for its six minarets, elegant blue Iznik tiles, and impressive Ottoman architecture.",
              "image": "https://images.pexels.com/photos/32570928/pexels-photo-32570928.jpeg?auto=compress&cs=tinysrgb&w=800"
            }
          ]
        },
        {
          "name": "Cappadocia",
          "description": "Cappadocia is one of Turkey's most magical destinations, known for its fairy chimneys, cave hotels, underground cities, and unforgettable hot air balloon rides.",
          "image": "https://images.pexels.com/photos/17373456/pexels-photo-17373456.jpeg?auto=compress&cs=tinysrgb&w=800",
          "tags": [
            "Unique",
            "Balloons",
            "Adventure"
          ],
          "attractions": [
            {
              "name": "Hot Air Balloon Experience",
              "description": "Watching hundreds of colorful balloons rise above Cappadocia at sunrise is one of the world's most unforgettable travel experiences.",
              "image": "https://images.pexels.com/photos/3027216/pexels-photo-3027216.jpeg?auto=compress&cs=tinysrgb&w=800"
            },
            {
              "name": "Göreme Open Air Museum",
              "description": "A UNESCO World Heritage Site featuring ancient rock-cut churches decorated with beautiful Byzantine frescoes.",
              "image": "https://images.pexels.com/photos/27099436/pexels-photo-27099436.jpeg?auto=compress&cs=tinysrgb&w=800"
            }
          ]
        },
        {
          "name": "Antalya",
          "description": "Located on Turkey's Mediterranean coast, Antalya combines golden beaches, ancient ruins, luxury resorts, and spectacular natural beauty.",
          "image": "https://images.pexels.com/photos/22921961/pexels-photo-22921961.jpeg?auto=compress&cs=tinysrgb&w=800",
          "tags": [
            "Beaches",
            "History",
            "Riviera"
          ],
          "attractions": [
            {
              "name": "Konyaaltı Beach",
              "description": "A beautiful Blue Flag beach with crystal-clear water, mountain views, restaurants, and a lively seaside promenade.",
              "image": "https://images.pexels.com/photos/38595664/pexels-photo-38595664.jpeg?auto=compress&cs=tinysrgb&w=800"
            },
            {
              "name": "Hadrian's Gate",
              "description": "Built in honor of the Roman Emperor Hadrian, this beautifully preserved gateway is one of Antalya's most famous historical landmarks.",
              "image": "https://images.pexels.com/photos/16155200/pexels-photo-16155200.jpeg?auto=compress&cs=tinysrgb&w=800"
            }
          ]
        }
      ]
    },
    "partnersDescription": "Autours partners with leading car rental providers across Turkey. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Istanbul, Antalya, Izmir, Ankara, and major airports.",
    "ctaTitle": "Ready to Explore Turkey?",
    "ctaDescription": "Compare airport car rental deals from trusted suppliers across Istanbul, Antalya, Cappadocia, Izmir, Ankara, Bodrum, Dalaman, Fethiye, Marmaris, Trabzon, and more. Book in minutes with competitive prices, free cancellation on most rentals, and instant confirmation—so you can start exploring Turkey the moment you arrive.",
    "ctaPrimaryText": "Search Cars Now",
    "ctaSecondaryText": "Contact Support"
  },
  "morocco": {
    "slug": "morocco",
    "name": "Morocco",
    "heroBadge": "Autours Morocco Airport Car Rental",
    "heroTitle": "Book Your Airport Rental",
    "heroHighlight": "Across Morocco",
    "heroLead": "Search pickup availability from Casablanca, Marrakech, Agadir, Fes, and Tangier airports — then choose the right car.",
    "heroBottomTitle": "Search by Morocco airport and land ready to drive.",
    "travelInfo": {
      "title": "Why Rent a Car in Morocco with Autours?",
      "subtitle": "Experience Morocco with the freedom to explore beyond the usual tourist routes. Whether you're arriving in Casablanca, discovering the blue streets of Chefchaouen, wandering the vibrant souks of Marrakech, or visiting Fes, Tangier, Rabat, Essaouira, Ouarzazate, Merzouga, or the Atlas Mountains, Autours helps you compare trusted airport car rental deals from leading local and international suppliers.\n\nFrom coastal road trips to desert adventures and imperial city tours, renting a car gives you the flexibility to experience Morocco on your own schedule.",
      "image": "countries/morocco.png",
      "benefits": [
        {
          "title": "Airport Pickup Across Morocco",
          "description": "Collect your rental car from major airports, including Mohammed V International Airport (Casablanca), Marrakech Menara Airport, Agadir Al Massira Airport, Fès–Saïss Airport, Tangier Ibn Battuta Airport, Rabat–Salé Airport, Oujda Angads Airport, Nador Airport, and other key locations across Morocco."
        },
        {
          "title": "Compare the Best Car Rental Deals",
          "description": "Compare offers from trusted local and international rental companies to find the perfect vehicle for city breaks, business trips, family holidays, or scenic road trips across Morocco."
        },
        {
          "title": "Free Cancellation on Most Bookings",
          "description": "Book with confidence thanks to flexible cancellation policies available on most rentals."
        },
        {
          "title": "Instant Booking Confirmation",
          "description": "Reserve your rental car online in minutes and receive instant confirmation before you arrive."
        }
      ]
    },
    "steps": [
      {
        "title": "Search",
        "description": "Enter your airport, dates, and times."
      },
      {
        "title": "Compare",
        "description": "Filter by price and car type."
      },
      {
        "title": "Book & Drive",
        "description": "Reserve online and hit the road."
      }
    ],
    "documents": {
      "items": [
        "Valid driving license",
        "Passport with valid entry visa (if required)",
        "Credit card in the main driver's name",
        "International Driving Permit (IDP) where applicable"
      ]
    },
    "faqs": [
      {
        "q": "What is the minimum age to rent a car in Morocco?",
        "a": "Most rental companies require drivers to be at least 21 years old. Some premium vehicles and luxury SUVs may require drivers to be 25 years or older."
      },
      {
        "q": "Do I need a credit card to rent a car in Morocco?",
        "a": "Yes. Most suppliers require a credit card in the main driver's name to cover the refundable security deposit when collecting the vehicle."
      },
      {
        "q": "What documents do I need to rent a car in Morocco?",
        "a": "You'll usually need a valid driving licence, passport, credit card in the main driver's name, International Driving Permit (IDP) if required for your nationality, and a valid visa or entry permit (where applicable)."
      },
      {
        "q": "Can tourists rent a car in Morocco?",
        "a": "Yes. International visitors can rent a car using a valid driving licence. Depending on your nationality and the supplier's policy, an International Driving Permit may also be required."
      },
      {
        "q": "Which airports can I collect my rental car from?",
        "a": "Autours offers airport car rental at major Moroccan airports, including Casablanca, Marrakech, Agadir, Fes, Tangier, Rabat, Oujda, and other popular destinations."
      },
      {
        "q": "Is driving in Morocco easy for tourists?",
        "a": "Yes. Morocco has an extensive road network connecting major cities and tourist attractions. Modern highways make it easy to travel between destinations such as Casablanca, Rabat, Marrakech, Agadir, and Fes."
      },
      {
        "q": "Can I drive from Casablanca to Marrakech or Chefchaouen?",
        "a": "Yes. Renting a car is one of the best ways to explore Morocco. Popular road trips include Casablanca, Rabat, Chefchaouen, Fes, Marrakech, Essaouira, Agadir, Merzouga, and the Atlas Mountains."
      },
      {
        "q": "What type of rental car is best for Morocco?",
        "a": "Economy cars are ideal for city travel and highways, while SUVs are recommended for mountain roads, desert excursions, and longer journeys through the Atlas Mountains or to Merzouga."
      },
      {
        "q": "Are unlimited mileage rentals available?",
        "a": "Many suppliers offer unlimited mileage, while others apply mileage limits. You'll always see the mileage policy before confirming your reservation."
      },
      {
        "q": "When should I book my Morocco car rental for the best price?",
        "a": "Booking 2–4 weeks in advance usually gives you the best prices and the widest choice of vehicles, especially during spring, summer holidays, Christmas, and other peak travel seasons."
      }
    ],
    "highlights": {
      "title": "Top Destinations in Morocco",
      "subtitle": "From imperial medinas to Saharan dunes and Atlantic beaches, Morocco offers some of the most diverse and captivating travel experiences in the world.",
      "places": [
        {
          "name": "Marrakech",
          "description": "Marrakech is Morocco's most iconic city, famous for its colorful souks, historic palaces, beautiful gardens, and vibrant atmosphere.",
          "image": "https://images.pexels.com/photos/22711558/pexels-photo-22711558.jpeg?auto=compress&cs=tinysrgb&w=800",
          "tags": [
            "UNESCO",
            "Culture",
            "Markets"
          ],
          "attractions": [
            {
              "name": "Jemaa el-Fnaa",
              "description": "The heart of Marrakech, this famous square comes alive with street performers, traditional food, musicians, and local markets.",
              "image": "https://images.pexels.com/photos/35891424/pexels-photo-35891424.jpeg?auto=compress&cs=tinysrgb&w=800"
            },
            {
              "name": "Koutoubia Mosque",
              "description": "The largest mosque in Marrakech, recognized for its stunning minaret and beautiful Almohad architecture.",
              "image": "https://images.pexels.com/photos/35816084/pexels-photo-35816084.jpeg?auto=compress&cs=tinysrgb&w=800"
            }
          ]
        },
        {
          "name": "Casablanca",
          "description": "Casablanca combines modern city life with impressive architecture, Atlantic Ocean views, and Morocco's largest cultural landmarks.",
          "image": "https://images.pexels.com/photos/29994223/pexels-photo-29994223.jpeg?auto=compress&cs=tinysrgb&w=800",
          "tags": [
            "Modern",
            "Ocean",
            "Architecture"
          ],
          "attractions": [
            {
              "name": "Hassan II Mosque",
              "description": "One of the largest and most beautiful mosques in the world, dramatically located on the Atlantic coastline.",
              "image": "https://images.pexels.com/photos/20580486/pexels-photo-20580486.jpeg?auto=compress&cs=tinysrgb&w=800"
            }
          ]
        }
      ]
    },
    "partnersDescription": "Autours partners with leading car rental providers across Morocco. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Casablanca, Marrakech, Agadir, Tangier, and major airports.",
    "ctaTitle": "Ready to Explore Morocco?",
    "ctaDescription": "Compare airport car rental deals from trusted suppliers across Casablanca, Marrakech, Agadir, Fes, Tangier, Rabat, Chefchaouen, Essaouira, Ouarzazate, and more. Book in minutes with competitive prices, free cancellation on most rentals, and instant confirmation—so you can start discovering Morocco the moment you arrive.",
    "ctaPrimaryText": "Search Cars Now",
    "ctaSecondaryText": "Contact Support"
  },
  "georgia": {
    "slug": "georgia",
    "name": "Georgia",
    "heroBadge": "Autours Georgia Airport Car Rental",
    "heroTitle": "Book Your Airport Rental",
    "heroHighlight": "Across Georgia",
    "heroLead": "Discover the beauty of Georgia with the freedom to travel wherever your journey takes you. Compare trusted airport car rental deals from leading local and international suppliers across Tbilisi, Batumi, Kutaisi, Kazbegi, and beyond.",
    "heroBottomTitle": "Search by Georgia airport and start your adventure.",
    "travelInfo": {
      "title": "Why Rent a Car in Georgia with Autours?",
      "subtitle": "Discover the beauty of Georgia with the freedom to travel wherever your journey takes you. Whether you're arriving in Tbilisi, exploring the mountain landscapes of Kazbegi, relaxing in Batumi on the Black Sea coast, visiting the vineyards of Kakheti, or discovering Kutaisi, Gudauri, Borjomi, Mtskheta, Sighnaghi, or Mestia — Autours helps you compare trusted airport car rental deals from leading local and international suppliers.",
      "image": "countries/georgia.png",
      "benefits": [
        {
          "title": "Airport Pickup Across Georgia",
          "description": "Collect your rental car from Tbilisi International Airport (TBS), Kutaisi International Airport (KUT), Batumi International Airport (BUS), and other convenient pickup locations across Georgia."
        },
        {
          "title": "Compare the Best Car Rental Deals",
          "description": "Compare prices from trusted local and international suppliers to find the ideal vehicle for city driving, mountain adventures, business trips, or road trips across Georgia."
        },
        {
          "title": "Free Cancellation on Most Bookings",
          "description": "Travel with confidence thanks to flexible cancellation policies available on most rentals."
        },
        {
          "title": "Instant Booking Confirmation",
          "description": "Book your rental car online in minutes and receive instant confirmation before you arrive."
        },
        {
          "title": "Wide Vehicle Selection",
          "description": "From compact economy cars for city driving to robust SUVs for mountain roads and ski resorts — find the right vehicle for every Georgia adventure."
        }
      ]
    },
    "steps": [
      {
        "title": "Search",
        "description": "Enter your Georgia airport or city, dates, and times to see available cars from trusted suppliers."
      },
      {
        "title": "Compare",
        "description": "Filter by price, vehicle type, transmission, and supplier ratings to find the best deal."
      },
      {
        "title": "Book & Drive",
        "description": "Reserve online in minutes, pick up your car at the airport, and start exploring Georgia."
      }
    ],
    "documents": {
      "items": [
        "Valid driving licence",
        "Passport",
        "Credit card in the main driver's name",
        "International Driving Permit (IDP), if required",
        "Booking confirmation (digital or printed)"
      ]
    },
    "faqs": [
      {
        "q": "What is the minimum age to rent a car in Georgia?",
        "a": "Most rental companies require drivers to be at least 21 years old. Some premium vehicles and SUVs may require drivers to be 25 years or older. The minimum age requirement for each vehicle is shown clearly before booking."
      },
      {
        "q": "Can tourists rent a car in Georgia?",
        "a": "Yes. International visitors can rent a car using a valid driving licence. Some suppliers may also require an International Driving Permit (IDP), depending on your nationality. All requirements are displayed before you confirm your booking on Autours."
      },
      {
        "q": "What documents do I need to rent a car in Georgia?",
        "a": "You'll usually need: a valid driving licence, passport, credit card in the main driver's name, and an International Driving Permit (IDP) if required by your nationality or the rental supplier."
      },
      {
        "q": "Which airports can I pick up my rental car from?",
        "a": "Autours offers airport car rental at Tbilisi International Airport (TBS), Kutaisi International Airport (KUT), Batumi International Airport (BUS), and selected city locations across Georgia."
      },
      {
        "q": "Is driving in Georgia easy for tourists?",
        "a": "Yes. Georgia has an expanding highway network connecting major cities and tourist destinations. Mountain roads are generally well maintained, although extra care is recommended during winter, especially in highland areas like Kazbegi and Gudauri."
      },
      {
        "q": "Can I drive from Tbilisi to Kazbegi or Batumi?",
        "a": "Yes. Renting a car is one of the best ways to explore Georgia. Popular road trips include Tbilisi to Kazbegi (Stepantsminda), Gudauri, Batumi, Kutaisi, Borjomi, Mtskheta, Kakheti, Sighnaghi, and Mestia — all easily accessible by road."
      },
      {
        "q": "Do I need a 4x4 in Georgia?",
        "a": "A standard car is suitable for most cities and highways. However, if you're visiting mountain regions such as Tusheti, Ushguli, or remote areas during winter, a 4WD vehicle is strongly recommended."
      },
      {
        "q": "Can I drive a rental car across the border?",
        "a": "Cross-border travel is restricted by many suppliers or requires prior approval, additional insurance, and extra documentation. Always check the rental conditions before booking if you plan to travel beyond Georgia's borders."
      },
      {
        "q": "What type of rental car is best for Georgia?",
        "a": "Economy cars are ideal for city driving and standard highways. SUVs are recommended for mountain roads, ski resorts, family holidays, and longer road trips across the Georgian countryside."
      },
      {
        "q": "When should I book my Georgia car rental for the best price?",
        "a": "Booking 2–4 weeks in advance usually gives you the best prices and the widest choice of vehicles, especially during the summer season, ski season (December–March), and national holidays."
      }
    ],
    "highlights": {
      "title": "Top Destinations in Georgia",
      "subtitle": "Georgia surprises every visitor — from the medieval Old Town of Tbilisi to the snow-capped peaks of Kazbegi and the Black Sea shores of Batumi.",
      "places": [
        {
          "name": "Tbilisi",
          "description": "Georgia's charming capital combines ancient history, colorful streets, hilltop fortresses, and modern culture, making it one of the Caucasus' most fascinating cities.",
          "image": "https://images.pexels.com/photos/7539985/pexels-photo-7539985.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "tags": [
            "Capital",
            "Heritage",
            "Nightlife"
          ],
          "attractions": [
            {
              "name": "Narikala Fortress",
              "description": "An ancient fortress overlooking Tbilisi, offering breathtaking panoramic views of the city and the Kura River.",
              "image": "https://images.pexels.com/photos/11653610/pexels-photo-11653610.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Holy Trinity Cathedral",
              "description": "One of the largest Orthodox churches in the world, admired for its magnificent architecture and peaceful atmosphere.",
              "image": "https://images.pexels.com/photos/16658272/pexels-photo-16658272.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        },
        {
          "name": "Batumi",
          "description": "Batumi is Georgia's vibrant Black Sea resort, known for its beaches, modern skyline, botanical gardens, and lively nightlife.",
          "image": "https://images.pexels.com/photos/11815773/pexels-photo-11815773.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "tags": [
            "Beaches",
            "Modern",
            "Leisure"
          ],
          "attractions": [
            {
              "name": "Batumi Boulevard",
              "description": "A scenic seaside promenade lined with palm trees, cafés, sculptures, and beautiful Black Sea views.",
              "image": "https://images.pexels.com/photos/35778764/pexels-photo-35778764.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Ali and Nino Statue",
              "description": "A moving sculpture symbolizing eternal love and one of Batumi's most iconic landmarks.",
              "image": "https://images.pexels.com/photos/34518816/pexels-photo-34518816.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        },
        {
          "name": "Kazbegi (Stepantsminda)",
          "description": "Kazbegi is one of Georgia's most breathtaking mountain destinations, famous for dramatic peaks, hiking trails, and stunning landscapes.",
          "image": "https://images.pexels.com/photos/1280840/pexels-photo-1280840.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "tags": [
            "Mountains",
            "Hiking",
            "Scenic"
          ],
          "attractions": [
            {
              "name": "Gergeti Trinity Church",
              "description": "Perched high above the mountains, this iconic church offers one of the most spectacular views in the Caucasus.",
              "image": "https://images.pexels.com/photos/9407207/pexels-photo-9407207.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Mount Kazbek",
              "description": "One of Georgia's highest mountains, attracting hikers, climbers, and nature lovers from around the world.",
              "image": "https://images.pexels.com/photos/33273790/pexels-photo-33273790.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        }
      ]
    },
    "partnersDescription": "Autours partners with leading car rental providers across Georgia. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Tbilisi, Batumi, Kutaisi, and all major airports.",
    "ctaTitle": "Ready to Explore Georgia?",
    "ctaDescription": "Compare airport car rental deals from trusted suppliers across Tbilisi, Batumi, Kutaisi, Kazbegi, Gudauri, Borjomi, Kakheti, Mtskheta, Sighnaghi, Mestia, and more. Book in minutes with competitive prices, free cancellation on most rentals, and instant confirmation — so you can start exploring Georgia from the moment you land.",
    "ctaPrimaryText": "Search Cars Now",
    "ctaSecondaryText": "Contact Support"
  },
  "greece": {
    "slug": "greece",
    "name": "Greece",
    "heroBadge": "Autours Greece Airport Car Rental",
    "heroTitle": "Book Your Airport Rental",
    "heroHighlight": "Across Greece",
    "heroLead": "Search pickup availability from Athens, Thessaloniki, Heraklion, Santorini, Mykonos, Rhodes, and Corfu airports — then choose the right car for your trip before you land.",
    "heroBottomTitle": "Search by Greece airport and land ready to drive.",
    "travelInfo": {
      "title": "Why Rent a Car in Greece with Autours?",
      "subtitle": "Discover Greece with the freedom to explore ancient landmarks, picturesque islands, and breathtaking coastlines at your own pace. Whether you're arriving in Athens, watching the sunset in Santorini, relaxing on the beaches of Crete, exploring Mykonos, or visiting Thessaloniki, Rhodes, Corfu, Nafplio, Meteora, or Delphi, Autours helps you compare trusted airport car rental deals from leading local and international suppliers.",
      "image": "countries/Greece.png",
      "benefits": [
        {
          "title": "Airport Pickup Across Greece",
          "description": "Collect your rental car from major airports, including Athens International Airport, Thessaloniki Airport, Heraklion Airport (Crete), Chania Airport, Santorini Airport, Mykonos Airport, Rhodes International Airport, Corfu International Airport, and other convenient locations across Greece."
        },
        {
          "title": "Compare the Best Car Rental Deals",
          "description": "Compare offers from trusted local and international rental companies to find the perfect vehicle for city breaks, island adventures, family holidays, or business travel."
        },
        {
          "title": "Free Cancellation on Most Bookings",
          "description": "Book with confidence thanks to flexible cancellation policies available on most rentals."
        },
        {
          "title": "Instant Booking Confirmation",
          "description": "Reserve your rental car online in minutes and receive instant confirmation before your arrival."
        }
      ]
    },
    "steps": [
      {
        "title": "Search",
        "description": "Enter your airport, dates, and times."
      },
      {
        "title": "Compare",
        "description": "Filter by price and car type."
      },
      {
        "title": "Book & Drive",
        "description": "Reserve online and hit the road."
      }
    ],
    "documents": {
      "items": [
        "Valid driving licence",
        "Passport",
        "Credit card in the main driver's name",
        "International Driving Permit (if required)"
      ]
    },
    "faqs": [
      {
        "q": "What is the minimum age to rent a car in Greece?",
        "a": "Most rental companies require drivers to be at least 21 years old. Premium vehicles and luxury cars may require drivers to be 25 years or older."
      },
      {
        "q": "Can tourists rent a car in Greece?",
        "a": "Yes. International visitors can rent a car with a valid driving licence. Depending on your nationality, an International Driving Permit (IDP) may also be required."
      },
      {
        "q": "What documents do I need to rent a car in Greece?",
        "a": "You'll usually need: a valid driving licence, passport, credit card in the main driver's name, and an International Driving Permit (if required)."
      },
      {
        "q": "Which airports can I pick up my rental car from?",
        "a": "Autours offers airport car rentals at major Greek airports, including Athens, Thessaloniki, Heraklion, Chania, Santorini, Mykonos, Rhodes, and Corfu."
      },
      {
        "q": "Is driving in Greece easy for tourists?",
        "a": "Yes. Greece has a modern road network connecting major cities, coastal towns, and many popular attractions. Driving is one of the best ways to explore the mainland and larger islands."
      },
      {
        "q": "Can I drive between Athens and popular destinations?",
        "a": "Yes. Renting a car makes it easy to visit destinations such as Delphi, Meteora, Nafplio, Peloponnese, Olympia, and other historic sites from Athens."
      },
      {
        "q": "Can I take my rental car on a ferry to the Greek islands?",
        "a": "Some suppliers allow ferry travel, while others require prior approval or additional insurance. Always check the rental terms before booking if you plan to travel between islands."
      },
      {
        "q": "What type of rental car is best for Greece?",
        "a": "Economy cars are ideal for city driving and narrow island streets, while SUVs are recommended for mountain villages, countryside routes, and family holidays."
      },
      {
        "q": "Are unlimited mileage rentals available?",
        "a": "Many suppliers offer unlimited mileage, while others apply mileage limits. The mileage policy is clearly displayed before you confirm your booking."
      },
      {
        "q": "When should I book my Greece car rental for the best price?",
        "a": "Booking 2–4 weeks in advance usually provides the best prices and the widest selection of vehicles, especially during the summer season, Easter, and public holidays."
      }
    ],
    "highlights": {
      "title": "Top Destinations in Greece",
      "subtitle": "Explore Greece's legendary ancient ruins, iconic blue-domed churches, idyllic island escapes, and breathtaking Mediterranean coastlines at your own pace.",
      "places": [
        {
          "name": "Athens",
          "description": "The birthplace of democracy, Athens is a city where ancient monuments blend with vibrant neighborhoods and modern culture.",
          "image": "https://images.pexels.com/photos/15141202/pexels-photo-15141202.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "tags": [
            "History",
            "UNESCO",
            "Culture"
          ],
          "attractions": [
            {
              "name": "Acropolis",
              "description": "The most famous landmark in Greece, featuring magnificent ancient temples overlooking the city.",
              "image": "https://images.pexels.com/photos/36825391/pexels-photo-36825391.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Parthenon",
              "description": "An architectural masterpiece dedicated to the goddess Athena and a symbol of classical civilization.",
              "image": "https://images.pexels.com/photos/14375296/pexels-photo-14375296.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        },
        {
          "name": "Santorini",
          "description": "Santorini is Greece's most famous island, celebrated for its whitewashed villages, blue-domed churches, volcanic cliffs, and unforgettable sunsets.",
          "image": "https://images.pexels.com/photos/1010655/pexels-photo-1010655.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "tags": [
            "Romantic",
            "Views",
            "Unique"
          ],
          "attractions": [
            {
              "name": "Oia Village",
              "description": "The island's most iconic village, offering breathtaking sunset views, charming white houses, and narrow streets overlooking the Aegean Sea.",
              "image": "https://images.pexels.com/photos/38464216/pexels-photo-38464216.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Blue Dome Churches",
              "description": "These beautiful blue-domed churches are among the most photographed landmarks in Greece and symbolize Santorini's unique architecture.",
              "image": "https://images.pexels.com/photos/33851769/pexels-photo-33851769.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        },
        {
          "name": "Mykonos",
          "description": "Mykonos is famous for its beautiful beaches, charming whitewashed streets, vibrant nightlife, and picturesque waterfront.",
          "image": "https://images.pexels.com/photos/37844835/pexels-photo-37844835.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "tags": [
            "Luxury",
            "Beaches",
            "Nightlife"
          ],
          "attractions": [
            {
              "name": "Mykonos Windmills",
              "description": "These historic windmills are the island's most recognizable landmark and offer spectacular sunset views.",
              "image": "https://images.pexels.com/photos/37844835/pexels-photo-37844835.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Little Venice",
              "description": "A beautiful waterfront neighborhood where colorful buildings stand directly above the sea.",
              "image": "https://images.pexels.com/photos/24244358/pexels-photo-24244358.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        }
      ]
    },
    "partnersDescription": "Autours partners with leading car rental providers across Greece. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Athens, Santorini, Mykonos, Crete, Thessaloniki, Rhodes, and Corfu.",
    "ctaTitle": "Ready to Explore Greece?",
    "ctaDescription": "Compare airport car rental deals from trusted suppliers across Athens, Santorini, Mykonos, Crete, Thessaloniki, Rhodes, Corfu, Delphi, Meteora, and more. Book in minutes with competitive prices, free cancellation on most rentals, and instant confirmation — so you can start discovering Greece from the moment you land.",
    "ctaPrimaryText": "Search Cars Now",
    "ctaSecondaryText": "Contact Support"
  },
  "bosnia": {
    "slug": "bosnia",
    "name": "Bosnia and Herzegovina",
    "heroBadge": "Autours Bosnia & Herzegovina Airport Car Rental",
    "heroTitle": "Book Your Airport Rental",
    "heroHighlight": "Across Bosnia and Herzegovina",
    "heroLead": "Search pickup availability from Sarajevo, Mostar, Banja Luka, and Tuzla airports — then choose the right car for your trip before you land.",
    "heroBottomTitle": "Search by Bosnia airport and land ready to drive.",
    "travelInfo": {
      "title": "Why Rent a Car in Bosnia and Herzegovina with Autours?",
      "subtitle": "Experience the natural beauty and rich history of Bosnia and Herzegovina with the freedom of your own rental car. Whether you're arriving in Sarajevo, exploring the iconic Mostar Bridge, relaxing in Neum on the Adriatic coast, discovering Banja Luka, or visiting Jajce, Travnik, Bihać, Tuzla, Međugorje, or Blagaj, Autours helps you compare trusted airport car rental deals from leading local and international suppliers.",
      "image": "countries/Bosnia.png",
      "benefits": [
        {
          "title": "Airport Pickup Across Bosnia and Herzegovina",
          "description": "Collect your rental car from major airports, including Sarajevo International Airport, Mostar International Airport, Banja Luka International Airport, Tuzla International Airport, and other convenient pickup locations across the country."
        },
        {
          "title": "Compare the Best Car Rental Deals",
          "description": "Compare offers from trusted local and international suppliers to find the perfect vehicle for city breaks, mountain adventures, business travel, or family holidays."
        },
        {
          "title": "Free Cancellation on Most Bookings",
          "description": "Travel with confidence thanks to flexible cancellation policies available on most reservations."
        },
        {
          "title": "Instant Booking Confirmation",
          "description": "Book your rental car online in minutes and receive instant confirmation before your arrival."
        }
      ]
    },
    "steps": [
      {
        "title": "Search",
        "description": "Enter your airport, dates, and times."
      },
      {
        "title": "Compare",
        "description": "Filter by price and car type."
      },
      {
        "title": "Book & Drive",
        "description": "Reserve online and hit the road."
      }
    ],
    "documents": {
      "items": [
        "Valid driving licence",
        "Passport",
        "Credit card in the main driver's name",
        "International Driving Permit (if required)"
      ]
    },
    "faqs": [
      {
        "q": "What is the minimum age to rent a car in Bosnia and Herzegovina?",
        "a": "Most rental companies require drivers to be at least 21 years old. Luxury vehicles and premium SUVs may require drivers to be 25 years or older."
      },
      {
        "q": "Can tourists rent a car in Bosnia and Herzegovina?",
        "a": "Yes. International visitors can rent a car with a valid driving licence. Depending on your nationality, an International Driving Permit (IDP) may also be required."
      },
      {
        "q": "What documents do I need to rent a car?",
        "a": "You'll usually need: a valid driving licence, passport, credit card in the main driver's name, and an International Driving Permit (if required)."
      },
      {
        "q": "Which airports can I pick up my rental car from?",
        "a": "Autours offers airport car rentals at Sarajevo International Airport, Mostar International Airport, Banja Luka International Airport, Tuzla International Airport, and selected city locations."
      },
      {
        "q": "Is driving in Bosnia and Herzegovina easy for tourists?",
        "a": "Yes. The country has a well-connected road network linking major cities and tourist destinations. Mountain roads offer spectacular scenery, but extra caution is recommended during winter."
      },
      {
        "q": "Can I drive from Sarajevo to Mostar?",
        "a": "Yes. The drive between Sarajevo and Mostar is one of the country's most popular road trips, passing beautiful mountains, rivers, and traditional villages."
      },
      {
        "q": "Can I cross the border with a rental car?",
        "a": "Many suppliers allow cross-border travel to neighboring countries such as Croatia, Montenegro, or Serbia, but prior approval, additional insurance, and documentation are usually required."
      },
      {
        "q": "What type of rental car is best for Bosnia and Herzegovina?",
        "a": "Economy cars are perfect for cities and highways, while SUVs provide extra comfort for mountain roads, rural areas, and winter travel."
      },
      {
        "q": "Are unlimited mileage rentals available?",
        "a": "Many suppliers offer unlimited mileage, while others apply mileage limits. The mileage policy is always displayed before you confirm your reservation."
      },
      {
        "q": "When should I book my Bosnia and Herzegovina car rental for the best price?",
        "a": "Booking 2–4 weeks in advance usually provides the best prices and the widest choice of vehicles, especially during the summer season, Christmas, and public holidays."
      }
    ],
    "highlights": {
      "title": "Top Destinations in Bosnia and Herzegovina",
      "subtitle": "Discover Bosnia's extraordinary beauty — medieval towns, turquoise rivers, and a rich cultural tapestry shaped by centuries of converging civilizations.",
      "places": [
        {
          "name": "Sarajevo",
          "description": "Sarajevo is a fascinating city where Ottoman, Austro-Hungarian, and modern cultures come together in a unique historical atmosphere.",
          "image": "https://images.pexels.com/photos/38183710/pexels-photo-38183710.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "tags": [
            "Culture",
            "History",
            "Heritage"
          ],
          "attractions": [
            {
              "name": "Baščaršija",
              "description": "The historic old bazaar filled with traditional cafés, artisan shops, and authentic Bosnian culture.",
              "image": "https://images.pexels.com/photos/28305255/pexels-photo-28305255.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Latin Bridge",
              "description": "A famous bridge known for its important role in world history and its beautiful riverside setting.",
              "image": "https://images.pexels.com/photos/20813448/pexels-photo-20813448.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        },
        {
          "name": "Mostar",
          "description": "Mostar is Bosnia and Herzegovina's most famous destination, celebrated for its iconic bridge, Ottoman architecture, and picturesque riverside scenery.",
          "image": "https://images.pexels.com/photos/16854727/pexels-photo-16854727.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "tags": [
            "UNESCO",
            "Bridge",
            "Heritage"
          ],
          "attractions": [
            {
              "name": "Stari Most (Old Bridge)",
              "description": "A UNESCO World Heritage Site and the symbol of Mostar, this stunning stone bridge spans the Neretva River and is famous for its breathtaking views and traditional diving performances.",
              "image": "https://images.pexels.com/photos/33660903/pexels-photo-33660903.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Mostar Old Bazaar",
              "description": "A charming historic district filled with cobblestone streets, traditional cafés, handmade crafts, and authentic Bosnian souvenirs.",
              "image": "https://images.pexels.com/photos/33670339/pexels-photo-33670339.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        },
        {
          "name": "Blagaj",
          "description": "Blagaj is a peaceful destination known for its crystal-clear spring, dramatic cliffs, and centuries-old monastery.",
          "image": "https://images.pexels.com/photos/29962035/pexels-photo-29962035.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "tags": [
            "Scenic",
            "Spiritual",
            "Nature"
          ],
          "attractions": [
            {
              "name": "Blagaj Tekke",
              "description": "A historic Dervish monastery beautifully built beside the source of the Buna River.",
              "image": "https://images.pexels.com/photos/30175102/pexels-photo-30175102.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Buna River Spring",
              "description": "One of Europe's largest natural springs, surrounded by breathtaking cliffs and turquoise water.",
              "image": "https://images.pexels.com/photos/33196209/pexels-photo-33196209.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        }
      ]
    },
    "partnersDescription": "Autours partners with leading car rental providers across Bosnia and Herzegovina. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Sarajevo, Mostar, Banja Luka, and Tuzla.",
    "ctaTitle": "Ready to Explore Bosnia and Herzegovina?",
    "ctaDescription": "Compare airport car rental deals from trusted suppliers across Sarajevo, Mostar, Banja Luka, Tuzla, Neum, Jajce, Travnik, Bihać, Blagaj, and more. Book in minutes with competitive prices, free cancellation on most rentals, and instant confirmation — so you can start exploring Bosnia and Herzegovina from the moment you arrive.",
    "ctaPrimaryText": "Search Cars Now",
    "ctaSecondaryText": "Contact Support"
  },
  "azerbaijan": {
    "slug": "azerbaijan",
    "name": "Azerbaijan",
    "heroBadge": "Autours Azerbaijan Airport Car Rental",
    "heroTitle": "Book Your Airport Rental",
    "heroHighlight": "Across Azerbaijan",
    "heroLead": "Search pickup availability from Baku, Gabala, Ganja, Lankaran, and Nakhchivan airports — then choose the right car for your trip before you land.",
    "heroBottomTitle": "Search by Azerbaijan airport and land ready to drive.",
    "travelInfo": {
      "title": "Why Rent a Car in Azerbaijan with Autours?",
      "subtitle": "Discover Azerbaijan with the freedom to explore its modern cities, ancient landmarks, mountain villages, and breathtaking landscapes at your own pace. Whether you're arriving in Baku, exploring the UNESCO-listed Old City (Icherisheher), driving to Gabala, relaxing in Ganja, visiting Sheki, Shamakhi, Quba, Khinalug, Naftalan, or enjoying the shores of the Caspian Sea, Autours helps you compare trusted airport car rental deals from leading local and international suppliers.",
      "image": "countries/Azerbaijan.png",
      "benefits": [
        {
          "title": "Airport Pickup Across Azerbaijan",
          "description": "Collect your rental car from major airports, including Heydar Aliyev International Airport (Baku), Gabala International Airport, Ganja International Airport, Lankaran International Airport, Nakhchivan International Airport, and other convenient pickup locations."
        },
        {
          "title": "Compare the Best Car Rental Deals",
          "description": "Compare offers from trusted local and international rental companies to find the ideal vehicle for city driving, mountain adventures, family holidays, or business travel."
        },
        {
          "title": "Free Cancellation on Most Bookings",
          "description": "Book with confidence thanks to flexible cancellation policies available on most rentals."
        },
        {
          "title": "Instant Booking Confirmation",
          "description": "Reserve your rental car online in minutes and receive instant confirmation before your arrival."
        }
      ]
    },
    "steps": [
      {
        "title": "Search",
        "description": "Enter your airport, dates, and times."
      },
      {
        "title": "Compare",
        "description": "Filter by price and car type."
      },
      {
        "title": "Book & Drive",
        "description": "Reserve online and hit the road."
      }
    ],
    "documents": {
      "items": [
        "Valid driving licence",
        "Passport",
        "Credit card in the main driver's name",
        "International Driving Permit (if required)"
      ]
    },
    "faqs": [
      {
        "q": "What is the minimum age to rent a car in Azerbaijan?",
        "a": "Most rental companies require drivers to be at least 21 years old, while luxury vehicles and premium SUVs may require drivers to be 25 years or older."
      },
      {
        "q": "Can tourists rent a car in Azerbaijan?",
        "a": "Yes. International visitors can rent a car with a valid driving licence. Depending on your nationality and the rental supplier, an International Driving Permit (IDP) may also be required."
      },
      {
        "q": "What documents do I need to rent a car in Azerbaijan?",
        "a": "You'll usually need: a valid driving licence, passport, credit card in the main driver's name, and an International Driving Permit (if required)."
      },
      {
        "q": "Which airports can I pick up my rental car from?",
        "a": "Autours offers airport car rentals at Heydar Aliyev International Airport (Baku), Gabala International Airport, Ganja International Airport, Lankaran International Airport, and other selected locations."
      },
      {
        "q": "Is driving in Azerbaijan easy for tourists?",
        "a": "Yes. Azerbaijan has modern highways connecting major cities and tourist destinations. Driving around Baku and between popular attractions is generally straightforward, while mountain roads require extra care during winter."
      },
      {
        "q": "Can I drive from Baku to Gabala or Sheki?",
        "a": "Yes. Renting a car is one of the best ways to explore Azerbaijan. Popular road trips include Baku, Gabala, Sheki, Shamakhi, Quba, Khinalug, Ganja, and the Caspian Sea coastline."
      },
      {
        "q": "Do I need an SUV to explore Azerbaijan?",
        "a": "A standard car is suitable for cities and highways, but an SUV is recommended for mountain regions, rural villages, and winter travel."
      },
      {
        "q": "Can I drive a rental car across international borders?",
        "a": "Cross-border travel is restricted by many suppliers or requires prior approval, additional insurance, and documentation. Always check the rental conditions before booking."
      },
      {
        "q": "Are unlimited mileage rentals available?",
        "a": "Many suppliers offer unlimited mileage, while others apply mileage limits. The mileage policy is clearly displayed before you confirm your booking."
      },
      {
        "q": "When should I book my Azerbaijan car rental for the best price?",
        "a": "Booking 2–4 weeks in advance usually provides the best prices and the widest choice of vehicles, especially during the spring, summer, ski season, and major public holidays."
      }
    ],
    "highlights": {
      "title": "Top Destinations in Azerbaijan",
      "subtitle": "Where ancient fire temples meet futuristic flame towers — Azerbaijan blends East and West, old and new, in one of the most fascinating destinations in the Caucasus.",
      "places": [
        {
          "name": "Sheki",
          "description": "Sheki is one of Azerbaijan's oldest and most beautiful cities, known for its Silk Road history, mountain scenery, and magnificent architecture.",
          "image": "https://images.pexels.com/photos/13502463/pexels-photo-13502463.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "tags": [
            "Heritage",
            "Palace",
            "Culture"
          ],
          "attractions": [
            {
              "name": "Sheki Khan's Palace",
              "description": "A masterpiece of Azerbaijani architecture, famous for its colorful stained-glass windows, intricate paintings, and beautiful wooden craftsmanship.",
              "image": "https://images.pexels.com/photos/13502463/pexels-photo-13502463.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Kish Albanian Church",
              "description": "One of the oldest churches in the Caucasus, surrounded by peaceful mountain landscapes and rich history.",
              "image": "https://images.pexels.com/photos/37497202/pexels-photo-37497202.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        },
        {
          "name": "Quba",
          "description": "Quba is a peaceful mountain destination famous for forests, waterfalls, traditional villages, and breathtaking natural scenery.",
          "image": "https://images.pexels.com/photos/30624421/pexels-photo-30624421.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "tags": [
            "Nature",
            "Mountains",
            "Forests"
          ],
          "attractions": [
            {
              "name": "Afurja Waterfall",
              "description": "One of Azerbaijan's tallest waterfalls, surrounded by lush forests and dramatic mountain landscapes.",
              "image": "https://images.pexels.com/photos/18531657/pexels-photo-18531657.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Shahdag Mountain Resort",
              "description": "A year-round resort offering skiing, hiking, cable cars, and adventure activities with stunning mountain views.",
              "image": "https://images.pexels.com/photos/32136804/pexels-photo-32136804.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        },
        {
          "name": "Ganja",
          "description": "Ganja is Azerbaijan's second-largest city, combining historic monuments, beautiful parks, and important cultural landmarks.",
          "image": "https://images.pexels.com/photos/792776/pexels-photo-792776.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "tags": [
            "Culture",
            "History",
            "Parks"
          ],
          "attractions": [
            {
              "name": "Javad Khan Street",
              "description": "A lively pedestrian street filled with cafés, restaurants, local shops, and historic architecture.",
              "image": "https://images.pexels.com/photos/20098621/pexels-photo-20098621.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Nizami Mausoleum",
              "description": "A magnificent monument dedicated to the legendary Persian poet Nizami Ganjavi.",
              "image": "https://images.pexels.com/photos/19439205/pexels-photo-19439205.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        }
      ]
    },
    "partnersDescription": "Autours partners with leading car rental providers across Azerbaijan. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Baku, Gabala, Ganja, and all major airports.",
    "ctaTitle": "Ready to Explore Azerbaijan?",
    "ctaDescription": "Compare airport car rental deals from trusted suppliers across Baku, Gabala, Sheki, Ganja, Quba, Shamakhi, Khinalug, Lankaran, Nakhchivan, and more. Book in minutes with competitive prices, free cancellation on most rentals, and instant confirmation — so you can start exploring Azerbaijan the moment you arrive.",
    "ctaPrimaryText": "Search Cars Now",
    "ctaSecondaryText": "Contact Support"
  },
  "cyprus": {
    "slug": "cyprus",
    "name": "Cyprus",
    "heroBadge": "Autours Cyprus Airport Car Rental",
    "heroTitle": "Book Your Airport Rental",
    "heroHighlight": "Across Cyprus",
    "heroLead": "Search pickup availability from Larnaca and Paphos airports — then choose the right car for your trip before you land.",
    "heroBottomTitle": "Search by Cyprus airport and land ready to drive.",
    "travelInfo": {
      "title": "Why Rent a Car in Cyprus with Autours?",
      "subtitle": "Discover Cyprus with the freedom to explore golden beaches, ancient ruins, and charming mountain villages at your own pace. Whether you're arriving in Larnaca, exploring the vibrant streets of Nicosia, relaxing on the beaches of Ayia Napa, enjoying the harbor of Limassol, or visiting Paphos, Protaras, Troodos Mountains, Coral Bay, Polis, or Kyrenia, Autours helps you compare trusted airport car rental deals from leading local and international suppliers.",
      "image": "countries/Cyprus.png",
      "benefits": [
        {
          "title": "Airport Pickup Across Cyprus",
          "description": "Collect your rental car from major airports, including Larnaca International Airport, Paphos International Airport, and other convenient pickup locations across Cyprus."
        },
        {
          "title": "Compare the Best Car Rental Deals",
          "description": "Compare offers from trusted local and international rental companies to find the ideal vehicle for city breaks, beach holidays, business trips, or island adventures."
        },
        {
          "title": "Free Cancellation on Most Bookings",
          "description": "Book with confidence thanks to flexible cancellation policies available on most rentals."
        },
        {
          "title": "Instant Booking Confirmation",
          "description": "Reserve your rental car online in minutes and receive instant confirmation before your arrival."
        }
      ]
    },
    "steps": [
      {
        "title": "Search",
        "description": "Enter your airport, dates, and times."
      },
      {
        "title": "Compare",
        "description": "Filter by price and car type."
      },
      {
        "title": "Book & Drive",
        "description": "Reserve online and hit the road."
      }
    ],
    "documents": {
      "items": [
        "Valid driving licence",
        "Passport",
        "Credit card in the main driver's name",
        "International Driving Permit (if required)"
      ]
    },
    "faqs": [
      {
        "q": "What is the minimum age to rent a car in Cyprus?",
        "a": "Most rental companies require drivers to be at least 21 years old. Luxury vehicles and premium SUVs may require drivers to be 25 years or older."
      },
      {
        "q": "Can tourists rent a car in Cyprus?",
        "a": "Yes. International visitors can rent a car with a valid driving licence. Depending on your nationality, an International Driving Permit (IDP) may also be required."
      },
      {
        "q": "What documents do I need to rent a car in Cyprus?",
        "a": "You'll usually need: a valid driving licence, passport, credit card in the main driver's name, and an International Driving Permit (if required)."
      },
      {
        "q": "Which airports can I pick up my rental car from?",
        "a": "Autours offers airport car rentals at Larnaca International Airport, Paphos International Airport, and selected city locations across Cyprus."
      },
      {
        "q": "Is driving in Cyprus easy for tourists?",
        "a": "Yes. Cyprus has a modern road network with well-maintained highways connecting major cities and tourist destinations. Keep in mind that traffic drives on the left-hand side of the road."
      },
      {
        "q": "Can I drive from Larnaca to Ayia Napa, Limassol, or Paphos?",
        "a": "Yes. Renting a car is one of the best ways to explore Cyprus. Popular road trips include Larnaca, Ayia Napa, Protaras, Limassol, Paphos, Troodos Mountains, and Nicosia."
      },
      {
        "q": "Can I drive a rental car between the Republic of Cyprus and Northern Cyprus?",
        "a": "Some rental companies allow travel across the border, while others have restrictions or require additional insurance. Always check the rental terms before booking."
      },
      {
        "q": "What type of rental car is best for Cyprus?",
        "a": "Economy cars are ideal for cities and coastal towns, while SUVs are recommended for exploring the Troodos Mountains, rural villages, and scenic countryside routes."
      },
      {
        "q": "Are unlimited mileage rentals available?",
        "a": "Many suppliers offer unlimited mileage, while others apply mileage limits. The mileage policy is clearly displayed before you complete your booking."
      },
      {
        "q": "When should I book my Cyprus car rental for the best price?",
        "a": "Booking 2–4 weeks in advance usually provides the best prices and the widest choice of vehicles, especially during the summer season, Easter, and public holidays."
      }
    ],
    "highlights": {
      "title": "Top Destinations in Cyprus",
      "subtitle": "Cyprus rewards every type of traveler — from ancient ruins and mountain monasteries to stunning beaches and vibrant resort towns all in one beautiful Mediterranean island.",
      "places": [
        {
          "name": "Paphos",
          "description": "Paphos is one of Cyprus' most famous coastal destinations, offering ancient ruins, beautiful beaches, and UNESCO World Heritage sites.",
          "image": "https://images.pexels.com/photos/14637245/pexels-photo-14637245.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "attractions": [
            {
              "name": "Paphos Archaeological Park",
              "description": "Discover impressive Roman villas decorated with beautifully preserved mosaics and ancient ruins.",
              "image": "https://images.pexels.com/photos/11062554/pexels-photo-11062554.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Aphrodite's Rock",
              "description": "Legend says this spectacular sea rock is the birthplace of Aphrodite, the Greek goddess of love.",
              "image": "https://images.pexels.com/photos/8962406/pexels-photo-8962406.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        },
        {
          "name": "Ayia Napa",
          "description": "A world-famous beach resort known for crystal-clear turquoise waters, golden sand beaches, sea caves, and lively nightlife.",
          "image": "https://images.pexels.com/photos/32056712/pexels-photo-32056712.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "attractions": [
            {
              "name": "Nissi Beach",
              "description": "One of Europe's most famous beaches, featuring powdery white sand and shallow, crystal-clear turquoise water.",
              "image": "https://images.pexels.com/photos/32056716/pexels-photo-32056716.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Cape Greco National Forest Park",
              "description": "A stunning coastal nature reserve featuring sea caves, natural stone bridges, hiking trails, and cliff-diving spots.",
              "image": "https://images.pexels.com/photos/9255956/pexels-photo-9255956.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        },
        {
          "name": "Limassol",
          "description": "Cyprus' vibrant southern coastal hub, blending luxury marina living, medieval castles, beach promenades, and ancient ruins.",
          "image": "https://images.pexels.com/photos/36934330/pexels-photo-36934330.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          "attractions": [
            {
              "name": "Limassol Marina",
              "description": "A modern waterfront destination featuring luxury yachts, seaside dining, stylish boutiques, and scenic promenades.",
              "image": "https://images.pexels.com/photos/36934330/pexels-photo-36934330.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            },
            {
              "name": "Kourion Ancient Amphitheatre",
              "description": "A magnificent ancient Greco-Roman theater perched high on a cliff offering spectacular Mediterranean Sea views.",
              "image": "https://images.pexels.com/photos/36623829/pexels-photo-36623829.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            }
          ]
        }
      ]
    },
    "partnersDescription": "Autours partners with leading car rental providers across Cyprus. Compare offers from trusted suppliers, enjoy competitive prices, and choose from a wide range of vehicles with convenient pickup locations across Larnaca, Paphos, Nicosia, Limassol, and Ayia Napa.",
    "ctaTitle": "Ready to Explore Cyprus?",
    "ctaDescription": "Compare airport car rental deals from trusted suppliers across Larnaca, Paphos, Nicosia, Limassol, Ayia Napa, Protaras, Troodos Mountains, Coral Bay, Polis, and more. Book in minutes with competitive prices, free cancellation on most rentals, and instant confirmation — so you can start exploring Cyprus the moment you arrive.",
    "ctaPrimaryText": "Search Cars Now",
    "ctaSecondaryText": "Contact Support"
  }
};
