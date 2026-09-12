/**
 * Centralized API Configuration
 * 
 * Provides base URLs for fetching data seamlessly across Local Development & Production.
 */

const isProd =
  process.env.NODE_ENV === 'production' ||
  process.env.VERCEL_ENV === 'production' ||
  (typeof window !== 'undefined' && window.location.hostname.includes('autours.net'));

// 1. The actual backend server (Laravel/PHP backend)
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (isProd ? 'https://www.autours.net' : 'http://localhost:8000');

// 2. For Client Components ("use client")
// Client components use relative proxy to eliminate CORS.
export const CLIENT_API_BASE = '/api/backend';

// 3. For Server Components ("use server" or App Router routes)
export const SERVER_API_BASE = `${BACKEND_URL}/api`;

// 4. Robust Candidate Backend URLs for fallback resilience
export const CANDIDATE_BACKEND_URLS: string[] = Array.from(
  new Set([
    BACKEND_URL,
    'https://www.autours.net',
    'https://autours.net',
    'http://127.0.0.1:8000',
    'http://localhost:8000',
    'http://127.0.0.1',
    'http://localhost',
  ].filter(Boolean))
);
