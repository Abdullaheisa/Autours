export const currencies = [
  { code: 'AED', flag: '🇦🇪', name: 'UAE Dirham' },
  { code: 'SAR', flag: '🇸🇦', name: 'Saudi Riyal' },
  { code: 'USD', flag: '🇺🇸', name: 'US Dollar' },
  { code: 'EGP', flag: '🇪🇬', name: 'Egyptian Pound' },
  { code: 'EUR', flag: '🇪🇺', name: 'Euro' },
  { code: 'QAR', flag: '🇶🇦', name: 'Qatari Riyal' },
  { code: 'KWD', flag: '🇰🇼', name: 'Kuwaiti Dinar' },
];

export const countries = [
  { id: "uae", name: "الإمارات العربية المتحدة", nameEn: "UAE", flag: "🇦🇪" },
  { id: "saudi", name: "المملكة العربية السعودية", nameEn: "Saudi Arabia", flag: "🇸🇦" },
  { id: "egypt", name: "مصر", nameEn: "Egypt", flag: "🇪🇬" },
  { id: "qatar", name: "قطر", nameEn: "Qatar", flag: "🇶🇦" },
  { id: "kuwait", name: "الكويت", nameEn: "Kuwait", flag: "🇰🇼" },
  { id: "bahrain", name: "البحرين", nameEn: "Bahrain", flag: "🇧🇭" },
  { id: "oman", name: "عمان", nameEn: "Oman", flag: "🇴🇲" },
  { id: "jordan", name: "الأردن", nameEn: "Jordan", flag: "🇯🇴" },
  { id: "morocco", name: "المغرب", nameEn: "Morocco", flag: "🇲🇦" },
];

export const companies = [
  { id: 1, name: "MAHD Rent", country: "uae", vehicles: 45, bookings: 1234, revenue: 456000, rating: 4.8 },
  { id: 2, name: "Autocar Elite", country: "saudi", vehicles: 62, bookings: 2156, revenue: 789000, rating: 4.6 },
  { id: 3, name: "Nile Motors", country: "egypt", vehicles: 38, bookings: 987, revenue: 234000, rating: 4.5 },
  { id: 4, name: "Doha Wheels", country: "qatar", vehicles: 28, bookings: 756, revenue: 345000, rating: 4.7 },
  { id: 5, name: "Kuwait Ride", country: "kuwait", vehicles: 33, bookings: 654, revenue: 278000, rating: 4.4 },
  { id: 6, name: "Bahrain Auto", country: "bahrain", vehicles: 22, bookings: 432, revenue: 189000, rating: 4.3 },
  { id: 7, name: "Oman Drive", country: "oman", vehicles: 18, bookings: 321, revenue: 156000, rating: 4.5 },
  { id: 8, name: "Jordan Cars", country: "jordan", vehicles: 25, bookings: 543, revenue: 198000, rating: 4.2 },
  { id: 9, name: "Maghreb Rent", country: "morocco", vehicles: 30, bookings: 678, revenue: 267000, rating: 4.6 },
  { id: 10, name: "Desert Line", country: "uae", vehicles: 35, bookings: 876, revenue: 398000, rating: 4.4 },
  { id: 11, name: "Riyadh Motors", country: "saudi", vehicles: 48, bookings: 1432, revenue: 567000, rating: 4.7 },
  { id: 12, name: "Cairo Wheels", country: "egypt", vehicles: 42, bookings: 1123, revenue: 312000, rating: 4.3 },
];

export const vehicles = [
  { id: 1, name: "Toyota Camry", category: "Sedan", bookings: 2345, revenue: 890000, image: "🚗" },
  { id: 2, name: "Honda Accord", category: "Sedan", bookings: 1987, revenue: 756000, image: "🚙" },
  { id: 3, name: "BMW X5", category: "SUV", bookings: 1876, revenue: 1234000, image: "🚘" },
  { id: 4, name: "Mercedes C-Class", category: "Luxury", bookings: 1654, revenue: 987000, image: "🏎️" },
  { id: 5, name: "Nissan Patrol", category: "SUV", bookings: 1543, revenue: 1123000, image: "🚙" },
  { id: 6, name: "Hyundai Tucson", category: "SUV", bookings: 1432, revenue: 567000, image: "🚗" },
  { id: 7, name: "Kia Sportage", category: "SUV", bookings: 1321, revenue: 498000, image: "🚙" },
  { id: 8, name: "Audi A6", category: "Luxury", bookings: 1210, revenue: 876000, image: "🏎️" },
  { id: 9, name: "Toyota Land Cruiser", category: "SUV", bookings: 2198, revenue: 1456000, image: "🚙" },
  { id: 10, name: "Lexus RX", category: "Luxury", bookings: 1765, revenue: 1345000, image: "🚘" },
];

export const bookingsByCountry = [
  { country: "UAE", bookings: 3456, revenue: 1456000, vehicles: 80 },
  { country: "Saudi", bookings: 4123, revenue: 1890000, vehicles: 110 },
  { country: "Egypt", bookings: 2345, revenue: 678000, vehicles: 80 },
  { country: "Qatar", bookings: 1876, revenue: 789000, vehicles: 28 },
  { country: "Kuwait", bookings: 1654, revenue: 567000, vehicles: 33 },
  { country: "Bahrain", bookings: 1234, revenue: 456000, vehicles: 22 },
  { country: "Oman", bookings: 987, revenue: 345000, vehicles: 18 },
  { country: "Jordan", bookings: 1456, revenue: 567000, vehicles: 25 },
  { country: "Morocco", bookings: 1765, revenue: 678000, vehicles: 30 },
];

export const monthlyBookings = [
  { month: "Jan", bookings: 2340, revenue: 890000 },
  { month: "Feb", bookings: 2567, revenue: 980000 },
  { month: "Mar", bookings: 2890, revenue: 1120000 },
  { month: "Apr", bookings: 3123, revenue: 1234000 },
  { month: "May", bookings: 3456, revenue: 1345000 },
  { month: "Jun", bookings: 3789, revenue: 1456000 },
  { month: "Jul", bookings: 4123, revenue: 1678000 },
  { month: "Aug", bookings: 3890, revenue: 1567000 },
  { month: "Sep", bookings: 3567, revenue: 1389000 },
  { month: "Oct", bookings: 3234, revenue: 1256000 },
  { month: "Nov", bookings: 2890, revenue: 1123000 },
  { month: "Dec", bookings: 3456, revenue: 1345000 },
];

export const companyPerformance = [
  { name: "MAHD Rent", bookings: 1234, revenue: 456000, rating: 4.8 },
  { name: "Autocar Elite", bookings: 2156, revenue: 789000, rating: 4.6 },
  { name: "Nile Motors", bookings: 987, revenue: 234000, rating: 4.5 },
  { name: "Doha Wheels", bookings: 756, revenue: 345000, rating: 4.7 },
  { name: "Riyadh Motors", bookings: 1432, revenue: 567000, rating: 4.7 },
  { name: "Cairo Wheels", bookings: 1123, revenue: 312000, rating: 4.3 },
];

export const recentBookings = [
  { id: "BK-001", customer: "Ahmed Hassan", vehicle: "Toyota Camry", company: "MAHD Rent", country: "UAE", date: "2024-01-15", amount: 450, status: "completed" },
  { id: "BK-002", customer: "Mohammed Ali", vehicle: "BMW X5", company: "Autocar Elite", country: "Saudi", date: "2024-01-14", amount: 890, status: "active" },
  { id: "BK-003", customer: "Sara Khalid", vehicle: "Mercedes C-Class", company: "Nile Motors", country: "Egypt", date: "2024-01-14", amount: 650, status: "completed" },
  { id: "BK-004", customer: "Omar Fahd", vehicle: "Nissan Patrol", company: "Doha Wheels", country: "Qatar", date: "2024-01-13", amount: 780, status: "pending" },
  { id: "BK-005", customer: "Fatima Zahra", vehicle: "Honda Accord", company: "Kuwait Ride", country: "Kuwait", date: "2024-01-13", amount: 380, status: "completed" },
  { id: "BK-006", customer: "Youssef Amr", vehicle: "Toyota Land Cruiser", company: "Bahrain Auto", country: "Bahrain", date: "2024-01-12", amount: 920, status: "active" },
  { id: "BK-007", customer: "Laila Samir", vehicle: "Kia Sportage", company: "Oman Drive", country: "Oman", date: "2024-01-12", amount: 420, status: "completed" },
  { id: "BK-008", customer: "Khaled Nasser", vehicle: "Hyundai Tucson", company: "Jordan Cars", country: "Jordan", date: "2024-01-11", amount: 350, status: "cancelled" },
];

export const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard", active: true },
  { id: "supplier-intelligence", label: "Supplier Intelligence", icon: "BarChart3" },
  { id: "profile", label: "My Profile", icon: "UserCircle" },
  { id: "bookings-calendar", label: "Bookings Calendar", icon: "CalendarCheck" },
  { id: "companies", label: "My Companies", icon: "Building2" },
  { id: "blogs", label: "Blogs", icon: "BookOpen" },
  { id: "profit", label: "Profit Margin", icon: "TrendingUp" },
  { id: "vehicles", label: "Vehicles Photos", icon: "Car" },
  { id: "bulk", label: "Vehicles Bulk Upload", icon: "Upload" },
  { id: "categories", label: "Categories", icon: "Grid3X3" },
  { id: "specs", label: "Specifications", icon: "Settings2" },
  { id: "memberships", label: "Memberships", icon: "Crown" },
  { id: "customers", label: "Customers", icon: "Users" },
  { id: "rentals", label: "Rentals", icon: "CalendarCheck" },
  { id: "reviews", label: "Rental Reviews", icon: "Star" },
  { id: "terms", label: "Rental Terms", icon: "FileText" },
  { id: "included", label: "What is included?", icon: "CheckCircle2" },
  { id: "subscribers", label: "Subscribers", icon: "Mail" },
  { id: "contest-popup", label: "Contest Control", icon: "Gift" },
  { id: "background", label: "Background Settings", icon: "Palette" },
  { id: "logout", label: "Sign Out", icon: "LogOut" },
];
// ========== Vehicles Photos ==========
export interface VehiclePhoto {
  id: number;
  name: string;
  category: string;
  image?: string;
}

export const vehiclesPhotos: VehiclePhoto[] = [
  { id: 1, name: "Audi A3 Automatic", category: "Sedan", image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=300&fit=crop" },
  { id: 2, name: "Audi A4 Automatic", category: "Sedan", image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop" },
  { id: 3, name: "Audi A6 Automatic", category: "Luxury", image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop" },
  { id: 4, name: "Audi A8 Automatic", category: "Luxury", image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop" },
  { id: 5, name: "Bestune B70 Automatic", category: "Sedan", image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=300&fit=crop" },
  { id: 6, name: "Bestune T33 Automatic", category: "SUV" },
  { id: 7, name: "Bestune T77 Automatic", category: "SUV", image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=300&fit=crop" },
  { id: 8, name: "Bestune T99 Automatic", category: "SUV", image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=300&fit=crop" },
  { id: 9, name: "Toyota Camry", category: "Sedan", image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop" },
  { id: 10, name: "BMW X5", category: "SUV", image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop" },
  { id: 11, name: "Mercedes C-Class", category: "Luxury", image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop" },
  { id: 12, name: "Nissan Patrol", category: "SUV" },
];

// ========== Bulk Vehicle Upload ==========
export interface ExcelRow {
  id: number;
  vehicleName: string;
  category: string;
  dailyPrice: number;
  status: "valid" | "invalid" | "pending";
  error?: string;
}

export const bulkUploadSuppliers = [
  "Nile Motors", "MAHD Rent", "Autocar Elite",
  "Doha Wheels", "Kuwait Ride", "Jordan Cars", "Cairo Wheels"
];

export const bulkUploadBranches = [
  "Hurghada International Airport", "Dubai Airport",
  "Riyadh Airport", "Doha Airport", "Kuwait City", "Amman Airport"
];

// ========== Specifications ==========
export interface Specification {
  id: number;
  name: string;
  key: string;
  options: string[];
  icon: string; // Lucide icon name
}

export const specifications: Specification[] = [
  { id: 1, name: "Color", key: "color", options: ["White", "Black", "Silver", "Red", "Blue"], icon: "Palette" },
  { id: 2, name: "Gearbox", key: "gearbox", options: ["Automatic", "Manual"], icon: "Cog" },
  { id: 3, name: "Doors", key: "doors", options: ["2", "4", "5"], icon: "DoorOpen" },
  { id: 4, name: "Seats", key: "seats", options: ["2", "4", "5", "7"], icon: "Users" },
  { id: 5, name: "Fuel Type", key: "fuel", options: ["Petrol", "Diesel", "Electric", "Hybrid"], icon: "Fuel" },
  { id: 6, name: "Condition", key: "condition", options: ["New", "Used"], icon: "Sparkles" },
];
export const specsData: Specification[] = [
  { id: 1, name: "Air Conditioner", key: "ac", options: ["Air Conditioning"], icon: "Wind" },
  { id: 2, name: "Doors", key: "doors", options: ["4", "5", "2"], icon: "DoorOpen" },
  { id: 3, name: "Fuel", key: "fuel", options: ["Petrol", "Gas", "Electric", "Hybrid Petrol & Gas", "Hybrid Gas & Petrol"], icon: "Fuel" },
  { id: 4, name: "Number of seats", key: "seats", options: ["4", "5", "7"], icon: "Users" },
  { id: 5, name: "Suitcase", key: "suitcase", options: ["Medium", "Small", "Large"], icon: "Luggage" },
  { id: 6, name: "Transmission", key: "transmission", options: ["Automatic", "Manual"], icon: "Settings2" },
];

// ========== Memberships ==========
export interface MembershipPlan {
  id: number;
  name: string;
  price: number;
  period: string;
  features: string[];
  active: boolean;
  subscribers: number;
  popular?: boolean;
}

export interface MembershipCompany {
  id: number;
  name: string;
  status: "active" | "inactive";
}

export const membershipPlans: MembershipPlan[] = [
  { id: 1, name: "Basic", price: 0, period: "month", features: ["5 vehicles listing", "Basic analytics", "Email support"], active: true, subscribers: 45 },
  { id: 2, name: "Pro", price: 99, period: "month", features: ["25 vehicles listing", "Advanced analytics", "Priority support", "Featured listings"], active: true, subscribers: 32, popular: true },
  { id: 3, name: "Enterprise", price: 299, period: "month", features: ["Unlimited vehicles", "Full analytics", "24/7 support", "API access", "Custom branding"], active: true, subscribers: 12 },
];

export const membershipCompanies: MembershipCompany[] = [
  { id: 1, name: "yomna ayman mohamed", status: "inactive" },
  { id: 2, name: "GO RENTAL", status: "active" },
  { id: 3, name: "FLEXI", status: "inactive" },
  { id: 4, name: "AutoRent", status: "active" },
  { id: 5, name: "Nile Motors", status: "inactive" },
  { id: 6, name: "Cairo Wheels", status: "active" },
  { id: 7, name: "Luxury Rides", status: "inactive" },
  { id: 8, name: "Fast Rent", status: "active" },
  { id: 9, name: "Best Rent", status: "inactive" },
  { id: 10, name: "Top Cars", status: "active" },
  { id: 11, name: "RentEasy", status: "inactive" },
  { id: 12, name: "AutoHub", status: "active" },
];





// ========== Rental Terms Data ==========

export interface RentalTerm {
  id: number;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  category?: string;
}

export const rentalTerms: RentalTerm[] = [
  {
    id: 1,
    title: "MINIMUM DRIVER AGE without extra charge",
    description: "25 years old",
    status: "pending",
    category: "Driver Requirements"
  },
  {
    id: 2,
    title: "Deposit and payment cards",
    description: `<div class="space-y-4">
      <div>
        <h4 class="font-bold text-sm mb-2">Refundable security deposit</h4>
        <p class="text-sm text-gray-600">The supplier will hold a deposit of US$ 550.00 on your card when you pick up the car.</p>
        <p class="text-sm text-gray-600 mt-1">A deposit will be blocked on the customer's credit card and will be released within 30 days after drop-off.</p>
      </div>
      <div>
        <h4 class="font-bold text-sm mb-2">Payment card</h4>
        <p class="text-sm text-gray-600">You'll need a credit card in the main driver's name to leave the deposit.</p>
      </div>
      <div>
        <h4 class="font-bold text-sm mb-2">Accepted cards</h4>
        <div class="flex items-center gap-2 mb-1">
          <span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded font-bold">MasterCard</span>
          <span class="text-sm text-gray-600">MasterCard Credit</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-bold">VISA</span>
          <span class="text-sm text-gray-600">Visa Credit</span>
        </div>
      </div>
      <div>
        <h4 class="font-bold text-sm text-red-500 mb-2">Not accepted</h4>
        <ul class="text-sm text-gray-600 list-none space-y-1">
          <li>Debit cards</li>
          <li>Someone else's card (including family members)</li>
          <li>Any virtual payment (e.g. Google Pay, Apple Pay, etc...)</li>
          <li>Cards from online-only banks</li>
        </ul>
      </div>
    </div>`,
    status: "pending",
    category: "Payment"
  },
  {
    id: 3,
    title: "Included protection",
    description: `<div class="space-y-4">
      <div>
        <h4 class="font-bold text-sm mb-2">Included Insurance</h4>
      </div>
      <div>
        <h4 class="font-bold text-sm mb-1">Collision Damage Waiver</h4>
        <p class="text-sm text-gray-600">Deductible: US$ 550.00 - US$ 2000.00</p>
        <p class="text-sm text-gray-600 mt-1">You'll have to pay at most the deductible if the car's bodywork is damaged (other parts of the car aren't covered).</p>
      </div>
      <div>
        <h4 class="font-bold text-sm mb-1">Theft Protection</h4>
        <p class="text-sm text-gray-600">You'll have to pay at most the deductible if the car is stolen.</p>
      </div>
      <div>
        <h4 class="font-bold text-sm mb-1">Roadside Assistance</h4>
        <p class="text-sm text-gray-600">You'll be able to get help for any mechanical problem you come across on the road.</p>
      </div>
      <div>
        <h4 class="font-bold text-sm mb-1">Third-Party Liability (TPL)</h4>
        <ul class="text-sm text-gray-600 list-none space-y-1">
          <li>- Bodily injury limit: $10,425.32</li>
          <li>- Property damage limit: $20,850.64</li>
        </ul>
        <p class="text-sm text-gray-600 mt-2">Mandatory coverage for injuries and damage you may cause to others while driving the car.</p>
      </div>
    </div>`,
    status: "pending",
    category: "Insurance"
  },
  {
    id: 4,
    title: "Fuel policy",
    description: "Same to same",
    status: "pending",
    category: "Policy"
  },
  {
    id: 5,
    title: "Mileage",
    description: "Unlimited mileage",
    status: "pending",
    category: "Policy"
  },
  {
    id: 6,
    title: "Driver Requirements",
    description: `<div class="space-y-3">
      <p class="text-sm text-gray-600">The minimum rental age is 21 years.</p>
      <p class="text-sm text-gray-600">A young driver fee applies to drivers under the age of 26.</p>
      <p class="text-sm text-gray-600">The maximum rental age is 80 years.</p>
      <p class="text-sm text-gray-600">A senior driver fee applies to drivers over the age of 75.</p>
      <p class="text-sm text-gray-600">The driver's license must have been issued by authorized authorities at least 1 year(s) before the commencement of the rental date.</p>
    </div>`,
    status: "pending",
    category: "Requirements"
  },
  {
    id: 7,
    title: "Cross-border travel",
    description: "Not available",
    status: "pending",
    category: "Travel"
  },
  {
    id: 8,
    title: "Pickup Instruction",
    description: `<div class="space-y-3">
      <p class="text-sm text-gray-600">Please contact the representative before arrival at +968 95356661 (WhatsApp text preferred). Kindly include the reservation number and your name (Same like voucher) in your message.</p>
      <p class="text-sm text-gray-600">The representative will meet the customer at the airport and escort them to the branch.</p>
    </div>`,
    status: "pending",
    category: "Instructions"
  }
];

// ========== What is Included Data ==========

export interface IncludedItem {
  id: number;
  name: string;
}

export const includedItems: IncludedItem[] = [
  { id: 1, name: "Free Cancellation (24)" },
  { id: 2, name: "Free Amendment" },
  { id: 3, name: "Third Party Liability (TPL)" },
  { id: 4, name: "Unlimited Mileage" },
  { id: 5, name: "24/7 Customer Support" },
  { id: 6, name: "Online Check -in" },
  { id: 7, name: "Collision Damage Waiver (CDW)" },
  { id: 8, name: "VAT" },
  { id: 9, name: "Free Breakdown Assistance" },
  { id: 10, name: "Airport Surcharge" },
  { id: 11, name: "Theft Waiver (THW)" },
  { id: 12, name: "Airport Fee" },
  { id: 13, name: "Limited Mileage :300 KM" },
  { id: 14, name: "Limited Mileage :250 KM" },
  { id: 15, name: "Free Additional Driver" },
  { id: 16, name: "Free Cancellation (48h)" },
  { id: 17, name: "Collision Damage Waiver (CDW)" },
  { id: 18, name: "Theft Protection (TP)" },
  { id: 19, name: "CDW +" },
  { id: 20, name: "CDW + reduces excess to:" },
  { id: 21, name: "Personal Insurance (PAI)" },
  { id: 22, name: "Wheel, Underside & Glass Insurance (WUG)" },
  { id: 23, name: "Airport Charge" },
  { id: 24, name: "3rd Party Liability" },
  { id: 25, name: "3rd Party Coverage Amount" },
  { id: 26, name: "3rd Party Coverage Amount" },
  { id: 27, name: "Non Waivable Excess" },
  { id: 28, name: "Damage Handling Fee" },
  { id: 29, name: "Excessively Dirty or soiled Vehicles with Stained Interior" },
  { id: 30, name: "Driving License Restrictions" },
  { id: 31, name: "Minimum Renting Length (days)" },
  { id: 32, name: "Mileage / Kilometre limitation" },
];



// ========== Subscribers Data ==========

export interface Subscriber {
  id: number;
  email: string;
  country: string;
}

export const subscribers: Subscriber[] = [
  { id: 1, email: "progyomenaaymen@gmail.com", country: "" },
  { id: 2, email: "yomnaatmanthabet@gmail.com", country: "" },
  { id: 3, email: "amnamagdii@gmail.com", country: "" },
  { id: 4, email: "walnagar80@gmail.com", country: "" },
];

// ========== Rentals Data ==========

export interface Rental {
  id: string;
  bookingNumber: string;
  vehicle: string;
  customerName: string;
  country: string;
  totalPrice: string;
  profit: string;
  supplierPrice: string;
  supplierName: string;
  rentalStatus: "confirmed" | "cancelled" | "pending";
  startedAt: string;
  endedAt: string;
  duration: number;
}

export const rentals: Rental[] = [
  {
    id: "1",
    bookingNumber: "UNATR0017",
    vehicle: "Nissan Sunny Automatic",
    customerName: "Mr. nufai",
    country: "United Arab Emirates",
    totalPrice: "735 AED",
    profit: "5%",
    supplierPrice: "700 AED",
    supplierName: "Highway",
    rentalStatus: "confirmed",
    startedAt: "2026-05-01",
    endedAt: "2026-05-08",
    duration: 7,
  },
  {
    id: "2",
    bookingNumber: "UNATR0016",
    vehicle: "Toyota Fourtuner Automatic",
    customerName: "Mr. nufai",
    country: "United Arab Emirates",
    totalPrice: "430.92 AED",
    profit: "8%",
    supplierPrice: "399 AED",
    supplierName: "AUTORENT",
    rentalStatus: "confirmed",
    startedAt: "2026-05-01",
    endedAt: "2026-05-08",
    duration: 7,
  },
  {
    id: "3",
    bookingNumber: "OMATR0015",
    vehicle: "Nissan Sunny",
    customerName: "Mr. Test",
    country: "Oman",
    totalPrice: "78.62 USD",
    profit: "8%",
    supplierPrice: "28 USD",
    supplierName: "MAHD",
    rentalStatus: "cancelled",
    startedAt: "2026-04-20",
    endedAt: "2026-04-24",
    duration: 4,
  },
  {
    id: "4",
    bookingNumber: "OMATR0014",
    vehicle: "MG 3",
    customerName: "Mr. Test",
    country: "Kuwait",
    totalPrice: "13 OMR",
    profit: "5%",
    supplierPrice: "10 OMR",
    supplierName: "MAHD",
    rentalStatus: "confirmed",
    startedAt: "2026-04-18",
    endedAt: "2026-04-22",
    duration: 4,
  },
  {
    id: "5",
    bookingNumber: "KWATR0013",
    vehicle: "Toyota Yaris",
    customerName: "Mr. Ahmed",
    country: "Kuwait",
    totalPrice: "120 KWD",
    profit: "10%",
    supplierPrice: "108 KWD",
    supplierName: "KTC",
    rentalStatus: "pending",
    startedAt: "2026-05-05",
    endedAt: "2026-05-10",
    duration: 5,
  },
  {
    id: "6",
    bookingNumber: "SAATR0012",
    vehicle: "Hyundai Accent",
    customerName: "Mr. Khalid",
    country: "Saudi Arabia",
    totalPrice: "650 SAR",
    profit: "7%",
    supplierPrice: "600 SAR",
    supplierName: "GO RENTAL",
    rentalStatus: "confirmed",
    startedAt: "2026-05-02",
    endedAt: "2026-05-09",
    duration: 7,
  },
];

// Filter options

export const suppliers = ["All", "Highway", "AUTORENT", "MAHD", "KTC", "GO RENTAL", "Auto Nation", "FLEXI", "STREET", "European"];
export const rentalStatuses = ["All", "confirmed", "cancelled", "pending"];

// ========== Rental Reviews Data ==========

export interface Review {
  id: number;
  customer: string;
  vehicle: string;
  company: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export const reviewsData: Review[] = [
  { id: 1, customer: "Ahmed Hassan", vehicle: "Toyota Camry", company: "MAHD Rent", rating: 5, comment: "Excellent service and clean vehicle. Highly recommended!", date: "2024-01-20", helpful: 12 },
  { id: 2, customer: "Mohammed Ali", vehicle: "BMW X5", company: "Autocar Elite", rating: 4, comment: "Great car, but pickup process was a bit slow.", date: "2024-01-19", helpful: 8 },
  { id: 3, customer: "Sara Khalid", vehicle: "Mercedes C-Class", company: "Nile Motors", rating: 5, comment: "Luxury experience at its best. Will rent again!", date: "2024-01-18", helpful: 15 },
  { id: 4, customer: "Omar Fahd", vehicle: "Nissan Patrol", company: "Doha Wheels", rating: 3, comment: "Vehicle was good but had some minor issues.", date: "2024-01-17", helpful: 3 },
  { id: 5, customer: "Fatima Zahra", vehicle: "Honda Accord", company: "Kuwait Ride", rating: 5, comment: "Perfect for family trip. Very comfortable.", date: "2024-01-16", helpful: 10 },
  { id: 6, customer: "Youssef Amr", vehicle: "Toyota Land Cruiser", company: "Bahrain Auto", rating: 4, comment: "Powerful SUV, handled desert driving well.", date: "2024-01-15", helpful: 7 },
];

export const ratings = ["All", "5", "4", "3", "2", "1"];
