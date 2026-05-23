"use client";

import { MapPin, Globe, Star } from "lucide-react";

interface CompanyDetailsHeroProps {
  company: any;
}

export default function CompanyDetailsHero({ company }: CompanyDetailsHeroProps) {
  return (
    <div className="relative h-48 sm:h-64">
      <img src={company.image} alt={company.name} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{company.name}</h1>
          <div className="flex flex-wrap gap-4 text-white/90 text-sm">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} />
              {company.address}
            </div>
            <div className="flex items-center gap-1.5">
              <Globe size={14} />
              {company.country}
            </div>
          </div>
        </div>
        <div className="hidden sm:block">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Star className="text-amber-400 fill-amber-400" size={16} />
              <span className="text-xl font-bold">{company.rating}</span>
            </div>
            <p className="text-xs text-white/70">Average Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
}
