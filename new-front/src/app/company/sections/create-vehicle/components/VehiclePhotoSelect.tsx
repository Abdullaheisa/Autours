'use client';

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Car, ChevronDown, ChevronUp, Check, Image as ImageIcon, Search } from "lucide-react";

interface VehiclePhotoSelectProps {
  vehiclePhotoId: string;
  photos: any[];
  onSelectPhoto: (photoId: string) => void;
}

export const VehiclePhotoSelect: React.FC<VehiclePhotoSelectProps> = ({
  vehiclePhotoId,
  photos,
  onSelectPhoto,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [photoSearch, setPhotoSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setPhotoSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedPhoto = photos.find(
    (p: any) => String(p.id) === vehiclePhotoId || p.photo === vehiclePhotoId
  );

  const filteredPhotos = useMemo(() => {
    if (!photoSearch.trim()) return photos;
    return photos.filter((p: any) =>
      p.name.toLowerCase().includes(photoSearch.toLowerCase())
    );
  }, [photos, photoSearch]);

  const handleSelect = (photoId: string) => {
    onSelectPhoto(photoId);
    setShowDropdown(false);
    setPhotoSearch("");
  };

  const getPhotoUrl = (photo: any) => {
    const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    let photoUrl = photo.photo || photo.image || photo.url || null;
    if (photoUrl && !photoUrl.startsWith('http') && !photoUrl.startsWith('data:') && !photoUrl.startsWith('/')) {
      photoUrl = `${backendBase}/img/vehicles/${photoUrl}`;
    }
    return photoUrl;
  };

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
        Vehicle Photo
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setShowDropdown((prev) => !prev);
          setPhotoSearch("");
        }}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 hover:bg-gray-100 transition-all"
      >
        <span className={selectedPhoto ? "text-gray-900 font-medium" : "text-gray-400"}>
          {selectedPhoto
            ? `${selectedPhoto.name}${selectedPhoto.category?.name ? ` (${selectedPhoto.category.name})` : ''}`
            : "Select a vehicle image…"}
        </span>
        {showDropdown ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>

      {/* Dropdown list */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden flex flex-col max-h-80">
          {/* Photo Search Bar */}
          <div className="p-2 border-b border-gray-100 flex items-center gap-2">
            <Search size={14} className="text-gray-400 shrink-0 ml-1" />
            <input
              type="text"
              value={photoSearch}
              onChange={(e) => setPhotoSearch(e.target.value)}
              placeholder="Search photo..."
              className="w-full px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-white"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredPhotos.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-400 text-sm">
                No matching photos found in library.
              </div>
            ) : (
              filteredPhotos.map((photo: any) => {
                const photoUrl = getPhotoUrl(photo);
                const catLabel = photo.category?.name || photo.category_name || "";
                const isSelected = vehiclePhotoId === String(photo.id);
                return (
                  <button
                    type="button"
                    key={photo.id}
                    onClick={() => handleSelect(String(photo.id))}
                    className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-all hover:bg-gray-50 border-b border-gray-50 last:border-0 ${
                      isSelected ? "bg-primary-50/50" : ""
                    }`}
                  >
                    <div className="w-16 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                      {photoUrl ? (
                        <img src={photoUrl} alt={photo.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Car size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${isSelected ? "text-primary-700" : "text-gray-900"}`}>
                        {photo.name}
                      </p>
                      {catLabel && <p className="text-xs text-gray-500">{catLabel}</p>}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Selected preview */}
      {selectedPhoto && (() => {
        const photoUrl = getPhotoUrl(selectedPhoto);
        const catLabel = selectedPhoto.category?.name || selectedPhoto.category_name || "";
        return (
          <div className="mt-3 p-4 bg-primary-50 rounded-xl border border-primary-100 flex items-center gap-4">
            <div className="w-24 h-16 rounded-lg overflow-hidden border-2 border-white shadow-sm bg-white">
              {photoUrl ? (
                <img src={photoUrl} alt={selectedPhoto.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                  <Car size={20} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">{selectedPhoto.name}</p>
              {catLabel && <p className="text-xs text-primary-600 font-medium">{catLabel}</p>}
              <p className="text-[10px] text-gray-400 mt-1">Image pulled from vehicle library</p>
            </div>
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-primary-200">
              <ImageIcon size={18} className="text-primary-500" />
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default VehiclePhotoSelect;
