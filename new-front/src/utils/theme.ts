/**
 * Global Theme Configuration
 * This file serves as a centralized source of truth for the application's visual identity.
 * Values here are mirrored in globals.css via CSS variables.
 */

export const theme = {
  colors: {
    primary: {
      main: "#f9d602",
      hover: "#e5c502",
      light: "#fffce6",
      text: "#806e01",
    },
    secondary: {
      main: "#111827",
      hover: "#1f2937",
      text: "#f9fafb",
    },
    status: {
      success: "#10b981",
      warning: "#f59e0b",
      danger: "#ef4444",
      info: "#3b82f6",
      scheduled: "#8b5cf6",
    },
    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      500: "#6b7280",
      900: "#111827",
    }
  },
  fonts: {
    primary: "'Manrope', Helvetica, Arial, sans-serif",
    secondary: "'Outfit', Helvetica, Arial, sans-serif",
  },
  borderRadius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "2rem",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    primary: "0 10px 15px -3px rgba(249, 214, 2, 0.2)",
  }
};

export default theme;
