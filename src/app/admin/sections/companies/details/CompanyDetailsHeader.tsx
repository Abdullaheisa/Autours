"use client";

import { ArrowLeft } from "lucide-react";

interface CompanyDetailsHeaderProps {
  company: any;
  onBack: () => void;
}

export default function CompanyDetailsHeader({ company, onBack }: CompanyDetailsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Companies
      </button>
      <div className="flex gap-2">
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
          company.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
          company.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
          'bg-red-50 text-red-700 border-red-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            company.status === 'active' ? 'bg-emerald-500' : 
            company.status === 'pending' ? 'bg-amber-500' : 
            'bg-red-500'
          }`} />
          {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
        </span>
      </div>
    </div>
  );
}
