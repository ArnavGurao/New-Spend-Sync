# SPENDSYNC — Master Build Brief for Claude Opus 4.6
> Read this entire file before writing a single line of code. This is the canonical source of truth.

---

## WHO YOU ARE & WHAT YOU ARE BUILDING

You are an expert React Native (Expo) engineer. You are migrating a working HTML/JS prototype called **SpendSync** into a production-grade React Native app using Expo SDK 51. The prototype is a dark-themed, Indian credit card and subscription manager with SMS-based transaction detection.

Your job is to faithfully port every screen and every interaction from the prototype while applying the UI enhancements described in Part 4 of this brief.

---

## ANSWERED CONFIGURATION QUESTIONS

| Question | Answer | Impact |
|---|---|---|
| Backend / persistence | **SQLite via `expo-sqlite` + Drizzle ORM** | All store persistence goes through Drizzle, not AsyncStorage |
| Target device | **Android Emulator** | `react-native-get-sms-android` does NOT work on emulators. Use a `MockSMSService` that replays the hardcoded `smsQueue` from the prototype. The parser itself stays real and pure. |
| Styling system | **NativeWind v4** | All RN components use `className` props. Tailwind classes from the prototype map directly. StyleSheet only for transforms/animations that NativeWind cannot express. |

> **NativeWind v4 clarification:** Yes — because NativeWind v4 gives React Native components a `className` prop, all the Tailwind utility classes from the HTML prototype (colors, spacing, typography, borders) migrate almost 1:1. You do not need to rewrite styles from scratch. You will translate `div` → `View`, `p`/`span` → `Text`, and keep the class strings. Animations (reanimated) and transforms still require inline style objects.

---

## PART 0 — PROTOTYPE STATE MODEL (GROUND TRUTH)

Every data structure in the app derives from this. Do not invent new fields.

```typescript
// ─── CARDS ───────────────────────────────────────────────────────────────────
type BankName =
  | 'HDFC Bank' | 'ICICI Bank' | 'State Bank of India'
  | 'Axis Bank' | 'Kotak Mahindra Bank' | 'Yes Bank'
  | 'IndusInd Bank' | string;

type Network = 'Visa' | 'Mastercard' | 'RuPay';

interface Card {
  id: string;
  bank: BankName;
  variant: string;       // e.g. "HDFC INFINIA", "ICICI EMERALDE"
  last4: string;         // exactly 4 digits
  expiry: string;        // "MM/YY"
  network: Network;
  gradient: string[];    // Tailwind gradient class tokens e.g. ['from-[#8b1d1d]','via-[#e11d48]','to-[#4c0519]']
  monthlySpend: number;
}

// ─── SUBSCRIPTIONS ───────────────────────────────────────────────────────────
type Category =
  | 'Entertainment' | 'Food' | 'Shopping'
  | 'Productivity' | 'Cloud' | 'Professional' | 'Other';

type SubscriptionStatus = 'urgent' | 'warning' | 'trial-urgent' | 'safe';
type BillingType = 'recurring' | 'trial';
type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

interface Subscription {
  id: string;
  name: string;
  cardId: string;
  amount: number;
  billingType: BillingType;
  cycle: BillingCycle | null;
  renewalDays: number;
  trialEndsAmount?: number;
  category: Category;
  icon: string;          // Material Symbols icon name string
  status: SubscriptionStatus;
}

// ─── PARSED SMS ───────────────────────────────────────────────────────────────
interface ParsedSMS {
  id: string;
  raw: string;
  merchant: string;
  amount: number;
  cardLastFour: string;
  cardId: string;
  bank: string;
  date: string;
}

// ─── SMS FLOW STATE ───────────────────────────────────────────────────────────
interface SMSFlowState {
  pendingSMS: ParsedSMS | null;
  step: 1 | 2;
  billingType: BillingType | null;
  cycle: BillingCycle | null;
  trialEndDate: string | null;
}
```

### Seed Data (pre-populate on first install)

**Cards:**
```typescript
const SEED_CARDS: Card[] = [
  { id: 'hdfc',  bank: 'HDFC Bank',            variant: 'HDFC INFINIA',       last4: '4521', expiry: '08/27', network: 'Visa',       gradient: ['from-[#8b1d1d]','via-[#e11d48]','to-[#4c0519]'], monthlySpend: 976  },
  { id: 'icici', bank: 'ICICI Bank',            variant: 'ICICI EMERALDE',     last4: '8834', expiry: '03/26', network: 'Mastercard', gradient: ['from-[#E65C00]','to-[#993D00]'],                  monthlySpend: 637  },
  { id: 'sbi',   bank: 'State Bank of India',   variant: 'SBI AURUM',          last4: '2210', expiry: '11/28', network: 'RuPay',      gradient: ['from-[#003366]','to-[#001A33]'],                  monthlySpend: 629  },
  { id: 'axis',  bank: 'Axis Bank',             variant: 'AXIS BANK MAGNUS',   last4: '6603', expiry: '06/27', network: 'Visa',       gradient: ['from-[#4A0E1C]','to-[#2D0911]'],                  monthlySpend: 1384 },
];
```

**Subscriptions:** 12 subscriptions as defined in prototype (Netflix, Spotify, Amazon Prime, YouTube Premium, Disney+ Hotstar, Zomato Pro, Canva Pro, Adobe Creative Cloud, Google One, Zoom Pro, Swiggy One, LinkedIn Premium) — distributed across the 4 cards.

**SMS Queue (mock — for emulator):**
```typescript
const MOCK_SMS_QUEUE: ParsedSMS[] = [
  { id: 'sms1', raw: 'Your HDFC Bank Credit Card XX4521 has been debited for INR 649.00 at NETFLIX on 28-Mar-2026...', merchant: 'Netflix',        amount: 649, cardLastFour: '4521', cardId: 'hdfc',  bank: 'HDFC Bank',           date: '28-Mar-2026' },
  { id: 'sms2', raw: 'Your ICICI Bank Credit Card XX8834 has been debited for INR 299.00 at HOTSTAR on 28-Mar-2026...', merchant: 'Disney+ Hotstar', amount: 299, cardLastFour: '8834', cardId: 'icici', bank: 'ICICI Bank',          date: '28-Mar-2026' },
  { id: 'sms3', raw: 'Your SBI Credit Card XX2210 has been debited for INR 499.00 at CANVA on 28-Mar-2026...',          merchant: 'Canva Pro',       amount: 499, cardLastFour: '2210', cardId: 'sbi',   bank: 'State Bank of India', date: '28-Mar-2026' },
];
```

---

## PART 1 — PROJECT SCAFFOLD

```
spendsync/
├── app.json
├── tailwind.config.js          ← NativeWind v4 config
├── babel.config.js
├── drizzle.config.ts
│
├── app/
│   ├── _layout.tsx             ← Root: fonts, StatusBar, SQLite init, safe area
│   ├── (tabs)/
│   │   ├── _layout.tsx         ← Custom tab bar (NOT default Expo tabs)
│   │   ├── index.tsx           ← Dashboard
│   │   ├── analytics.tsx
│   │   └── alerts.tsx
│   ├── subscriptions/
│   │   └── [cardId].tsx        ← Card detail
│   ├── add-card.tsx            ← Modal (stack push)
│   ├── advisor.tsx
│   └── dna.tsx
│
├── components/
│   ├── cards/
│   │   ├── CreditCard.tsx      ← 3D flip, sizes: hero | stacked | thumbnail
│   │   ├── StackedCardDeck.tsx ← Physics fan-out animation
│   │   └── HeroCard.tsx        ← Full-width card for detail screen
│   ├── subscriptions/
│   │   ├── SubscriptionRow.tsx ← Swipeable row
│   │   └── StatusBadge.tsx
│   ├── sms/
│   │   ├── SMSBottomSheet.tsx  ← Modal + PanResponder sheet
│   │   └── SMSStepFlow.tsx     ← Step 1 + Step 2a/2b content
│   └── ui/
│       ├── Toast.tsx
│       ├── CountUp.tsx         ← Reanimated number animation
│       ├── SpendRing.tsx       ← react-native-svg animated donut
│       ├── BottomSheet.tsx     ← Generic reusable sheet
│       └── TabBar.tsx          ← Custom bottom nav
│
├── db/
│   ├── client.ts               ← expo-sqlite + drizzle instance
│   ├── schema.ts               ← Drizzle table definitions
│   └── migrations/             ← Auto-generated by drizzle-kit
│
├── lib/
│   ├── smsParser.ts            ← Pure TS — zero RN imports
│   ├── smsSync.ts              ← Platform-aware sync (mock on emulator)
│   ├── categorizer.ts          ← Keyword → category map
│   └── formatters.ts           ← fmt(), fmtDate(), fmtCycle()
│
├── store/
│   └── useStore.ts             ← Zustand (UI state only — data comes from DB)
│
└── constants/
    ├── theme.ts                ← Color tokens
    └── gradients.ts            ← Bank → gradient mapping
```

---

## PART 2 — DATABASE LAYER (SQLite + Drizzle)

### `db/schema.ts`

```typescript
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const cards = sqliteTable('cards', {
  id:           text('id').primaryKey(),
  bank:         text('bank').notNull(),
  variant:      text('variant').notNull(),
  last4:        text('last4').notNull(),
  expiry:       text('expiry').notNull(),
  network:      text('network').notNull(),
  gradient:     text('gradient').notNull(),   // JSON.stringify(string[])
  monthlySpend: real('monthly_spend').default(0),
  createdAt:    integer('created_at').notNull(),
});

export const subscriptions = sqliteTable('subscriptions', {
  id:              text('id').primaryKey(),
  name:            text('name').notNull(),
  cardId:          text('card_id').notNull(),
  amount:          real('amount').notNull(),
  billingType:     text('billing_type').notNull(),
  cycle:           text('cycle'),
  renewalDays:     integer('renewal_days').notNull(),
  trialEndsAmount: real('trial_ends_amount'),
  category:        text('category').notNull(),
  icon:            text('icon').notNull(),
  status:          text('status').notNull(),
  createdAt:       integer('created_at').notNull(),
});

export const processedSMS = sqliteTable('processed_sms', {
  id:          text('id').primaryKey(),
  processedAt: integer('processed_at').notNull(),
});

export const syncLog = sqliteTable('sync_log', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  syncedAt:  integer('synced_at').notNull(),
  fetched:   integer('fetched').default(0),
  parsed:    integer('parsed').default(0),
  newCount:  integer('new_count').default(0),
});
```

### `db/client.ts`

```typescript
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';

const sqlite = SQLite.openDatabaseSync('spendsync.db');
export const db = drizzle(sqlite, { schema });

export async function initDB() {
  // Run migrations on app start
  await sqlite.execAsync(`PRAGMA journal_mode = WAL;`);
  // Drizzle migrations run here via migrate()
}

export async function seedIfEmpty() {
  const existing = await db.select().from(schema.cards).limit(1);
  if (existing.length === 0) {
    // Insert SEED_CARDS and SEED_SUBSCRIPTIONS
  }
}
```

---

## PART 3 — SMS PARSING ENGINE

### `lib/smsParser.ts` — DELIVER FIRST. Pure TypeScript. No React Native imports. 100% unit-testable.

```typescript
export interface ParsedTransaction {
  merchant: string;
  amount: number;
  type: 'debit' | 'credit';
  cardLastFour: string;
  bank: string;
  date: Date;
  category: Category;
  rawSMS: string;
  confidence: 'high' | 'medium' | 'low';
}

export function parseSMS(raw: string, receivedAt: Date): ParsedTransaction | null
```

**Regex patterns required — one per bank, tested against these exact SMS formats:**

| Bank | SMS format |
|------|-----------|
| HDFC | `Your HDFC Bank Credit Card XX{last4} has been debited for INR {amount} at {MERCHANT} on {date}` |
| ICICI | `Your ICICI Bank Credit Card XX{last4} has been debited for INR {amount} at {MERCHANT} on {date}` |
| SBI | `Your SBI Credit Card XX{last4} has been debited for INR {amount} at {MERCHANT} on {date}` |
| Axis | `Axis Bank Credit Card ending {last4}... debited by Rs.{amount} at {MERCHANT}` |
| Kotak | `Kotak Credit Card XX{last4} used for Rs {amount} at {MERCHANT}` |
| UPI catch-all | `/(?:debited|deducted).*?(?:INR|Rs\.?|₹)\s*([0-9,]+(?:\.[0-9]{2})?)/i` |
| Credit | `credited` / `received` / `refund` → type = 'credit' |

**Amount parsing — handle ALL these formats:**
- `INR 1,20,000.00` (Indian lakh system)
- `Rs.4,19,351` (no space)
- `Rs 649/-` (slash suffix)
- `₹649` (rupee prefix)

Strip all commas before `parseFloat()`. Never use `parseInt` — decimals matter.

**Return `null` immediately for:**
- Contains: `OTP`, `one time password`, `password`
- Contains: `low balance`, `minimum balance`
- Contains: `reward point`, `cashback credited to your reward`
- Contains: `payment due`, `bill generated`, `statement`
- Contains: promotional keywords: `offer`, `discount`, `% off`, `deal`
- No amount found after all patterns exhausted

---

### `lib/categorizer.ts`

```typescript
const MERCHANT_MAP: Record<string, Category> = {
  // Entertainment
  netflix: 'Entertainment', spotify: 'Entertainment', hotstar: 'Entertainment',
  'youtube': 'Entertainment', 'prime video': 'Entertainment', 'apple tv': 'Entertainment',
  // Food
  swiggy: 'Food', zomato: 'Food', starbucks: 'Food', mcdonalds: 'Food',
  dominos: 'Food', 'blinkit': 'Food',
  // Shopping
  amazon: 'Shopping', flipkart: 'Shopping', myntra: 'Shopping', ajio: 'Shopping',
  // Travel
  uber: 'Travel', ola: 'Travel', irctc: 'Travel', makemytrip: 'Travel', goibibo: 'Travel',
  // Productivity
  zoom: 'Productivity', adobe: 'Productivity', canva: 'Productivity',
  notion: 'Productivity', slack: 'Productivity', figma: 'Productivity',
  // Cloud
  google: 'Cloud', dropbox: 'Cloud', icloud: 'Cloud',
  // Professional
  linkedin: 'Professional',
};

// Fuzzy match: lowercase(merchant).includes(key) → category
// Fallback: 'Other'
export function categorize(merchant: string): Category
```

---

### `lib/smsSync.ts` — Platform-aware. Emulator uses MockSMSService.

```typescript
import { Platform } from 'react-native';

// On EMULATOR / iOS: replay MOCK_SMS_QUEUE
// On REAL ANDROID: use react-native-get-sms-android with READ_SMS permission

export interface SyncResult {
  fetched: number;
  parsed: number;
  duplicates: number;
  newTransactions: ParsedTransaction[];
}

export async function requestSMSPermission(): Promise<boolean>
// Android real device: PermissionsAndroid.request('android.permission.READ_SMS')
// Emulator / iOS: return true (mock always available)

export async function syncSMSInbox(lastSyncTimestamp: number): Promise<SyncResult>
// 1. Platform.OS !== 'android' OR __DEV__ + emulator → MockSMSService.getNext()
// 2. Real Android: SmsAndroid.list(JSON.stringify({minDate: lastSyncTimestamp, box: 'inbox'}))
// 3. Filter by BANK_SENDERS
// 4. parseSMS() each one
// 5. Dedup via processedSMS table in SQLite
// 6. Return SyncResult

const BANK_SENDERS = [
  'HDFCBK', 'HDFCCC', 'ICICIB', 'ICICICC',
  'SBIINB', 'SBICRD', 'AXISBK', 'AXISCC',
  'KOTAKB', 'KOTAKC', 'YESBNK', 'INDBNK',
];

// MockSMSService: cycles through MOCK_SMS_QUEUE, one per call
// Simulates the "Simulate Incoming SMS" button from the prototype
class MockSMSService {
  private static queue = [...MOCK_SMS_QUEUE];
  static getNext(): ParsedSMS | null
  static reset(): void
}
```

---

## PART 4 — UI REDESIGN DIRECTIVES

### 4.1 Color System

```typescript
// constants/theme.ts — extend the exact prototype palette, add new tokens
export const COLORS = {
  // ── BACKGROUNDS (from prototype) ──
  surface:                  '#0e0e0e',
  surfaceContainerLowest:   '#000000',
  surfaceContainerLow:      '#131313',
  surfaceContainer:         '#191a1a',
  surfaceContainerHigh:     '#1f2020',
  surfaceContainerHighest:  '#252626',
  surfaceBright:            '#2c2c2c',

  // ── TEXT (from prototype) ──
  onSurface:          '#e7e5e4',
  onSurfaceVariant:   '#acabaa',
  outline:            '#767575',
  outlineVariant:     '#484848',

  // ── BRAND (from prototype) ──
  primary:            '#c6c6c7',
  primaryDim:         '#b8b9b9',
  primaryContainer:   '#454747',
  onPrimary:          '#3f4041',
  secondary:          '#ffbf00',
  secondaryDim:       '#eeb200',
  secondaryContainer: '#4e3800',
  tertiary:           '#ff716b',
  error:              '#ee7d77',
  brandTeal:          '#00C9A7',

  // ── NEW: Glassmorphism ──
  glassWhite:     'rgba(255,255,255,0.04)',
  glassBorder:    'rgba(255,255,255,0.08)',
  glassHighlight: 'rgba(255,255,255,0.12)',

  // ── NEW: Chart ──
  chart1: '#FF6D00',
  chart2: '#00BFA5',
  chart3: '#304FFE',
  chart4: '#F50057',
  chart5: '#FFD600',
} as const;
```

### 4.2 NativeWind v4 Setup

**`tailwind.config.js`:**
```javascript
const { hairlineWidth } = require('nativewind/theme');

module.exports = {
  content: ['./app/**/*.{tsx,ts}', './components/**/*.{tsx,ts}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        headline: ['Manrope_700Bold'],
        body:     ['Inter_400Regular'],
        label:    ['Inter_500Medium'],
      },
      colors: {
        // paste entire COLORS object here as Tailwind tokens
        primary: '#c6c6c7',
        'primary-dim': '#b8b9b9',
        'primary-container': '#454747',
        'on-primary': '#3f4041',
        secondary: '#ffbf00',
        'secondary-dim': '#eeb200',
        'secondary-container': '#4e3800',
        'on-secondary': '#563e00',
        tertiary: '#ff716b',
        error: '#ee7d77',
        'on-surface': '#e7e5e4',
        'on-surface-variant': '#acabaa',
        surface: '#0e0e0e',
        'surface-container-lowest': '#000000',
        'surface-container-low': '#131313',
        'surface-container': '#191a1a',
        'surface-container-high': '#1f2020',
        'surface-container-highest': '#252626',
        'surface-bright': '#2c2c2c',
        outline: '#767575',
        'outline-variant': '#484848',
        'brand-teal': '#00C9A7',
        'chart-1': '#FF6D00',
        'chart-2': '#00BFA5',
        'chart-3': '#304FFE',
        'chart-4': '#F50057',
        'chart-5': '#FFD600',
      },
    },
  },
};
```

**`babel.config.js`:**
```javascript
module.exports = {
  presets: [
    ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    'nativewind/babel',
  ],
};
```

### 4.3 Key Component Specs

#### `CreditCard.tsx` — 3D Flip

```typescript
import Animated, {
  useSharedValue, withSpring, useAnimatedStyle, interpolate
} from 'react-native-reanimated';

// rotateY: 0 → 180 on tap
// Front: gradient bg, bank name, variant, XXXX XXXX XXXX {last4}, network logo text
// Back: subscription count + total monthly spend
// Size variants:
//   hero:      width=100%, height=192px
//   stacked:   width=100%, height=224px (used in deck)
//   thumbnail: width=120px, height=76px

interface CreditCardProps {
  card: Card;
  subscriptions: Subscription[];
  onPress?: () => void;
  size?: 'hero' | 'stacked' | 'thumbnail';
  flippable?: boolean;   // default true for hero, false for stacked
}
```

Haptic on tap: `expo-haptics` → `Haptics.impactAsync(ImpactFeedbackStyle.Medium)`

#### `StackedCardDeck.tsx` — Stagger Spring

```typescript
// Cards render in reverse order (bottom card first)
// Each card enters with: translateY from +40 → 0, spring({ damping: 15, stiffness: 120 })
// Stagger: 80ms delay per card index
// Stack height = 160 + (cards.length - 1) * 56
// On card press: translateY(-14), scale(1.02), zIndex raise
// Navigate to /subscriptions/[cardId] on press
```

#### `SpendRing.tsx` — SVG Animated Donut

```typescript
import { Circle, Svg } from 'react-native-svg';
import Animated, { useSharedValue, withTiming, Easing } from 'react-native-reanimated';

// r=40, circumference=251.2
// Each segment: strokeDasharray=251.2, strokeDashoffset animated from 251.2 → calculated offset
// Animation: duration 1200ms, Easing.out(Easing.cubic), stagger 150ms per segment
// Center: CountUp number + label text

interface SpendRingProps {
  segments: { value: number; color: string; label: string }[];
  size?: number;        // default 240
  strokeWidth?: number; // default 8
  centerLabel: string;
  centerValue: number;
}
```

#### `CountUp.tsx` — Reanimated Number

```typescript
// useSharedValue(0) → withTiming(target, { duration: 1500, easing: Easing.out(Easing.cubic) })
// useDerivedValue → Math.round(sv.value).toLocaleString('en-IN')
// Render via createAnimatedComponent(Text)
// Prefix: optional string (e.g. '₹')

interface CountUpProps {
  target: number;
  prefix?: string;
  className?: string;  // NativeWind className
  duration?: number;
}
```

#### `BottomSheet.tsx` — Custom (no @gorhom)

```typescript
// Why no @gorhom: conflicts with Expo Go managed workflow
// Implementation:
//   Modal (transparent) + Animated.Value translateY
//   PanResponder for drag-to-dismiss
//   Snap points: ['75%'] single snap
//   Backdrop: View with bg black/60, onPress → dismiss
//   Handle: 32×4px pill, centered, 12px from top
//   Animation in: spring({ damping: 20, stiffness: 300 })
//   Animation out: timing({ duration: 280 })

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapHeight?: string; // default '75%'
}
```

#### `SMSBottomSheet.tsx` — Exact 2-Step Flow From Prototype

**Step 1:**
- Label: "SpendSync Detected a Charge" (uppercase, tracking)
- Raw SMS box: monospace font, surfaceContainerLowest bg, outline-variant border
- Parsed fields grid: merchant / amount / card / date — each with green check icon + "Auto-detected" label
- Two selector cards: "Recurring Subscription" (repeat icon) vs "Free Trial" (timer icon)
- Selected state: primary border + primary/10 bg + primary icon tint
- "Next" button appears only after selection, full-width, gradient

**Step 2a — Recurring:**
- Back button (chevron_left) + step dots (2 dots, second active)
- Three cycle pills: Monthly / Quarterly / Yearly (full-width, show sub-label with cost)
- "Done — Track This Subscription" button after cycle selection

**Step 2b — Trial:**
- Back button + step dots
- DateTimePicker (expo) or text input for trial end date
- Warning banner: secondary/10 bg, secondary border, warning icon, "SpendSync will alert you 3 days before..."
- "Done — Track Trial" button

**Completion:**
1. Build Subscription object from flow state
2. Insert into SQLite via Drizzle
3. Update Zustand optimistically
4. Shift mock queue (or mark real SMS processed)
5. Close sheet (spring out)
6. `router.replace('/')` after 500ms
7. Show success Toast

---

## PART 5 — SCREEN SPECIFICATIONS

### Dashboard (`app/(tabs)/index.tsx`)

**Exact prototype elements, enhanced:**
- Greeting: `Good ${getTimeOfDay()}, Rahul` — morning before 12, afternoon 12-17, evening 17+
- Hero spend number: `CountUp` component, target = totalMonthly() from DB
- Yearly sub-label: below hero number, surfaceContainerHighest/50 pill
- "Your Wallet" section: `StackedCardDeck` with all cards
- Optimization banner: pulse animation on `auto_awesome` icon (reanimated withRepeat)
- Quick action grid: Card Advisor | Your DNA (2 columns)
- **"Simulate Incoming SMS" button**: calls `MockSMSService.getNext()` → triggers toast → opens SMSBottomSheet

**New enhancements vs prototype:**
- LinearGradient header halo (react-native-linear-gradient), top of screen, primary/3 → transparent, height 120px
- `useSafeAreaInsets().top` padding applied correctly
- FlatList for subscriptions (not map → ScrollView) to avoid nesting scroll

---

### Card Detail (`app/subscriptions/[cardId].tsx`)

- `HeroCard` at top (full-width, 3D flippable)
- `SubscriptionRow` list — swipe-left reveals red "Cancel" action (react-native-gesture-handler Swipeable)
- Floating bar: BlurView (`expo-blur` intensity=60) + amount + Auto-Pay button
- Filter: show only subs for this cardId (from DB query)

---

### Add Card (`app/add-card.tsx`)

- Stack modal (from tab bar "+" or navigate)
- Live card preview updates on every keystroke (same logic as prototype)
- Bank picker: custom modal with colored bank rows
- Expiry auto-format: `handleExpiry()` — strip non-digits, insert `/` after index 2
- Network toggle: 3 pills Visa / Mastercard / RuPay
- On submit: validate → INSERT to SQLite → update Zustand → router.back() → success toast

---

### Analytics (`app/(tabs)/analytics.tsx`)

- Month picker: horizontal FlatList of months, snap-to-center
- `SpendRing` animated donut (replace static SVG)
- `react-native-gifted-charts` BarChart for weekly distribution (lighter than Victory)
- Category breakdown bars: animated width on mount (reanimated)
- Recent transactions list from DB

---

### Alerts (`app/(tabs)/alerts.tsx`)

- Filter tabs: All / Urgent / Trials — animated underline indicator (LayoutAnimation or reanimated)
- Subscription rows sorted by `renewalDays` ASC
- Status left-border color: urgent=error, warning=secondary, trial-urgent=primary, safe=outline-variant
- SpendSync Intelligence banner at top (exact from prototype)
- Empty placeholder at bottom

---

### Advisor (`app/advisor.tsx`)

- Search bar (TextInput with search icon)
- Category filter pills: horizontal ScrollView (All Recommendations / Dining / OTT / Fuel / Travel)
- Smart Pick horizontal scroll: 3 cards (HDFC Regalia, HDFC Regalia Dining, ICICI Amazon Pay)
- Main card list: HDFC Regalia full detail (reward table + analytics + lounge + milestone) + ICICI Amazon Pay full detail + 2 collapsed placeholder cards
- All static data — no DB dependency for this screen

---

### DNA (`app/dna.tsx`)

- Hero persona card: "The Creator" — 94% match, animated pulse on teal dot
- Stat pills: horizontal ScrollView (9 active subs / ₹3,347/month / 4 cards / Creator cluster top 12%)
- Peer insights grid: 3 cards (Adobe CC / Notion / LinkedIn) with brandTeal progress bars
- Life-stage alert: secondary/10 bg section with transition tags
- DNA timeline: 3 nodes (Student → Young Professional → Creator) with connecting line

---

## PART 6 — STORE (Zustand — UI state only)

Data lives in SQLite. Zustand manages ephemeral UI state and caches the current query results.

```typescript
// store/useStore.ts
import { create } from 'zustand';

interface AppStore {
  // Cached DB results (refreshed after mutations)
  cards: Card[];
  subscriptions: Subscription[];

  // UI state
  selectedCardId: string | null;
  alertFilter: 'all' | 'urgent' | 'trials';
  smsFlow: SMSFlowState;
  mockSMSQueue: ParsedSMS[];  // cycles for emulator

  // Actions
  setCards: (cards: Card[]) => void;
  setSubscriptions: (subs: Subscription[]) => void;
  selectCard: (id: string | null) => void;
  setAlertFilter: (f: 'all' | 'urgent' | 'trials') => void;
  setSMSFlow: (patch: Partial<SMSFlowState>) => void;
  resetSMSFlow: () => void;
  shiftMockSMSQueue: () => void;

  // Computed
  totalMonthly: () => number;
  subsForCard: (cardId: string) => Subscription[];
  urgentCount: () => number;
}
```

**No persistence middleware** — SQLite is the persistence layer. Zustand is reset on app restart and rehydrated from DB in `app/_layout.tsx` via `useEffect`.

---

## PART 7 — NAVIGATION (`app/(tabs)/_layout.tsx`)

Build a **fully custom** tab bar component. Do NOT use the default Expo Tabs UI.

```typescript
// TabBar.tsx
const TABS = [
  { name: 'index',     label: 'Dashboard', icon: 'dashboard'           },
  { name: 'add-card',  label: 'Cards',     icon: 'credit_card'         },
  { name: 'analytics', label: 'Analytics', icon: 'insert_chart'        },
  { name: 'alerts',    label: 'Alerts',    icon: 'notifications_active' },
];

// Active tab: pill bg surfaceContainerHighest, primary icon + label
// Inactive: primaryContainer icon + label, no bg
// Height: 56px + useSafeAreaInsets().bottom
// Background: surfaceContainer/80 + expo-blur BlurView
// Border top: 1px outlineVariant/15
// Alert badge: red circle with count on Alerts tab
```

---

## PART 8 — DEPENDENCIES (exact install commands)

```bash
# Core Expo
npx expo install expo-router expo-font expo-status-bar expo-blur expo-haptics expo-splash-screen

# SQLite + Drizzle
npx expo install expo-sqlite
npm install drizzle-orm
npm install -D drizzle-kit

# Animations + Gestures
npx expo install react-native-reanimated react-native-gesture-handler

# SVG (for SpendRing)
npx expo install react-native-svg

# Charts
npm install react-native-gifted-charts

# NativeWind v4
npm install nativewind
npm install -D tailwindcss

# Fonts
npx expo install @expo-google-fonts/manrope @expo-google-fonts/inter expo-font

# Zustand
npm install zustand

# Linear Gradient
npx expo install expo-linear-gradient

# Safe Area
npx expo install react-native-safe-area-context

# SMS (real device only — still install for the module to resolve)
npm install react-native-get-sms-android
```

**`app.json` — add android permissions:**
```json
{
  "expo": {
    "android": {
      "permissions": ["android.permission.READ_SMS", "android.permission.RECEIVE_SMS"]
    },
    "plugins": [
      ["expo-font"],
      ["expo-sqlite"],
      "expo-router"
    ]
  }
}
```

---

## PART 9 — CONSTRAINTS (Non-Negotiable)

1. **TypeScript strict mode** throughout. Zero `any`. Zero `as unknown`.
2. **NativeWind v4** for all styling. `className` prop on every View/Text/Pressable. StyleSheet only for reanimated inline transforms and SVG props.
3. **Android-emulator target**: SMS sync uses `MockSMSService`. Never crash on missing SMS permission.
4. **SQLite is the source of truth.** Never write to Zustand without writing to DB first (or simultaneously).
5. **Every screen** must have three UI states: loading (skeleton), empty, and populated.
6. **All animations via react-native-reanimated v3.** Never use the legacy `Animated` from react-native core.
7. **Business logic in `lib/`** — zero React or RN imports. Pure TS functions, unit-testable.
8. **Haptic feedback** on: card flip tap, subscription confirm, SMS flow completion, destructive swipe.
9. **Safe area** handled via `useSafeAreaInsets()` in every screen. No hardcoded top/bottom padding.
10. **Fonts must load** before any screen renders — use `useFonts()` in `_layout.tsx` with `SplashScreen.preventAutoHideAsync()`.
11. **One component per file.** No barrel `index.ts` re-exports.
12. **No inline `require()` for images** — use static `import` or `expo-asset`.

---

## PART 10 — DELIVERY ORDER

Output files in exactly this sequence. Each file: complete, no truncation, no `// TODO`, no placeholders.

Before each file, output a single line:
```
// ── FILE: path/to/file.ts ──────────────────────────────────────────────────
```

**Sequence:**
1. `constants/theme.ts`
2. `constants/gradients.ts`
3. `lib/formatters.ts`
4. `lib/categorizer.ts`
5. `lib/smsParser.ts` ← **most important file. do not truncate.**
6. `lib/smsSync.ts`
7. `db/schema.ts`
8. `db/client.ts`
9. `store/useStore.ts`
10. `tailwind.config.js`
11. `babel.config.js`
12. `components/ui/CountUp.tsx`
13. `components/ui/SpendRing.tsx`
14. `components/ui/Toast.tsx`
15. `components/ui/BottomSheet.tsx`
16. `components/ui/TabBar.tsx`
17. `components/cards/CreditCard.tsx`
18. `components/cards/StackedCardDeck.tsx`
19. `components/cards/HeroCard.tsx`
20. `components/subscriptions/StatusBadge.tsx`
21. `components/subscriptions/SubscriptionRow.tsx`
22. `components/sms/SMSStepFlow.tsx`
23. `components/sms/SMSBottomSheet.tsx`
24. `app/_layout.tsx`
25. `app/(tabs)/_layout.tsx`
26. `app/(tabs)/index.tsx` ← Dashboard
27. `app/(tabs)/analytics.tsx`
28. `app/(tabs)/alerts.tsx`
29. `app/subscriptions/[cardId].tsx`
30. `app/add-card.tsx`
31. `app/advisor.tsx`
32. `app/dna.tsx`

---

## STARTING INSTRUCTION

Begin with this assumptions block (3 lines max):

```
ASSUMPTIONS:
- [Styling decision: NativeWind className vs StyleSheet boundary]
- [SQLite seed strategy: seedIfEmpty() called in _layout on first mount]
- [Emulator SMS: MockSMSService used when __DEV__ === true OR Platform.OS !== 'android']
```

Then immediately write File 1 (`constants/theme.ts`). Do not ask clarifying questions. Make reasonable decisions and note them as inline comments. Do not stop mid-file under any circumstance.

If you reach the token limit before completing all files, end the current file cleanly and output:
```
// ── CONTINUE: run this prompt again, starting from file N ──
```

---

*End of SpendSync Build Brief — Version 1.0*
*Prototype source: SpendSync HTML prototype (SpendSync — Smart Card & Subscription Tracker)*
*Author context: Dark Obsidian Finance aesthetic, Indian banking ecosystem, Android-first*
