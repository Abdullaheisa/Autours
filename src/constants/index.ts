export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
  USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK === "true" || true,
};

export const APP_CONFIG = {
  SITE_NAME: "Autours Dashboard",
  DEFAULT_CURRENCY: "USD",
};
