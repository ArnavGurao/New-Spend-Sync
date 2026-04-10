// ── FILE: constants/theme.ts ──────────────────────────────────────────────────

export const COLORS = {
  // ── BACKGROUNDS ──
  surface: '#0e0e0e',
  surfaceContainerLowest: '#000000',
  surfaceContainerLow: '#131313',
  surfaceContainer: '#191a1a',
  surfaceContainerHigh: '#1f2020',
  surfaceContainerHighest: '#252626',
  surfaceBright: '#2c2c2c',

  // ── TEXT ──
  onSurface: '#e7e5e4',
  onSurfaceVariant: '#acabaa',
  outline: '#767575',
  outlineVariant: '#484848',

  // ── BRAND ──
  primary: '#c6c6c7',
  primaryDim: '#b8b9b9',
  primaryContainer: '#454747',
  onPrimary: '#3f4041',
  secondary: '#ffbf00',
  secondaryDim: '#eeb200',
  secondaryContainer: '#4e3800',
  onSecondary: '#563e00',
  tertiary: '#ff716b',
  error: '#ee7d77',
  brandTeal: '#00C9A7',

  // ── GLASSMORPHISM ──
  glassWhite: 'rgba(255,255,255,0.04)',
  glassBorder: 'rgba(255,255,255,0.08)',
  glassHighlight: 'rgba(255,255,255,0.12)',

  // ── CHART ──
  chart1: '#FF6D00',
  chart2: '#00BFA5',
  chart3: '#304FFE',
  chart4: '#F50057',
  chart5: '#FFD600',
} as const;

export type ColorKey = keyof typeof COLORS;
