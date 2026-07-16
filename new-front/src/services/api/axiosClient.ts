import axios from 'axios';
import { API_CONFIG } from '@/constants';
import toast from 'react-hot-toast';

// Set global defaults for withCredentials so all axios requests receive legacy cookies
axios.defaults.withCredentials = true;

// ─── Axios Instance ────────────────────────────────────────────────────────────
//
// withCredentials: true is NON-NEGOTIABLE.
//
// Why? The backend routes live in web.php which runs the Laravel "web" middleware
// group. That group includes session management. Sanctum uses the "web" session
// guard as its FIRST auth mechanism. With withCredentials: false the browser
// sends no cookies → session is lost → all protected web.php routes return 401/403.
//
// The Bearer token below is the SECOND auth mechanism. Sanctum checks the
// Authorization header after the session guard. Having BOTH simultaneously means:
//   • web.php routes (session-based)    ✓ authenticated via cookie
//   • /api/* routes (token-based)       ✓ authenticated via Bearer token
// Nothing can break with this setup.
//
export const axiosClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true, // KEEP THIS TRUE — session cookies must flow
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
axiosClient.interceptors.request.use(
  (config) => {
    // 1. External / absolute URL: bypass the Next.js proxy baseURL
    //    /api/external/* is handled by a separate rewrite in next.config.js
    const isExternal = config.url?.startsWith('/api/external');
    const isAbsolute = config.url?.startsWith('http');
    if (isExternal || isAbsolute) {
      config.baseURL = '';
    }

    // 2. Inject Bearer token (if present)
    //    Always inject — logout needs the token to revoke it server-side.
    //    If there is no token yet (login / register), this block is skipped safely.
    if (typeof window !== 'undefined') {
      let token = null;
      if (sessionStorage.getItem('isImpersonated') === 'true') {
        token = sessionStorage.getItem('token');
        config.withCredentials = false; // Prevents sending admin session cookies that override Bearer token
      }
      if (!token) {
        token = localStorage.getItem('token') || sessionStorage.getItem('token');
      }
      if (token) {
        config.headers = config.headers ?? {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // 3. FormData upload — remove forced Content-Type so the browser sets
    //    multipart/form-data with the correct boundary automatically.
    //    Without this, file uploads and bulk Excel uploads break silently.
    if (config.data instanceof FormData) {
      if (config.headers) {
        if (typeof config.headers.delete === 'function') {
          config.headers.delete('content-type');
          config.headers.delete('Content-Type');
        } else {
          delete config.headers['Content-Type'];
          delete config.headers['content-type'];
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ──────────────────────────────────────────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error status is 401, do NOT clear localStorage, do NOT call any logout action,
    // and do NOT redirect to login. Simply return Promise.reject(error);.
    // The frontend MUST NOT aggressively log the user out when a dashboard API fails.
    if (error.response?.status === 401) {
      // Intentionally bypassed forced logout to prevent aggressive instant logout loop on dashboard API failures.
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    // Normalize error for Redux thunks / catch blocks in components
    if (error.response?.data) {
      error.message = error.response.data.message ?? error.message;
      error.errors  = error.response.data.errors;
    }

    return Promise.reject(error);
  }
);

// ─── Typed API Client Helper ───────────────────────────────────────────────────
// Thin typed wrapper that unwraps response.data so callers don't need to.
export const apiClient = {
  get: async <T>(endpoint: string, options?: object): Promise<T> => {
    const response = await axiosClient.get<T>(endpoint, options);
    return response.data;
  },

  post: async <T>(endpoint: string, data?: unknown, options?: object): Promise<T> => {
    const response = await axiosClient.post<T>(endpoint, data, options);
    return response.data;
  },

  put: async <T>(endpoint: string, data?: unknown, options?: object): Promise<T> => {
    const response = await axiosClient.put<T>(endpoint, data, options);
    return response.data;
  },

  patch: async <T>(endpoint: string, data?: unknown): Promise<T> => {
    const response = await axiosClient.patch<T>(endpoint, data);
    return response.data;
  },

  delete: async <T>(endpoint: string, data?: unknown): Promise<T> => {
    const response = await axiosClient.delete<T>(endpoint, { data });
    return response.data;
  },
};

// ─── Payload Sanitizer ─────────────────────────────────────────────────────────
// Strips null/undefined values and empty arrays before sending to the backend,
// preventing accidental field overwrites via partial updates.
export function cleanPayload(
  data: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  if (!data) return {};
  const clean: Record<string, unknown> = {};
  for (const key of Object.keys(data)) {
    const value = data[key];
    if (value === undefined || value === null) continue;
    if (typeof value === 'string') {
      clean[key] = value.trim();
    } else if (Array.isArray(value)) {
      if (value.length > 0) clean[key] = value;
    } else {
      clean[key] = value;
    }
  }
  return clean;
}
