"use client";

import { Pencil, Trash2 } from "lucide-react";

interface CategoryCardProps {
  category: any;
  onEdit: (category: any) => void;
  onDelete: (id: number) => void;
}

export default function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div className="group bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-xl hover:border-primary-200 transition-all duration-300">
      <div className="relative h-40 overflow-hidden">
        <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
      <div className="p-4 flex items-center justify-between bg-gray-50/50">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${category.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${category.active ? "bg-emerald-500" : "bg-gray-500"}`} />
          {category.active ? "Active" : "Inactive"}
        </span>
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
              <img src={`https://i.pravatar.cc/100?img=${i + category.id}`} alt="user" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
