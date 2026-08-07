// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Brand Extras â€” Benefits & FAQs per Brand
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Keys MUST match `brand.id` returned by the API (/get/car-rental-brands).
// The ID is generated server-side as Str::slug(company_name).
// Any brand not listed here gets the `defaultBrandExtra` fallback automatically.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface BrandBenefit {
  icon: string;        // lucide-react icon name (PascalCase)
  title: string;
  description: string;
}

export interface BrandFAQ {
  question: string;
  answer: string;
}

export interface BrandExtra {
  brandId: string;
  benefits: BrandBenefit[];
  faqs: BrandFAQ[];
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Generic fallback â€” used for any brand without a specific entry
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const defaultBrandExtra: Omit<BrandExtra, 'brandId'> = {
  benefits: [
    { icon: 'ShieldCheck',  title: 'Comprehensive Insurance & Flexible Options', description: 'We provide various insurance options including full coverage with zero excess for your peace of mind.' },
    { icon: 'Zap',          title: 'Fast & Digital Pickup',                      description: 'Streamlined and quick counter procedures so you can start your journey right away without long waiting times.' },
    { icon: 'Sparkles',     title: 'Modern & Sanitized Fleet',                  description: 'All vehicles undergo thorough inspection and sanitization before delivery, featuring recent annual models.' },
    { icon: 'MapPin',       title: 'Multiple Pickup Locations',                 description: 'Convenient branches at major airports and city centres for easy vehicle pickup and drop-off anywhere you are.' },
    { icon: 'Headphones',   title: '24/7 Roadside Assistance & Support',        description: 'Our customer support and roadside assistance teams are available around the clock to help in emergencies or breakdowns.' },
    { icon: 'Calendar',     title: 'Flexible Booking & Easy Cancellation',       description: 'Modify your reservation details or cancel easily in accordance with clear, flexible cancellation policies.' },
  ],
  faqs: [
    { question: 'What documents are required to pick up the car?', answer: 'You need a valid driving licence (local or international for visitors), a national ID or passport, and a credit card in the main driver\'s name for the deposit.' },
    { question: 'Is there a minimum age requirement for renting a car?', answer: 'The standard minimum age is 21 for most vehicle categories. Young driver surcharges may apply for drivers under 25, or higher age limits for luxury vehicles.' },
    { question: 'How are traffic fines handled during the rental period?', answer: 'Traffic violations incurred during the rental period are registered against the driver\'s licence or sent to the rental company, which charges the renter along with any administrative fees.' },
    { question: 'Do I need to pay a refundable security deposit at pickup?', answer: 'Yes, all rental suppliers require a temporary security deposit hold on your credit card at pickup. The hold is automatically released after vehicle return once inspected and checked for fines.' },
    { question: 'What is the standard fuel policy?', answer: 'The most common policy is Full-to-Full. You receive the vehicle with a full tank of fuel and must return it full to avoid refuelling charges from the rental branch.' },
  ],
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Brand-specific entries â€” keyed by real brand.id from the API
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const brandExtrasMap: Record<string, Omit<BrandExtra, 'brandId'>> = {

  // GO RENTAL
  'go-rental': {
    benefits: [
      { icon: 'Zap',          title: 'Quick & Easy Booking',   description: 'Book your GO RENTAL car in minutes through Autours â€” instant confirmation guaranteed.' },
      { icon: 'BadgePercent', title: 'Competitive Daily Rates', description: 'GO RENTAL offers transparent pricing with no hidden fees across all branches.' },
      { icon: 'ShieldCheck',  title: 'Trusted by Thousands',   description: 'Hundreds of verified customer reviews back GO RENTAL\'s commitment to quality service.' },
      { icon: 'MapPin',       title: 'Multiple Locations',      description: 'Conveniently located branches at airports and key city spots for easy pickup and drop-off.' },
      { icon: 'Clock',        title: '24/7 Availability',       description: 'Select GO RENTAL branches operate around the clock to fit any travel schedule.' },
      { icon: 'HeadphonesIcon', title: 'Autours Support',       description: 'Any issue with your booking? Our team handles it on your behalf â€” fast.' },
    ],
    faqs: [
      { question: 'Where are GO RENTAL branches located?',          answer: 'GO RENTAL has branches at major airports and city centres. Full branch details including opening hours are shown on the booking confirmation and on the location page.' },
      { question: 'Does GO RENTAL require a deposit?',              answer: 'Yes â€” a refundable security deposit is held on your credit card at pickup. The exact amount depends on the vehicle category and rental duration.' },
      { question: 'Can I add an additional driver to a GO RENTAL booking?', answer: 'Yes. Additional drivers must present a valid driving licence at pickup. An extra daily fee typically applies.' },
      { question: 'What happens if I return the car late?',         answer: 'A grace period of up to 1 hour is usually allowed. Beyond that, an additional day charge applies. Please call the branch if you expect to be delayed.' },
      { question: 'Is there a mileage limit with GO RENTAL?',       answer: 'Most GO RENTAL packages include unlimited mileage within the country of rental. Check the specific package terms shown at checkout.' },
    ],
  },

  // Auto Nation
  'auto-nation': {
    benefits: [
      { icon: 'Star',         title: 'Wide Vehicle Selection',  description: 'Auto Nation offers a diverse fleet from compact city cars to spacious family SUVs.' },
      { icon: 'BadgePercent', title: 'Best Autours Price',      description: 'We always show Auto Nation\'s lowest available rate â€” no booking fees added.' },
      { icon: 'ShieldCheck',  title: 'Quality Assured',         description: 'Every Auto Nation vehicle is regularly serviced and inspected before your rental.' },
      { icon: 'MapPin',       title: 'Convenient Locations',    description: 'Auto Nation branches are positioned at key travel hubs for seamless pickup.' },
      { icon: 'Clock',        title: 'Instant Confirmation',    description: 'Your booking is confirmed in seconds â€” no chasing and no waiting.' },
      { icon: 'HeadphonesIcon', title: 'Dedicated Support',     description: 'Autours provides 24/7 assistance for all Auto Nation bookings.' },
    ],
    faqs: [
      { question: 'What vehicle categories does Auto Nation offer?', answer: 'Auto Nation provides economy, midsize, SUV, and premium vehicle categories. Availability varies by branch and date â€” check the search results for live options.' },
      { question: 'Can I pick up from the airport with Auto Nation?', answer: 'Yes â€” Auto Nation has airport pickup locations. Check the branch selector at booking to confirm the airport counter details and operating hours.' },
      { question: 'What is the minimum rental age at Auto Nation?',  answer: 'The standard minimum age is 21. Drivers aged 21â€“24 may incur a young driver surcharge. Please check the country-specific terms at checkout.' },
      { question: 'Does Auto Nation offer monthly rentals?',         answer: 'Yes â€” long-term and monthly rental packages are available at discounted rates. Contact Autours support for a tailored quote.' },
      { question: 'Is full insurance coverage available?',           answer: 'Yes â€” you can add Super CDW (zero excess) and Personal Accident Insurance at the time of booking or at the counter.' },
    ],
  },

  // SOVOYCARS
  'sovoycars': {
    benefits: [
      { icon: 'Star',         title: 'Premium Experience',      description: 'SOVOYCARS delivers a premium car rental experience with hand-picked quality vehicles.' },
      { icon: 'Zap',          title: 'Fast Pickup',             description: 'SOVOYCARS\'s streamlined process means less waiting and more time enjoying your trip.' },
      { icon: 'BadgePercent', title: 'Best Price via Autours',  description: 'Book SOVOYCARS through Autours and get the best daily rate with zero booking fees.' },
      { icon: 'ShieldCheck',  title: 'Well-Maintained Fleet',   description: 'Each SOVOYCARS vehicle undergoes a full pre-rental inspection for your safety.' },
      { icon: 'Globe',        title: 'Multiple Countries',       description: 'SOVOYCARS operates across several countries â€” your rental experience stays consistent.' },
      { icon: 'HeadphonesIcon', title: '24/7 Autours Help',     description: 'Got a question about your SOVOYCARS booking? We\'re here around the clock.' },
    ],
    faqs: [
      { question: 'What makes SOVOYCARS different from other rental companies?', answer: 'SOVOYCARS focuses on delivering a premium, personalised rental experience with high-quality vehicles and attentive service â€” at competitive Autours prices.' },
      { question: 'Where can I find SOVOYCARS branches?',           answer: 'SOVOYCARS branches are listed on the Autours location selector. Locations include airports and select city branches depending on the country.' },
      { question: 'Can I modify my SOVOYCARS booking after confirming?', answer: 'Yes â€” modifications can be made through Autours Manage Booking. Date changes are subject to vehicle availability and any rate differences.' },
      { question: 'Does SOVOYCARS include GPS navigation?',         answer: 'GPS units are available as an optional add-on. You can also use your own device or smartphone â€” just ensure it\'s mounted safely.' },
      { question: 'Is there a mileage limit with SOVOYCARS?',       answer: 'Most SOVOYCARS packages come with generous or unlimited mileage. The specific allowance is shown clearly at checkout.' },
    ],
  },

  // EUROPEAN
  'european': {
    benefits: [
      { icon: 'Globe',        title: 'European Standards',      description: 'EUROPEAN brings European-quality service to the Middle East car rental market.' },
      { icon: 'Star',         title: 'Modern Fleet',            description: 'EUROPEAN maintains a consistently modern, well-equipped vehicle fleet.' },
      { icon: 'BadgePercent', title: 'Value Rates',             description: 'Autours ensures you always access EUROPEAN\'s best available pricing.' },
      { icon: 'ShieldCheck',  title: 'Safety First',            description: 'All EUROPEAN vehicles meet strict safety and maintenance standards.' },
      { icon: 'MapPin',       title: 'Strategic Locations',     description: 'EUROPEAN branches are situated at airports and business districts for maximum convenience.' },
      { icon: 'Clock',        title: 'Flexible Hours',          description: 'Many EUROPEAN locations offer extended operating hours to suit any itinerary.' },
    ],
    faqs: [
      { question: 'What countries does EUROPEAN operate in?',       answer: 'EUROPEAN operates across key Middle East and North Africa markets. Current country coverage is shown on the brand page.' },
      { question: 'Does EUROPEAN offer SUVs and 4x4 vehicles?',     answer: 'Yes â€” EUROPEAN\'s fleet includes SUVs and larger vehicles. Availability varies by location and season.' },
      { question: 'What is the cancellation policy for EUROPEAN?',  answer: 'Standard bookings can be cancelled free of charge up to 48 hours before pickup. Specific cancellation terms are shown at checkout.' },
      { question: 'Can I pick up my EUROPEAN car outside office hours?', answer: 'Some EUROPEAN locations offer out-of-hours pickup arrangements. Please confirm with the branch via Autours before booking.' },
      { question: 'Does EUROPEAN require a credit card?',           answer: 'Yes â€” a valid credit card is required for the security deposit at pickup. The deposit amount is displayed at checkout.' },
    ],
  },

  // U-SAVE
  'u-save': {
    benefits: [
      { icon: 'BadgePercent', title: 'You Save, Always',        description: 'U-SAVE lives up to its name â€” competitive rates without sacrificing vehicle quality.' },
      { icon: 'Star',         title: 'Reliable Fleet',          description: 'U-SAVE\'s vehicles are well-maintained and regularly updated for your comfort.' },
      { icon: 'Clock',        title: 'Quick Booking',           description: 'Complete your U-SAVE booking through Autours in under 2 minutes.' },
      { icon: 'ShieldCheck',  title: 'No Hidden Costs',         description: 'All U-SAVE charges are shown upfront â€” no surprises at the counter.' },
      { icon: 'MapPin',       title: 'Airport Pickup',          description: 'U-SAVE branches at key airports make arrival and departure seamless.' },
      { icon: 'HeadphonesIcon', title: 'Autours Assistance',    description: 'Questions or issues? Autours support resolves U-SAVE booking queries 24/7.' },
    ],
    faqs: [
      { question: 'Is U-SAVE a trustworthy car rental company?',    answer: 'Yes â€” U-SAVE is a licensed and verified rental company operating across multiple markets. All listings on Autours are quality-checked.' },
      { question: 'Does U-SAVE offer one-way rentals?',             answer: 'One-way rental availability depends on the specific locations. Check the search page for current options and any applicable surcharge.' },
      { question: 'What is included in the U-SAVE rental price?',   answer: 'The rental price includes basic liability insurance. Additional cover options (CDW, Super CDW) are available at checkout.' },
      { question: 'Can I get a child seat with U-SAVE?',            answer: 'Yes â€” child and infant seats are available as an add-on. Book in advance to guarantee availability.' },
      { question: 'What fuel policy does U-SAVE use?',              answer: 'U-SAVE typically uses a full-to-full fuel policy. You pick up the car with a full tank and return it full to avoid fuel charges.' },
    ],
  },

  // RAMA
  'rama': {
    benefits: [
      { icon: 'Star',         title: 'Trusted Local Brand',     description: 'RAMA is a well-established local rental company with a strong regional reputation.' },
      { icon: 'BadgePercent', title: 'Affordable Rates',        description: 'RAMA provides competitive pricing that suits both short and long-term rentals.' },
      { icon: 'ShieldCheck',  title: 'Quality Vehicles',        description: 'RAMA\'s fleet is regularly maintained to ensure a safe and comfortable journey.' },
      { icon: 'MapPin',       title: 'Local Expertise',         description: 'RAMA\'s local knowledge means better branch locations and responsive service.' },
      { icon: 'Clock',        title: 'Instant Confirmation',    description: 'Book RAMA through Autours and receive your confirmation immediately.' },
      { icon: 'HeadphonesIcon', title: '24/7 Support',          description: 'Autours is here around the clock for all RAMA booking enquiries.' },
    ],
    faqs: [
      { question: 'Where does RAMA operate?',                      answer: 'RAMA operates in select markets in the Middle East. Branch locations are shown on the Autours location selector at booking.' },
      { question: 'Does RAMA offer long-term rental discounts?',   answer: 'Yes â€” the longer you rent, the lower the daily rate. Weekly and monthly packages offer the best value.' },
      { question: 'What documents do I need for a RAMA rental?',   answer: 'You need a valid driving licence, a passport or national ID, and a credit card in the renter\'s name for the deposit.' },
      { question: 'Can I add an extra driver to a RAMA rental?',   answer: 'Yes. Additional drivers must present their driving licence at pickup. A small daily fee applies.' },
      { question: 'What happens if my RAMA vehicle has a problem?', answer: 'Call RAMA\'s roadside number listed on your rental agreement. Autours support can also help coordinate assistance.' },
    ],
  },

  // KTC
  'ktc': {
    benefits: [
      { icon: 'Star',         title: 'Established & Reliable',  description: 'KTC is a trusted car rental brand with a strong track record of customer satisfaction.' },
      { icon: 'Zap',          title: 'Fast Processing',         description: 'KTC\'s efficient counter process ensures you\'re on the road without unnecessary delays.' },
      { icon: 'BadgePercent', title: 'Best KTC Rate',           description: 'Autours compares all KTC options to surface the lowest available rate for your dates.' },
      { icon: 'ShieldCheck',  title: 'Safe & Maintained Fleet', description: 'KTC vehicles are inspected and serviced regularly for maximum safety and comfort.' },
      { icon: 'MapPin',       title: 'Convenient Branches',     description: 'KTC branches are located at strategic points for easy access wherever you are.' },
      { icon: 'HeadphonesIcon', title: 'Autours Backup',        description: 'Autours support handles any KTC booking issue on your behalf â€” anytime.' },
    ],
    faqs: [
      { question: 'What vehicle types does KTC offer?',             answer: 'KTC offers a range including economy, saloon, SUV, and van options. Exact availability is shown on the Autours search results for your chosen location.' },
      { question: 'Is airport pickup available with KTC?',          answer: 'Yes â€” KTC has airport locations. Check the branch selector at booking to confirm hours and meeting point details.' },
      { question: 'Does KTC offer insurance upgrades?',             answer: 'Yes â€” Full CDW (zero excess) and Personal Accident Insurance can be added at the time of booking on Autours or at the counter.' },
      { question: 'Can I extend my KTC rental?',                    answer: 'Yes â€” contact KTC directly or reach out to Autours support to arrange an extension. Extensions are subject to vehicle availability.' },
      { question: 'What is the minimum age requirement at KTC?',    answer: 'The standard minimum age is 21. A young driver surcharge may apply for renters aged 21â€“24.' },
    ],
  },

  // HIGHWAY
  'highway': {
    benefits: [
      { icon: 'Zap',          title: 'Hit the Highway Ready',   description: 'HIGHWAY ensures every vehicle is road-ready so you can start your journey immediately.' },
      { icon: 'Star',         title: 'Quality Assured',         description: 'HIGHWAY\'s fleet goes through rigorous checks to keep you safe on every road.' },
      { icon: 'BadgePercent', title: 'Great Value',             description: 'Competitive rates and transparent pricing â€” what you see on Autours is what you pay.' },
      { icon: 'MapPin',       title: 'Easy to Find',            description: 'HIGHWAY branches are in prime locations at airports and city centres.' },
      { icon: 'ShieldCheck',  title: 'Full Coverage Options',   description: 'Add comprehensive insurance cover at checkout for complete peace of mind.' },
      { icon: 'HeadphonesIcon', title: 'Autours 24/7 Help',     description: 'Our team is always ready to assist with your HIGHWAY rental booking.' },
    ],
    faqs: [
      { question: 'Does HIGHWAY offer unlimited mileage?',          answer: 'Many HIGHWAY packages include unlimited mileage. The specific terms are shown on the vehicle card at checkout.' },
      { question: 'Can I rent a HIGHWAY car for one day only?',     answer: 'Yes â€” minimum rental is typically 1 day (24 hours). Some premium categories may require a 2-day minimum.' },
      { question: 'What payment methods does HIGHWAY accept?',      answer: 'A credit card is required for the security deposit. Payment for the rental itself may also be made by debit card or cash depending on the location.' },
      { question: 'Does HIGHWAY offer 4WD or off-road vehicles?',   answer: 'Yes â€” 4WD and SUV options are available at select locations. Filter by vehicle type on the Autours search page.' },
      { question: 'What is HIGHWAY\'s cancellation policy?',        answer: 'Free cancellation is available up to 48 hours before pickup for most bookings. The exact policy is shown at checkout.' },
    ],
  },

  // SAFETY
  'safety': {
    benefits: [
      { icon: 'ShieldCheck',  title: 'Safety is Our Priority', description: 'SAFETY puts your wellbeing first â€” every vehicle is thoroughly inspected before rental.' },
      { icon: 'Star',         title: 'Certified Vehicles',      description: 'SAFETY\'s fleet meets all local safety regulations and is regularly renewed.' },
      { icon: 'BadgePercent', title: 'Transparent Pricing',     description: 'No surprises at the counter â€” SAFETY\'s full rate is shown clearly on Autours.' },
      { icon: 'Clock',        title: 'Reliable Punctuality',    description: 'SAFETY prides itself on having your vehicle ready exactly when and where you need it.' },
      { icon: 'MapPin',       title: 'Key Locations',           description: 'SAFETY branches are at airports and city hubs for maximum convenience.' },
      { icon: 'HeadphonesIcon', title: 'Autours Support',       description: 'Any question about your SAFETY rental is handled by Autours support 24/7.' },
    ],
    faqs: [
      { question: 'What makes SAFETY different from other car rental companies?', answer: 'As the name suggests, SAFETY places vehicle condition and roadworthiness at the centre of its service. Every car is fully checked before handover.' },
      { question: 'Does SAFETY offer insurance with the rental?',   answer: 'Basic coverage is included. Upgraded options (CDW, Super CDW, PAI) are available at checkout or at pickup.' },
      { question: 'Can I return my SAFETY rental at a different location?', answer: 'One-way returns are available at select locations. An additional fee applies and must be pre-selected at booking.' },
      { question: 'Does SAFETY allow pets in the vehicle?',         answer: 'Pet policies vary by branch. Please contact Autours support before booking to confirm and avoid any cleaning surcharges.' },
      { question: 'What if I need roadside assistance from SAFETY?', answer: 'All SAFETY rentals come with a 24/7 emergency number on the rental agreement. Autours support can also help coordinate assistance.' },
    ],
  },

  // AUTORENT
  'autorent': {
    benefits: [
      { icon: 'Zap',          title: 'Simple & Speedy',         description: 'AUTORENT keeps the rental process simple â€” book in minutes, pick up fast.' },
      { icon: 'BadgePercent', title: 'Best Value Rates',        description: 'Autours ensures you always see AUTORENT\'s lowest available rate.' },
      { icon: 'Star',         title: 'Varied Fleet',            description: 'AUTORENT offers a broad selection of vehicles to match every need and budget.' },
      { icon: 'ShieldCheck',  title: 'Maintained & Verified',   description: 'AUTORENT vehicles are regularly inspected and cleaned before every rental.' },
      { icon: 'MapPin',       title: 'Airport Accessible',      description: 'Find AUTORENT at major airports for a smooth start to your journey.' },
      { icon: 'Clock',        title: 'Flexible Pickup Times',   description: 'AUTORENT accommodates early morning and late-night pickups at select branches.' },
    ],
    faqs: [
      { question: 'How do I pick up my AUTORENT vehicle?',          answer: 'Head to the AUTORENT counter at your chosen location. The counter address and opening hours are in your booking confirmation.' },
      { question: 'Can I pay cash at AUTORENT?',                    answer: 'A credit card is required for the security deposit at all AUTORENT locations. Cash may be accepted for the rental fee at some branches â€” confirm at booking.' },
      { question: 'Does AUTORENT offer van or minibus rentals?',    answer: 'AUTORENT offers larger vehicles at select locations. Use the vehicle type filter on Autours to find available vans or minibuses.' },
      { question: 'What if the AUTORENT vehicle has a fault on the road?', answer: 'Call the AUTORENT roadside assistance number on your rental agreement immediately. Autours support is also available to help coordinate.' },
      { question: 'Can I cross borders with an AUTORENT vehicle?',  answer: 'Cross-border travel is generally not permitted without prior written approval from AUTORENT. Please confirm before your rental if you plan to travel across borders.' },
    ],
  },

  // EASY RENTAL
  'easy-rental': {
    benefits: [
      { icon: 'Zap',          title: 'Effortlessly Easy',       description: 'EASY RENTAL makes car hire genuinely simple â€” from booking to drop-off.' },
      { icon: 'BadgePercent', title: 'Affordable for All',      description: 'EASY RENTAL provides great value rates suitable for every type of traveller.' },
      { icon: 'ShieldCheck',  title: 'Hassle-Free Process',     description: 'Clear terms, transparent pricing, and a smooth pickup â€” no complications.' },
      { icon: 'Star',         title: 'Clean & Ready',           description: 'Every EASY RENTAL vehicle is cleaned and prepared before you collect it.' },
      { icon: 'MapPin',       title: 'Accessible Locations',    description: 'EASY RENTAL branches at airports and city centres for your convenience.' },
      { icon: 'Clock',        title: 'Quick Confirmation',      description: 'Book and confirm your EASY RENTAL in seconds through Autours.' },
    ],
    faqs: [
      { question: 'Is the booking process really easy with EASY RENTAL?', answer: 'Absolutely â€” select your vehicle on Autours, enter your details, and confirm in under 2 minutes. You\'ll receive an instant email confirmation.' },
      { question: 'What is included in the EASY RENTAL price?',    answer: 'Basic liability coverage and unlimited mileage (where applicable) are included. Full details of what\'s included are shown on the vehicle card.' },
      { question: 'Can I rent without a credit card at EASY RENTAL?', answer: 'A credit card is preferred for the security deposit. Some branches may accept debit cards â€” please confirm at booking.' },
      { question: 'What is EASY RENTAL\'s late return policy?',    answer: 'A grace period of up to 59 minutes is typically allowed. After that, an extra half-day or full day charge may apply.' },
      { question: 'Does EASY RENTAL offer family vehicles?',        answer: 'Yes â€” larger vehicles including SUVs and 7-seaters are available at select EASY RENTAL branches. Filter by category on the Autours search page.' },
    ],
  },

  // STREET
  'street': {
    benefits: [
      { icon: 'MapPin',       title: 'Street-Smart Locations',  description: 'STREET branches are placed in the most practical spots for urban travellers.' },
      { icon: 'Zap',          title: 'Ready When You Are',      description: 'STREET\'s fast counter process means your car is ready the moment you arrive.' },
      { icon: 'BadgePercent', title: 'City-Friendly Rates',     description: 'Competitive pricing tailored for short city stays and weekend getaways.' },
      { icon: 'Star',         title: 'Urban Fleet',             description: 'STREET offers compact and midsize cars perfect for navigating busy city streets.' },
      { icon: 'ShieldCheck',  title: 'Trusted & Reviewed',      description: 'Verified customer feedback confirms STREET\'s consistent service quality.' },
      { icon: 'HeadphonesIcon', title: 'Autours Backup',        description: 'Autours support is available 24/7 for any STREET booking need.' },
    ],
    faqs: [
      { question: 'Is STREET car rental good for city driving?',   answer: 'Yes â€” STREET specialises in compact vehicles ideal for city centres. Their branches are located for maximum urban convenience.' },
      { question: 'Does STREET offer parking assistance?',          answer: 'STREET vehicles come with parking sensors as standard on many models. The specific features of each car are listed on the vehicle card.' },
      { question: 'Can I book a STREET car for just a few hours?',  answer: 'Minimum rental is typically 24 hours. For shorter durations, please contact Autours support for alternative options.' },
      { question: 'Does STREET allow travel outside the city?',     answer: 'Yes â€” STREET vehicles can be used for inter-city travel within the same country. Cross-border travel requires prior approval.' },
      { question: 'What insurance is included with STREET rentals?', answer: 'Basic Collision Damage Waiver is included. Additional coverage options are available at checkout or at the counter.' },
    ],
  },

  // EMR
  'emr': {
    benefits: [
      { icon: 'Star',         title: 'Expert Mobility',         description: 'EMR provides expert-level car rental services backed by years of regional experience.' },
      { icon: 'Zap',          title: 'Efficient Pickup',        description: 'EMR\'s organised counter process means you spend less time waiting and more time exploring.' },
      { icon: 'BadgePercent', title: 'Autours Best Price',      description: 'Book EMR through Autours for the most competitive rate available â€” no extra fees.' },
      { icon: 'ShieldCheck',  title: 'Well-Maintained Cars',    description: 'EMR vehicles are serviced on a strict schedule to ensure reliability.' },
      { icon: 'MapPin',       title: 'Airport & City Spots',    description: 'EMR branches at airports and city centres make pickup and drop-off straightforward.' },
      { icon: 'Clock',        title: 'Flexible Scheduling',     description: 'EMR accommodates various pickup times to match your travel plans.' },
    ],
    faqs: [
      { question: 'What does EMR stand for?',                      answer: 'EMR stands for Expert Mobility Rentals â€” reflecting the company\'s commitment to a professional and reliable car rental experience.' },
      { question: 'Does EMR offer business rental accounts?',       answer: 'Yes â€” EMR offers corporate accounts with streamlined billing and dedicated account management. Contact Autours for business enquiries.' },
      { question: 'Can I get a receipt for my EMR rental?',         answer: 'Yes â€” a full receipt is provided at the end of your rental. Digital copies can be requested from the counter.' },
      { question: 'What vehicle sizes does EMR offer?',             answer: 'EMR offers a range from compact economy cars to SUVs and larger vehicles. See the full selection on the Autours search page.' },
      { question: 'Is roadside assistance included with EMR?',      answer: 'Yes â€” 24/7 roadside assistance is included with all EMR rentals. The contact number is on your rental agreement.' },
    ],
  },

  // MAHD Car Rental
  'mahd-car-rental': {
    benefits: [
      { icon: 'Star',         title: 'Premium Regional Service', description: 'MAHD Car Rental delivers a premium-quality rental experience across the region.' },
      { icon: 'ShieldCheck',  title: 'Inspected Fleet',         description: 'Every MAHD vehicle passes a pre-rental inspection for your safety and comfort.' },
      { icon: 'BadgePercent', title: 'Competitive Pricing',     description: 'MAHD offers fair, transparent rates with no hidden charges at the counter.' },
      { icon: 'MapPin',       title: 'Strategic Branches',      description: 'MAHD locations are positioned at airports and high-traffic city spots.' },
      { icon: 'Globe',        title: 'Regional Coverage',       description: 'MAHD covers multiple markets across the Middle East and North Africa.' },
      { icon: 'HeadphonesIcon', title: 'Autours Support',       description: 'Our team is on hand 24/7 for any MAHD Car Rental booking query.' },
    ],
    faqs: [
      { question: 'What makes MAHD Car Rental stand out?',          answer: 'MAHD focuses on delivering a premium regional experience, combining quality vehicles with attentive local service â€” now bookable through Autours.' },
      { question: 'Does MAHD Car Rental offer SUVs?',               answer: 'Yes â€” MAHD has SUVs and family vehicles in its fleet. Filter by type on the Autours search page for current availability.' },
      { question: 'Can I modify a MAHD booking through Autours?',   answer: 'Yes â€” use the Manage Booking section on Autours. Changes are subject to vehicle availability and rate differences.' },
      { question: 'What is the security deposit for MAHD?',         answer: 'The deposit amount varies by vehicle category and rental duration. It is shown during checkout and refunded at return.' },
      { question: 'Does MAHD allow cross-border travel?',           answer: 'Cross-border travel requires prior written approval from MAHD. Please contact Autours support before confirming if you plan to cross borders.' },
    ],
  },

  // DRIVUS
  'drivus': {
    benefits: [
      { icon: 'Zap',          title: 'Drive with Confidence',   description: 'DRIVUS puts you in control with a reliable, well-maintained vehicle and clear terms.' },
      { icon: 'Star',         title: 'Modern Fleet',            description: 'DRIVUS keeps its fleet current â€” enjoy newer models with the latest features.' },
      { icon: 'BadgePercent', title: 'Fair Pricing',            description: 'DRIVUS rates are transparent and competitive across all booking durations.' },
      { icon: 'ShieldCheck',  title: 'Safety Certified',        description: 'Every DRIVUS vehicle is certified and maintained to the highest local standards.' },
      { icon: 'MapPin',       title: 'Airport Pickup',          description: 'DRIVUS offers convenient airport pickup and drop-off at all served locations.' },
      { icon: 'HeadphonesIcon', title: 'Autours 24/7',          description: 'Autours provides round-the-clock support for all DRIVUS bookings.' },
    ],
    faqs: [
      { question: 'Is DRIVUS available at the airport?',            answer: 'Yes â€” DRIVUS has airport branches at key locations. The exact counter details are in your booking confirmation.' },
      { question: 'Does DRIVUS include insurance in the base rate?', answer: 'Yes â€” basic Collision Damage Waiver is included. You can upgrade to full cover at checkout for added peace of mind.' },
      { question: 'Can I drive a DRIVUS vehicle outside the country?', answer: 'Cross-border driving is not included by default. Please request approval from DRIVUS via Autours support before your rental starts.' },
      { question: 'What is the deposit amount for DRIVUS?',         answer: 'The security deposit depends on the vehicle type and rental length. The exact amount is shown before you confirm the booking.' },
      { question: 'Does DRIVUS offer child seats?',                 answer: 'Yes â€” infant, toddler, and booster seats are available. Add one at the booking stage to ensure it\'s ready at pickup.' },
    ],
  },

  // Routes
  'routes': {
    benefits: [
      { icon: 'MapPin',       title: 'Routes for Every Journey', description: 'Routes covers all the destinations you need with branches in prime locations.' },
      { icon: 'Star',         title: 'Trusted Partner',          description: 'Routes is a verified Autours partner with consistent customer satisfaction scores.' },
      { icon: 'BadgePercent', title: 'Best Routes Rate',         description: 'Autours always shows Routes\'s lowest available rate â€” no booking fees added.' },
      { icon: 'ShieldCheck',  title: 'Safe Vehicles',            description: 'Routes maintains its fleet to rigorous safety and cleanliness standards.' },
      { icon: 'Clock',        title: 'On-Time Delivery',         description: 'Routes ensures your vehicle is ready at the agreed time and location.' },
      { icon: 'HeadphonesIcon', title: 'Autours Help Desk',      description: 'Any Routes booking issue is handled by Autours support within minutes.' },
    ],
    faqs: [
      { question: 'How do I find the Routes pickup location?',       answer: 'The exact pickup address is in your booking confirmation. You can also find it using the branch map on the Autours location page.' },
      { question: 'Does Routes offer long-term rental rates?',       answer: 'Yes â€” Routes provides weekly and monthly rental packages at reduced daily rates. Contact Autours for a long-term quote.' },
      { question: 'Can I add a driver under 25 to a Routes booking?', answer: 'Young drivers (21â€“24) may be added as additional drivers. A surcharge applies and varies by location.' },
      { question: 'What is Routes\'s late return policy?',           answer: 'A short grace period is usually allowed. After that, an extra hour or full day may be charged. Contact Routes directly if you are running late.' },
      { question: 'Does Routes offer a delivery service?',           answer: 'Vehicle delivery to your hotel or residence is available at some Routes branches for an additional fee. Confirm at booking.' },
    ],
  },

  // Essence
  'essence': {
    benefits: [
      { icon: 'Star',         title: 'Refined Experience',       description: 'Essence offers a refined, upscale car rental experience at accessible prices.' },
      { icon: 'Zap',          title: 'Smooth Pickup',            description: 'Essence\'s organised handover means you spend more time on your journey and less at the counter.' },
      { icon: 'BadgePercent', title: 'Great Value',              description: 'Autours ensures you always book Essence at the best available price.' },
      { icon: 'ShieldCheck',  title: 'Premium Condition',        description: 'Essence vehicles are cleaned, inspected, and prepared to the highest standard.' },
      { icon: 'Globe',        title: 'Regional Presence',        description: 'Essence serves key markets with branches at airports and city locations.' },
      { icon: 'HeadphonesIcon', title: 'Dedicated Support',      description: 'Autours support is available 24/7 for any Essence booking enquiry.' },
    ],
    faqs: [
      { question: 'What type of vehicles does Essence offer?',       answer: 'Essence provides a curated fleet of economy, midsize, and premium vehicles. The full selection is available on the Autours search page.' },
      { question: 'Is insurance included with Essence?',             answer: 'Basic coverage is included in all Essence rentals. Upgrade options are available at checkout.' },
      { question: 'Can I book Essence for a one-day rental?',        answer: 'Yes â€” minimum rental duration is 1 day (24 hours). Some vehicles may require a 2-day minimum.' },
      { question: 'Does Essence have a loyalty programme?',          answer: 'Loyal customers are rewarded through Autours promotional deals. Sign up for the Autours newsletter to stay informed of exclusive offers.' },
      { question: 'What is Essence\'s cancellation policy?',         answer: 'Most Essence bookings through Autours offer free cancellation up to 48 hours before pickup. Check your booking terms for specifics.' },
    ],
  },

  // SurPrice
  'surprice': {
    benefits: [
      { icon: 'BadgePercent', title: 'Surprising Prices',        description: 'SurPrice lives up to its name â€” consistently low rates that surprise even seasoned travellers.' },
      { icon: 'Star',         title: 'Quality Fleet',            description: 'SurPrice maintains a diverse, well-serviced vehicle fleet at every location.' },
      { icon: 'ShieldCheck',  title: 'Transparent Terms',        description: 'No hidden fees â€” SurPrice\'s full pricing is shown clearly before you confirm.' },
      { icon: 'Zap',          title: 'Fast Pickup',              description: 'SurPrice\'s efficient counter process gets you behind the wheel without delay.' },
      { icon: 'MapPin',       title: 'Airport & City Branches',  description: 'SurPrice branches are located at key airports and city centres for maximum convenience.' },
      { icon: 'HeadphonesIcon', title: 'Autours Support',        description: 'Got a question? Autours support handles all SurPrice bookings 24/7.' },
    ],
    faqs: [
      { question: 'Are SurPrice rates really that low?',            answer: 'Yes â€” SurPrice focuses on offering highly competitive rates without compromising on vehicle quality. Book through Autours to always get the best SurPrice rate.' },
      { question: 'Is SurPrice available at the airport?',          answer: 'Yes â€” SurPrice has airport pickup locations. The counter details are included in your booking confirmation.' },
      { question: 'Does SurPrice include unlimited mileage?',       answer: 'Most SurPrice packages include generous mileage allowances. The exact terms are shown on the vehicle card at checkout.' },
      { question: 'Can I upgrade my SurPrice vehicle at pickup?',   answer: 'Subject to vehicle availability, upgrades can often be arranged at the counter. Confirm with the SurPrice team on arrival.' },
      { question: 'What is the SurPrice security deposit amount?',  answer: 'The deposit varies by vehicle category. The exact amount is displayed during the Autours checkout process before you confirm.' },
    ],
  },

  // Autowill
  'autowill': {
    benefits: [
      { icon: 'Zap',          title: 'Where There\'s a Willâ€¦',  description: 'Autowill is driven by a commitment to get you the right vehicle, every time.' },
      { icon: 'Star',         title: 'Reliable & Consistent',   description: 'Autowill customers return again and again for the dependable service quality.' },
      { icon: 'BadgePercent', title: 'Value Rates',             description: 'Autours ensures you always access Autowill\'s most competitive pricing.' },
      { icon: 'ShieldCheck',  title: 'Well-Maintained Fleet',   description: 'Autowill vehicles are thoroughly inspected before every handover.' },
      { icon: 'MapPin',       title: 'Convenient Pickup',       description: 'Autowill branches at airports and city centres for a seamless start.' },
      { icon: 'Clock',        title: 'On-Time Service',         description: 'Autowill guarantees your vehicle is ready at the confirmed time.' },
    ],
    faqs: [
      { question: 'What makes Autowill a good choice?',             answer: 'Autowill combines reliable vehicles, fair pricing, and attentive service â€” making it a dependable option for both leisure and business travellers.' },
      { question: 'Does Autowill offer airport pickup?',            answer: 'Yes â€” Autowill has airport counter locations. Full details are in your booking confirmation.' },
      { question: 'Can I cancel my Autowill booking for free?',     answer: 'Free cancellation is available up to 48 hours before pickup for most bookings. Check the cancellation terms shown at checkout.' },
      { question: 'What fuel policy does Autowill use?',            answer: 'Autowill operates on a full-to-full fuel policy. You collect the car with a full tank and return it full to avoid extra charges.' },
      { question: 'Does Autowill offer van rentals?',               answer: 'Larger vehicles including vans may be available at select Autowill locations. Use the vehicle type filter on Autours.' },
    ],
  },

  // Nissa
  'nissa': {
    benefits: [
      { icon: 'Star',         title: 'Smooth & Stylish',        description: 'Nissa offers a smooth, stylish rental experience with a curated vehicle selection.' },
      { icon: 'BadgePercent', title: 'Great Daily Rates',       description: 'Competitive pricing for every duration â€” from day trips to extended stays.' },
      { icon: 'ShieldCheck',  title: 'Inspected & Clean',       description: 'Each Nissa vehicle is cleaned and checked before your arrival.' },
      { icon: 'Zap',          title: 'Quick Booking',           description: 'Book your Nissa car on Autours in seconds â€” instant confirmation every time.' },
      { icon: 'MapPin',       title: 'Prime Locations',         description: 'Nissa branches at airports and key city spots for effortless pickup.' },
      { icon: 'HeadphonesIcon', title: 'Autours 24/7',          description: 'Any issue with your Nissa booking is handled by Autours support anytime.' },
    ],
    faqs: [
      { question: 'What is the pickup process with Nissa?',         answer: 'Head to the Nissa counter at your chosen location. The address and hours are on your booking confirmation. Our team is ready to process you quickly.' },
      { question: 'Does Nissa have a child seat option?',           answer: 'Yes â€” infant and child seats are available as add-ons at booking. We recommend pre-booking to guarantee availability.' },
      { question: 'What is Nissa\'s cancellation policy?',          answer: 'Most Nissa bookings offer free cancellation up to 48 hours prior to pickup. Full policy details are shown at checkout.' },
      { question: 'Can I pay at the counter with Nissa?',           answer: 'A credit card is required for the security deposit. The rental fee payment method varies by location â€” confirm at booking.' },
      { question: 'Does Nissa offer GPS navigation?',               answer: 'GPS units are available as an optional extra. Alternatively, use your smartphone with a compatible mount.' },
    ],
  },

  // MY Mobirent
  'my-mobirent': {
    benefits: [
      { icon: 'Zap',          title: 'Mobile-First Rental',     description: 'MY Mobirent is built for the modern traveller â€” book, manage, and return with ease.' },
      { icon: 'Star',         title: 'Flexible Options',        description: 'MY Mobirent offers a wide range of vehicles and rental durations to fit any plan.' },
      { icon: 'BadgePercent', title: 'Best Mobirent Rate',      description: 'Autours always surfaces MY Mobirent\'s lowest available rate for your dates.' },
      { icon: 'ShieldCheck',  title: 'Verified & Safe',         description: 'MY Mobirent vehicles are inspected and certified for safety before every rental.' },
      { icon: 'MapPin',       title: 'Accessible Locations',    description: 'MY Mobirent branches at airports and city hubs for seamless access.' },
      { icon: 'HeadphonesIcon', title: 'Autours Support',       description: 'Our support team handles MY Mobirent booking queries 24/7.' },
    ],
    faqs: [
      { question: 'What does MY Mobirent specialise in?',           answer: 'MY Mobirent focuses on providing a flexible, modern car rental experience â€” ideal for travellers who want a smooth, digital-first booking process.' },
      { question: 'Can I extend my MY Mobirent rental online?',     answer: 'Yes â€” contact Autours support or the MY Mobirent branch to arrange an extension. This is subject to vehicle availability.' },
      { question: 'Does MY Mobirent offer electric vehicles?',      answer: 'EV availability depends on the specific MY Mobirent location. Filter by "Electric" on the Autours search page to check.' },
      { question: 'Is there an app for managing MY Mobirent bookings?', answer: 'Manage your booking through the Autours platform. All reservation details, modifications, and cancellations are handled there.' },
      { question: 'What documents do I need for MY Mobirent pickup?', answer: 'You\'ll need a valid driving licence, a passport or national ID, and the credit card used for the booking (for the deposit).' },
    ],
  },

  // XDrive Mobility
  'xdrive-mobility': {
    benefits: [
      { icon: 'Zap',          title: 'Drive to the Extreme',    description: 'XDrive Mobility delivers high-performance vehicles for those who demand more from their drive.' },
      { icon: 'Star',         title: 'Premium Vehicles',        description: 'XDrive Mobility\'s fleet features top-tier models for a truly elevated rental experience.' },
      { icon: 'BadgePercent', title: 'Autours Pricing',         description: 'Access XDrive Mobility\'s best rates exclusively through Autours.' },
      { icon: 'ShieldCheck',  title: 'Fully Maintained',        description: 'Every XDrive Mobility vehicle is meticulously serviced and inspected.' },
      { icon: 'Globe',        title: 'Performance Meets Travel', description: 'Whether business or leisure, XDrive Mobility elevates every journey.' },
      { icon: 'HeadphonesIcon', title: 'Dedicated Support',     description: 'Autours provides 24/7 support for all XDrive Mobility reservations.' },
    ],
    faqs: [
      { question: 'What type of vehicles does XDrive Mobility offer?', answer: 'XDrive Mobility specialises in premium and performance vehicles. The available selection is shown in real time on the Autours search page.' },
      { question: 'Is a special licence required for XDrive Mobility vehicles?', answer: 'A standard driving licence is sufficient for most vehicles. Certain high-performance models may require additional verification â€” this is noted on the vehicle listing.' },
      { question: 'Does XDrive Mobility offer daily exotic car rentals?', answer: 'Yes â€” short-term rentals including daily bookings are available for most vehicles in the XDrive Mobility fleet.' },
      { question: 'What is the security deposit for XDrive Mobility?', answer: 'The deposit for premium vehicles is typically higher than standard rentals. The exact amount is shown at checkout before confirmation.' },
      { question: 'Can I drive an XDrive Mobility car on a track?',  answer: 'Track use is not permitted under standard rental terms. The vehicle is for road use only within the country of rental.' },
    ],
  },

  // SKYES CAR RENTAL
  'skyes-car-rental': {
    benefits: [
      { icon: 'Star',         title: 'Sky\'s the Limit',        description: 'SKYES CAR RENTAL reaches for the highest standards in every aspect of your rental.' },
      { icon: 'BadgePercent', title: 'Competitive Rates',       description: 'SKYES offers great value pricing across all vehicle categories and rental durations.' },
      { icon: 'ShieldCheck',  title: 'Inspected & Ready',       description: 'Every SKYES vehicle goes through a full pre-rental check for safety and cleanliness.' },
      { icon: 'Zap',          title: 'Efficient Service',       description: 'SKYES\'s streamlined process ensures a quick and smooth pickup every time.' },
      { icon: 'MapPin',       title: 'Key Locations',           description: 'SKYES branches at airports and city centres for ultimate convenience.' },
      { icon: 'HeadphonesIcon', title: 'Autours Backup',        description: 'Autours support is available 24/7 for any SKYES CAR RENTAL booking.' },
    ],
    faqs: [
      { question: 'What does SKYES CAR RENTAL offer?',              answer: 'SKYES provides a full range of car rental categories, from compact economy cars to spacious SUVs, with clear pricing and reliable service.' },
      { question: 'Is SKYES CAR RENTAL available at the airport?',  answer: 'Yes â€” SKYES has airport branch locations. The counter details are in your Autours booking confirmation.' },
      { question: 'Can I add insurance to my SKYES booking?',        answer: 'Yes â€” CDW, Super CDW, and PAI are available at checkout or at the pickup counter.' },
      { question: 'What is SKYES\'s cancellation policy?',           answer: 'Most SKYES bookings through Autours offer free cancellation up to 48 hours before pickup. Terms are shown at checkout.' },
      { question: 'Does SKYES allow additional drivers?',            answer: 'Yes â€” additional drivers can be added at pickup with a valid licence. A daily fee typically applies.' },
    ],
  },

  // Sharr Express
  'sharr-express': {
    benefits: [
      { icon: 'Zap',          title: 'Express Service',         description: 'Sharr Express delivers fast, no-fuss car rental for travellers on the move.' },
      { icon: 'Star',         title: 'Reliable Fleet',          description: 'Sharr Express vehicles are well-maintained and consistently rated highly by customers.' },
      { icon: 'BadgePercent', title: 'Express Value',           description: 'Competitive pricing across all Sharr Express categories, shown clearly on Autours.' },
      { icon: 'ShieldCheck',  title: 'Safety First',            description: 'Sharr Express inspects every vehicle before handover for your safety on the road.' },
      { icon: 'MapPin',       title: 'Strategic Locations',     description: 'Sharr Express branches at airports and key city points for easy access.' },
      { icon: 'Clock',        title: 'On-Time Every Time',      description: 'Your Sharr Express vehicle is ready at the agreed time â€” no waiting around.' },
    ],
    faqs: [
      { question: 'How fast is the Sharr Express pickup process?',   answer: 'Sharr Express is known for its efficient counter service. Most pickups are completed within minutes of arriving at the branch.' },
      { question: 'Does Sharr Express offer unlimited mileage?',     answer: 'Many Sharr Express packages include unlimited mileage. The exact terms are shown on the vehicle card at checkout.' },
      { question: 'Can I return my Sharr Express car early?',        answer: 'Early returns are accepted. No refund is given for unused days unless a flexible rate was selected at booking.' },
      { question: 'Is Sharr Express suitable for business travel?',  answer: 'Yes â€” Sharr Express offers reliable, professional vehicles well-suited to business travellers. Corporate accounts are also available.' },
      { question: 'Does Sharr Express offer delivery to hotels?',    answer: 'Vehicle delivery is available at select Sharr Express branches for an additional fee. Confirm availability when booking.' },
    ],
  },

  // ALLMEET Rent A Car
  'allmeet-rent-a-car': {
    benefits: [
      { icon: 'Globe',        title: 'All Meets',               description: 'ALLMEET Rent A Car is built to meet every traveller\'s needs â€” business, family, or solo.' },
      { icon: 'Star',         title: 'Diverse Fleet',           description: 'ALLMEET offers a wide vehicle range to suit every preference and budget.' },
      { icon: 'BadgePercent', title: 'Best Autours Price',      description: 'Autours always shows ALLMEET\'s most competitive rate â€” zero booking fees.' },
      { icon: 'ShieldCheck',  title: 'Quality Assured',         description: 'ALLMEET vehicles are rigorously maintained and inspected before every rental.' },
      { icon: 'MapPin',       title: 'All-Location Access',     description: 'ALLMEET branches at airports and city centres make any pickup convenient.' },
      { icon: 'HeadphonesIcon', title: 'Autours 24/7 Help',     description: 'Any ALLMEET booking question is handled quickly by our support team.' },
    ],
    faqs: [
      { question: 'What does ALLMEET Rent A Car specialise in?',    answer: 'ALLMEET specialises in meeting the needs of all traveller types â€” with flexible rental options, a broad vehicle range, and competitive pricing.' },
      { question: 'Does ALLMEET offer airport pickup?',             answer: 'Yes â€” ALLMEET has airport branch locations. Pickup and drop-off details are included in your booking confirmation.' },
      { question: 'Can I book ALLMEET for a week or longer?',       answer: 'Yes â€” weekly and monthly rates are available with significant daily rate reductions for longer bookings.' },
      { question: 'Does ALLMEET have vehicles for large groups?',   answer: 'Yes â€” ALLMEET offers minivans and larger vehicles at select locations. Use the vehicle type filter on Autours to find them.' },
      { question: 'What is ALLMEET\'s refund policy on cancellation?', answer: 'Bookings cancelled up to 48 hours before pickup are typically fully refunded. Full terms are shown at the checkout stage.' },
    ],
  },

};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Public helper
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Returns brand-specific benefits & FAQs.
 * Falls back to `defaultBrandExtra` for any brand not explicitly listed above.
 * The `brandId` is the slug returned by the API as `brand.id`.
 */
export function getBrandExtras(brandId: string): BrandExtra {
  const specific = brandExtrasMap[brandId];
  return {
    brandId,
    benefits: specific?.benefits ?? defaultBrandExtra.benefits,
    faqs:     specific?.faqs     ?? defaultBrandExtra.faqs,
  };
}