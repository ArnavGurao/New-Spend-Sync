# Design System Document: The Fiscal Curator

## 1. Overview & Creative North Star
This design system is built upon the philosophy of **"The Fiscal Curator."** Moving away from the cluttered, utility-first appearance of traditional fintech, this system treats financial data with the reverence of a high-end editorial magazine. It is designed to feel like a private concierge—sophisticated, quiet, and hyper-organized.

The aesthetic "North Star" is a blend of **Soft Minimalism** and **Organic Brutalism**. We achieve this by rejecting generic "boxed" layouts in favor of intentional asymmetry, ultra-wide breathing room, and a depth model based on tonal shifts rather than structural lines. The interface doesn't just display data; it stages it.

---

## 2. Colors: Tonal Architecture
The palette is rooted in deep obsidian tones, utilizing a monochromatic primary scale punctuated by high-signal functional colors.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined exclusively through background color shifts.
- Use `surface_container_low` (#131313) to distinguish a section from the main `surface` (#0e0e0e).
- Use `surface_container_high` (#1f2020) for interactive elements sitting within a container.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of premium materials. 
- **Base Layer:** `surface` (#0e0e0e).
- **Secondary Plates:** `surface_container` (#191a1a).
- **Interactive Cards:** `surface_container_highest` (#252626).

### Signature Textures & Glass
To avoid a "flat" digital feel, main CTAs should utilize a subtle linear gradient from `primary` (#c6c6c7) to `primary_container` (#454747). For floating elements like navigation bars or overlays, use **Glassmorphism**: apply a semi-transparent `surface_container` color with a 20px backdrop-blur to allow underlying colors to bleed through softly.

---

## 3. Typography: Editorial Authority
We use a dual-typeface system to create a high-contrast hierarchy that feels custom and intentional.

- **Headlines (Manrope):** Chosen for its geometric precision and modern "tech-luxury" feel. Use `display-lg` for account balances and `headline-sm` for category titles.
- **Body & Labels (Inter):** A workhorse typeface designed for maximum legibility at small sizes. Use `body-md` for subscription details and `label-sm` for metadata (dates, frequencies).

**The Hierarchy Rule:** Always pair a large Manrope heading with a significantly smaller Inter label. This "High-Low" pairing mimics high-fashion editorial layouts and creates a clear visual anchor.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often a crutch for poor spacing. In this system, depth is achieved through **Tonal Layering**.

### The Layering Principle
Stack containers to create "lift." A `surface_container_lowest` (#000000) card placed on a `surface_container_low` (#131313) section creates a recessed, "carved-out" look. Conversely, a `surface_container_highest` (#252626) card on a `surface` (#0e0e0e) background creates a soft, natural lift.

### Ambient Shadows
If a "floating" effect is required (e.g., a Bottom Sheet or FAB):
- **Blur:** 32px to 64px.
- **Opacity:** 4%–8%.
- **Color:** Use a tinted version of `on_surface` (#e7e5e4) to simulate real-world ambient occlusion rather than a "dirty" black shadow.

### The "Ghost Border" Fallback
If contrast is insufficient for accessibility, use a **Ghost Border**: `outline_variant` (#484848) at 15% opacity. Never use a 100% opaque border.

---

## 5. Components

### Cards & Lists
*Forbid the use of divider lines.*
- **Subscriptions:** Use `surface_container` (#191a1a) cards with `xl` (0.75rem) roundedness. 
- **Separation:** Use the Spacing Scale `6` (1.5rem) to separate list items. 
- **Visual Signal:** Use a vertical 4px "pill" on the left edge of the card using functional colors (`secondary` for 7-day warnings, `tertiary` for 3-day warnings) to indicate status without cluttering the card face.

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`). Text color: `on_primary` (#3f4041). Shape: `full` (pill).
- **Secondary:** `surface_container_highest` (#252626) fill with `on_surface` text.
- **Tertiary:** No background. `primary` text with an underline using `outline_variant` at 20% opacity.

### Input Fields
- **Styling:** Inset appearance. Use `surface_container_lowest` (#000000) with a `sm` (0.125rem) roundedness to create a "technical" look.
- **States:** On focus, the "Ghost Border" increases to 40% opacity. Error states use the `error` (#ee7d77) token for label text only.

### Chips
- **Filter Chips:** Use `surface_container_high` (#1f2020) for unselected and `primary` (#c6c6c7) for selected.
- **Padding:** `1.5` (0.375rem) vertical, `3` (0.75rem) horizontal.

---

## 6. Do’s and Don’ts

### Do
- **Do** use asymmetrical spacing (e.g., more top padding than bottom) in Hero sections to create an avant-garde feel.
- **Do** leverage "Safe Green" (functional success) only for positive reinforcement, like "Subscription Optimized" messages.
- **Do** use `display-lg` typography for the most important number on the screen—and nothing else.

### Don't
- **Don’t** use standard "Grey" for backgrounds. Always use the specified obsidian `surface` (#0e0e0e).
- **Don’t** use icons as primary buttons. Pair icons with `label-md` text to maintain the editorial feel.
- **Don’t** use cards within cards. If you need a sub-section, use a background shift or a "Ghost Border," never a nested card with a shadow.
- **Don’t** clutter the screen. If more than 5 subscriptions are visible, ensure the "No-Line" rule is strictly followed to prevent "grid-fatigue."