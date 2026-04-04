# SpendSync — AI Build Reference README

> **Document Type:** Full Prototype Specification for AI Builders  
> **Platform:** Android-First Mobile App  
> **Target Market:** Indian Users  
> **Core Input Mechanism:** SMS Read Permission  
> **Prototype Format:** Single-file HTML (index.html) + Landing Page (landing.html)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Core Technical Flow](#2-core-technical-flow)
3. [Design System](#3-design-system)
4. [Seed Data](#4-seed-data)
5. [Screen Specifications](#5-screen-specifications)
   - [Screen 01 — Dashboard](#screen-01--dashboard)
   - [Screen 02 — Card Detail (Subscription View)](#screen-02--card-detail-subscription-view)
   - [Screen 03 — Add New Card](#screen-03--add-new-card)
   - [Screen 04 — Analytics](#screen-04--analytics)
   - [Screen 05 — Alerts](#screen-05--alerts)
   - [Screen 06 — Optimal Card Advisor](#screen-06--optimal-card-advisor)
   - [Screen 07 — Subscription DNA](#screen-07--subscription-dna)
6. [Component Library](#6-component-library)
7. [Landing Page Specification](#7-landing-page-specification)
8. [Animation Reference](#8-animation-reference)
9. [Implementation Directives for AI Builders](#9-implementation-directives-for-ai-builders)

---

## 1. Project Overview

### 1.1 What is SpendSync?

SpendSync is a smart card and subscription tracking mobile application for Indian users. It solves a single, well-defined problem: the average Indian credit card user holds **6–9 active subscriptions** across **3–4 different bank cards**, with zero central visibility. Monthly subscription spend silently accumulates through forgotten subscriptions, unconverted free trials, and surprise recurring charges that arrive as bank SMS messages — and are swiped away unread.

**Core Value Proposition:** Zero manual tracking. Install once, add cards once, grant SMS permission once — and every subscription rupee is automatically detected, categorized, tracked, and alerted on.

### 1.2 Problem Statement

| Dimension | Detail |
|-----------|--------|
| **Scale** | Average user: 6–9 active subscriptions across 3–4 cards = ₹3,000–₹7,000/month in recurring spend |
| **Trigger** | Every charge arrives as a bank SMS — 90% of users swipe it away |
| **Pain Point 1** | Forgotten subscriptions: Netflix, Spotify, Hotstar, Canva — especially on less-checked cards |
| **Pain Point 2** | Trial-to-paid conversion traps: Adobe Creative Cloud, Apple One auto-convert after trial |
| **Pain Point 3** | Wrong card usage: paying Amazon on HDFC instead of ICICI Amazon Pay = losing 5% cashback |

### 1.3 Four Feature Layers

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Optimal Card Advisor** | Cross-references merchant vs card benefits DB; alerts if sub-optimal card is used |
| 2 | **SpendSync DNA Personas** | Classifies user into life-stage archetype based on subscription portfolio |
| 3 | **SpendSync Intelligence (AI Copilot)** | Natural language Q&A over user's own subscription + financial data |
| 4 | **Upcoming Intelligence Features** | Money Leak Detector, Sharing Detector, Bill Negotiation, Salary Day Shield |

---

## 2. Core Technical Flow

> The entire product is built around **Android SMS Read Permission**.

```
Step 1  → User installs app + completes onboarding
Step 2  → User adds cards (one-time): bank name, last 4 digits, expiry, network
Step 3  → User grants SMS read permission (only permission required)
Step 4  → Bank SMS arrives: "HDFC Bank Credit Card XX4521 debited INR 649.00 at NETFLIX on 28-Mar-2026"
Step 5  → App auto-parses: merchant=Netflix, amount=₹649, card=HDFC••4521, date=28-Mar-2026
Step 6  → Toast notification (top of screen): "Bank SMS Detected — HDFC: Card ••4521 debited ₹649 at NETFLIX"
Step 7  → After 2.5s, bottom sheet modal appears with pre-filled data
Step 8a → If Recurring: user selects Monthly / Quarterly / Yearly
Step 8b → If Free Trial: user picks trial end date; app warns 3 days before charge
Step 9  → App calculates next renewal date, saves subscription, sets 3-tier alerts (7d / 3d / 1d)
Step 10 → Dashboard updates instantly
```

---

## 3. Design System

### 3.1 Foundational Rules

- **Mode:** Dark-first — NEVER use white or light backgrounds anywhere
- **Card shape:** Always `rounded-full` (pill ends) — this is a NON-NEGOTIABLE brand element
- **Typography Headings:** Manrope — MUST load from Google Fonts
- **Typography Body:** Inter — MUST load from Google Fonts
- **Feedback:** Every tap uses `active:scale-95 transition-transform` — physical feedback on all interactive elements

### 3.2 Color Tokens

| Token Name | Hex Value | Usage |
|------------|-----------|-------|
| `background` | `#0E0E0E` | App base background |
| `surface-lowest` | `#000000` | Deepest layer |
| `surface` | `#0E0E0E` | Default surface |
| `surface-low` | `#131313` | Slightly elevated |
| `surface-container` | `#191A1A` | Cards, sheets |
| `surface-high` | `#1F2020` | Elevated surfaces |
| `surface-highest` | `#252626` | Top-layer surfaces |
| `outline` | `#484848` | Borders, dividers |
| `outline-variant` | `#767575` | Subtle borders |
| `primary` | `#C6C6C7` | Silver/platinum — main accent |
| `primary-container` | `#454747` | Darker primary variant |
| `secondary` | `#FFBF00` | Gold/amber — alerts, CTAs |
| `secondary-dim` | `#EEB200` | Darker gold variant |
| `tertiary` | `#FF716B` | Coral red — urgent/error |
| `error` | `#EE7D77` | Softer error red |
| `on-surface` | `#E7E5E4` | Primary text |
| `on-surface-variant` | `#ACABAA` | Secondary text |
| `on-primary` | `#0E0E0E` | Text on primary bg |

### 3.3 Card Gradients (Bank-Specific)

| Bank | Gradient CSS |
|------|-------------|
| HDFC | `from-[#8B1D1D] via-[#E11D48] to-[#4C0519]` — deep crimson-red |
| ICICI | `from-[#E65C00] to-[#993D00]` — deep orange |
| SBI | `from-[#003366] to-[#001A33]` — deep navy blue |
| Axis | `from-[#4A0E1C] to-[#2D0911]` — deep burgundy/maroon |
| Default / Other | `from-[#1a1a2e] to-[#16213e]` — deep navy |

### 3.4 Typography Scale

| Role | Font | Weight | Size | Notes |
|------|------|--------|------|-------|
| Display / Hero | Manrope | 800 (extrabold) | 3xl–6xl | Page titles, big numbers |
| Headings | Manrope | 700 (bold) | xl–2xl | Screen titles, section headers |
| Sub-headings | Manrope | 600 (semibold) | base–lg | Card titles, subscription names |
| Body | Inter | 400/500 | sm–base | Paragraphs, descriptions |
| Labels | Inter | 500/600 | 9–11px uppercase | Status tags, tab labels |
| Card Numbers | Manrope | 700 | base–lg | `letter-spacing: 0.2em` |
| Monospace | System | 400 | xs | Raw SMS preview only |

### 3.5 Motion Tokens

| Animation | Value |
|-----------|-------|
| Spring easing | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Toast entry | `translateY(-120%) → translateY(0)`, 0.4s spring |
| Toast exit | `translateY(0) → translateY(-120%)` after 3s |
| Bottom sheet entry | `translateY(100%) → translateY(0)`, 0.4s spring |
| Card hover lift | `translateY(-12px) scale(1.02)`, 0.3s spring |
| Button press | `active:scale-95`, 150ms |
| Screen nav | `opacity`, 0.2s ease |
| Chart draw | SVG `stroke-dashoffset` from full length → 0, on scroll trigger |
| Count-up | `requestAnimationFrame`, 0 → target over 1.5s |

### 3.6 Shared Layout Rules

- Max content width: `max-w-sm` centered
- Horizontal padding: `px-6`
- Top padding: `pt-8`
- Bottom padding: `pb-32` (clears floating nav bar)
- Header: sticky top, `#131313` solid background
- Bottom nav: fixed bottom, `z-index: 50`, frosted glass

---

## 4. Seed Data

> The app is pre-populated with data for a fictional Indian power user named **Rahul**.

### 4.1 Cards

```json
[
  {
    "id": "hdfc-4521",
    "bank": "HDFC Bank",
    "variant": "HDFC INFINIA",
    "lastFour": "4521",
    "expiry": "08/27",
    "network": "Visa",
    "gradient": "from-[#8B1D1D] via-[#E11D48] to-[#4C0519]",
    "monthlySpend": 976
  },
  {
    "id": "icici-8834",
    "bank": "ICICI Bank",
    "variant": "ICICI EMERALDE",
    "lastFour": "8834",
    "expiry": "03/26",
    "network": "Mastercard",
    "gradient": "from-[#E65C00] to-[#993D00]",
    "monthlySpend": 637
  },
  {
    "id": "sbi-2210",
    "bank": "State Bank of India",
    "variant": "SBI AURUM",
    "lastFour": "2210",
    "expiry": "11/28",
    "network": "RuPay",
    "gradient": "from-[#003366] to-[#001A33]",
    "monthlySpend": 629
  },
  {
    "id": "axis-6603",
    "bank": "Axis Bank",
    "variant": "AXIS BANK MAGNUS",
    "lastFour": "6603",
    "expiry": "06/27",
    "network": "Visa",
    "gradient": "from-[#4A0E1C] to-[#2D0911]",
    "monthlySpend": 1384
  }
]
```

### 4.2 Subscriptions (12 Total)

```json
[
  {
    "id": "netflix",
    "name": "Netflix",
    "icon": "play_circle",
    "cardId": "hdfc-4521",
    "amount": 649,
    "billingType": "recurring",
    "cycle": "monthly",
    "renewalDays": 3,
    "status": "urgent"
  },
  {
    "id": "spotify",
    "name": "Spotify",
    "icon": "music_note",
    "cardId": "hdfc-4521",
    "amount": 119,
    "billingType": "recurring",
    "cycle": "monthly",
    "renewalDays": 12,
    "status": "safe"
  },
  {
    "id": "amazon-prime",
    "name": "Amazon Prime",
    "icon": "local_shipping",
    "cardId": "hdfc-4521",
    "amount": 208,
    "billingType": "recurring",
    "cycle": "monthly",
    "renewalDays": 8,
    "status": "warning"
  },
  {
    "id": "youtube-premium",
    "name": "YouTube Premium",
    "icon": "smart_display",
    "cardId": "icici-8834",
    "amount": 189,
    "billingType": "recurring",
    "cycle": "monthly",
    "renewalDays": 20,
    "status": "safe"
  },
  {
    "id": "hotstar",
    "name": "Disney+ Hotstar",
    "icon": "live_tv",
    "cardId": "icici-8834",
    "amount": 299,
    "billingType": "recurring",
    "cycle": "monthly",
    "renewalDays": 5,
    "status": "warning"
  },
  {
    "id": "zomato-pro",
    "name": "Zomato Pro",
    "icon": "restaurant",
    "cardId": "icici-8834",
    "amount": 149,
    "billingType": "recurring",
    "cycle": "monthly",
    "renewalDays": 18,
    "status": "safe"
  },
  {
    "id": "canva-pro",
    "name": "Canva Pro",
    "icon": "palette",
    "cardId": "sbi-2210",
    "amount": 499,
    "billingType": "recurring",
    "cycle": "monthly",
    "renewalDays": 15,
    "status": "safe"
  },
  {
    "id": "adobe-cc",
    "name": "Adobe Creative Cloud",
    "icon": "brush",
    "cardId": "sbi-2210",
    "amount": 0,
    "trialConvertAmount": 1675,
    "billingType": "trial",
    "cycle": "trial",
    "renewalDays": 4,
    "status": "trial-urgent"
  },
  {
    "id": "google-one",
    "name": "Google One",
    "icon": "cloud",
    "cardId": "sbi-2210",
    "amount": 130,
    "billingType": "recurring",
    "cycle": "monthly",
    "renewalDays": 22,
    "status": "safe"
  },
  {
    "id": "zoom-pro",
    "name": "Zoom Pro",
    "icon": "videocam",
    "cardId": "axis-6603",
    "amount": 1100,
    "billingType": "recurring",
    "cycle": "monthly",
    "renewalDays": 45,
    "status": "safe"
  },
  {
    "id": "swiggy-one",
    "name": "Swiggy One",
    "icon": "delivery_dining",
    "cardId": "axis-6603",
    "amount": 299,
    "billingType": "recurring",
    "cycle": "monthly",
    "renewalDays": 9,
    "status": "warning"
  },
  {
    "id": "linkedin-premium",
    "name": "LinkedIn Premium",
    "icon": "work",
    "cardId": "axis-6603",
    "amount": 2499,
    "billingType": "recurring",
    "cycle": "monthly",
    "renewalDays": 30,
    "status": "safe"
  }
]
```

### 4.3 Financial Totals

| Metric | Value |
|--------|-------|
| Total Monthly Spend | ₹3,626 |
| HDFC Monthly | ₹976 (Netflix ₹649 + Spotify ₹119 + Amazon Prime ₹208) |
| ICICI Monthly | ₹637 (YouTube ₹189 + Hotstar ₹299 + Zomato ₹149) |
| SBI Monthly | ₹629 (Canva ₹499 + Google One ₹130; Adobe is free trial) |
| Axis Monthly | ₹1,384 (Zoom ₹1,100 + Swiggy ₹299 + LinkedIn ₹2,499 prorated) |
| Projected Yearly | ₹43,512 |
| Adobe Trial Risk | ₹1,675 (trial → paid conversion) |

### 4.4 Status Color Mapping

| Status Key | Border Color | Icon Color | Pill Style |
|------------|-------------|------------|------------|
| `urgent` | `bg-error` (red `#EE7D77`) | `text-error` | `bg-error-container/20 text-error` |
| `trial-urgent` | `bg-primary` (silver) | `text-primary` | `bg-primary/10 text-primary` |
| `warning` | `bg-secondary` (gold) | `text-secondary` | `bg-secondary-container/20 text-secondary` |
| `safe` | `bg-on-surface-variant/30` | `text-on-surface-variant` | `bg-surface-container-highest/50 text-on-surface-variant` |

### 4.5 Sample SMS Queue (for Simulation)

```javascript
const smsQueue = [
  {
    raw: "Your HDFC Bank Credit Card XX4521 has been debited for INR 649.00 at NETFLIX on 28-Mar-2026. Available limit: Rs.4,19,351.00",
    parsed: { merchant: "Netflix", amount: 649, card: "HDFC ••4521", date: "28-Mar-2026" }
  }
]
```

---

## 5. Screen Specifications

> All screens share: max-w-sm container, px-6 padding, dark backgrounds, sticky header, floating bottom nav.

---

### Screen 01 — Dashboard

**Purpose:** Home screen / primary landing. Displays monthly spend total, stacked card wallet, yearly projection, AI nudge, and SMS simulation trigger.

#### Header (Sticky Top)

| Element | Spec |
|---------|------|
| Background | `#131313` solid |
| Left | `account_balance_wallet` (filled icon) + "SpendSync" wordmark, Manrope bold 20px, `#C6C6C7` |
| Right | `notifications` bell icon + red badge showing count `3` |
| Badge spec | `w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold` absolute positioned |
| Tap bell | Navigates to Alerts screen |

#### Bottom Navigation Bar (Persistent)

| Element | Spec |
|---------|------|
| Background | `#191A1A` at 80% opacity + `backdrop-blur-xl` |
| Position | `fixed bottom-0 full-width z-50 max-w-sm centered` |
| Shape | `rounded-t-3xl border-t border-outline-variant/15` |
| Padding | `pb-6 pt-3` |
| Tabs | Dashboard (`dashboard`), Cards (`credit_card`), Analytics (`insert_chart`), Alerts (`notifications_active`) |
| Active tab | `bg-[#252626] text-[#C6C6C7] rounded-xl` |
| Inactive tab | `text-[#454747]` |
| Labels | `10px uppercase Inter tracking-wide` — DASHBOARD / CARDS / ANALYTICS / ALERTS |
| Hidden state | `nav.classList.add('hidden')` when SMS sheet is open |

#### Greeting Section

```
"Good morning, Rahul"    — Manrope 3xl extrabold tracking-tight white
"You have 4 active cards and 11 subscriptions"  — Inter sm text-on-surface-variant
Spacing: mb-10
```

#### Hero Spend Pill

| Element | Spec |
|---------|------|
| Container | `bg-[#131313] p-8 rounded-full border border-outline-variant/15 overflow-hidden` |
| Glow effect | `absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl` |
| Label | "TOTAL MONTHLY SPEND" — `10px uppercase tracking-[0.2em] text-on-surface-variant mb-3` |
| Currency | "₹" — Manrope 2xl bold `#C6C6C7` |
| Amount | "3,626" — Manrope 6xl (60px) extrabold white `tracking-tighter` |
| Sub-pill | `bg-surface-container-highest/50 px-4 py-1.5 rounded-full backdrop-blur` — "TOTAL YEARLY" label + "₹43,512" |
| Alignment | `flex-col items-center text-center` |

#### Stacked Card Wallet

| Element | Spec |
|---------|------|
| Section header | "Your Wallet" (Manrope bold 18px white) + "Manage All" (primary color, underlined, right) |
| Container height | `160px + (cardCount-1)*56px + 64px` = `280px` for 4 cards |
| Stack order | Array reversed — bottom card renders first (lowest z-index) |
| Z-positions | Card 1: `top-0 z-40` / Card 2: `top-14 z-30` / Card 3: `top-[7rem] z-20` / Card 4: `top-40 z-10` |
| Card shape | `absolute w-full h-56 rounded-full p-6` |
| Card border | `border border-white/5` |
| Card shadow | `shadow-2xl` |
| Card top-left | `account_balance_wallet` filled, `text-white/70 text-2xl` |
| Card top-right | Monthly spend pill: `bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-[10px] bold uppercase` |
| Card bottom-left | Variant name `text-white/40 10px tracking-[0.3em]` above card number `XXXX XXXX XXXX 4521` Manrope bold 18px |
| Hover animation | `translateY(-12px) scale(1.02) z-index:50`, 0.3s spring |
| Tap behavior | Navigate to Card Detail screen, passing `cardId` |

#### Optimization Nudge

| Element | Spec |
|---------|------|
| Container | `bg-surface-container-high p-5 rounded-full flex items-center gap-4` |
| Icon | `bg-primary/10 p-3 rounded-full` containing `auto_awesome` in primary color |
| Title | "Optimization Ready" — white Manrope bold sm |
| Body | "3 subscriptions have price drops available." — `text-on-surface-variant xs` |
| Button | "Review" — `bg-primary text-on-primary px-4 py-2 rounded-full text-[10px] uppercase tracking-widest active:scale-95` |

#### Simulate SMS Button (Prototype-Only)

| Element | Spec |
|---------|------|
| Style | `w-full bg-gradient-to-r from-secondary to-secondary-dim text-on-secondary Manrope font-bold py-4 rounded-full` |
| Icon | `sms` (outlined) |
| Label | "Simulate Incoming SMS" |
| Behavior | Calls `simulateSMS()` → waits 2.5s → fires SMS toast → opens SMS bottom sheet |

#### SMS Toast Notification

| Element | Spec |
|---------|------|
| Position | `fixed top-4 left-0 right-0 max-w-sm centered z-100` |
| Container | `bg-surface-container-highest/90 backdrop-blur-md rounded-full p-3 px-4 border border-outline-variant/20` |
| Left icon | `w-10 h-10 bg-gradient-to-br from-primary to-primary-container rounded-full flex centered` — SMS icon inside |
| Label | "BANK SMS DETECTED" — `10px bold Manrope uppercase tracking-wider text-primary` |
| Body | Bank name + card + amount + merchant — `sm text-on-surface truncated` |
| Timestamp | "Now" — `10px text-on-surface-variant font-medium` |
| Entry | `translateY(-120%) → translateY(0)` spring 0.4s |
| Duration | Visible 2.5s → slides up → SMS sheet opens |

#### SMS Bottom Sheet — Step 1 (Classify Charge)

| Element | Spec |
|---------|------|
| Overlay | `fixed inset-0 bg-black/60 z-60` — tap to close |
| Sheet | `fixed bottom-0 bg-[#191A1A] rounded-t-3xl max-w-sm centered max-h-[75vh] overflow-y-auto z-70` |
| Entry | `translateY(100%) → translateY(0)` spring 0.4s |
| Handle | `w-12 h-1 bg-[#484848] rounded-full centered mb-5` |
| Section label | "SPENDSYNC DETECTED A CHARGE" — `10px bold uppercase tracking-[0.2em] text-primary mb-3` |
| SMS preview box | `bg-[#0E0E0E] rounded-xl p-3 font-mono xs text-[#ACABAA] border border-[#484848] mb-5` |
| Parsed data grid | `bg-[#252626] rounded-2xl p-4 mb-6` — 4 rows: Merchant / Amount / Card / Date, each with green `check_circle` + "Auto-detected" tag |
| Question | "One question — what is this charge?" — Manrope semibold white base mb-4 |
| Option 1 | "Recurring Subscription" — `rounded-2xl p-5 flex-col centered` with `repeat` icon — `border-primary bg-primary/10` when selected |
| Option 2 | "Free Trial" — same style, `timer` icon |
| Next button | Appears after selection — `w-full bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full py-4 Manrope bold` |

#### SMS Bottom Sheet — Step 2A (Recurring)

| Element | Spec |
|---------|------|
| Back nav | `chevron_left` + two progress dots (right active) |
| Question | "How often does this charge repeat?" |
| Options | 3 full-width `rounded-full` buttons: Monthly / Quarterly / Yearly — each shows cycle name left + cost right — selected = `border-primary bg-primary/10 text-primary` |
| Done button | "Done — Track This Subscription" — same gradient style |

#### SMS Bottom Sheet — Step 2B (Free Trial)

| Element | Spec |
|---------|------|
| Question | "When does your free trial end?" |
| Date picker | `type=date input bg-[#252626] border-primary rounded-full px-4 py-4 text-white text-lg centered` |
| Warning box | `bg-secondary/10 rounded-xl p-3 border border-secondary/20` — warning icon + "SpendSync will alert you 3 days before this date so you can cancel before being charged." |

---

### Screen 02 — Card Detail (Subscription View)

**Purpose:** Drill-down from dashboard card tap. Shows all subscriptions for a specific card, card hero visual, and floating total/CTA bar.

#### Header

| Left | Center | Right |
|------|--------|-------|
| `arrow_back` → Dashboard | Card name (e.g., "HDFC INFINIA") — Manrope bold 20px | `notifications` bell (no badge) |

#### Card Hero

| Element | Spec |
|---------|------|
| Container | `rounded-full p-8 h-48 flex flex-col justify-between` + bank gradient |
| Border | `border border-white/5` |
| Shadow | editorial-shadow |
| Top-left | `account_balance_wallet` filled, `text-white/90 text-4xl` |
| Top-right | "Available Limit" xs uppercase white/60 + "₹4,20,000" 2xl Manrope bold white |
| Bottom pills | `[X Active Subscriptions]` + `[₹Y/month]` — `bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10` |
| Bottom-right | Card last-four: "•••• 4521" white/80 Manrope medium `tracking-[0.2em]` |

#### Subscription List

| Element | Spec |
|---------|------|
| Section header | "Active Subscriptions" (on-surface-variant semibold) + "Manage All" (primary text sm) |
| Item container | `bg-surface-container hover:bg-surface-container-high transition-all 300ms rounded-full p-4 flex items-center justify-between border-l-4` |
| Left border | Status-coded (see status color table) |
| Icon area | `w-12 h-12 rounded-full bg-surface-container-highest flex centered` |
| Service name | Manrope font-bold text-on-surface |
| Sub label | Inter xs text-on-surface-variant — "Monthly Plan" / "Free Trial" |
| Amount | Manrope bold — "₹649" + "/mo" in `10px on-surface-variant` |
| Status pill | Status-coded text + color (see Section 4.4) |

#### Floating Bottom Action Bar

| Element | Spec |
|---------|------|
| Position | `fixed bottom-24 px-6 pointer-events-none z-40` |
| Card | `max-w-sm bg-surface-container-high/90 backdrop-blur-xl border border-outline-variant/10 rounded-full p-6 flex justify-between editorial-shadow` |
| Left | "Total due this month" `10px uppercase tracking-widest on-surface-variant` + amount `2xl Manrope bold primary` |
| CTA | "Auto-Pay" — `bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-3 rounded-full Manrope bold sm` |

#### Per-Card Subscription Data

| Card | Subscriptions | Total |
|------|-------------|-------|
| HDFC INFINIA | Netflix ₹649 (URGENT 3d), Spotify ₹119 (safe 12d), Amazon Prime ₹208 (warning 8d) | ₹976/mo |
| ICICI EMERALDE | YouTube ₹189 (safe 20d), Hotstar ₹299 (warning 5d), Zomato Pro ₹149 (safe 18d) | ₹637/mo |
| SBI AURUM | Canva Pro ₹499 (safe 15d), Adobe CC FREE TRIAL (trial-urgent 4d → ₹1,675), Google One ₹130 (safe 22d) | ₹629/mo + trial risk |
| AXIS MAGNUS | Zoom ₹1,100 (safe 45d), Swiggy One ₹299 (warning 9d), LinkedIn ₹2,499 (safe 30d) | ₹1,384/mo |

---

### Screen 03 — Add New Card

**Purpose:** Add a new bank card. Features live card preview that updates in real time as form is filled. Collects only identification metadata — NO card number, NO CVV.

#### Header

| Left | Center | Right |
|------|--------|-------|
| `arrow_back` → Dashboard | "Add New Card" — Manrope bold 20px | Empty |

#### Live Card Preview

| Element | Spec |
|---------|------|
| Shape | `rounded-full h-52 p-6 flex flex-col justify-between shadow-2xl border border-white/5` |
| Gradient | Dynamically set by selected bank. Default: `from-[#1a1a2e] to-[#16213e]` |
| Top-left | Bank name (Manrope bold sm white) — shows "Select Bank" until chosen |
| Top-right | Network name (`text-white/50 text-xs font-label`) |
| Bottom variant | Card variant name `text-white/40 10px tracking-[0.3em]` |
| Bottom number | `XXXX XXXX XXXX ____` — last 4 positions show user input; untyped digits = `_` |
| Bottom expiry | `MM/YY` in `text-white/50 xs font-label` |

#### Form Fields

**Global input style:** `bg-[#191A1A] border border-[#484848] rounded-full px-4 py-3 text-white focus:border-primary outline-none`  
**Global label style:** `text-on-surface-variant xs font-label uppercase tracking-wider mb-2 block`

| Field | Type | Options/Behavior |
|-------|------|-----------------|
| Bank Name | `<select>` | Select Bank / HDFC Bank / ICICI Bank / State Bank of India / Axis Bank / Kotak Mahindra Bank / Yes Bank / IndusInd Bank / Other → updates card gradient |
| Card Variant | Text input | Placeholder: "e.g. Regalia, Sapphire" → updates preview variant line |
| Last 4 Digits | Text input | Strip non-digits, max 4 chars → updates preview number |
| Expiry Date | Text input | `handleExpiry()` — auto-inserts `/` after 2 digits, strips non-digits, format `MM/YY` |
| Network | Segmented toggle | Visa / Mastercard / RuPay — active: `bg-primary text-on-primary`, inactive: `bg-[#191A1A] border border-[#484848]`, default: Visa |

#### Submit Button

| Element | Spec |
|---------|------|
| Label | "Add Card" |
| Style | `w-full bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full py-4 Manrope bold active:scale-95 mt-4` |
| Validation | bank not empty + lastFour is exactly 4 digits + expiry not empty → error toast if invalid |
| Success | Add to `state.cards`, reset form, navigate to Dashboard, show success toast |

#### Success Toast

- Icon: `check_circle` in `text-green-400`
- Message: "Card added successfully"
- Duration: 3s visible, then slide-up dismiss

---

### Screen 04 — Analytics

**Purpose:** Full financial breakdown — trend line chart, spend-by-card bars, category donut, and top subscriptions list.

#### KPI Cards (3-Column Grid)

| KPI | Value | Notes |
|-----|-------|-------|
| MONTHLY | ₹3,347 | Shows `+12%` in gold (MoM increase indicator) |
| YEARLY | ₹40,164 | Projected |
| ACTIVE SUBS | 9 | Count |

Card spec: `bg-surface-container p-4 rounded-xl border border-outline-variant/15 flex flex-col justify-between h-28`

#### Monthly Trend Line Chart (SVG)

| Element | Spec |
|---------|------|
| Container | `bg-surface-container-low p-6 rounded-xl border border-outline-variant/10` |
| Chart area | `h-48 w-full SVG viewBox="0 0 1000 200"` |
| Grid lines | 3 horizontal dashed lines at y=50, y=100, y=150 — `#484848` stroke 0.5 |
| Data path | `M 0,160 Q 150,155 200,140 T 400,120 T 600,90 T 800,70 T 1000,45` |
| Line style | Gradient stroke (primary → primary-container), stroke-width 4, Gaussian blur glow |
| X-axis | Oct / Nov / Dec / Jan / Feb / Mar — `10px uppercase Inter text-on-surface-variant` |
| Meaning | Upward slope = subscription creep over 6 months |

#### Spend by Card (Horizontal Bars)

| Card | Amount | Bar Width | Bar Color |
|------|--------|-----------|-----------|
| Axis Bank | ₹1,384 | 100% | `bg-purple-500` |
| HDFC | ₹976 | 70% | `bg-error` (red) |
| ICICI | ₹637 | 46% | `bg-secondary` (gold) |
| SBI | ₹629 | 45% | `bg-blue-500` |

Bar track: `w-full h-3 bg-surface-container-highest rounded-full`

#### Spend by Category (Donut Chart)

| Segment | Percentage | Color |
|---------|-----------|-------|
| Entertainment | 45% | `#C6C6C7` (primary/silver) |
| Productivity | 30% | `#FFBF00` (secondary/gold) |
| Cloud | 13% | `#FF716B` (tertiary/red) |
| Food | 12% | `#767575` (outline/grey) |

SVG: `w-40 h-40 rotated -90deg`, `r=40%` (~64px), `stroke-width: 12`, track circle `#252626`. Center label: "Total" 10px + "100%" xl bold.

#### Top Subscriptions (Ranked)

| Rank | Service | Amount | Billing | Color |
|------|---------|--------|---------|-------|
| 1 | LinkedIn Premium | ₹2,499 | Monthly, 30d | `border-primary` (silver) |
| 2 | Zoom Pro | ₹1,100 | Monthly, 45d | `border-secondary` (gold) |
| 3 | Netflix | ₹649 | Monthly, 3d URGENT | `border-tertiary` (red) |

Item spec: `bg-surface-container-high p-5 rounded-xl flex items-center justify-between border-l-4`

---

### Screen 05 — Alerts

**Purpose:** All subscriptions sorted by urgency (soonest renewal first). Filter tabs. AI nudge at top.

#### SpendSync Intelligence AI Nudge

| Element | Spec |
|---------|------|
| Container | `bg-surface-container-highest/60 backdrop-blur-md rounded-full p-1 pl-1 pr-4 flex items-center gap-3 border border-outline-variant/20 editorial-shadow mb-10` |
| Left icon | `w-10 h-10 bg-gradient-to-br from-primary to-primary-container rounded-full` — `auto_awesome` icon |
| Label | "SPENDSYNC INTELLIGENCE" — `11px bold uppercase tracking-wider text-primary` |
| Message | "Netflix renews in 3 days — ₹649 on HDFC ••4521" |
| Timestamp | "Now" — `10px on-surface-variant font-medium` |

#### Section Headline

```
"Upcoming Alerts"       — Manrope 4xl (36px) extrabold tracking-tight mb-2
"3 subscriptions need your attention this week"  — Inter on-surface-variant lg mb-8
```

#### Filter Tabs

| Tab | Active Style | Inactive Style | Filter Logic |
|-----|-------------|---------------|-------------|
| All | `bg-primary text-on-primary px-5 py-2 rounded-full text-sm font-semibold` | `bg-surface-container-high text-on-surface-variant` | Show all |
| Urgent | Same active | Same inactive | `status === 'urgent' \|\| status === 'trial-urgent'` → Netflix, Hotstar, Adobe CC |
| Trials | Same active | Same inactive | `billingType === 'trial'` → Adobe CC only |

Default active: **All**

#### Alert List Item

| Element | Spec |
|---------|------|
| Container | `bg-surface-container rounded-full overflow-hidden flex items-center p-3 pr-6 relative editorial-shadow hover:bg-surface-container-high` |
| Left accent bar | `absolute left-0 top-0 bottom-0 w-1` — status-coded color |
| Icon area | `w-14 h-14 rounded-full bg-surface-container-highest flex centered mr-4` — filled icon in status color |
| Service name | Manrope font-bold text-base + optional "Trial" badge (`bg-primary/10 text-primary 10px px-2 py-0.5 rounded-full`) |
| Card info | "HDFC ••4521" — `xs on-surface-variant uppercase tracking-widest` |
| Amount | Manrope font-bold xl — "₹649" or "Free" for trial |
| Days label | "in 3 days" — `xs font-bold uppercase` in status color |

#### Full Sorted Subscription Order (All Filter)

```
1.  Netflix             HDFC ••4521    ₹649    in 3 days   URGENT (red)
2.  Adobe Creative Cloud SBI ••2210   Free    in 4 days   TRIAL-URGENT (silver)
3.  Disney+ Hotstar     ICICI ••8834  ₹299    in 5 days   WARNING (gold)
4.  Amazon Prime        HDFC ••4521   ₹208    in 8 days   WARNING (gold)
5.  Swiggy One          Axis ••6603   ₹299    in 9 days   WARNING (gold)
6.  Spotify             HDFC ••4521   ₹119    in 12 days  Safe (grey)
7.  Canva Pro           SBI ••2210    ₹499    in 15 days  Safe (grey)
8.  Zomato Pro          ICICI ••8834  ₹149    in 18 days  Safe (grey)
9.  YouTube Premium     ICICI ••8834  ₹189    in 20 days  Safe (grey)
10. Google One          SBI ••2210    ₹130    in 22 days  Safe (grey)
11. LinkedIn Premium    Axis ••6603   ₹2,499  in 30 days  Safe (grey)
12. Zoom Pro            Axis ••6603   ₹1,100  in 45 days  Safe (grey)
```

#### Empty State Footer

```
Container: mt-10 p-8 border border-dashed border-outline-variant/30 rounded-full flex flex-col items-center text-center
Icon: verified_user — text-4xl text-on-surface-variant/40 mb-3
Text: "No other payments detected for this month." — sm font-medium text-on-surface-variant
```

---

### Screen 06 — Optimal Card Advisor

**Purpose:** For any subscription merchant, determine which linked card gives maximum cashback/benefit. Features card roulette animation.

#### Layout

```
Section label:   "SMART OPTIMIZATION" — small uppercase tracking label
Headline:        "Pay smarter. Save more." — centered Manrope extrabold
Subtext:         "Each subscription analyzed against your card benefits database"
```

#### Merchant Display

```
Demo merchant: Netflix
Visual: Large "N" in Netflix red (#E50914) in circular badge, labeled "Netflix"
Question: "Which card should you use?" — Manrope semibold centered
```

#### Card Spinner Animation

| Element | Spec |
|---------|------|
| Cards shown | HDFC INFINIA (crimson) / ICICI EMERALDE (orange) / SBI AURUM (navy) / AXIS MAGNUS (burgundy) |
| Each card | Bank gradient + variant name + masked number |
| Animation | Vertical scroll/spin, one card active at a time (full opacity, scale 1.0), others faded. Speed: fast → decelerates → lands on winner |
| Winner for Netflix | **HDFC INFINIA** (OTT cashback benefit) |

#### Result Panel (After Spinner Settles)

| Element | Spec |
|---------|------|
| Cashback badge | "5% cashback on OTT" — pill badge, accent background |
| Savings counter | "₹32 saved monthly" — animated count-up from 0 |
| Calculation | ₹649/month × 5% = ₹32.45/month = ₹389/year |
| CTA | "Switch to this card" / "Apply Recommendation" button |

#### Card Benefits Database

| Card | Best For | Benefit |
|------|---------|---------|
| ICICI Amazon Pay | Amazon Prime, Audible | 5% cashback |
| HDFC Infinia | OTT, Dining, Travel | 5% OTT / 3.3% general |
| Axis Magnus | Travel, Lounge | 12 EDGE Miles / ₹200 |
| SBI Aurum | Milestone Rewards | 12,500 pts on ₹2.5L spend |
| ICICI Emeralde | Lounge + Insurance | 4% dining/entertainment |

#### Contextual Integration with SMS Flow

When SMS is classified → app checks used card vs optimal card → if sub-optimal, nudge appears in SMS confirmation: "You could save ₹32/month by paying Netflix with HDFC instead of SBI." — also surfaces as Dashboard "Optimization Ready" banner.

---

### Screen 07 — Subscription DNA

**Purpose:** Life-stage persona classification. Transforms subscription portfolio into an identity archetype with peer benchmarks and evolution timeline.

#### Background

- `tsParticles` slim preset — animated constellation of dots connected by lines suggesting DNA strand / neural network
- Low density, slow drift, `#C6C6C7` primary color particles

#### DNA Profile Card

| Element | Spec |
|---------|------|
| DNA label | "Your subscription DNA" — small label above persona |
| Persona title | "The Creator" — large Manrope extrabold, primary color or white |
| Descriptor | "Design-first · Tool-heavy · Premium card user" — Inter medium, muted, dot-separated |
| Match badge | Pulsing green dot + "94% match" |
| Animation | Fade in with slight upward translate on scroll |

#### Persona Definitions

| Persona | Subscription Signals | Life Stage |
|---------|---------------------|-----------|
| **The Creator** *(Rahul's)* | Canva Pro + Adobe CC + Zoom Pro + LinkedIn Premium | Young professional → independent creator economy |
| The Entertainer | Netflix + Hotstar + Zomato Pro + Swiggy One | Urban working professional, comfort-seeking |
| The Professional | LinkedIn + Zoom + Microsoft 365 + Google Workspace | Corporate senior, remote work, career-primary |
| The Student | Spotify + YouTube Premium + Notion | College / early career, budget-conscious |

#### Peer Insights (3 Cards)

| Service | % | Insight Text |
|---------|---|-------------|
| Adobe Creative Cloud | 73% | "73% of creators with Canva Pro 8+ months also use Adobe CC" |
| Notion Workspace | 81% | "81% of creators in your cluster use Notion for project tracking" |
| LinkedIn Premium | 67% | "67% of creators upgrade to LinkedIn Premium after 12 months" |

Bar spec: `h-2 bg-surface-container-highest/30 rounded-full` track + animated fill from 0 → target on scroll-trigger. Color: primary.

#### DNA Evolution Timeline

| Point | Timestamp | Style |
|-------|-----------|-------|
| Student | 18m ago | Grey inactive dot |
| Young Professional | 8m ago | Grey inactive dot |
| **Creator** | Now | Pulsing active dot in primary color |

Connector: horizontal line, grey → transitions to primary color at current point.

---

## 6. Component Library

### 6.1 Card Component

```
Props: bank, variant, lastFour, expiry, network, gradient, monthlySpend
Variants:
  - Stacked: small, interactive, hover-lift (Dashboard wallet)
  - Hero: large, static, full-detail (Card Detail screen top)
  - Preview: form-reactive, live-update (Add Card screen)
Shape: ALWAYS rounded-full — non-negotiable
```

### 6.2 Subscription Row Component

```
Props: name, icon, amount, billingType, cycle, renewalDays, status, cardId
Status variants: urgent / warning / trial-urgent / safe
Note: Alerts screen uses rounded-full pill; Card Detail uses rounded-full with border-l-4
```

### 6.3 Toast Notification Component

```
Variants: SMS (bank detected) / Success (check_circle green) / Error (error icon red) / Info (info icon primary)
Behavior: slide from top, auto-dismiss 3s, z-100, max-w-sm centered
Animation: translateY(-120%) → translateY(0) spring 0.4s
```

### 6.4 Bottom Sheet Component

```
Features: handle bar, overlay backdrop, spring animation, scrollable content, max-h-75vh
Usage: SMS classification 2-step flow
Overlay: bg-black/60 z-60
Sheet: bg-[#191A1A] rounded-t-3xl z-70
```

### 6.5 Bottom Navigation Component

```
Tabs: Dashboard / Cards / Analytics / Alerts
Active: bg-[#252626] pill highlight
Hidden: nav.classList.add('hidden') — when SMS sheet is open
```

### 6.6 Section Label Component

```
Style: 10-11px uppercase Inter 600 tracking-[0.2em] primary/accent color
Usage: Above major section headings — "YOUR WALLET", "SMART OPTIMIZATION", "YOUR SUBSCRIPTION DNA"
```

---

## 7. Landing Page Specification

> Built with GSAP + ScrollTrigger + Lenis smooth scroll + tsParticles. Each section = one reel scene.

### Scene 1 — Silent Debit Cascade (0:00–0:08)

5 debit notification cards appear sequentially → running total animates: ₹0 → ₹649 → ₹948 → ₹1,447 → ₹2,547 → ₹2,846 → "You didn't notice." + gradient text "SpendSync did." fades in.

Notifications: `HDFC -₹649 NETFLIX` / `ICICI -₹299 HOTSTAR` / `SBI -₹499 CANVA` / `Axis -₹1,100 ZOOM` / `Axis -₹299 SWIGGY`

### Scene 2 — Three Ignored Phones (0:08–0:15)

3 phones side-scrolling: (1) SMS inbox with stacked debit messages — "Swiped away. Forgotten." (2) Bank statement with CANVAPRO ₹499 flagged red. (3) Email: "Your free trial has ended — Adobe Creative Cloud — ₹1,675.00 charged."

### Scene 3 — Scroll-Driven SMS Demo (0:15–0:25)

5-step scroll-driven product demo: Empty dashboard → SMS banner slides in → Bottom sheet rises → Subscription row appears → Renewal alert appears. Progress dots below phone show active step.

### Scene 4 — Card Stack Reveal (0:25–0:32)

"All your cards. One smart stack." 4 cards fan into view with spring animation, each showing gradient + monthly spend badge.

### Scene 5 — Analytics Reveal (0:32–0:40)

"Your spending, visualized." KPI cards count up. Trend line draws left to right. Bars animate width. Donut segments sweep in — all on scroll trigger.

### Scene 6 — Optimal Card Advisor (0:40–0:48)

Netflix logo → card spinner cycles → lands on HDFC → "5% cashback on OTT" badge → savings count ₹0 → ₹32.

### Scene 7 — Subscription DNA (0:48–0:55)

Particle constellation → "The Creator — 94% match" fades in → peer bars animate → timeline illuminates left to right.

### Scene 8 — CTA (0:55–1:00)

SpendSync logo assembles letter by letter. "Stop. The. Leak. Start. Today." fades word by word. Buttons: "Download APK" (primary) + "View Demo" (secondary). Social proof: "2,847 subscriptions tracked across India."

---

## 8. Animation Reference

| Animation | CSS / JS Spec |
|-----------|-------------|
| Spring easing | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Toast entry | `translateY(-120%) → translateY(0)`, 0.4s spring |
| Toast exit | `translateY(0) → translateY(-120%)` after 3s |
| Bottom sheet entry | `translateY(100%) → translateY(0)`, 0.4s spring |
| Card hover lift | `translateY(-12px) scale(1.02)`, z-index 50, 0.3s spring |
| Button press | `active:scale-95 transition-transform duration-150` |
| Chart draw | SVG `stroke-dashoffset` full-length → 0, on scroll trigger |
| Count-up | `requestAnimationFrame`, 0 → target over 1.5s |
| Particle bg | tsParticles slim preset, slow drift, low opacity, connecting lines |
| Screen navigation | `opacity` 0.2s ease — fade in/out |
| Donut segments | Stroke-dasharray sweep on scroll trigger |
| Bar chart widths | `width: 0 → target%` on scroll trigger |

---

## 9. Implementation Directives for AI Builders

> Critical rules. Follow these exactly.

### Must-Do Rules

1. **Dark mode only** — Background `#0E0E0E`. NEVER use white or light grey backgrounds anywhere.
2. **Cards are always `rounded-full`** — This is the core brand shape. Not `rounded-2xl`, not `rounded-xl`. Pill ends everywhere.
3. **Active:scale-95 on every interactive element** — All taps must have physical feedback.
4. **Manrope for all headings** — Load from Google Fonts. Non-negotiable.
5. **Inter for all body text** — Load from Google Fonts. Non-negotiable.
6. **Use semantic color tokens** — Use token names (`primary`, `secondary`, etc.) not raw hex, so they can be themed.
7. **Every card gradient is distinct** — HDFC (red), ICICI (orange), SBI (navy), Axis (burgundy). Visually different.
8. **Stacked wallet needs 3D depth** — Z-index layering with offset positions is critical. Cards MUST visually stack.
9. **SMS flow is the hero interaction** — Must be the most polished, most animated sequence in the prototype.
10. **Alerts screen sorts by `renewalDays` ascending** — Most urgent always first.
11. **Bottom nav is frosted glass floating pill** — Not a standard tab bar. Must have `backdrop-blur`.
12. **Analytics donut has exactly 4 segments** — Entertainment 45%, Productivity 30%, Cloud 13%, Food 12%.
13. **DNA screen requires 4 components** — Particle background + persona card + peer insight bars + timeline.

### Must-Not Rules

- Do NOT add bright white backgrounds anywhere.
- Do NOT use light mode elements or colored primary backgrounds.
- Do NOT use standard Android-style bottom tab bars.
- Do NOT use `rounded-2xl` or `rounded-xl` for cards — only `rounded-full`.
- Do NOT collect card numbers or CVV in the Add Card form.

### Reel Recording Sequence

| Step | Screen | Duration | Action |
|------|--------|----------|--------|
| 1 | Dashboard | 5s | Show wallet stack + ₹3,626 monthly spend |
| 2 | SMS Flow | 8s | Tap Simulate SMS → toast → bottom sheet |
| 3 | SMS Flow | 5s | Select Recurring + Monthly + tap Done |
| 4 | Add Card | 6s | Select HDFC, type 4521, 08/27, Visa |
| 5 | Analytics | 8s | Charts animate in — pan slowly |
| 6 | Alerts | 6s | Show Netflix urgent + Adobe trial → tap Urgent filter |
| 7 | Optimal Card Advisor | 7s | Spinner lands on HDFC → savings reveal |
| 8 | DNA | 8s | Particle bg + The Creator + peer bars + timeline |
| 9 | CTA | 3s | "Stop the Leak. Start Today." + SpendSync logo |

### Prototype Build Order (Recommended)

1. Design system setup (tokens, fonts, global CSS)
2. Shared components (Toast, Bottom Sheet, Nav Bar, Card component)
3. Screen 01: Dashboard (core layout + wallet stack)
4. SMS simulation flow (toast + bottom sheet steps 1 & 2)
5. Screen 02: Card Detail
6. Screen 03: Add Card
7. Screen 04: Analytics (SVG charts)
8. Screen 05: Alerts
9. Screen 06: Optimal Card Advisor
10. Screen 07: DNA (tsParticles + persona)
11. Landing page (GSAP + ScrollTrigger scenes)

---

*End of SpendSync AI Build Reference README*  
*Covers: 7 app screens · 1 landing page · complete design system · full seed data · component library · reel script*
