/** Format a number with K/M suffix */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

/** Format currency */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/**
 * Safely parse date string or Date object without timezone shift bugs for YYYY-MM-DD
 */
export function parseDateSafe(date: string | Date | null | undefined): Date | null {
  if (!date) return null;
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date;
  }
  if (typeof date === "string") {
    const clean = date.trim();
    if (!clean) return null;

    // Format YYYY-MM-DD or YYYY/MM/DD
    const ymdMatch = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10) - 1;
      const day = parseInt(ymdMatch[3], 10);
      return new Date(year, month, day);
    }

    // Format DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      return new Date(year, month, day);
    }

    const parsed = new Date(clean);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

/** Format date to readable string like "10 Oct 2026" or "1 Nov 2026" */
export function formatDate(date: string | Date | null | undefined, padDay: boolean = false): string {
  if (!date) return "";
  const d = parseDateSafe(date);
  if (!d) return String(date);
  const dayNum = d.getDate();
  const day = padDay ? String(dayNum).padStart(2, "0") : String(dayNum);
  const month = MONTH_NAMES[d.getMonth()] || d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/** Format date with time like "10 Oct 2026 10:00" or "1 Nov 2026 10:00" */
export function formatDateTime(date: string | Date | null | undefined, time?: string | null): string {
  if (!date) return "";
  const formatted = formatDate(date);
  if (!formatted) return "";
  return time ? `${formatted} ${time}` : formatted;
}

/** Truncate text */
export function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

/** Capitalize first letter */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Generate slug from title */
export function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
