"use client";

import { Search } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ 
  title = "No items found", 
  description = "Try adjusting your filters or search query",
  actionLabel = "Clear all filters",
  onAction 
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Search className="text-gray-400" size={28} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-500 mt-1">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
