# Aiko — Mercury editorial (IPL 2022)

Source: Mercury — Banking Editorial Warmth  
https://github.com/rohitg00/awesome-claude-design/blob/main/design-md/warm/mercury.md

Cream paper, warm ink, hairline tables. **One** saturated accent: cricket-field green (Mercury indigo swapped). Success / warning / danger stay Mercury’s.

---

Reference DESIGN.md for a data product that feels calm and considered, not chrome-and-glass cold. Cream canvas, green action, dashboard density that still reads like editorial.

## 1. Visual Theme & Atmosphere

Trust through editorial restraint. The page is paper, not plastic. Cream backgrounds, warm-gray ink, one green CTA. Information density borrows from Linear; tone borrows from a financial broadsheet. Numbers are legible, surfaces are quiet, the brand lets the data stand.

Mood: trustworthy, deliberate, modern, unhurried. Product name: **Aiko**. Independent IPL 2022 analytics — not a bank, not a live-score toy.

## 2. Color Palette & Roles

```
--bg-primary:      #f6f5f2   /* warm canvas, page */
--bg-secondary:    #ebe8e0   /* surface lift */
--bg-tertiary:     #ded9ca   /* tonal divider, secondary CTA */
--surface:         #ffffff   /* card, table */
--text-primary:    #2a2924   /* ink */
--text-secondary:  #5a5548   /* warm gray */
--text-muted:      #8a8478
--accent:          #1B5E3B   /* field green, primary CTA + link */
--accent-hover:    #154C30
--border:          #ded9ca
--border-strong:   #c9c3b3
--success:         #2f7d57   /* win */
--warning:         #c98a42   /* saffron highlight, MOTM */
--danger:          #b54a3a   /* loss / error */
```

Rule: field green is the only saturated action color. Use it for primary buttons and link underline. Warm grays do everything else. Team brand colors: logo or a 4px accent bar only — never a section fill.

## 3. Typography Rules

- **Headlines:** `Arcadia Display`, fallback `Georgia`, `Iowan Old Style`. Weight 400. Letter-spacing −1%.
- **Body + UI:** `Arcadia`, fallback `Inter`, system-ui. Weight 400/500. Line-height 1.5.
- **Numerals:** tabular figures on every score, average, strike rate, chart label, standings cell. Never proportional figures on stats.
- **Mono:** `IBM Plex Mono` for IDs, overs (`17.4`), and code.

Implementation (Next.js, no paid Arcadia): **Inter** + **IBM Plex Mono** via `next/font`. Headlines may use `Georgia` until a licensed display face exists.

Scale: 13 / 14 / 16 / 18 / 22 / 28 / 36 / 48 / 72.

Mobile inputs: 16px minimum.

## 4. Component Stylings

**Buttons**
- Primary: `--accent` fill, white text, full pill (radius 999), padding 10/20, weight 500. No shadow.
- Secondary: `--bg-tertiary` fill, ink text, full pill. Hover: `--border-strong`.
- Ghost: ink text, `--accent` on hover.
- One primary per region. Hit area 44px on mobile.

**Cards**
- Surface white on `--bg-primary`, 1px `--border`, radius 8px. No shadow.
- Stat cells: value in 36px tabular, label in 13px uppercase eyebrow.

**Inputs**
- Pill shape, 1px `--border`, padding 10/16. Focus: 2px `--accent` ring, 2px offset.

**Tables**
- Tabular numerals, hairline `--border` between rows, sticky header in 12px uppercase eyebrow on `--bg-secondary`.
- Numbers right-aligned. Below 640px: stacked key-value cards, primary number 22px tabular.

## 5. Layout Principles

- App shell 1280px max, 24px gutter. Content may sit at 1120px inside the shell.
- 4px base. 4 / 8 / 12 / 16 / 24 / 32 / 48 / 96.
- Sidebar persistent at 240px, content right of it.
- Nav order: Overview · Matches · Standings · Stats · Teams · Players · Venues.

## 6. Depth & Elevation

Flat. Depth from cream tone shifts and 1px borders. Modals only use shadow: `0 12px 32px rgba(42, 41, 36, 0.10)`. No card lift, no neumorphism, no glass.

## 7. Do's and Don'ts

**Do**
- Tabular figures everywhere a score or rate appears.
- Pair green CTA with a tonal cream secondary, never two saturated buttons.
- Let cream do the lifting between sections; resist boxing every group.
- Loading / empty / error states that keep layout height.

**Don't**
- Use crypto-startup gradients, neon, or fake LIVE.
- Set score tables in proportional figures.
- Introduce a second saturated accent for “highlight” tiles — use `--warning` only for MOTM / champion chips, not page chrome.
- Add card shadows to dashboard tiles.
- Dark navy shells, purple gradients, stadium photography.

## 8. Responsive Behavior

- Sidebar collapses to icon rail at 1024px, hidden behind a 44px menu control below 768px.
- Tables become stacked KV cards below 640px, scores kept in 22px tabular.
- Floor: 360px. No horizontal page scroll.

## 9. Motion

120ms color/opacity only. `prefers-reduced-motion: reduce` → 0ms. No count-up scores.

## 10. Agent Prompt Guide

Bias: cream background, warm-gray ink, single field-green accent, full-pill buttons, tabular numerals on every score surface, hairline tables, persistent left sidebar, editorial vertical rhythm.

Reject: pure-white SaaS canvas, indigo leftover from Mercury, multiple saturated accents, drop-shadowed cards, proportional figures on scores, gradient hero treatments, glass-morphism over cricket data.
