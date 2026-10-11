---
name: CLIF Foundation
description: Clinical open-infrastructure site — cool ink neutrals, petrol links, mint fills; Funnel + Spline Mono; hairline data panels.
colors:
  ink-950: "#0E1111"
  ink-900: "#1A1F1D"
  ink-800: "#2A2F2C"
  ink-750: "#3D423E"
  ink-600: "#555B55"
  ink-400: "#9AA19B"
  ink-300: "#C4C9C3"
  ink-200: "#CDD1CA"
  ink-150: "#DFE2DC"
  ink-100: "#EAECE7"
  ink-50: "#F5F6F3"
  ink-0: "#FFFFFF"
  signal-100: "#DCEFE6"
  signal-300: "#B9E3D0"
  signal-400: "#3A9B78"
  signal-500: "#2E8B6A"
  signal-700: "#12495E"
  signal-800: "#0D3B4C"
  bg-page: "#F5F6F3"
  bg-panel: "#EAECE7"
  bg-figure: "#FFFFFF"
  text-primary: "#0E1111"
  text-body: "#3D423E"
  text-muted: "#555B55"
  link: "#12495E"
  accent-fill: "#3A9B78"
  action-primary-bg: "#0E1111"
  action-primary-fg: "#F5F6F3"
  status-error: "#B42318"
  crimson-logo: "#841839"
typography:
  display-xl:
    fontFamily: "Funnel Display, Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(40px, 6.4vw, 88px)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  display-l:
    fontFamily: "Funnel Display, Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(38px, 5.6vw, 76px)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.035em"
  display-m:
    fontFamily: "Funnel Display, Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(28px, 3.2vw, 42px)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Funnel Display, Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(30px, 3.6vw, 48px)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  h3:
    fontFamily: "Funnel Display, Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(26px, 2.8vw, 36px)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.025em"
  h4:
    fontFamily: "Funnel Display, Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(24px, 2.4vw, 32px)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "normal"
  lead:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(17px, 1.5vw, 20px)"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  lead-lg:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(18px, 1.6vw, 21px)"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  body:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  small:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  ui:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "normal"
  label:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "0.01em"
  mono:
    fontFamily: "Spline Sans Mono, ui-monospace, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0.02em"
  mono-s:
    fontFamily: "Spline Sans Mono, ui-monospace, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0.02em"
  mono-xs:
    fontFamily: "Spline Sans Mono, ui-monospace, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  tag: "2px"
  control: "3px"
  panel: "6px"
spacing:
  "4": "4px"
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "24": "24px"
  "32": "32px"
  "48": "48px"
  "72": "72px"
  "120": "120px"
  gutter: "clamp(16px, 4vw, 56px)"
  section-y: "clamp(72px, 9vw, 120px)"
  measure: "680px"
  content-max: "1424px"
components:
  button-primary:
    backgroundColor: "{colors.action-primary-bg}"
    textColor: "{colors.action-primary-fg}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.signal-700}"
    textColor: "{colors.action-primary-fg}"
    rounded: "{rounded.control}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
    height: "48px"
  tag-existing:
    backgroundColor: "{colors.ink-950}"
    textColor: "{colors.ink-50}"
    rounded: "{rounded.tag}"
    padding: "2px 8px"
  data-panel:
    backgroundColor: "{colors.bg-figure}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.panel}"
    padding: "0"
---

# Design System: CLIF Foundation

## Overview

**Creative North Star: "The Clinical Lab Notebook"**

A cool, clinical public face for open ICU data infrastructure: paper-white grounds, near-black ink type, petrol for links and eyebrows, mint reserved for fills and dark-ground actions. The system feels like a carefully typeset research artifact — hairline rules, numbered sections, and a recurring data-panel motif — not a SaaS marketing kit.

Source of truth: `design/tokens/*` (mirrored in `src/styles/*`). Agents must preserve this incumbent world; do not replace it with generic Impeccable aesthetics, cream/serif “editorial” defaults, purple gradients, or glassmorphism.

**Key Characteristics:**
- Ink + petrol + mint only (crimson is logo/Consortium credit, never Foundation UI chrome)
- Funnel Display headlines, Funnel Sans UI/body, Spline Sans Mono for technical ids
- Hairline lists over cards; square-ish radii; no product shadows; no gradients
- DataPanel as the signature motif; illustrative schematics always labeled

## Colors

Cool green-gray ink scale with one accent family (jade → petrol). Light mode is the default public face; dark mode is a token swap, not a second design.

### Primary
- **Ink 950** (`#0E1111`): Primary text and primary action fill on light grounds.
- **Petrol 700** (`#12495E`): Links, eyebrows, action hover on light; accent-text role in light mode.
- **Mint 400** (`#3A9B78`): Fill-only accent on light (highlights, current state); becomes link/action color on ink grounds / dark mode.

### Neutral
- **Page** (`#F5F6F3` / `--ink-50`), **Panel** (`#EAECE7` / `--ink-100`), **Figure** (`#FFFFFF`)
- Body `#3D423E`, muted `#555B55`, borders `#CDD1CA` / `#DFE2DC`

### Named Rules
**The Petrol-on-Light Rule.** Green (`--accent` / mint) is never text on light grounds; use petrol (`--signal-700`) for links and eyebrows.

**The Crimson Ban.** Consortium crimson (`#841839`) never appears in Foundation UI. Logo stays one-color ink (light) or white (dark).

**The Flat Ground Rule.** No gradients, no photography collages, no decorative glow. Depth comes from panel bands and 1px ink rules.

## Typography

**Display Font:** Funnel Display 600 (tight negative tracking)
**Body Font:** Funnel Sans (UI, nav, eyebrows 500, body 400)
**Label/Mono Font:** Spline Sans Mono — technical labels only

**Character:** Clinical and precise. Display is heavy and tight; body is calm 17/1.6; mono marks machine vocabulary, never sentences.

### Hierarchy
- **Display XL** (600, `clamp(40px, 6.4vw, 88px)`, lh 0.98, tracking −0.035em): Home hero.
- **Display L** (600, `clamp(38px, 5.6vw, 76px)`): Inner-page display headlines.
- **Display M** (600, `clamp(28px, 3.2vw, 42px)`): Band / callout display titles.
- **Headline / H2** (600, `clamp(30px, 3.6vw, 48px)`): Section titles.
- **H3** (600, `clamp(26px, 2.8vw, 36px)`): Subsection titles.
- **H4** (600, `clamp(24px, 2.4vw, 32px)`): Panel / form titles.
- **Title** (500, 20px): Card/list titles.
- **Lead** (400, `clamp(17px, 1.5vw, 20px)`): Supporting intro sentences.
- **Lead LG** (400, `clamp(18px, 1.6vw, 21px)`): Mission / long-form lead.
- **Body** (400, 17px, measure 680px): Reading text.
- **Small / UI** (400–500, 15px): Nav, secondary copy, control labels.
- **Label / Eyebrow** (500, 13px): Petrol eyebrows, section indexes (`NN — Label`, `NN / snake_case`).
- **Mono** (13px): Table/field names, snake_case ids.
- **Mono S / XS** (12–11px): Figure ticks and dense schematic metadata (illustrative panels only).

### Named Rules
**The Mono Sentence Rule.** If a string is a sentence, it is not mono. Mono is sentence case — never all caps.

## Layout

Max content width 1424px; reading measure 680px; gutters `clamp(16px, 4vw, 56px)`; section padding `clamp(72px, 9vw, 120px)`. Sticky header 72px with 1px bottom rule. Context bar above header: one positioning line + Consortium link. Below 1000px, nav collapses to Menu. Sections on home numbered `NN — Label`; inner pages open with `NN / snake_case` eyebrow + display headline.

## Elevation & Depth

Flat by design. No box-shadows in product UI. Depth = tonal panel bands (`--bg-panel`, `--bg-inverse`) and 1px ink borders. Focus is a 2px outline with 3px offset (ink on light, mint on ink grounds).

### Named Rules
**The No-Shadow Rule.** Never add drop shadows, glow, or layered card elevation to “polish” the system.

## Shapes

Square-ish geometry: tags 2px, controls 3px, panels 6px. Borders 1px; active nav bar 2px. Lists start with a 1px ink rule; rows divide with ink-200. No pill clusters, no rounded-full chips.

## Components

### Buttons
- **Shape:** 3px radius; primary height 48px; min touch 44px.
- **Primary:** Ink fill, light text; hover → petrol (`--signal-700`). Transition 120ms color only.
- **Secondary:** Transparent + 1px ink border; hover → panel fill. No press shrink.

### Tags
- **Existing / discussion:** Ink fill, light text.
- **Info:** Outline only.

### DataPanel (signature)
White figure, 1px ink frame, mono header row (`organization.record`, field paths). Schematics labeled “Illustrative schematic · not patient data”.

### Navigation
Context bar (inverse/panel band) → sticky header lockup + primary nav + Support CTA + theme toggle. Footer: lockup, short description, mono email, nav + Consortium ↗ + GitHub ↗.

### Filter chips / links
FilterChip for research filters; TextLink with underline-on-hover for list titles; external links append ↗.

## Do's and Don'ts

**Do**
- Port and extend tokens from `design/tokens/` / `src/styles/`.
- Keep sentence case; credit Consortium research.
- Use hairline lists and DataPanels instead of card grids.
- Respect reduced motion; keep color-only 120ms transitions.

**Don't**
- Replace Funnel/Spline with Inter, Roboto, or decorative serifs.
- Introduce purple gradients, cream “AI beige”, glassmorphism, glow, or emoji.
- Use mint as body/link text on light grounds.
- Put Consortium crimson in Foundation chrome.
- Add shadcn/card clutter, stat strips, or hero badge overlays.
