'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store';
import { restoreAuth } from '@/store/slices/authSlice';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    dispatch(restoreAuth());
    setChecked(true);
  }, [dispatch]);

  useEffect(() => {
    if (!checked) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.replace('/login');
    }
  }, [checked, isAuthenticated, user, allowedRoles, router]);

  if (!checked || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent" />
      </div>
    );
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
