// ── FILE: lib/formatters.ts ───────────────────────────────────────────────────
// Pure TS — zero React/RN imports. All formatting utilities.

/**
 * Format a number as Indian Rupee currency string.
 * e.g. 1234.56 → "₹1,234.56"
 */
export function fmt(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format a date string or Date into DD-Mon-YYYY format.
 * e.g. new Date("2026-03-28") → "28-Mar-2026"
 */
export function fmtDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(d.getDate()).padStart(2, '0');
  const mon = months[d.getMonth()];
  const yr  = d.getFullYear();
  return `${day}-${mon}-${yr}`;
}

/**
 * Format a billing cycle label.
 * e.g. 'monthly' → 'Monthly', 'quarterly' → 'Quarterly'
 */
export function fmtCycle(cycle: string | null): string {
  if (!cycle) return 'One-time';
  return cycle.charAt(0).toUpperCase() + cycle.slice(1);
}

/**
 * Get the current greeting based on the time of day.
 */
export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/**
 * Get greeting prefix string.
 */
export function getGreeting(): string {
  return `Good ${getTimeOfDay()}`;
}

/**
 * Calculate yearly cost from monthly amount and cycle.
 */
export function yearlyAmount(amount: number, cycle: string | null): number {
  if (cycle === 'monthly') return amount * 12;
  if (cycle === 'quarterly') return amount * 4;
  if (cycle === 'yearly') return amount;
  return amount;
}

/**
 * Parse a raw Indian currency string to a number.
 * Handles: "INR 1,20,000.00", "Rs.4,19,351", "Rs 649/-", "₹649"
 */
export function parseIndianCurrency(raw: string): number | null {
  // Strip currency prefixes and suffixes
  const cleaned = raw
    .replace(/INR|Rs\.?|₹/gi, '')
    .replace(/\/-$/, '')
    .replace(/,/g, '')
    .trim();
  const val = parseFloat(cleaned);
  return isNaN(val) ? null : val;
}
