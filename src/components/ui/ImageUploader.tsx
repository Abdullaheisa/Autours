"use client";

import { X, Upload, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

interface ImageUploaderProps {
  label?: string;
  value?: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}

export default function ImageUploader({ label, value, onChange, className = "" }: ImageUploaderProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(value || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        onChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    setPreviewImage(null);
    onChange(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{label}</label>}
      <div className="relative group">
        <div className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${previewImage ? 'border-solid border-primary-500' : 'border-gray-300 hover:border-primary-400'}`}>
          {previewImage ? (
            <>
              <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <ImageIcon size={24} className="text-gray-400 mb-2" />
              <span className="text-[10px] text-gray-500 font-medium">Upload Image</span>
            </>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
