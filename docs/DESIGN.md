# Aiko — paper editorial (IPL 2022)

Cream sheet, warm ink, one field-green action. A broadsheet for scores, not a live-score toy and not a SaaS dashboard.

Mood: unhurried, trustworthy, dense where the numbers live. Product name: **Aiko**. Independent IPL 2022 analytics.

## 1. Atmosphere

The page is paper. Cream canvas, quiet surfaces, hairline rules. Information density from a results page; tone from a financial broadsheet. Team colours never fill a section — logo or nothing.

## 2. Color

```
--bg-primary:      #f1eee6   /* page paper */
--bg-secondary:    #e6e1d4   /* lift, date rules */
--bg-tertiary:     #d4cebe   /* secondary fill */
--surface:         #faf8f3   /* raised sheet */
--text-primary:    #1c1914   /* ink */
--text-secondary:  #5c564a
--text-muted:      #8a8376
--brand:           #1a5c38   /* field green, CTA + active link */
--brand-hover:     #14492c
--border:          #d4cebe
--border-strong:   #b8b09c
--success:         #2f7d57
--warning:         #c98a42   /* MOTM / champion chips only */
--danger:          #b54a3a
```

Field green is the only saturated action colour. Warm greys do the rest.

## 3. Type

- **Display:** Newsreader, 400. Tracking −0.02em. Headings only.
- **Body + UI:** Source Sans 3, 400/500. Line-height 1.5. Measure leave for long copy; this app is mostly UI.
- **Scores / overs / IDs:** IBM Plex Mono, tabular figures. Never proportional figures on stats.

Scale: 13 / 14 / 16 / 18 / 22 / 28 / 36 / 48.

Mobile inputs: 16px minimum.

## 4. Components

**Buttons**
- Primary: accent fill, white, pill, padding 10/20, weight 500. Press: scale 0.97, 120ms.
- Secondary: tertiary fill, ink, pill. Hover: stronger border.
- Ghost: ink, accent on hover.
- One primary per region. Hit 44px on mobile.

**Match rows**
- One card for every match. Hairline between rows. Latest match gets a subtle paper background.
- Newest first, then the previous game, and so on.
- Date is a heading on the card. Winner name medium ink; loser secondary. Result in secondary ink. Infinite scroll. After ~48px, a back-to-top control.

**Inputs**
- Pill, 1px border. Focus: 2px accent ring, 2px offset.

## 5. Layout

- Sticky bar is full-bleed. Aiko + links and page body share max-width 1280px, 24px gutter.
- 4px base: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 96.
- Top nav: Aiko (wordmark, no underline) · Matches (`/`) · Standings · Stats · Teams · Players · Venues.
- Active link: field green, wider hit (`px-5`, 44px). Colour only — no underline.
- Sticky nav is full width. At rest it is quiet (no rule). After ~48px scroll it shows a paper fill and a hairline under-rule.

## 6. Depth

Flat. Tone shift and 1px borders. Modal only: `0 12px 32px rgba(28, 25, 20, 0.10)`. No card shadow, no glass.

## 7. Do / Don't

**Do**
- Tabular figures on every score.
- Green CTA with cream secondary — never two saturated buttons.
- Let paper separate groups.

**Don't**
- Gradients, neon, fake LIVE, dark navy, stadium photography.
- Uppercase eyebrows over headings.
- 4px accent bars on list rows.
- Proportional figures on scores.

## 8. Responsive

- Below 768px: 44px menu, links in a sheet.
- Floor 360px. `overflow-x: clip` on html/body. No page-level horizontal scroll.

## 9. Motion

120ms colour, opacity, and press-scale only. `ease-out`. Lenis handles document scroll; skip it when `prefers-reduced-motion` is enabled. `prefers-reduced-motion: reduce` → 0ms. No count-up scores. Sticky chrome: opacity only.

## 10. Agent guide

Bias: cream paper, Newsreader headings, Source Sans 3 UI, IBM Plex Mono scores, one field green, contained sticky masthead, hairline match list.

Reject: Inter-as-display, pill-filled nav as the only active state, boxed card grids for fixtures, indigo, glass.
