"use client";

import { SearchProvider } from "./context/SearchContext";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SearchProvider>
      {children}
    </SearchProvider>
  );
}
