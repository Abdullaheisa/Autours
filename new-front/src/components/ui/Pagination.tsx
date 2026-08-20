"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Smart pagination with ellipsis truncation.
 * Always shows: first page, last page, current page ± 2 neighbors, with "..." gaps.
 * This prevents the bar from overflowing when there are many pages.
 */
export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Build the list of page tokens to render (numbers or "ellipsis" markers)
  const getPageTokens = (): (number | "ellipsis-left" | "ellipsis-right")[] => {
    const delta = 2; // neighbors on each side of current page
    const range: number[] = [];
    const tokens: (number | "ellipsis-left" | "ellipsis-right")[] = [];

    // Always include first, last, and the window around currentPage
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    tokens.push(1);

    if (left > 2) {
      tokens.push("ellipsis-left");
    }

    tokens.push(...range);

    if (right < totalPages - 1) {
      tokens.push("ellipsis-right");
    }

    if (totalPages > 1) {
      tokens.push(totalPages);
    }

    return tokens;
  };

  const tokens = getPageTokens();

  return (
    <div className="flex items-center justify-center gap-1.5 pt-4 flex-wrap">
      {/* Previous */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
      >
        <ChevronLeft size={14} />
        Prev
      </button>

      {/* Page tokens */}
      {tokens.map((token, idx) => {
        if (token === "ellipsis-left" || token === "ellipsis-right") {
          return (
            <span
              key={`${token}-${idx}`}
              className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm select-none"
            >
              &hellip;
            </span>
          );
        }
        const page = token as number;
        const isActive = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
              isActive
                ? "bg-primary text-black shadow-sm"
                : "border border-gray-200 text-gray-600 bg-white hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        );
      })}

      {/* Next */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
      >
        Next
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
