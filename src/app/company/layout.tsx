"use client";

import { SearchProvider } from "./context/SearchContext";
import AuthGuard from '@/components/shared/auth/AuthGuard';

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={['admin', 'supplier']}>
      <SearchProvider>
        {children}
      </SearchProvider>
    </AuthGuard>
  );
}
