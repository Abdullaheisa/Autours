"use client";

import AuthGuard from '@/components/shared/auth/AuthGuard';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['admin']}>
      {children}
    </AuthGuard>
  );
}
