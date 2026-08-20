"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { BACKEND_URL } from "@/config/api";

// شيلنا الاستدعاءات اللي ملهاش لازمة عشان ننظف الملف

interface CategoryCardProps {
  category: any;
  onEdit: (category: any) => void;
  onDelete: (id: number) => void;
}

export default function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const [imgError, setImgError] = useState(false);

// 1. قراءة المسار من الباك إند 
  const imagePath = category.photo || category.image || category.image_path || "";

  // 2. بناء الرابط السليم بناءً على مسار البروجيكت القديم
  let imageUrl = "";
  if (imagePath) {
    if (imagePath.startsWith("http")) {
      imageUrl = imagePath;
    } else {
      // بننظف الاسم عشان لو لارافل باعت الكلمة متكررة، ونوجهه لفولدر img/categories الصح
      const cleanName = imagePath.replace(/^img\/categories\//, '').replace(/^categories\//, '').replace(/^\//, '');
      imageUrl = `${BACKEND_URL}/img/categories/${cleanName}`;
    }
  }

  return (
    <div className="group bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-xl hover:border-primary-200 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="relative h-40 overflow-hidden bg-gray-100 flex items-center justify-center">
          {!imgError && imageUrl ? (
            <Image 
              src={imageUrl} 
              alt={category.name || "Category"} 
              fill
              unoptimized
              className="object-cover group-hover:scale-110 transition-transform duration-500" 
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 group-hover:scale-110 transition-transform duration-500">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/>
                <path d="M9 17h6"/>
                <circle cx="17" cy="17" r="2"/>
              </svg>
              <span className="text-xs mt-2 font-medium">No Image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
            <button 
              onClick={() => onEdit(category)}
              className="p-2 bg-white/90 backdrop-blur-md text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl shadow-lg transition-all"
            >
              <Pencil size={16} />
            </button>
            <button 
              onClick={() => onDelete(category.id)}
              className="p-2 bg-white/90 backdrop-blur-md text-red-500 hover:bg-red-500 hover:text-white rounded-xl shadow-lg transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="absolute bottom-4 left-4">
            <h3 className="text-lg font-bold text-white">{category.name}</h3>
            <p className="text-xs text-white/80 font-medium">{category.vehicles} active vehicles</p>
          </div>
        </div>
        {category.description && (
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed" title={category.description}>
              {category.description}
            </p>
          </div>
        )}
      </div>
      <div className="p-4 flex items-center justify-between bg-gray-50/50">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${category.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${category.active ? "bg-emerald-500" : "bg-gray-500"}`} />
          {category.active ? "Active" : "Inactive"}
        </span>
        <span className="text-xs text-gray-500 font-medium">{category.vehicles} vehicles</span>
      </div>
    </div>
  );
}