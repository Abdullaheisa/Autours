'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * Persists pagination page across unmounts, tab switches, and detail views
 * using URL search parameters and sessionStorage.
 *
 * @param storageKey Unique identifier for the section/table (e.g. 'company_vehicles', 'admin_companies')
 * @param defaultPage Default page if none stored (defaults to 1)
 */
export function usePersistedPage(
  storageKey: string,
  defaultPage: number = 1
): [number, (page: number) => void, () => void] {
  const [currentPage, setCurrentPageState] = useState<number>(() => {
    if (typeof window === 'undefined') return defaultPage;
    try {
      // 1. Check URL param 'page' if applicable
      const params = new URLSearchParams(window.location.search);
      const urlPage = params.get('page');
      const urlTab = params.get('tab');

      // Check if URL page belongs to this tab
      const isMatchingTab =
        !urlTab ||
        storageKey.toLowerCase().includes(urlTab.toLowerCase()) ||
        urlTab.toLowerCase().includes(storageKey.toLowerCase());

      if (urlPage && isMatchingTab) {
        const parsed = parseInt(urlPage, 10);
        if (!isNaN(parsed) && parsed > 0) {
          return parsed;
        }
      }

      // 2. Check sessionStorage
      const saved = sessionStorage.getItem(`pagination_page_${storageKey}`);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return defaultPage;
  });

  const setPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, page);
      setCurrentPageState(validPage);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(`pagination_page_${storageKey}`, String(validPage));
          const params = new URLSearchParams(window.location.search);
          const currentTab = params.get('tab');
          if (
            !currentTab ||
            storageKey.toLowerCase().includes(currentTab.toLowerCase()) ||
            currentTab.toLowerCase().includes(storageKey.toLowerCase())
          ) {
            params.set('page', String(validPage));
            window.history.replaceState(
              { ...window.history.state, page: validPage },
              '',
              `?${params.toString()}`
            );
          }
        } catch {
          // ignore
        }
      }
    },
    [storageKey]
  );

  const resetPage = useCallback(() => {
    setPage(1);
  }, [setPage]);

  // Sync if popstate or URL changes
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlPage = params.get('page');
        const urlTab = params.get('tab');
        const isMatchingTab =
          !urlTab ||
          storageKey.toLowerCase().includes(urlTab.toLowerCase()) ||
          urlTab.toLowerCase().includes(storageKey.toLowerCase());

        if (urlPage && isMatchingTab) {
          const parsed = parseInt(urlPage, 10);
          if (!isNaN(parsed) && parsed > 0 && parsed !== currentPage) {
            setCurrentPageState(parsed);
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [storageKey, currentPage]);

  return [currentPage, setPage, resetPage];
}

export default usePersistedPage;
