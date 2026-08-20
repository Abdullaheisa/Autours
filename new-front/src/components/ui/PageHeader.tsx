"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  actionHref?: string;
  showAction?: boolean;
}

export default function PageHeader({ 
  title, 
  description, 
  actionLabel = "Add New", 
  actionIcon = <Plus size={18} />,
  onAction,
  actionHref,
  showAction = true 
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{title}</h1>
        {description && <p className="text-gray-500 mt-1">{description}</p>}
      </div>
      
      {showAction && (
        actionHref ? (
          <Link 
            href={actionHref}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-gray-900 px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-primary/20 w-fit"
          >
            {actionIcon}
            {actionLabel}
          </Link>
        ) : onAction ? (
          <button 
            onClick={onAction}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-gray-900 px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-primary/20 w-fit"
          >
            {actionIcon}
            {actionLabel}
          </button>
        ) : null
      )}
    </div>
  );
}
