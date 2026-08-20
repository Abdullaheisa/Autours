"use client";

import { Eye, Pencil, Trash2, ArrowUpRight } from "lucide-react";

interface ActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showRead?: boolean;
  onRead?: () => void;
  size?: "sm" | "md";
}

export default function ActionButtons({
  onView,
  onEdit,
  onDelete,
  showRead = false,
  onRead,
  size = "md",
}: ActionButtonsProps) {
  const iconSize = size === "sm" ? 14 : 16;
  const btnClass = size === "sm" ? "p-1.5" : "p-2";

  return (
    <div className="flex items-center gap-1">
      {showRead && onRead && (
        <button
          onClick={onRead}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          Read
          <ArrowUpRight size={12} />
        </button>
      )}
      {onView && (
        <button
          onClick={onView}
          className={`${btnClass} text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors`}
        >
          <Eye size={iconSize} />
        </button>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          className={`${btnClass} text-amber-500 hover:bg-amber-50 rounded-lg transition-colors`}
        >
          <Pencil size={iconSize} />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className={`${btnClass} text-red-500 hover:bg-red-50 rounded-lg transition-colors`}
        >
          <Trash2 size={iconSize} />
        </button>
      )}
    </div>
  );
}
