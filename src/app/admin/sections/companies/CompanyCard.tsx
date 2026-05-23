"use client";

import { MapPin, Mail, Car, CalendarCheck, DollarSign, Star, Globe, MoreHorizontal, ArrowUpRight } from "lucide-react";

interface CompanyCardProps {
  company: any;
  onView: (company: any) => void;
  statusColorMap: Record<string, string>;
  statusDotMap: Record<string, string>;
}

export default function CompanyCard({ company, onView, statusColorMap, statusDotMap }: CompanyCardProps) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all duration-300 overflow-hidden">
      <div className="relative h-32 overflow-hidden">
        <img src={company.image} alt={company.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute top-2.5 left-2.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border backdrop-blur-sm bg-white/90 ${statusColorMap[company.status] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
            <span className={`w-1 h-1 rounded-full ${statusDotMap[company.status] || "bg-gray-500"}`} />
            {company.status}
          </span>
        </div>
        <div className="absolute top-2.5 right-2.5">
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white/90 backdrop-blur-sm rounded-md text-[10px] font-bold text-gray-900">
            <Star className="text-amber-400 fill-amber-400" size={10} />{company.rating}
          </span>
        </div>
        <div className="absolute bottom-2 left-2.5 right-2.5">
          <h3 className="text-white font-bold text-sm truncate">{company.name}</h3>
          {company.parentCompany && <p className="text-white/80 text-[10px]">Parent: {company.parentCompany}</p>}
        </div>
      </div>
      <div className="p-3.5">
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600"><MapPin size={12} className="text-gray-400 shrink-0" /><span className="truncate">{company.address}</span></div>
          <div className="flex items-center gap-2 text-xs text-gray-600"><Mail size={12} className="text-gray-400 shrink-0" /><span className="truncate">{company.email}</span></div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <Car className="mx-auto text-primary-600 mb-0.5" size={14} />
            <p className="text-xs font-bold text-gray-900">{company.vehicles}</p>
            <p className="text-[9px] text-gray-500 uppercase">Vehicles</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <CalendarCheck className="mx-auto text-emerald-600 mb-0.5" size={14} />
            <p className="text-xs font-bold text-gray-900">{company.bookings}</p>
            <p className="text-[9px] text-gray-500 uppercase">Bookings</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <DollarSign className="mx-auto text-amber-600 mb-0.5" size={14} />
            <p className="text-xs font-bold text-gray-900">${(company.revenue / 1000).toFixed(0)}k</p>
            <p className="text-[9px] text-gray-500 uppercase">Revenue</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <Globe size={12} className="text-gray-400" />
            <span className="text-[10px] text-gray-500">Since {company.since}</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"><MoreHorizontal size={16} /></button>
            <button 
              onClick={() => onView(company)}
              className="inline-flex items-center gap-0.5 text-[10px] font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-2 py-1 rounded-md transition-colors"
            >
              View <ArrowUpRight size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
