// ── FILE: constants/gradients.ts ──────────────────────────────────────────────

// Maps bank names to Tailwind gradient class token arrays (NativeWind compatible)
// Used by CreditCard component to determine card background color
export const BANK_GRADIENTS: Record<string, string[]> = {
  'HDFC Bank': ['from-[#8b1d1d]', 'via-[#e11d48]', 'to-[#4c0519]'],
  'ICICI Bank': ['from-[#E65C00]', 'to-[#993D00]'],
  'State Bank of India': ['from-[#003366]', 'to-[#001A33]'],
  'Axis Bank': ['from-[#4A0E1C]', 'to-[#2D0911]'],
  'Kotak Mahindra Bank': ['from-[#1a237e]', 'to-[#0d1245]'],
  'Yes Bank': ['from-[#1b5e20]', 'to-[#0a2e0d]'],
  'IndusInd Bank': ['from-[#4a148c]', 'to-[#2a0a52]'],
};

// Raw hex stop arrays for use with expo-linear-gradient (Reanimated-driven cards)
export const BANK_GRADIENT_COLORS: Record<string, string[]> = {
  'HDFC Bank': ['#8b1d1d', '#e11d48', '#4c0519'],
  'ICICI Bank': ['#E65C00', '#993D00'],
  'State Bank of India': ['#003366', '#001A33'],
  'Axis Bank': ['#4A0E1C', '#2D0911'],
  'Kotak Mahindra Bank': ['#1a237e', '#0d1245'],
  'Yes Bank': ['#1b5e20', '#0a2e0d'],
  'IndusInd Bank': ['#4a148c', '#2a0a52'],
};

export const DEFAULT_GRADIENT_COLORS: string[] = ['#252626', '#131313'];

export function getGradientColors(bank: string): string[] {
  return BANK_GRADIENT_COLORS[bank] ?? DEFAULT_GRADIENT_COLORS;
}
