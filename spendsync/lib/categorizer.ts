// ── FILE: lib/categorizer.ts ──────────────────────────────────────────────────
// Pure TS — zero React/RN imports.

export type Category =
  | 'Entertainment'
  | 'Food'
  | 'Shopping'
  | 'Travel'
  | 'Productivity'
  | 'Cloud'
  | 'Professional'
  | 'Other';

const MERCHANT_MAP: Record<string, Category> = {
  // Entertainment
  netflix: 'Entertainment',
  spotify: 'Entertainment',
  hotstar: 'Entertainment',
  'disney+': 'Entertainment',
  youtube: 'Entertainment',
  'prime video': 'Entertainment',
  'amazon prime': 'Entertainment',
  'apple tv': 'Entertainment',
  jiocinema: 'Entertainment',
  sonyliv: 'Entertainment',
  zee5: 'Entertainment',
  mxplayer: 'Entertainment',

  // Food
  swiggy: 'Food',
  zomato: 'Food',
  starbucks: 'Food',
  mcdonalds: 'Food',
  dominos: 'Food',
  blinkit: 'Food',
  dunzo: 'Food',
  zepto: 'Food',
  instamart: 'Food',

  // Shopping
  amazon: 'Shopping',
  flipkart: 'Shopping',
  myntra: 'Shopping',
  ajio: 'Shopping',
  nykaa: 'Shopping',
  meesho: 'Shopping',

  // Travel
  uber: 'Travel',
  ola: 'Travel',
  irctc: 'Travel',
  makemytrip: 'Travel',
  goibibo: 'Travel',
  rapido: 'Travel',
  redbus: 'Travel',

  // Productivity
  zoom: 'Productivity',
  adobe: 'Productivity',
  canva: 'Productivity',
  notion: 'Productivity',
  slack: 'Productivity',
  figma: 'Productivity',
  microsoft: 'Productivity',
  office: 'Productivity',
  evernote: 'Productivity',

  // Cloud
  google: 'Cloud',
  dropbox: 'Cloud',
  icloud: 'Cloud',
  'google one': 'Cloud',

  // Professional
  linkedin: 'Professional',
  coursera: 'Professional',
  udemy: 'Professional',
};

/**
 * Fuzzy-match merchant name to a Category.
 * Lowercases merchant and checks if any key is a substring.
 * Falls back to 'Other'.
 */
export function categorize(merchant: string): Category {
  const lower = merchant.toLowerCase();
  for (const [key, cat] of Object.entries(MERCHANT_MAP)) {
    if (lower.includes(key)) {
      return cat;
    }
  }
  return 'Other';
}
