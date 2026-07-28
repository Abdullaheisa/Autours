import { API_CONFIG } from "@/constants";
import { BACKEND_URL } from "@/config/api";

export const getBackendBaseUrl = () => {
  // 1. If using mock data, serve images from Next.js public directory
  if (API_CONFIG.USE_MOCK) {
    return '';
  }

  // 2. Always use the absolute backend URL for images to bypass Next.js image proxy issues.
  // Images do not have CORS restrictions, so they should be loaded directly.
  return BACKEND_URL; // e.g. "https://www.autours.net"
};

const BACKEND_BASE = getBackendBaseUrl();

/**
 * Resolves a vehicle photo filename to its full URL.
 * Vehicle photos are served from /img/vehicles/ on the backend.
 */
export const getVehicleImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  
  // Clean up the path
  let cleanPath = trimmed;
  if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
  if (cleanPath.startsWith('img/vehicles/')) {
    cleanPath = cleanPath.replace('img/vehicles/', '');
  } else if (cleanPath.startsWith('vehicles/')) {
    cleanPath = cleanPath.replace('vehicles/', '');
  }
  
  return `${BACKEND_BASE}/img/vehicles/${cleanPath}`;
};

/**
 * Resolves a supplier logo filename to its full URL.
 * Logos are served from /img/ on the backend.
 */
export const getLogoUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  
  // Clean up the path
  let cleanPath = trimmed;
  if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
  if (cleanPath.startsWith('img/')) {
    cleanPath = cleanPath.replace('img/', '');
  }
  
  // Auto-resolve known global webp logos stored in company_logos/
  const lower = cleanPath.toLowerCase();
  const knownLogos = ['alamo.webp', 'avis.webp', 'budget.webp', 'dollar.webp', 'enterprise.webp', 'europcar.webp', 'hertz.webp', 'national.webp', 'sixt.webp', 'thrifty.webp'];
  if (knownLogos.includes(lower) || (lower.endsWith('.webp') && !lower.startsWith('company_logos/'))) {
    cleanPath = `company_logos/${cleanPath}`;
  }
  
  return `${BACKEND_BASE}/img/${cleanPath}`;
};

/**
 * Resolves a user avatar or company logo filename to its full URL.
 * Users/Companies upload logos which go into uploads/logos or direct relative paths.
 */
export const getUserImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  
  let cleanPath = trimmed;
  if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
  
  if (!cleanPath.includes('/')) {
    return `${BACKEND_URL}/img/${cleanPath}`;
  }
  
  return `${BACKEND_URL}/${cleanPath}`;
};

/**
 * Safely resolves and formats image URLs.
 * - Local paths (/img/, /assets/) → returned as-is (served from Next.js public/)
 * - Full URLs (http/https) → returned as-is
 * - Backend-relative paths → prepended with backend base /img/
 */
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';

  const trimmedPath = path.trim();
  if (!trimmedPath) return '';

  if (trimmedPath.startsWith('data:')) {
    return trimmedPath;
  }

  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    return trimmedPath;
  }

  if (trimmedPath.startsWith('/img/')) {
    return `${BACKEND_BASE}${trimmedPath}`;
  }
  if (trimmedPath.startsWith('img/')) {
    return `${BACKEND_BASE}/${trimmedPath}`;
  }

  if (
    trimmedPath.startsWith('/assets/') ||
    trimmedPath.startsWith('/public/')
  ) {
    return trimmedPath;
  }

  const cleanPath = trimmedPath.startsWith('/') ? trimmedPath.slice(1) : trimmedPath;
  return `${BACKEND_BASE}/img/${cleanPath}`;
};

/**
 * Resolves a category photo filename to its full URL.
 * Category images are served from /img/categories/ on the backend.
 */
/**
 * Resolves a blog featured image path to its full URL.
 * Blog images are served from /img/blogs/ on the backend.
 */
export const getBlogImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/img/blogs/')) return `${BACKEND_BASE}${trimmed}`;
  if (trimmed.startsWith('/')) return `${BACKEND_BASE}${trimmed}`;
  const cleanPath = trimmed.replace(/^blogs\//, '').replace(/^blog\//, '');
  return `${BACKEND_BASE}/img/blogs/${cleanPath}`;
};

export const getCategoryImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  
  
  
  let cleanPath = trimmed;
  if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
  
  // Support both /storage/ and /img/categories/
  if (cleanPath.startsWith('storage/')) {
    return `${BACKEND_URL}/${cleanPath}`;
  }
  if (cleanPath.startsWith('img/categories/')) {
    return `${BACKEND_URL}/${cleanPath}`;
  }
  if (cleanPath.startsWith('categories/')) {
    cleanPath = cleanPath.replace('categories/', '');
  }
  
  return `${BACKEND_URL}/img/categories/${cleanPath}`;
};
