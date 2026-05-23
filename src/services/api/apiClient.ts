import { API_CONFIG } from "@/constants";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const isProxied = endpoint.startsWith('/api/external');
  const isAbsolute = endpoint.startsWith('http');
  const url = isAbsolute || isProxied ? endpoint : `${API_CONFIG.BASE_URL}${endpoint}`;
  
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(typeof window !== 'undefined' && localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
        ...options?.headers 
      },
      ...options,
    });
  } catch (error) {
    console.error("Fetch failed:", error);
    throw new Error("Backend server is unreachable. Please make sure it is running on " + API_CONFIG.BASE_URL);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "An error occurred" }));
    const err: any = new Error(errorData.message || `HTTP ${response.status}`);
    err.errors = errorData.errors;
    throw err;
  }
  
  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: "PUT", body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
  patch: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: "PATCH", body: JSON.stringify(data) }),
};

export function cleanPayload(data: any) {
  if (!data) return {};
  const clean: any = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      if (typeof data[key] === 'string') {
        clean[key] = data[key].trim();
      } else if (Array.isArray(data[key])) {
        if (data[key].length > 0) clean[key] = data[key];
      } else {
        clean[key] = data[key];
      }
    }
  });
  return clean;
}
