"use client";

import { Trash2, Car } from "lucide-react";
import { VehiclePhoto } from "@/lib/data";

interface VehiclePhotoCardProps {
  vehicle: VehiclePhoto;
  onDelete: (id: number) => void;
}

export default function VehiclePhotoCard({ vehicle, onDelete }: VehiclePhotoCardProps) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-300 overflow-hidden">
      {/* Image Section */}
      <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
        {vehicle.image ? (
          <img
            src={vehicle.image}
            alt={vehicle.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="text-center">
            <Car size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-xs text-gray-400">No photo</p>
          </div>
        )}

        {/* Delete Button */}
        <button
          onClick={() => onDelete(vehicle.id)}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm text-red-500 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{vehicle.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{vehicle.category}</p>
      </div>
    </div>
  );
}
