"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          const show = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
          const showEllipsis = (page === 2 && currentPage > 3) || (page === totalPages - 1 && currentPage < totalPages - 2);

          if (showEllipsis) {
            return <span key={`ellipsis-${page}`} className="px-2 text-gray-400">...</span>;
          }

          if (!show) return null;

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[36px] h-9 text-sm font-medium rounded-xl transition-all ${
                currentPage === page
                  ? "bg-primary-600 text-white shadow-md shadow-primary-200"
                  : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
