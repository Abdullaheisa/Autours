import { Company, Blog, Category, Rental, Notification } from "../types";

export const companies: Company[] = [
  { id: 1, name: "GO RENTAL", branchName: "GO RENTAL", country: "Jordan", address: "Amman, Jordan", email: "info@easycarjordan.com", phone: "+962 7 9012 3456", parentCompany: null, role: "active_supplier", vehicles: 24, bookings: 456, revenue: 128000, rating: 4.6, status: "active", since: "2021", image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=200&fit=crop" },
  { id: 2, name: "Royal Star", branchName: "Royal Star", country: "Kuwait", address: "Kuwait City, Kuwait", email: "ucarkuwait@gmail.com", phone: "+965 5 123 4567", parentCompany: null, role: "active_supplier", vehicles: 38, bookings: 892, revenue: 245000, rating: 4.8, status: "active", since: "2019", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=200&fit=crop" },
  { id: 3, name: "Auto Nation", branchName: "Auto Nation", country: "Jordan", address: "Amman, Jordan", email: "info@autonationrentacar.com", phone: "+962 7 8123 4567", parentCompany: null, role: "active_supplier", vehicles: 31, bookings: 678, revenue: 189000, rating: 4.4, status: "active", since: "2020", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop" },
];

export const blogs: Blog[] = [
  { id: 1, title: "Daily vs Monthly Car Rental in UAE: Which Option Offers Better Value?", excerpt: "Choosing the right car rental duration in the UAE can make a significant difference in your overall costs...", author: "Yomna Ayman", authorAvatar: "Y", category: "Money Saving Tips", status: "published", date: "Apr 16, 2026", time: "02:40 PM", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop" },
  { id: 2, title: "How to Choose the Best Car Rental in Dubai for Your Needs", excerpt: "Choosing a car rental in Dubai can feel overwhelming at first with so many options available...", author: "waleed alnaggar", authorAvatar: "W", category: "Best Agencies", status: "scheduled", date: "May 10, 2026", time: "10:00 AM", image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=250&fit=crop", publishDate: "2026-05-10", publishTime: "10:00" },
  { id: 3, title: "Car Rental Security Deposit Explained", excerpt: "When booking a car rental security deposit, many travelers are unsure about the process...", author: "Waleed Al Nagga", authorAvatar: "W", category: "Money Saving Tips", status: "draft", date: "Apr 7, 2026", time: "02:38 PM", image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop" },
];

export const categories: Category[] = [
  { id: 1, name: "Sedan", image: "https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=400&h=300&fit=crop", vehicles: 45, active: true },
  { id: 2, name: "SUV", image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop", vehicles: 62, active: true },
];

export const notifications: Notification[] = [
  { id: "1", title: "New Booking", message: "Ahmed Hassan booked a Toyota Camry", type: "booking", timestamp: "2 mins ago", isRead: false },
  { id: "2", title: "Blog Interaction", message: "Your post 'Daily vs Monthly...' received 5 comments", type: "blog", timestamp: "1 hour ago", isRead: false },
  { id: "3", title: "System Update", message: "The dashboard has been updated to v2.0", type: "system", timestamp: "1 day ago", isRead: true },
];

export const rentals: Rental[] = [
  { id: "1", bookingNumber: "UNATR0017", vehicle: "Nissan Sunny Automatic", customerName: "Mr. nufai", country: "United Arab Emirates", totalPrice: "735 AED", profit: "5%", supplierPrice: "700 AED", supplierName: "Highway", rentalStatus: "confirmed", startedAt: "2026-05-01", endedAt: "2026-05-08", duration: 7 },
];
