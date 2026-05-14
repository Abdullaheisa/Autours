'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { RootState, AppDispatch } from '@/store';
import { setFilterParams, applyLocalFilters } from '@/store/slices/searchSlice';
import { categories } from '@/data/categories';

interface CategoryFilterBarProps {
  onFilterChange?: () => void;
}

export default function CategoryFilterBar({ onFilterChange }: CategoryFilterBarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const filterParams = useSelector((state: RootState) => state.search.filterParams);

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
  }, [handleScroll]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleCategoryClick = useCallback((catId: string) => {
    const isSelected = filterParams.category.includes(catId);
    const newCategory = isSelected ? [] : [catId];
    dispatch(setFilterParams({ category: newCategory }));
    dispatch(applyLocalFilters());
    onFilterChange?.();
  }, [filterParams.category, dispatch, onFilterChange]);

  return (
    <div className="relative w-full">
      {/* Left Arrow - Desktop only */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-md hover:bg-white hover:shadow-lg transition-all"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
      )}

      {/* Right Arrow - Desktop only */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-md hover:bg-white hover:shadow-lg transition-all"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      )}

      {/* Scrollable slider */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto no-scrollbar px-2 sm:px-12 py-2"
        style={{ scrollBehavior: 'smooth' }}
      >
        {categories.map((cat) => {
          const isSelected = filterParams.category.includes(cat.id);

          return (
            <motion.button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`relative flex flex-col items-center justify-center min-w-[140px] sm:min-w-[180px] w-[140px] sm:w-[180px] rounded-xl border transition-all shrink-0 overflow-hidden ${isSelected
                  ? 'border-yellow-400 bg-white shadow-[0_8px_30px_rgba(244,216,73,0.4)] ring-2 ring-yellow-400/30'
                  : 'border-gray-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.18)] hover:border-yellow-300'
                }`}
            >
              {/* Category Image - Large */}
              <div className="w-full h-[140px] sm:h-[160px] flex items-center justify-center overflow-hidden p-3">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-[200px] h-[200px] object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}