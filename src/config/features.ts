/**
 * ─────────────────────────────────────────────────────────────────────────────
 * AUTOURS FEATURE FLAG SYSTEM
 * ─────────────────────────────────────────────────────────────────────────────
 * Set a flag to `true`  → feature is ENABLED  (visible & accessible)
 * Set a flag to `false` → feature is DISABLED (hidden & returns 404)
 *
 * Pages are NEVER deleted — only routing and navigation visibility are toggled.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const features = {

  // ── Admin Dashboard Modules ───────────────────────────────────────────────

  /** Supplier Pricing Intelligence page (/admin → supplier-intelligence tab) */
  supplierIntelligence: true,

  /** Bookings Calendar page (/admin → bookings-calendar tab) */
  bookingsCalendar: true,

  // ── Public Country Landing Pages ──────────────────────────────────────────

  /** Dynamic country pages (/countries/uae, /countries/egypt, etc.) */
  countryPages: true,

  // ── Global UI Features ────────────────────────────────────────────────────

  /** Contest promotional popup — shows on homepage only */
  contestPopup: false,

  /** Contest control page in admin dashboard */
  contestControl: true,

  /** Global login gate popup on homepage */
  loginGate: false,

} as const;

/** Helper: returns true only if the feature flag is enabled */
export const isEnabled = (flag: keyof typeof features): boolean => !!features[flag];
