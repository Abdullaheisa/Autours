'use client';

import React from "react";

interface SectionCardProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  icon: Icon,
  title,
  children,
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
    <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30 rounded-t-2xl">
      <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
        <Icon size={18} className="text-primary-600" />
      </div>
      <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export default SectionCard;
