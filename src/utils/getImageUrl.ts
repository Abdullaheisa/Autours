/**
 * Safely resolves and formats image URLs.
 * - Local paths (/img/, /assets/) → returned as-is (served from Next.js public/)
 * - Full URLs (http/https) → returned as-is
 * - Backend-relative paths → prepended with API storage base
 */
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';

  const trimmedPath = path.trim();
  if (!trimmedPath) return '';

  // Already a full URL → return as-is
  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    return trimmedPath;
  }

  // Local static asset (Next.js public folder) → return as-is
  if (
    trimmedPath.startsWith('/img/') ||
    trimmedPath.startsWith('/assets/') ||
    trimmedPath.startsWith('/public/')
  ) {
    return trimmedPath;
  }

  // Backend storage path → prepend API base
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://www.autours.net';
  const cleanBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
  const baseUrl = `${cleanBase}/storage/`;

  const cleanPath = trimmedPath.startsWith('/') ? trimmedPath.slice(1) : trimmedPath;
  return `${baseUrl}${cleanPath}`;
};
