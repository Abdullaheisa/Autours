"use client";

import { ReactNode } from "react";

interface SectionLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function SectionLayout({ children, className = "" }: SectionLayoutProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {children}
    </div>
  );
}
