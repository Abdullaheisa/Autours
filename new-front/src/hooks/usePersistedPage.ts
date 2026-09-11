'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * Persists pagination page across drill-down subviews and browser back/forward,
 * but starts clean at page 1 when navigating to a section/tab anew from sidebar or switching companies.
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
      const params = new URLSearchParams(window.location.search);
      const urlPage = params.get('page');
      const urlTab = params.get('tab');

      const isMatchingTab =
        !urlTab ||
        storageKey.toLowerCase().includes(urlTab.toLowerCase()) ||
        urlTab.toLowerCase().includes(storageKey.toLowerCase());

      // 1. If URL has explicit 'page' for this tab (e.g. ?tab=vehicles&page=20), use it!
      if (urlPage && isMatchingTab) {
        const parsed = parseInt(urlPage, 10);
        if (!isNaN(parsed) && parsed > 0) {
          sessionStorage.setItem(`pagination_page_${storageKey}`, String(parsed));
          return parsed;
        }
      }

      // 2. If user navigated to this tab fresh (?tab=vehicles without ?page=...), reset to 1 and clear storage!
      if (urlTab && isMatchingTab && !urlPage) {
        sessionStorage.removeItem(`pagination_page_${storageKey}`);
        return defaultPage;
      }

      // 3. Fallback to sessionStorage only if no explicit tab override
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
          const params = new URLSearchParams(window.location.search);
          const currentTab = params.get('tab');
          const isMatchingTab =
            !currentTab ||
            storageKey.toLowerCase().includes(currentTab.toLowerCase()) ||
            currentTab.toLowerCase().includes(storageKey.toLowerCase());

          if (validPage > 1) {
            sessionStorage.setItem(`pagination_page_${storageKey}`, String(validPage));
            if (isMatchingTab) {
              params.set('page', String(validPage));
              window.history.replaceState(
                { ...window.history.state, page: validPage },
                '',
                `?${params.toString()}`
              );
            }
          } else {
            sessionStorage.removeItem(`pagination_page_${storageKey}`);
            if (isMatchingTab) {
              params.delete('page');
              const newSearch = params.toString() ? `?${params.toString()}` : window.location.pathname;
              window.history.replaceState(
                { ...window.history.state, page: 1 },
                '',
                newSearch
              );
            }
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

        if (isMatchingTab) {
          if (urlPage) {
            const parsed = parseInt(urlPage, 10);
            if (!isNaN(parsed) && parsed > 0 && parsed !== currentPage) {
              setCurrentPageState(parsed);
            }
          } else if (currentPage !== defaultPage) {
            setCurrentPageState(defaultPage);
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [storageKey, currentPage, defaultPage]);

  return [currentPage, setPage, resetPage];
}

export default usePersistedPage;
