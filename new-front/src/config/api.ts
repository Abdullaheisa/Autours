/**
 * Centralized API Configuration
 * 
 * Provides base URLs for fetching data in different environments.
 */

// 1. The actual backend server (Laravel/PHP backend)
// This is read at build time or runtime depending on the environment.
// In production, set NEXT_PUBLIC_BACKEND_URL=https://www.autours.net in the server env.
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// 2. For Client Components ("use client")
// Client components are subject to CORS. They must use the relative '/api/backend' path,
// which Next.js will intercept and proxy to the actual backend via the rewrite rules in next.config.js.
// We strictly use the Next.js proxy for ALL environments to eliminate CORS completely.
export const CLIENT_API_BASE = '/api/backend';

// 3. For Server Components ("use server" or default App Router components)
// Server components run in a Node environment and do not care about CORS.
// To save proxy overhead, they should directly call the actual Backend URL.
export const SERVER_API_BASE = BACKEND_URL.includes('autours.net')
  ? `${BACKEND_URL}/api/backend/api`
  : `${BACKEND_URL}/api`;

// 4. Robust Candidate Backend URLs for fallback resilience (used by chatbot routes)
export const CANDIDATE_BACKEND_URLS: string[] = Array.from(
  new Set([
    'https://www.autours.net/api/backend',
    'https://www.autours.net',
    'http://127.0.0.1:8000',
    'http://localhost:8000',
    BACKEND_URL,
  ].filter(Boolean))
);
