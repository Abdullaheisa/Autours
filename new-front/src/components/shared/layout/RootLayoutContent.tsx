'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { initCurrency, setCurrency, fetchExchangeRates, currencySymbols, Currency } from '@/store/slices/currencySlice';
import { restoreAuth } from '@/store/slices/authSlice';
import { detectUserCountry } from '@/utils/userCountry';
import ContestPopup from '@/components/shared/layout/ContestPopup';
import AIChatAssistant from '@/components/chat/AIChatAssistant';

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
    // Restore saved currency from localStorage / cached country
    dispatch(initCurrency());
    // Fetch live exchange rates from API
    dispatch(fetchExchangeRates(false));

    // Fast IP-based country & currency auto-detection (<50ms)
    detectUserCountry()
      .then((detected) => {
        if (detected?.currency && currencySymbols[detected.currency as Currency]) {
          const isManual =
            typeof window !== 'undefined' &&
            localStorage.getItem('autours_user_manual_currency') === 'true';
          if (!isManual) {
            dispatch(setCurrency(detected.currency as Currency));
          }
        }
      })
      .catch(() => {});
  }, [dispatch]);

  return (
    <div className="min-h-screen">
      <ContestPopup />
      {children}
      <AIChatAssistant />
    </div>
  );
}

