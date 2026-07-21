'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { assets } from '@/config/assets';
import { Car, Users, Briefcase, ChevronRight, Sparkles, ShieldCheck } from 'lucide-react';

interface BrandFleetSectionProps {
  brandName: string;
  brandId: string;
}

interface FleetCategory {
  id: string;
  name: string;
  badge: string;
  image: string;
  exampleModel: string;
  seats: string;
  doors: string;
  luggage: string;
  description: string;
  highlights: string[];
}

export default function BrandFleetSection({ brandName, brandId }: BrandFleetSectionProps) {
  const fleetCategories: FleetCategory[] = [
    {
      id: 'mini',
      name: 'Mini & Small',
      badge: 'Budget & City',
      image: assets.categories.mini || assets.categories.small,
      exampleModel: 'Kia Picanto, Fiat 500, or similar',
      seats: '4 Seats',
      doors: '2-4 Doors',
      luggage: '1 Small Bag',
      description: `Autours connects you with ${brandName}'s compact Mini fleet — the most economical choice for city travel. Designed for easy parking in tight spots and ultra-low fuel consumption, Mini cars offer single travelers and couples a hassle-free, budget-friendly journey.`,
      highlights: ['Ultra-low fuel consumption', 'Easy city parking & maneuvering', 'Best rental rates available'],
    },
    {
      id: 'economy',
      name: 'Economy & Compact',
      badge: 'Most Popular',
      image: assets.categories.economy || assets.categories.small,
      exampleModel: 'Toyota Yaris, Nissan Sunny, Hyundai Accent, or similar',
      seats: '5 Seats',
      doors: '4 Doors',
      luggage: '2 Bags',
      description: `The Economy fleet from ${brandName} is the preferred choice for everyday commuters and small families. Enjoy smooth driving dynamics, modern AC, and great mileage whether navigating urban streets or suburban highways.`,
      highlights: ['Optimal balance of comfort & price', 'Spacious 5-seater cabin', 'Exceptional fuel efficiency'],
    },
    {
      id: 'full-size',
      name: 'Full Size & Sedan',
      badge: 'Executive Comfort',
      image: assets.categories.fullSize || assets.categories.standard,
      exampleModel: 'Toyota Camry, Nissan Altima, Honda Accord, or similar',
      seats: '5 Seats',
      doors: '4 Doors',
      luggage: '3 Large Bags',
      description: `Upgrade your travel with ${brandName}'s Full-Size sedans on Autours. Offering generous legroom, large trunk capacity, and advanced safety features, these sedans are built for business delegations and long-distance highway cruises.`,
      highlights: ['Generous legroom & trunk space', 'Smooth highway suspension', 'Premium interior features'],
    },
    {
      id: 'suv',
      name: 'SUV & Crossover',
      badge: 'Family & Terrain',
      image: assets.categories.suv || assets.categories.compactSUV,
      exampleModel: 'Nissan Patrol, Toyota Prado, Hyundai Tucson, or similar',
      seats: '5-7 Seats',
      doors: '5 Doors',
      luggage: '4-5 Large Bags',
      description: `Conquer any road with ${brandName}'s versatile SUV fleet. Featuring an elevated driving perspective, powerful engine options, and expandable cargo space, SUVs booked via Autours ensure maximum safety for family adventures and road trips.`,
      highlights: ['Elevated road visibility', 'High ground clearance & luggage capacity', 'All-wheel drive capability'],
    },
    {
      id: 'luxury',
      name: 'Luxury & Executive',
      badge: 'VIP & Performance',
      image: assets.categories.luxury || assets.categories.luxurySuv,
      exampleModel: 'BMW 5 Series, Mercedes-Benz E-Class, Audi A6, or similar',
      seats: '5 Seats',
      doors: '4 Doors',
      luggage: '3 Bags',
      description: `Arrive in style with ${brandName}'s luxury and executive vehicles. Autours gives you direct access to high-performance luxury models equipped with leather interiors, cutting-edge infotainment, and prestige design for special events and business meetings.`,
      highlights: ['Prestige brand styling & comfort', 'Leather interior & top-tier infotainment', 'VIP pickup & handover service'],
    },
    {
      id: 'minivan',
      name: 'Minivan & Passenger Van',
      badge: 'Group & Family',
      image: assets.categories.minivan || assets.categories.family,
      exampleModel: 'Kia Carnival, Hyundai H1, Toyota HiAce, or similar',
      seats: '7-9 Seats',
      doors: '5 Doors',
      luggage: '5+ Bags',
      description: `Traveling with a large family or tour group? ${brandName}'s multi-seater passenger vans available on Autours accommodate 7 to 9 passengers comfortably with plenty of room for heavy luggage and group gear.`,
      highlights: ['Seats up to 7-9 passengers', 'Dual sliding doors & easy loading', 'Maximum luggage capacity'],
    },
  ];

  const [activeTab, setActiveTab] = useState<string>('economy');
  const selectedCategory = fleetCategories.find((c) => c.id === activeTab) || fleetCategories[1];

  return (
    <section className="py-16 md:py-24 bg-[#f8fafc] border-y border-slate-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/20 text-gray-950 text-xs font-black uppercase tracking-wider mb-4 border border-primary/30">
            <Sparkles size={14} className="text-gray-900" />
            Diverse Vehicle Options
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-title uppercase italic mb-4">
            {brandName} Fleet Categories
          </h2>
          <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed">
            Autours connects you directly with {brandName}&apos;s extensive fleet across all major categories. From compact city cars to luxury SUVs, find the exact vehicle type tailored to your trip.
          </p>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {fleetCategories.map((cat) => {
            const isActive = cat.id === activeTab;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-5 py-3 rounded-2xl text-xs md:text-sm font-black whitespace-nowrap transition-all duration-200 focus:outline-none flex items-center gap-2 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-lg scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{cat.name}</span>
                {isActive && <span className="w-2 h-2 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>

        {/* Active Category Display Box */}
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Car Representation Image & Specs */}
          <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-6 border border-slate-150 text-center relative flex flex-col items-center justify-center min-h-[300px]">
            <span className="absolute top-4 left-4 bg-primary text-gray-950 text-[11px] font-black uppercase px-3 py-1 rounded-full shadow-xs">
              {selectedCategory.badge}
            </span>

            <div className="relative w-full h-44 md:h-52 my-4">
              <Image
                src={selectedCategory.image}
                alt={`${brandName} ${selectedCategory.name} car rental`}
                fill
                className="object-contain hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>

            <h3 className="text-lg md:text-xl font-black text-slate-900 mb-1">
              {selectedCategory.exampleModel}
            </h3>
            <p className="text-xs font-bold text-slate-500 mb-4">
              Representative {selectedCategory.name} vehicle from {brandName}
            </p>

            {/* Spec Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full border-t border-slate-200/80 pt-4 text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                <Users size={14} className="text-primary" />
                {selectedCategory.seats}
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                <Car size={14} className="text-primary" />
                {selectedCategory.doors}
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                <Briefcase size={14} className="text-primary" />
                {selectedCategory.luggage}
              </span>
            </div>
          </div>

          {/* Right Column: Explanatory Content & Highlights */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-extrabold text-primary-700 uppercase tracking-wider mb-1 block">
                Category Overview
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {selectedCategory.name} Car Rental by {brandName}
              </h3>
            </div>

            <p className="text-slate-700 text-sm md:text-base font-medium leading-relaxed bg-slate-50/80 p-5 rounded-2xl border border-slate-150">
              {selectedCategory.description}
            </p>

            {/* Highlights List */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Why Choose {selectedCategory.name}?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedCategory.highlights.map((h, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">
                    <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Search CTA Button */}
            <div className="pt-2">
              <Link
                href={`/car-rental-brands/${brandId}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-yellow-400 text-gray-950 font-black text-xs md:text-sm uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg transition-all border border-black/5 group"
              >
                <span>Browse All {brandName} Vehicles</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
