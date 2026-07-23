'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getVehicleImageUrl } from '@/utils/getImageUrl';
import { Vehicle } from '@/types';
import { Car, ChevronRight, Sparkles, ShieldCheck } from 'lucide-react';
import { assets } from '@/config/assets';

interface BrandFleetSectionProps {
  brandName: string;
  brandId: string;
  vehicles: Vehicle[];
}

interface FleetCategory {
  id: string;
  originalName: string;
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

interface CategoryDetails {
  badge: string;
  description: string;
  highlights: string[];
}

function getCategoryDetails(categoryName: string, brandName: string): CategoryDetails {
  const name = categoryName.toLowerCase();
  // Match SUV first so "Compact SUV" matches Family & Terrain instead of Most Popular (Economy)
  if (name.includes('suv') || name.includes('crossover') || name.includes('4x4')) {
    return {
      badge: 'Family & Terrain',
      description: `Conquer any road with ${brandName}'s versatile SUV fleet. Featuring an elevated driving perspective, powerful engine options, and expandable cargo space, SUVs booked via Autours ensure maximum safety for family adventures and road trips.`,
      highlights: ['Elevated road visibility', 'High ground clearance & luggage capacity', 'All-wheel drive capability'],
    };
  }
  if (name.includes('mini') || name.includes('small')) {
    return {
      badge: 'Budget & City',
      description: `Autours connects you with ${brandName}'s compact Mini fleet — the most economical choice for city travel. Designed for easy parking in tight spots and ultra-low fuel consumption, Mini cars offer single travelers and couples a hassle-free, budget-friendly journey.`,
      highlights: ['Ultra-low fuel consumption', 'Easy city parking & maneuvering', 'Best rental rates available'],
    };
  }
  if (name.includes('economy') || name.includes('compact')) {
    return {
      badge: 'Most Popular',
      description: `The Economy fleet from ${brandName} is the preferred choice for everyday commuters and small families. Enjoy smooth driving dynamics, modern AC, and great mileage whether navigating urban streets or suburban highways.`,
      highlights: ['Optimal balance of comfort & price', 'Spacious 5-seater cabin', 'Exceptional fuel efficiency'],
    };
  }
  if (name.includes('full') || name.includes('standard') || name.includes('sedan') || name.includes('large')) {
    return {
      badge: 'Executive Comfort',
      description: `Upgrade your travel with ${brandName}'s Full-Size sedans on Autours. Offering generous legroom, large trunk capacity, and advanced safety features, these sedans are built for business delegations and long-distance highway cruises.`,
      highlights: ['Generous legroom & trunk space', 'Smooth highway suspension', 'Premium interior features'],
    };
  }
  if (name.includes('luxury') || name.includes('premium') || name.includes('exotic')) {
    return {
      badge: 'VIP & Performance',
      description: `Arrive in style with ${brandName}'s luxury and executive vehicles. Autours gives you direct access to high-performance luxury models equipped with leather interiors, cutting-edge infotainment, and prestige design for special events and business meetings.`,
      highlights: ['Prestige brand styling & comfort', 'Leather interior & top-tier infotainment', 'VIP pickup & handover service'],
    };
  }
  if (name.includes('van') || name.includes('minivan') || name.includes('bus') || name.includes('family')) {
    return {
      badge: 'Group & Family',
      description: `Traveling with a large family or tour group? ${brandName}'s multi-seater passenger vans available on Autours accommodate 7 to 9 passengers comfortably with plenty of room for heavy luggage and group gear.`,
      highlights: ['Seats up to 7-9 passengers', 'Dual sliding doors & easy loading', 'Maximum luggage capacity'],
    };
  }
  // Generic fallback
  return {
    badge: 'Reliable Fleet',
    description: `Browse ${brandName}'s high-quality ${categoryName} fleet. Autours offers premium booking rates, comprehensive protection, and direct pickup options for all journeys.`,
    highlights: ['Well-maintained modern vehicles', 'Transparent rental terms', 'Direct supplier support'],
  };
}

interface EstimatedSpecs {
  seats: string;
  doors: string;
  luggage: string;
}

function getEstimatedSpecs(categoryName: string, dbSeats?: any, dbDoors?: any, dbLuggage?: any): EstimatedSpecs {
  const name = categoryName.toLowerCase();
  
  // Try to use DB values if they are present and realistic
  const hasDbSeats = dbSeats !== undefined && dbSeats !== null && parseInt(dbSeats) > 0;
  const hasDbDoors = dbDoors !== undefined && dbDoors !== null && parseInt(dbDoors) > 0;
  const hasDbLuggage = dbLuggage !== undefined && dbLuggage !== null && dbLuggage !== '' && dbLuggage !== 'N/A' && dbLuggage !== '2 Bags';

  if (name.includes('mini') || name.includes('small')) {
    return {
      seats: hasDbSeats ? `${dbSeats} Seats` : '4 Seats',
      doors: hasDbDoors ? `${dbDoors} Doors` : '2-4 Doors',
      luggage: hasDbLuggage ? String(dbLuggage) : '1 Bag',
    };
  }
  if (name.includes('suv') || name.includes('crossover') || name.includes('4x4')) {
    return {
      seats: hasDbSeats ? `${dbSeats} Seats` : '5-7 Seats',
      doors: hasDbDoors ? `${dbDoors} Doors` : '5 Doors',
      luggage: hasDbLuggage ? String(dbLuggage) : '4 Bags',
    };
  }
  if (name.includes('van') || name.includes('minivan') || name.includes('bus') || name.includes('family')) {
    return {
      seats: hasDbSeats ? `${dbSeats} Seats` : '7-9 Seats',
      doors: hasDbDoors ? `${dbDoors} Doors` : '5 Doors',
      luggage: hasDbLuggage ? String(dbLuggage) : '5 Bags',
    };
  }
  if (name.includes('luxury') || name.includes('premium') || name.includes('exotic')) {
    return {
      seats: hasDbSeats ? `${dbSeats} Seats` : '5 Seats',
      doors: hasDbDoors ? `${dbDoors} Doors` : '4 Doors',
      luggage: hasDbLuggage ? String(dbLuggage) : '3 Bags',
    };
  }
  if (name.includes('economy') || name.includes('compact')) {
    return {
      seats: hasDbSeats ? `${dbSeats} Seats` : '5 Seats',
      doors: hasDbDoors ? `${dbDoors} Doors` : '4 Doors',
      luggage: hasDbLuggage ? String(dbLuggage) : '2 Bags',
    };
  }
  
  return {
    seats: hasDbSeats ? `${dbSeats} Seats` : '5 Seats',
    doors: hasDbDoors ? `${dbDoors} Doors` : '4 Doors',
    luggage: hasDbLuggage ? String(dbLuggage) : '2-3 Bags',
  };
}

export default function BrandFleetSection({ brandName, brandId, vehicles = [] }: BrandFleetSectionProps) {
  // 1. Group the supplier's vehicles by category
  const groupedByCategory: Record<string, Vehicle[]> = {};
  vehicles.forEach((vehicle) => {
    const catName = vehicle.category || 'Standard';
    if (!groupedByCategory[catName]) {
      groupedByCategory[catName] = [];
    }
    groupedByCategory[catName].push(vehicle);
  });

  const categoryNames = Object.keys(groupedByCategory);

  const formatLuggage = (suitcases: string | number | undefined) => {
    if (!suitcases) return '';
    const s = suitcases.toString().trim();
    if (/^\d+$/.test(s)) {
      const num = parseInt(s) || 2;
      return `${num} ${num > 1 ? 'Bags' : 'Bag'}`;
    }
    return s;
  };

  // 2. Generate categories list from the supplier's actual vehicles
  const fleetCategories: FleetCategory[] = categoryNames.map((catName) => {
    const categoryVehicles = groupedByCategory[catName];
    const representative = categoryVehicles[0];
    const details = getCategoryDetails(catName, brandName);

    const formattedLuggage = formatLuggage(representative.suitcases);
    const specs = getEstimatedSpecs(catName, representative.seats, representative.doors, formattedLuggage);

    return {
      id: catName.toLowerCase().replace(/\s+/g, '-'),
      originalName: catName,
      name: catName,
      badge: details.badge,
      image: getVehicleImageUrl(representative.photo),
      exampleModel: representative.name,
      seats: specs.seats,
      doors: specs.doors,
      luggage: specs.luggage,
      description: details.description,
      highlights: details.highlights,
    };
  });

  // Initialize active tab with the first category's ID
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    if (fleetCategories.length > 0) {
      setActiveTab(fleetCategories[0].id);
    }
  }, [vehicles, fleetCategories.length]);

  // If the brand has no cars in database, hide this section or display a clean info box
  if (fleetCategories.length === 0) {
    return (
      <section className="py-12 bg-slate-50 border-y border-slate-150">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-3">
            <Car className="text-slate-400" size={24} />
          </div>
          <p className="text-slate-500 font-bold text-sm">
            No fleet vehicles are registered for this supplier at the moment.
          </p>
        </div>
      </section>
    );
  }

  const selectedCategory = fleetCategories.find((c) => c.id === activeTab) || fleetCategories[0];

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
        {selectedCategory && (
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

              <h3 className="text-lg md:text-xl font-black text-slate-900 mb-1 leading-snug">
                {selectedCategory.exampleModel}
              </h3>
              <p className="text-xs font-bold text-slate-500 mb-4">
                Representative {selectedCategory.name} vehicle from {brandName}
              </p>

              {/* Spec Pills */}
              <div className="flex flex-wrap items-center justify-center gap-3 w-full border-t border-slate-200/80 pt-4 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                  <img 
                    src={assets.icons.seats} 
                    alt="" 
                    className="w-5 h-5 object-contain shrink-0" 
                    style={{ filter: 'invert(88%) sepia(35%) saturate(1005%) hue-rotate(345deg) brightness(101%) contrast(92%)' }} 
                  />
                  {selectedCategory.seats}
                </span>
                <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                  <img 
                    src={assets.icons.doors} 
                    alt="" 
                    className="w-5 h-5 object-contain shrink-0" 
                    style={{ filter: 'invert(88%) sepia(35%) saturate(1005%) hue-rotate(345deg) brightness(101%) contrast(92%)' }} 
                  />
                  {selectedCategory.doors}
                </span>
                <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                  <img 
                    src={assets.icons.bags + "?v=4"} 
                    alt="" 
                    className="w-[22px] h-[22px] object-contain shrink-0" 
                    style={{ filter: 'invert(88%) sepia(35%) saturate(1005%) hue-rotate(345deg) brightness(101%) contrast(92%)' }} 
                  />
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
                  href={`/search?supplier=${brandId}`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-yellow-400 text-gray-950 font-black text-xs md:text-sm uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg transition-all border border-black/5 group"
                >
                  <span>Browse All {brandName} Vehicles</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}
