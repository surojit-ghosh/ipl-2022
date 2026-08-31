# Aiko - Sportsbook Pro Light (IPL 2022)

Light sportsbook interface for fast cricket scanning. Clean ice background, white market panels, green action, amber promo/highlight, red danger only.

Mood: betting desk in daylight, not dull paper and not heavy casino dark. Product name: **Aiko**. Independent IPL 2022 analytics with sportsbook-grade readability.

## 1. Atmosphere

The page is light and crisp. Cards feel like sportsbook market panels. Stats, scores, and rows should read at a glance under pressure. Use color as state, not decoration.

## 2. Color

```css
--bg-primary:      #f4f7fb   /* page shell */
--bg-secondary:    #e8eef6   /* nav, muted bands */
--bg-tertiary:     #dbe5f0   /* secondary fills */
--surface:         #ffffff   /* cards, popovers */
--surface-hover:   #eef4fb   /* hover and active surfaces */
--text-primary:    #08111f   /* main text */
--text-secondary:  #42526a
--text-muted:      #748198
--brand:           #16a34a   /* CTA, selected odds, active nav, win states */
--brand-hover:     #15803d
--promo:           #d97706   /* VIP, MOTM, special highlight only */
--border:          rgba(8,17,31,.10)
--border-strong:   rgba(8,17,31,.18)
--success:         #16a34a
--warning:         #d97706
--danger:          #dc2626   /* loss, destructive, negative movement */
```

Shadcn maps these through `src/app/globals.css`: `background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `ring`, and chart tokens.

## 3. Type

- **Display + UI:** Geist, 500-700. No serif headings.
- **Numbers / scores / odds:** Geist Mono, tabular figures.
- **Tracking:** 0. Avoid compressed display spacing for dense tables.

Scale: 13 / 14 / 16 / 18 / 22 / 28 / 36 / 48.

Mobile inputs: 16px minimum.

## 4. Components

**Buttons**
- Primary: `--brand` fill, white text, pill, 44px hit target. Use for primary action only.
- Secondary: `--bg-tertiary` fill, dark text, stronger border on hover.
- Ghost: dark text, green on hover.
- Destructive: `--danger` fill, white text.

**Cards / market panels**
- Background `--surface`, 1px `--border`, radius 10-12px.
- Hover can lift to `--surface-hover`; no heavy shadow.
- Selected/winner state uses green tint and green border, not full green panels.

**Tables and rows**
- Dense, tabular, stable. Headers use muted ice fill.
- Positive/win/up state: green. Negative/down/loss state: red. Promo/highlight: amber.
- Never use color-only communication when text/icon is needed for clarity.

**Inputs**
- White fill, 1px border. Focus ring: 2px green with readable offset.

## 5. Layout

- Sticky bar full-bleed; inner shell max-width 1280px, 24px gutter.
- 4px base: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 96.
- Top nav: Aiko, Matches, Standings, Stats, Teams, Players, Venues.
- Active link: green text. No underline needed.
- Header dock state: white card fill + subtle bottom border.

## 6. Depth

Mostly flat. Use surface contrast and borders. Modal/back-to-top can use `0 18px 60px rgba(8,17,31,.16)`. No glass unless a real sportsbook overlay needs it.

## 7. Do / Don't

**Do**
- Keep light sportsbook theme locked across the app.
- Use green for action/win/up states.
- Use red sparingly for danger/down/loss.
- Use amber only for promotions, awards, and standout match moments.
- Keep stats in mono with tabular figures.

**Don't**
- Bring back cream paper styling.
- Use serif display fonts.
- Add purple gradients, casino confetti, or fake live badges.
- Make every card glow.
- Mix multiple UI libraries; shadcn + Tailwind tokens remain the base.

## 8. Responsive

- Below 768px: 44px menu, links in a light sheet.
- Floor 360px. `overflow-x: clip` on html/body. No page-level horizontal scroll.
- Tables can scroll horizontally inside their own panel only.

## 9. Motion

120ms color, opacity, and press-scale. Lenis handles document scroll; skip it when `prefers-reduced-motion` is enabled. `prefers-reduced-motion: reduce` means 0ms. No count-up scores.

## 10. Agent Guide

Bias: light ice shell, white market panels, Geist UI, Geist Mono numbers, shadcn CSS variables, green action, amber promo, red danger, compact sportsbook panels.

Reject: paper editorial theme, Newsreader/Source Sans/IBM Plex stack, beige surfaces, dark-only design, broad casino ornament, untokenized colors.