import type { Config } from "tailwindcss";
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Flat mapping to ensure bg-primary-600 works perfectly
        "primary": "var(--primary)",
        "primary-50": "var(--primary-50)",
        "primary-100": "var(--primary-100)",
        "primary-200": "var(--primary-200)",
        "primary-300": "var(--primary-300)",
        "primary-400": "var(--primary-400)",
        "primary-500": "var(--primary-500)",
        "primary-600": "var(--primary-600)",
        "primary-700": "var(--primary-700)",
        "primary-800": "var(--primary-800)",
        "primary-900": "var(--primary-900)",
        "secondary": "var(--secondary-color)",
      },
      screens: {
        'lg': '1080px',
        'xl': '1150px',
        '2xl': '1280px',
        '3xl': '1400px',
      },
      fontFamily: {
        sans: ["TajawalNumbers", "-apple-system", "system-ui", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "var(--font-tajawal)", "sans-serif"],
        title: ["TajawalNumbers", "-apple-system", "system-ui", "BlinkMacSystemFont", "Segoe UI", "Helvetica Neue", "Arial", "var(--font-tajawal)", "sans-serif"],
        body: ["TajawalNumbers", "-apple-system", "system-ui", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "var(--font-tajawal)", "sans-serif"],
        arabic: ["var(--font-tajawal)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [
    typography,
  ],
};

export default config;