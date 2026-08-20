"use client";

import { ReactNode } from "react";

interface GenericCardProps {
  image?: string;
  title: string;
  subtitle?: string;
  badges?: { label: string; color: string }[];
  metaItems?: { icon: ReactNode; label: string }[];
  footer?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function GenericCard({
  image,
  title,
  subtitle,
  badges = [],
  metaItems = [],
  footer,
  onClick,
  className = "",
}: GenericCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all duration-300 overflow-hidden flex flex-col ${className}`}
    >
      {/* Image Section */}
      {image && (
        <div className="relative h-44 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Badges */}
          {badges.length > 0 && (
            <div className="absolute top-3 left-3 right-3 flex justify-between">
              {badges.map((badge, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border backdrop-blur-sm bg-white/90 ${badge.color}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>

        {subtitle && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2 flex-1">{subtitle}</p>
        )}

        {/* Meta Items */}
        {metaItems.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
            {metaItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-400">
                {item.icon}
                <span className="text-xs text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
