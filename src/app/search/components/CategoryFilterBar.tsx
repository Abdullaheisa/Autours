'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { RootState, AppDispatch } from '@/store';
import { setFilterParams } from '@/store/slices/searchSlice';
import { categoryApi } from '@/services/api';
import { BACKEND_URL } from '@/config/api';

const WORLD_CATEGORY_ORDER = ['mini', 'small', 'standard', 'economy', 'full size', 'compact suv', 'suv', 'van', 'family', 'luxury'];

export default function CategoryFilterBar() {
  const dispatch = useDispatch<AppDispatch>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filterParams = useSelector((state: RootState) => state.search.filterParams);

  useEffect(() => {
    setIsLoading(true);
    categoryApi.getAll()
      .then((res: any) => {
        const list = res?.data || res || [];
        const sortedList = [...list].sort((a, b) => {
          const indexA = WORLD_CATEGORY_ORDER.indexOf(a.name.toLowerCase().trim());
          const indexB = WORLD_CATEGORY_ORDER.indexOf(b.name.toLowerCase().trim());
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.name.localeCompare(b.name);
        });
        setCategories(sortedList);
      })
      .catch((err) => console.warn("Failed to fetch categories:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      handleScroll();
    }
    return () => el?.removeEventListener('scroll', handleScroll);
  }, [handleScroll, categories]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = useCallback((catId: string) => {
    const isSelected = filterParams.category.includes(catId);
    const newCategory = isSelected ? [] : [catId];
    dispatch(setFilterParams({ category: newCategory }));
  }, [filterParams.category, dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6 text-gray-400 gap-2">
        <Loader2 size={16} className="animate-spin text-yellow-400" />
        <span className="text-xs font-medium">Loading categories...</span>
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <div className="relative w-full">
      {canScrollLeft && (
        <button 
          onClick={() => scroll('left')} 
          aria-label="Scroll categories left" // 🚀 Accessibility Fix
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-md hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
      )}

      {canScrollRight && (
        <button 
          onClick={() => scroll('right')} 
          aria-label="Scroll categories right" // 🚀 Accessibility Fix
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-md hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      )}

      <div ref={scrollRef} className="flex gap-3 overflow-x-auto no-scrollbar px-2 sm:px-12 py-2" style={{ scrollBehavior: 'smooth' }}>
        {categories.map((cat) => {
          const catId = String(cat.id);
          const isSelected = filterParams.category.includes(catId);
          const rawPhotoPath = cat.photo || cat.image || "";
          const cleanName = rawPhotoPath.replace(/^img\/categories\//, '').replace(/^categories\//, '').replace(/^\//, '');
          const photoUrl = rawPhotoPath.startsWith("http") ? rawPhotoPath : (rawPhotoPath ? `${BACKEND_URL}/img/categories/${cleanName}` : "");

          return (
            <motion.button
              key={cat.id}
              onClick={() => handleCategoryClick(catId)}
              aria-pressed={isSelected} // 🚀 Accessibility Fix
              aria-label={`Filter by ${cat.name}`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`group relative flex flex-col items-center justify-center min-w-[140px] sm:min-w-[180px] w-[140px] sm:w-[180px] rounded-xl border transition-all shrink-0 overflow-hidden focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 ${
                isSelected
                  ? 'border-yellow-400 bg-amber-50/40 shadow-[0_8px_30px_rgba(244,216,73,0.35)] ring-2 ring-yellow-400/40'
                  : 'border-gray-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.12)] hover:border-yellow-300'
              }`}
            >
              <div className="relative w-full h-[100px] sm:h-[160px] flex items-center justify-center p-3">
                {photoUrl ? (
                  // 🚀 Performance Fix: next/image instead of <img>
                  <Image 
                    src={photoUrl} 
                    alt="" // 🚀 Accessibility Fix: Empty alt for decorative images (Redundant text issue)
                    fill
                    sizes="(max-width: 640px) 140px, 180px"
                    className="object-contain p-3 transition-transform duration-300 group-hover:scale-105" 
                  />
                ) : (
                  <span className="text-xs font-bold text-gray-400">{cat.name}</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}