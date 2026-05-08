'use client';

import { useState } from "react";
import { CreditCard, DollarSign, Wallet } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";

const initialMethods = [
  { 
    id: 1, 
    name: "Pay on Arrival", 
    description: "Pay full amount cash when arrived to the office", 
    active: true 
  },
  { 
    id: 2, 
    name: "Pay in Full", 
    description: "Pay full amount with card (online Payment)", 
    active: false 
  },
  { 
    id: 3, 
    name: "Pay Partially", 
    description: "Pay only part of the total amount and the other can be paid in cash", 
    active: false 
  },
];

const icons: Record<number, React.ReactNode> = {
  1: <DollarSign size={18} />,
  2: <CreditCard size={18} />,
  3: <Wallet size={18} />,
};

export default function PaymentMethodsSection() {
  const [methods, setMethods] = useState(initialMethods);

  const handleSelect = (selectedId: number) => {
    setMethods(methods.map(m => ({
      ...m,
      active: m.id === selectedId
    })));
  };

  return (
    <SectionLayout>
      <PageHeader 
        title="Payment Methods" 
        description="Configure how customers can pay for their rentals"
        showAction={false} 
      />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-8 py-4">Method Name</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-8 py-4">Description</th>
                <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-8 py-4">Activation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {methods.map((method) => (
                <tr 
                  key={method.id} 
                  className={`transition-colors cursor-pointer ${
                    method.active 
                      ? 'bg-primary-50/40' 
                      : 'hover:bg-gray-50/50'
                  }`}
                  onClick={() => handleSelect(method.id)}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                        method.active 
                          ? 'bg-primary-100 text-primary-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {icons[method.id]}
                      </div>
                      <span className={`font-bold text-sm ${method.active ? 'text-primary-700' : 'text-gray-900'}`}>
                        {method.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500">{method.description}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center">
                      <div 
                        className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer
                          ${method.active 
                            ? 'border-primary-500 bg-primary-500' 
                            : 'border-gray-300 bg-white hover:border-gray-400'
                          }
                        `}
                      >
                        {method.active && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionLayout>
  );
}