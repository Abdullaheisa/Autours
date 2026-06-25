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
