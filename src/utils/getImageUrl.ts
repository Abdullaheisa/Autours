const BACKEND_BASE = 'https://www.autours.net';

/**
 * Resolves a vehicle photo filename to its full URL.
 * Vehicle photos are served from /img/vehicles/ on the backend.
 */
export const getVehicleImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/')) return trimmed;
  return `${BACKEND_BASE}/img/vehicles/${trimmed}`;
};

/**
 * Resolves a supplier logo filename to its full URL.
 * Logos are served from /img/ on the backend.
 */
export const getLogoUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/')) return trimmed;
  return `${BACKEND_BASE}/img/${trimmed}`;
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

  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    return trimmedPath;
  }

  if (
    trimmedPath.startsWith('/img/') ||
    trimmedPath.startsWith('/assets/') ||
    trimmedPath.startsWith('/public/')
  ) {
    return trimmedPath;
  }

  const cleanPath = trimmedPath.startsWith('/') ? trimmedPath.slice(1) : trimmedPath;
  return `${BACKEND_BASE}/img/${cleanPath}`;
};
