"use client";

import { Car, CalendarCheck, DollarSign } from "lucide-react";

interface CompanyDetailsStatsProps {
  company: any;
}

export default function CompanyDetailsStats({ company }: CompanyDetailsStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <Car className="text-primary-600 mb-2" size={20} />
        <p className="text-xl font-bold text-gray-900">{company.vehicles}</p>
        <p className="text-xs text-gray-500">Fleet Size</p>
      </div>
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <CalendarCheck className="text-emerald-600 mb-2" size={20} />
        <p className="text-xl font-bold text-gray-900">{company.bookings}</p>
        <p className="text-xs text-gray-500">Total Bookings</p>
      </div>
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <DollarSign className="text-amber-600 mb-2" size={20} />
        <p className="text-xl font-bold text-gray-900">${(company.revenue / 1000).toFixed(0)}k</p>
        <p className="text-xs text-gray-500">Total Revenue</p>
      </div>
    </div>
  );
}
