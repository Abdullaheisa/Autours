"use client";

import { Mail, Phone } from "lucide-react";
import CompanyDetailsHeader from "./details/CompanyDetailsHeader";
import CompanyDetailsHero from "./details/CompanyDetailsHero";
import CompanyDetailsStats from "./details/CompanyDetailsStats";
import CompanyDetailsSidebar from "./details/CompanyDetailsSidebar";

interface CompanyDetailsProps {
  company: any;
  onBack: () => void;
}

export default function CompanyDetails({ company, onBack }: CompanyDetailsProps) {
  if (!company) return null;

  return (
    <div className="space-y-6">
      <CompanyDetailsHeader company={company} onBack={onBack} />

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <CompanyDetailsHero company={company} />

        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Company Overview</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {company.name} is a leading car rental provider in {company.country}, established in {company.since}. 
                  With a fleet of {company.vehicles} vehicles and a track record of {company.bookings} successful bookings, 
                  they provide exceptional service to customers across the region.
                </p>
              </div>

              <CompanyDetailsStats company={company} />

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Email Address</p>
                      <p className="text-sm font-medium text-gray-900">{company.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Phone Number</p>
                      <p className="text-sm font-medium text-gray-900">{company.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <CompanyDetailsSidebar company={company} />
          </div>
        </div>
      </div>
    </div>
  );
}
