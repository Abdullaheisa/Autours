/**
 * Centralized API Configuration
 * 
 * Provides base URLs for fetching data in different environments.
 */

// 1. The actual backend server (Laravel/PHP backend)
// This is read at build time or runtime depending on the environment.
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// For Client Components ("use client")
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
