import React, { useState } from "react";
import { ChevronDown, ChevronUp, Handshake, MapPin } from "lucide-react";
import Image from "next/image";

interface SupplierTableProps {
  data: any[];
  onNegotiate: (supplier: any) => void;
}

export function SupplierTable({ data, onNegotiate }: SupplierTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Group and sort data
  const groupedData = data.reduce((acc: any, offer: any) => {
    if (!acc[offer.name]) {
      acc[offer.name] = [];
    }
    acc[offer.name].push(offer);
    return acc;
  }, {});

  const groupsArray = Object.values(groupedData).map((offers: any) => {
    // Sort offers internally by lowest daily price
    offers.sort((a: any, b: any) => a.dailyPrice - b.dailyPrice);
    return {
      supplierName: offers[0].name,
      cheapestOffer: offers[0].dailyPrice,
      offers
    };
  });

  // Sort groups by the supplier with the absolute cheapest offer
  groupsArray.sort((a: any, b: any) => a.cheapestOffer - b.cheapestOffer);

  // Flatten back to array for table rendering, but inject a supplier separator row if needed, 
  // or just let them render sequentially with border logic
  const flatData = groupsArray.flatMap(g => g.offers);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getPositionBadge = (position: string) => {
    switch (position) {
      case "Cheapest": return "bg-green-100 text-green-700";
      case "Competitive": return "bg-blue-100 text-blue-700";
      case "Premium": return "bg-purple-100 text-purple-700";
      case "Expensive": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'none' || !status) return null;
    switch (status) {
      case "deal closed": return "bg-green-100 text-green-700 border border-green-200";
      case "negotiating": return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      case "rejected": return "bg-red-100 text-red-700 border border-red-200";
      case "interested": return "bg-blue-100 text-blue-700 border border-blue-200";
      case "contacted": return "bg-purple-100 text-purple-700 border border-purple-200";
      case "maybe later": return "bg-gray-50 text-gray-500 border border-gray-200";
      default: return "bg-gray-50 text-gray-500 border border-gray-200";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
            <th className="px-6 py-4">Supplier</th>
            <th className="px-6 py-4">Vehicle</th>
            <th className="px-6 py-4">Daily</th>
            <th className="px-6 py-4">Weekly</th>
            <th className="px-6 py-4">Monthly</th>
            <th className="px-6 py-4">Market</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {groupsArray.map((group, groupIdx) => (
            <React.Fragment key={group.supplierName}>
              {/* Group Separator (Visual Organization) */}
              <tr className="bg-gray-50/50">
                <td colSpan={8} className="px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-t-2 border-gray-100">
                  {group.supplierName} Fleet — {group.offers.length} Cars
                </td>
              </tr>
              
              {group.offers.map((offer: any) => (
                <React.Fragment key={offer.id}>
                  <tr className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => toggleRow(offer.id)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg border border-gray-100 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          <Image src={offer.logo} alt={offer.name} width={56} height={56} className="object-contain" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{offer.name}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <MapPin size={12} />
                            <span className="truncate max-w-[120px]">{offer.branchLocations[0]}</span> 
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-10 rounded-md bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                          <Image src={offer.carImage} alt={offer.carName} width={64} height={40} className="object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{offer.carName}</p>
                          <p className="text-xs text-gray-500">{offer.category} • {offer.fuel}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{offer.dailyPrice} <span className="text-xs text-gray-500 font-normal">AED</span></td>
                    <td className="px-6 py-4 font-medium text-gray-700">{offer.weeklyPrice} <span className="text-xs text-gray-400 font-normal">AED</span></td>
                    <td className="px-6 py-4 font-medium text-gray-700">{offer.monthlyPrice} <span className="text-xs text-gray-400 font-normal">AED</span></td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPositionBadge(offer.marketPosition)}`}>
                        {offer.marketPosition}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(offer.negotiationStatus) && (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(offer.negotiationStatus)}`}>
                          {offer.negotiationStatus}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onNegotiate(offer); }}
                          className="p-2 text-primary hover:bg-primary-50 rounded-lg transition-colors tooltip-trigger relative group/btn"
                        >
                          <Handshake size={18} />
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Notes</span>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          {expandedRow === offer.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {expandedRow === offer.id && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={8} className="p-0 border-b border-gray-100">
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-900">Vehicle Specs</h4>
                            <div className="flex gap-4">
                              <div className="w-24 h-16 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0">
                                <Image src={offer.carImage} alt={offer.carName} width={96} height={64} className="w-full h-full object-cover" />
                              </div>
                              <div className="space-y-1 text-xs text-gray-600">
                                <p>Transmission: <span className="font-medium text-gray-900">{offer.transmission}</span></p>
                                <p>Seats: <span className="font-medium text-gray-900">{offer.seats}</span></p>
                                <p>Availability: <span className="font-medium text-gray-900">{offer.availability} units left</span></p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-900">Negotiation Info</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-gray-500">Target Price</span>
                                <span className="font-medium text-gray-900">{offer.targetPrice || 'Not set'}</span>
                              </div>
                              <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-gray-500">Negotiated Price</span>
                                <span className="font-medium text-gray-900">{offer.negotiatedPrice || 'Not set'}</span>
                              </div>
                              <div className="flex justify-between pb-2">
                                <span className="text-gray-500">Follow-up</span>
                                <span className="font-medium text-gray-900">{offer.followUpDate || 'None'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-900">CRM Notes</h4>
                            <div className="bg-white p-3 rounded-xl border border-gray-200 text-sm text-gray-600 min-h-[80px]">
                              {offer.notes || "No internal notes yet. Click the handshake icon to log notes."}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
