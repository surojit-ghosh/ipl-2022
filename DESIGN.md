# Aiko — Design System
### IPL Cricket Data & Analytics Platform

> A visual and token reference for engineering. Save as `DESIGN.md` in the repo root.

---

## 0. Reference Analysis

Three references were used to triangulate the direction:

| Reference | What it contributes | What we leave behind |
|---|---|---|
| **Sportsbook dashboard** (odds grid) | Near-black surfaces with a single hot accent cutting through; live-state dots; photography darkened under a gradient so team crests stay legible; dense but evenly-gridded match tiles | The red-as-everything accent (odds, CTAs, logo, live tag all fighting for the same color) — we split identity color from semantic color |
| **Esports stat profile** (tracker.gg-style) | Left-edge accent bars on stat tiles; a percentile-colored ring for win/loss; orange as a "premium/CTA" color kept separate from data color; side-specific (CT/T) color coding | The ad-banner clutter and the orange-for-everything CTA sprawl — we reserve gold for exactly two jobs: boundaries and premium actions |
| **Mobile score ticker** | Extreme legibility at small size: bold white numerals on near-black, minimal chrome, crest + score + status pill only | The lack of any secondary hierarchy — a full analytics platform needs more layers than a ticker does |

Synthesis: a **floodlit stadium at night**, not a generic "dark SaaS dashboard." The base is a cool near-black with a faint blue-green undertone (turf-under-floodlight, not photography-black). One electric accent — cyan — stands in for the Hawk-Eye/ball-tracking layer of the product (lines, active states, links, focus). A second, warmer accent — a trophy gold — is reserved almost exclusively for boundaries (sixes) and the one primary call-to-action per screen. Everything else stays quiet: slate surfaces, hairline borders, restrained type.

---

## 1. Design Philosophy & Brand Identity

**Aesthetic summary:** *Floodlit Precision* — futuristic sports telemetry meets high-end editorial analytics. The product should feel like a broadcast graphics engine (Hawk-Eye, CrickViz) crossed with a Linear/Vercel-grade dashboard: technical, fast, confident, never decorative for its own sake.

**Core principles**

1. **Data density with breathing room.** Cricket generates enormous granularity (ball-by-ball, over-by-over, phase-by-phase). Density is the point — but every table gets generous row height, hairline dividers instead of heavy grid-lines, and one consistent gutter so density doesn't read as clutter.
2. **Floodlit contrast, not flat black.** The base surface is never pure `#000`. It carries a faint cool undertone so accent colors glow rather than sit on dead black.
3. **One accent does the talking.** Hawk-Eye Cyan is the only color used for interactive/informational emphasis (links, active tabs, focus rings, primary data lines). Trophy Gold is reserved for boundaries and the single primary CTA. Team colors are identity, never decoration — they appear on crests, jersey chips, and head-to-head headers, and nowhere else.
4. **Color carries meaning, not mood.** Every non-neutral color on screen answers "what does this represent" (a wicket, a six, an economy band, a team) — never "what looks nice here."
5. **Structure encodes information.** Borders, left-edge accent bars, rank rings, and progression bars all describe the data (rank, side, phase) rather than decorate the layout.
6. **Motion answers action.** Numbers count up once, on first reveal, when a match state changes — not on every scroll tick. Hover states respond to the cursor; nothing animates just to prove it can.

---

## 2. Color Palette & Token System

All values below were derived directly from hex (single source of truth) so hex/HSL/OKLCH stay mathematically consistent — no hand-eyeballed conversions.

### 2.1 Color Palette & Token System — "Night Match" (Single Theme)

Aiko is purpose-built with a single, dedicated dark mode (*Floodlit Precision*). Light mode has been deliberately omitted to keep the telemetry and stadium floodlight aesthetic focused and uncompromising.

**Backgrounds & surfaces**

| Token | Hex | HSL | OKLCH | Usage |
|---|---|---|---|---|
| `--bg-base` | `#0A0D12` | `hsl(218 29% 5%)` | `oklch(15.8% 0.012 260.6)` | App shell background |
| `--bg-surface` | `#12161F` | `hsl(222 27% 10%)` | `oklch(20.0% 0.019 266.0)` | Cards, table rows, panels |
| `--bg-surface-hover` | `#171C27` | `hsl(221 26% 12%)` | `oklch(22.7% 0.023 265.6)` | Row/card hover |
| `--bg-elevated` | `#1A2029` | `hsl(216 22% 13%)` | `oklch(24.2% 0.019 258.4)` | Popovers, modals, dropdowns |
| `--border-subtle` | `rgba(255,255,255,0.06)` | — | — | Default dividers, card outlines |
| `--border-strong` | `#2E3646` | `hsl(220 21% 23%)` | `oklch(33.2% 0.030 264.0)` | Emphasized borders, input outlines |
| `--border-active` | `rgba(44,224,255,0.35)` | — | — | Focused/active element border (cyan-tinted) |

**Text**

| Token | Hex | HSL | OKLCH | Usage |
|---|---|---|---|---|
| `--text-primary` | `#F3F5F8` | `hsl(216 26% 96%)` | `oklch(96.9% 0.005 258.3)` | Headings, primary numerals |
| `--text-secondary` | `#A7B0C0` | `hsl(218 17% 70%)` | `oklch(75.5% 0.025 262.1)` | Labels, secondary copy |
| `--text-tertiary` | `#6B7280` | `hsl(220 9% 46%)` | `oklch(55.1% 0.023 264.4)` | Disabled, timestamps, placeholder |

**Primary & secondary accent**

| Token | Hex | HSL | OKLCH | Usage |
|---|---|---|---|---|
| `--accent-primary` (Hawk-Eye Cyan) | `#2CE0FF` | `hsl(189 100% 59%)` | `oklch(83.6% 0.139 213.1)` | Links, active nav/tab, focus ring, primary chart line, "live" tracking elements |
| `--accent-primary-hover` | `#17B8D9` | `hsl(190 81% 47%)` | `oklch(72.3% 0.126 217.3)` | Hover/pressed state of the above |
| `--accent-secondary` (Trophy Gold) | `#F2B84B` | `hsl(39 87% 62%)` | `oklch(81.7% 0.140 80.1)` | Primary CTA button, six-run chip, rank #1 badge |
| `--accent-secondary-hover` | `#D89B2E` | `hsl(38 69% 51%)` | `oklch(73.1% 0.138 77.0)` | Hover/pressed state of the above |

> Rule of two: if a screen needs a third "bright" color for anything other than a team crest or a semantic data chip, that's a sign the layout needs simplifying, not a third accent.

### 2.2 IPL Team Accent Palette

Tuned as a *matched set* for dark backgrounds — kept inside a similar chroma/lightness band (~roughly OKLCH L 55–85%) so all ten sit together on a head-to-head screen without one team visually "winning" by being brighter than the rest. Each team also gets one muted trim color for jersey-stripe details, badges, and gradients — never used as the primary identifier.

| Team | Primary | Hex | HSL | OKLCH | Trim (secondary) |
|---|---|---|---|---|---|
| Chennai Super Kings (CSK) | Whistle Gold | `#F2C230` | `hsl(45 88% 57%)` | `oklch(83.4% 0.158 89.0)` | — |
| Mumbai Indians (MI) | Electric Cobalt | `#2C6BFF` | `hsl(222 100% 59%)` | `oklch(58.0% 0.230 263.4)` | — |
| Royal Challengers Bengaluru (RCB) | Crimson | `#E6283C` | `hsl(354 79% 53%)` | `oklch(59.9% 0.221 22.6)` | Gold `#C7A252` |
| Kolkata Knight Riders (KKR) | Knight Violet | `#8B5CF6` | `hsl(258 90% 66%)` | `oklch(60.6% 0.219 292.7)` | Gold `#B99447` |
| Sunrisers Hyderabad (SRH) | Sunburst Orange | `#FF7A29` | `hsl(23 100% 58%)` | `oklch(72.4% 0.184 47.0)` | — |
| Delhi Capitals (DC) | Capitals Blue | `#2F6FED` | `hsl(220 84% 56%)` | `oklch(57.4% 0.202 262.0)` | Red `#EF4444` |
| Punjab Kings (PBKS) | Regal Red | `#E63946` | `hsl(355 78% 56%)` | `oklch(61.2% 0.208 22.2)` | — |
| Rajasthan Royals (RR) | Royal Pink | `#F72585` | `hsl(333 93% 56%)` | `oklch(64.3% 0.244 0.7)` | Navy `#1B2133` |
| Gujarat Titans (GT) | Titan Teal | `#0E7C66` | `hsl(168 80% 27%)` | `oklch(52.5% 0.097 174.1)` | Gold `#B99658` |
| Lucknow Super Giants (LSG) | Super Turquoise | `#17B8CE` | `hsl(187 80% 45%)` | `oklch(71.8% 0.121 210.2)` | Orange `#FF6B35` |

**Why these, not the raw brand hexes:** several real broadcast colors (Titans navy, Royals' deep pink-on-maroon) are too dark or too saturated to read as a *swatch* on a `#0A0D12` background — they'd disappear or vibrate. Each was re-balanced in lightness/chroma while keeping enough hue fidelity that a fan still reads "that's CSK yellow."

**Guardrail:** team colors are identity-only. Never reuse a team's primary as a semantic signal (e.g., don't let MI's blue double as "four runs" in the same screen — see §2.3 for the dedicated semantic set).

### 2.3 Data Visualization & Semantic Colors

Ball-by-ball, economy, and win/loss all need their own fixed vocabulary, independent of team colors.

| Token | Meaning | Hex | HSL | OKLCH |
|---|---|---|---|---|
| `--data-dot` | Dot ball | `#3A4150` (outline only, no fill) | `hsl(220 15% 27%)` | — |
| `--data-runs` | 1–3 runs | `#5B7CB0` (muted, low-emphasis) | `hsl(213 34% 52%)` | — |
| `--data-four` | Boundary (4) | `#3D7EFF` | `hsl(220 100% 62%)` | `oklch(62.2% 0.204 262.2)` |
| `--data-six` | Six | `#F5C451` | `hsl(42 89% 64%)` | `oklch(84.3% 0.141 85.5)` |
| `--data-wicket` | Wicket | `#FF4757` | `hsl(355 100% 64%)` | `oklch(66.9% 0.219 20.9)` |
| `--data-extras` | Wide / No-ball | `#FF8A3D` | `hsl(24 100% 62%)` | `oklch(75.0% 0.167 50.5)` |
| `--data-byes` | Bye / Leg-bye | `#14B8A6` | `hsl(173 80% 40%)` | `oklch(70.4% 0.123 182.5)` |
| `--semantic-success` | Win / top-percentile stat | `#22C55E` | `hsl(142 71% 45%)` | `oklch(72.3% 0.192 149.6)` |
| `--semantic-negative` | Loss / bottom-percentile stat | `#F04438` | `hsl(4 86% 58%)` | `oklch(63.7% 0.210 28.5)` |
| `--semantic-warning` | Generic alert / caution | `#FBBF24` | `hsl(43 96% 56%)` | `oklch(83.7% 0.164 84.4)` |

Notice `--data-six` and `--data-wicket` intentionally sit close to `--accent-secondary` and `--semantic-negative` respectively — a six *should* feel like a small trophy moment, a wicket *should* feel like the same "bad for the batting side" red as a loss. That's the narrative logic, not a coincidence.

**Economy-rate heatmap** (bowling figures table): reuse the three-band traffic-light set already defined, don't invent new hues —

- Elite (< 6.00 RPO) → `--semantic-success`
- Par (6.00–8.50 RPO) → `--semantic-warning`
- Expensive (> 8.50 RPO) → `--semantic-negative`

**Run-rate comparison charts** (worm graphs, required-vs-current): don't hardcode colors — pull from the two competing teams' entries in §2.2. Generic (non-team) run-rate lines (e.g., a single team's required-rate projection) use `--accent-primary` solid for *current run rate* and `--accent-secondary` dashed for *required run rate*, with a 6%-opacity fill of `--accent-primary` for the "par" band.

---

## 3. Tailwind CSS v4 & CSS Variables Integration

Tailwind v4 reads design tokens straight out of an `@theme` block, and shadcn/ui expects the `background` / `foreground` / `card` / `primary` naming convention — the block below satisfies both, then layers the cricket-specific tokens on top as first-class Tailwind colors (so `bg-wicket`, `text-team-csk`, `border-accent` etc. all work out of the box).

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* ---- Fonts ---- */
  --font-display: "Space Grotesk", "Manrope", sans-serif;
  --font-hero: "Big Shoulders Display", "Space Grotesk", sans-serif;
  --font-sans: "Manrope", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "SFMono-Regular", monospace;

  /* ---- Radius ---- */
  --radius-sm: 0.375rem;
  --radius-md: 0.625rem;
  --radius-lg: 0.875rem;
  --radius-xl: 1.25rem;

  /* ---- Cricket semantic colors (theme-invariant hues, shadcn-style vars below) ---- */
  --color-wicket: var(--data-wicket);
  --color-four: var(--data-four);
  --color-six: var(--data-six);
  --color-extras: var(--data-extras);
  --color-byes: var(--data-byes);
  --color-dot: var(--data-dot);
  --color-runs: var(--data-runs);

  /* ---- IPL team colors (static across themes) ---- */
  --color-team-csk: #F2C230;
  --color-team-mi: #2C6BFF;
  --color-team-rcb: #E6283C;
  --color-team-rcb-trim: #C7A252;
  --color-team-kkr: #8B5CF6;
  --color-team-kkr-trim: #B99447;
  --color-team-srh: #FF7A29;
  --color-team-dc: #2F6FED;
  --color-team-dc-trim: #EF4444;
  --color-team-pbks: #E63946;
  --color-team-rr: #F72585;
  --color-team-rr-trim: #1B2133;
  --color-team-gt: #0E7C66;
  --color-team-gt-trim: #B99658;
  --color-team-lsg: #17B8CE;
  --color-team-lsg-trim: #FF6B35;

  /* ---- shadcn/ui bridge (reads the CSS custom properties set per-theme below) ---- */
  --color-background: var(--bg-base);
  --color-foreground: var(--text-primary);
  --color-card: var(--bg-surface);
  --color-card-foreground: var(--text-primary);
  --color-popover: var(--bg-elevated);
  --color-popover-foreground: var(--text-primary);
  --color-primary: var(--accent-primary);
  --color-primary-foreground: var(--bg-base);
  --color-secondary: var(--accent-secondary);
  --color-secondary-foreground: var(--bg-base);
  --color-muted: var(--bg-surface-hover);
  --color-muted-foreground: var(--text-secondary);
  --color-accent: var(--accent-primary);
  --color-accent-foreground: var(--bg-base);
  --color-destructive: var(--semantic-negative);
  --color-destructive-foreground: var(--text-primary);
  --color-border: var(--border-subtle);
  --color-input: var(--border-strong);
  --color-ring: var(--accent-primary);

  --color-chart-1: var(--accent-primary);
  --color-chart-2: var(--accent-secondary);
  --color-chart-3: var(--semantic-success);
  --color-chart-4: var(--semantic-negative);
  --color-chart-5: var(--data-byes);
}

/* ---- Theme: Dark Mode ("Night Match" - Single Mode) ---- */
:root {
  --bg-base: #0A0D12;
  --bg-surface: #12161F;
  --bg-surface-hover: #171C27;
  --bg-elevated: #1A2029;
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-strong: #2E3646;
  --border-active: rgba(44, 224, 255, 0.35);

  --text-primary: #F3F5F8;
  --text-secondary: #A7B0C0;
  --text-tertiary: #6B7280;

  --accent-primary: #2CE0FF;
  --accent-primary-hover: #17B8D9;
  --accent-secondary: #F2B84B;
  --accent-secondary-hover: #D89B2E;

  --data-dot: #3A4150;
  --data-runs: #5B7CB0;
  --data-four: #3D7EFF;
  --data-six: #F5C451;
  --data-wicket: #FF4757;
  --data-extras: #FF8A3D;
  --data-byes: #14B8A6;

  --semantic-success: #22C55E;
  --semantic-negative: #F04438;
  --semantic-warning: #FBBF24;

  color-scheme: dark;
}
```

---

## 4. Typography Hierarchy

| Role | Typeface | Source | Why |
|---|---|---|---|
| **Display / Headings** | **Space Grotesk** | Google Fonts (variable, wt 300–700) | Geometric with a technical, slightly industrial personality — reads as "data tooling," not "marketing site." Distinct enough from body copy without needing a second unrelated family. |
| **Hero numerals** (big scoreboard totals, top-of-page stat) | **Big Shoulders Display** | Google Fonts (variable, wt 100–900, condensed) | Purpose-built condensed display face (originally for scoreboard/signage use) — used sparingly, only for the single largest number on a screen (e.g., match total, a player's headline stat). |
| **Body / UI copy** | **Manrope** | Google Fonts (variable, wt 200–800) | Humanist-geometric, excellent at 13–15px, calmer than Space Grotesk so paragraphs and table labels don't compete with headings. |
| **Tabular / Monospace** | **JetBrains Mono** | Google Fonts (variable, wt 100–800) | Real tabular figures, unambiguous 1/l/I and 0/O — essential for scorecards, overs (e.g. `18.4`), strike rates (`147.36`), economy (`7.20`). Shares a technical lineage with Space Grotesk, reinforcing the telemetry feel. |

**Type scale**

| Token | Size / Line-height | Tracking | Weight | Face | Use |
|---|---|---|---|---|---|
| `hero` | 96px / 0.95 | -0.02em | 700 | Big Shoulders Display | Match total, headline player stat |
| `display-1` | 48px / 1.1 | -0.01em | 600 | Space Grotesk | Page/section titles |
| `display-2` | 36px / 1.15 | -0.01em | 600 | Space Grotesk | Card feature headings |
| `h3` | 28px / 1.2 | 0 | 600 | Space Grotesk | Subsection headings |
| `h4` | 22px / 1.3 | 0 | 500 | Space Grotesk | Widget titles |
| `h5` | 18px / 1.4 | 0 | 500 | Manrope | Table section headers |
| `body-lg` | 16px / 1.5 | 0 | 400 | Manrope | Primary reading copy |
| `body` | 14px / 1.5 | 0 | 400 | Manrope | Default UI copy |
| `caption` | 12px / 1.4 | 0.01em | 500 | Manrope | Field labels, timestamps |
| `data-lg` | 20px / 1.2 | 0 | 600 | JetBrains Mono | Featured stat values |
| `data` | 14px / 1.4 | 0 | 500 | JetBrains Mono | Table figures, over counts |
| `data-sm` | 12px / 1.3 | 0.01em | 500 | JetBrains Mono | Dense inline figures (ball-by-ball) |

**Rules of use**

- Never set body copy in Space Grotesk past ~20px of running text — it's a display face, not a reading face.
- Any number that will be compared row-to-row (a table column, a leaderboard) must use `--font-mono`, full stop — this is what keeps digits aligned and scannable at density.
- Reserve `hero`/Big Shoulders Display for exactly one element per screen. If two things feel like they both "need" it, that's a hierarchy problem, not a font problem.

---

## 5. Component Style Guide & Micro-Interactions

### 5.1 Stat Cards & Metric Tiles

- **Structure:** `--bg-surface` fill, 1px `--border-subtle` outline, `--radius-lg` corners, 20–24px internal padding. A 3px accent bar on the left edge (using the relevant semantic or team color) tells you *what kind* of stat this is before you've read the label — mirrors the left-edge-bar pattern from the esports reference.
- **Hover:** background steps to `--bg-surface-hover`; border shifts to a 12%-opacity tint of the tile's own accent color (not a generic glow) — `box-shadow: 0 0 0 1px var(--border-active), 0 8px 24px -12px rgba(44,224,255,0.25)` for cyan-keyed tiles.
- **Backdrop blur** is reserved for anything that floats over content — popovers, the "compare players" tray, sticky filter bars — `backdrop-filter: blur(12px)` over `rgba(10,13,18,0.72)`. Never blur a static in-flow card; blur signals "this is temporarily overlapping something."
- **Featured/hero tiles only:** a barely-there radial gradient mesh behind the number, `--accent-primary` at 6% opacity fading to transparent, evoking a floodlight glow without becoming decoration.

### 5.2 Match Scorecards & Timeline Bars

- **Innings progression bar:** a segmented horizontal stacked bar, one segment per over, height 32px, segment width proportional to runs scored that over (min-width floor so a maiden over is still visible). A thin white tick mark denotes a wicket falling within that over's segment.
- **Ball-by-ball chips:** 28px circles in a horizontal scroll rail.
  - Dot ball → hollow circle, `--data-dot` outline, no fill, no label
  - 1/2/3 → filled `--data-runs` at 70% opacity, white numeral
  - Four → filled `--data-four`, white "4"
  - Six → filled `--data-six`, `--bg-base`-colored "6" (dark text on light gold reads better than white)
  - Wicket → filled `--data-wicket`, white "W"
  - Wide/No-ball → filled `--data-extras`, white "wd"/"nb"
  - Bye/Leg-bye → filled `--data-byes`, white "b"/"lb"
- **Phase markers** (Powerplay / Middle / Death) sit as small `caption`-styled labels above the progression bar, not inside it — keeps the bar itself reading purely as runs+wickets.

### 5.3 Leaderboards & Tables

- **Sticky header:** `--bg-elevated` with `backdrop-filter: blur(8px)`, 1px `--border-subtle` bottom edge, pins on scroll within the table's own scroll container (not the page).
- **Row dividers:** hairline `--border-subtle` between rows, **not zebra striping** — zebra fights with the left-edge accent bars and team-color chips already carrying visual weight; a dense table stays calmer with dividers + hover-only emphasis. (Provide a "compact/zebra" density toggle as a power-user option, off by default.)
- **Row hover:** background to `--bg-surface-hover`; row gains a 2px left accent bar in the relevant team/semantic color if one applies (e.g., hovering a bowler row from the fielding side tints in that team's color).
- **Rank badges:** circular, 24px.
  - Rank 1 → `--accent-secondary` fill (Trophy Gold), `--bg-base` numeral
  - Rank 2 → `#B8C0CC` fill, `--bg-base` numeral
  - Rank 3 → `#C08552` fill, `--bg-base` numeral
  - Rank 4+ → transparent, `--border-strong` outline, `--text-secondary` numeral in `--font-mono`

### 5.4 Motion & Scrolling (Lenis + micro-interactions)

- **Lenis config:** `lerp: 0.1`, `duration: 1.1s` — enough smoothing to feel premium without introducing input lag on a data-heavy page where people scroll to *scan*, not to enjoy the ride.
- **Easing:** standard interaction easing is `cubic-bezier(0.16, 1, 0.3, 1)` ("ease-out-expo") for anything that appears or expands (dropdowns, expanding rows, modal entry) — fast start, soft landing, no bounce.
- **One orchestrated moment per page:** the hero score/summary block runs a single reveal sequence on first load (staggered by ~60ms per element, 400ms total). Nothing else fades-and-slides-up on scroll — per-card scroll reveals are the generic tell to avoid, and on a stats-dense page they actively slow down scanning.
- **Count-up numbers:** any headline stat (hero total, a player's strike rate on their profile) counts up from 0 exactly once, on first mount/view — 700–900ms, ease-out-expo, formatted with the final decimal precision from frame one (don't animate decimal places in/out).
- **Card tilt:** reserved for the handful of *featured* cards (e.g., "Player of the Match," a hero team-comparison card) — mouse-tracked 3D tilt, max 4–6°, `perspective(800px)`, spring back to flat on mouse-leave over 300ms. Not applied to ordinary stat tiles or table rows; if every card tilts, none of them feel special.
- **Live match states:** a small pulsing dot (`--semantic-success`, 1.6s ease-in-out opacity loop) marks a live match — the only continuously-looping animation permitted anywhere in the system.
- **Respect `prefers-reduced-motion`:** disable count-up (render final value immediately), tilt, and the hero reveal stagger; keep instant color/opacity state changes only.

---

## Appendix: Quick Reference

```
Backgrounds  bg-base → bg-surface → bg-surface-hover → bg-elevated   (darkest → lightest)
Accents      accent-primary = Hawk-Eye Cyan   (interactive/info, use everywhere)
             accent-secondary = Trophy Gold   (CTA + six-run chip ONLY)
Semantics    success/negative/warning         (win-loss, percentiles, economy bands)
Ball events  dot / runs / four / six / wicket / extras / byes   (fixed vocabulary, never reused as UI color)
Teams        10 dark-mode-balanced hues, identity only, never semantic
Type         Space Grotesk (headings) · Big Shoulders Display (hero numerals, sparingly)
             Manrope (body/UI) · JetBrains Mono (every comparable number)
```
