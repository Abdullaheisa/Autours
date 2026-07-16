'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { initCurrency, fetchExchangeRates } from '@/store/slices/currencySlice';
import { restoreAuth } from '@/store/slices/authSlice';
import ContestPopup from '@/components/shared/layout/ContestPopup';

export default function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const BUILD_VERSION = "release-2026-07-16-v1";
    if (typeof window !== 'undefined') {
      const storedVersion = localStorage.getItem('app_build_version');
      if (storedVersion !== BUILD_VERSION) {
        const hadSession = !!(localStorage.getItem('token') || sessionStorage.getItem('token'));

        // Clear session info
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('isImpersonated');

        // Clear cookies to ensure backend session is also wiped
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }

        // Save new build version
        localStorage.setItem('app_build_version', BUILD_VERSION);

        if (hadSession) {
          window.location.href = '/login';
          return;
        }
      }
    }

    // Restore auth status from localStorage/sessionStorage
    dispatch(restoreAuth());
    // Restore saved currency from localStorage
    dispatch(initCurrency());
    // Fetch live exchange rates from API
    dispatch(fetchExchangeRates(false));
  }, [dispatch]);

  return (
    <div className="min-h-screen">
      <ContestPopup />
      {children}
    </div>
  );
}
