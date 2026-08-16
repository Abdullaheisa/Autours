'use client';
import { Sparkles, Info } from 'lucide-react';
import { getVehicleImageUrl } from '@/utils/getImageUrl';
import { assets } from '@/config/assets';

interface Props {
  cheapest: Record<string, any>;
  locationName: string;
}

export default function FleetSection({ cheapest, locationName }: Props) {
  if (!cheapest || Object.keys(cheapest).length === 0) return null;

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 text-black text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Best Deals in {locationName}
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight uppercase italic font-title">
            Our Fleet &amp; Cheapest Daily Rates
          </h2>
          <p className="text-gray-500 mt-2 text-sm md:text-base font-semibold">
            Cheapest rates calculated from monthly rentals (daily average)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {Object.entries(cheapest).map(([categoryName, car]: any) => (
            <div
              key={categoryName}
              className="bg-white rounded-3xl border-2 border-gray-100 hover:border-primary transition-all duration-300 overflow-hidden shadow-md flex flex-col sm:flex-row items-stretch"
            >
              {/* Left: Car Image */}
              <div className="relative w-full sm:w-[200px] md:w-[220px] shrink-0 bg-white flex items-center justify-center p-4 min-h-[180px]">
                <span className="absolute top-3 left-3 bg-primary text-gray-900 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm z-10">
                  {categoryName}
                </span>
                <img
                  src={getVehicleImageUrl(car.photo) || 'https://via.placeholder.com/300x180?text=No+Image'}
                  alt={car.car_name}
                  className="max-h-[120px] w-auto object-contain transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* Right: Info & Specs & Price */}
              <div className="flex-grow p-5 md:p-6 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <h3 className="text-base font-black text-gray-900 leading-tight">{car.car_name}</h3>
                    <div className="relative w-3.5 h-3.5 rounded-full flex items-center justify-center bg-yellow-400 text-gray-900 cursor-pointer shadow-sm">
                      <Info size={8} strokeWidth={4} className="text-gray-900" />
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-blue-900/70 mb-4 uppercase tracking-wider">{categoryName}</p>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                      <img src={assets.icons.seats} alt="Seats" className="w-6 h-6 object-contain shrink-0" />
                      <span>{car.seats} Seats</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                      <img src={assets.icons.doors} alt="Doors" className="w-5 h-5 object-contain shrink-0 ml-0.5 mr-0.5" />
                      <span>{car.doors} Doors</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                      <img src={assets.icons.bags} alt="Luggage" className="w-6 h-6 object-contain shrink-0" />
                      <span className="truncate">{car.suitcases || '2 Bags'} Suitcase</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                      <img src={assets.icons.ac} alt="A/C" className="w-6 h-6 object-contain shrink-0" />
                      <span className="truncate">{car.ac ? 'Air Conditioning' : 'No A/C'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                      <img src={assets.icons.fuel} alt="Fuel" className="w-6 h-6 object-contain shrink-0" />
                      <span className="truncate">{car.fuelType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                      <img src={assets.icons.transmission} alt="Transmission" className="w-6 h-6 object-contain shrink-0" />
                      <span className="truncate">{car.transmission}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="bg-white border border-gray-200 rounded-xl p-1 flex items-center justify-center w-[80px] h-[40px] shrink-0 shadow-sm">
                      {car.supplier_logo ? (
                        <img src={`/img/${car.supplier_logo}`} alt={car.supplier} className="h-7 w-auto max-w-[72px] object-contain" />
                      ) : (
                        <span className="text-[8px] font-black text-gray-600 truncate">{car.supplier}</span>
                      )}
                    </div>
                    <span className="text-xs font-black text-gray-800 truncate">{car.supplier}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider leading-none mb-0.5">Starting from</p>
                    <div className="flex items-baseline gap-0.5 justify-end">
                      <span className="text-xl font-black text-gray-900 leading-none">{car.price}</span>
                      <span className="text-[10px] font-black text-gray-500">{car.currency}/day</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
