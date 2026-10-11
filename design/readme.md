# CLIF Foundation Design System

Visual and content system for the **CLIF Foundation** website: a nonprofit that supports wider adoption of the Common Longitudinal ICU data Format (CLIF). The **CLIF Consortium** (clif-icu.com) conducts federated research; the Foundation supports adoption. The two share the CLIF symbol but have distinct identities.

## Sources
- CLIF Consortium site: https://clif-icu.com/ (content, publications, resources, logo files)
- Logo files (not copied — hot-linked): `https://clif-icu.com/images/logos/clif_logo_transparent_FINAL_cropped.png`, `…/clif_logo_white_email.png`
- Aesthetic reference: https://flora.ai/ (spacing, typography, compact controls)
- Final artifacts: `CLIF Foundation Site.dc.html` (six-page responsive prototype, light and dark), `CLIF Foundation Board Meeting 01.dc.html` (27-slide board deck)
- Decision record: palette chosen from four directions (lime, teal, navy, evergreen/amber) and refined to black ink + petrol + jade green; fonts Funnel Display, Funnel Sans, Spline Sans Mono; logo black on light, white on dark. Earlier explorations were removed from this package.

## Factual boundaries (must hold in every artifact)
- Programs, board directors, and officer roles are published as current. Do not label them “proposed”.
- Credit research to the CLIF Consortium and original investigators; link to the original source.
- Legal status (confirmed): Illinois nonprofit corporation, EIN issued, 501(c)(3) application pending. Say exactly that. Never claim tax-exempt status or deductibility until the IRS determination letter is posted.
- Do not invent biographies, partnerships, funding commitments, or impact statistics.
- Data schematics are simplified concepts for donors. For users of CLIF or mCIDE, link to clif-icu.com, which owns the specification and documentation; do not reproduce it.
- Giving is by inquiry to **info@clificufoundation.org** — no payment checkout.

## CONTENT FUNDAMENTALS
- Plain, factual, third person for the organization ("CLIF Foundation proposes to…"); "we/us" only in direct calls to act ("Email us to discuss a gift").
- Conditional voice for anything not yet real: "would support", "proposes to", "published when adopted".
- Sentence case everywhere, including buttons and headings. No exclamation points, no emoji.
- Short declarative headlines: "Open infrastructure for critical care data." "Data stays at each hospital. Code travels." "Giving starts with a conversation."
- CLIF vocabulary appears verbatim in mono: `respiratory_support`, `device_category`, `mCIDE`, `impl_support`.
- External destinations end with ↗. Calls to action name the outcome: "Email a gift inquiry", "Start with CLIF 101".

## VISUAL FOUNDATIONS
- **Color:** cool clinical white (`--ink-50`) page, ink (`--ink-950`) type and primary actions, one accent family: petrol (`--signal-700`, #12495E) for links, eyebrows and action hovers on light grounds; mint (`--signal-400`, #3A9B78) as a *fill* (highlighted intervals, current state) and as the action and link color on ink grounds. Green is never text on light grounds. Red of any kind is reserved for errors; the Consortium crimson never appears in Foundation UI. No gradients. No red/blue pairing. Data viz uses its own categorical set (ink, teal, amber, violet, gray).
- **Logo:** one-color ink logo on light, white on dark. The crimson original belongs to the Consortium and appears only where the Consortium is credited. Never recolor the logo petrol or mint. Black on white in light mode; white on ink in dark mode.
- **Type:** Funnel Display 600 for headlines (tight negative tracking); Funnel Sans for everything people read — body, UI, navigation, eyebrows (500 weight), section labels, the context bar. Spline Sans Mono is reserved for technical labels only: CLIF table and field names, snake_case ids, data panel headers, tick labels, figure metadata (“Illustrative schematic”), page numbers. If a string is a sentence, it is not mono. Mono is sentence case — never all caps.
- **Motif:** the data panel — a white figure framed in 1px ink with a mono header row (`organization.record`, `respiratory_support.device_category`). Schematics are always labeled "Illustrative schematic · not patient data".
- **Structure:** hairline lists over cards. Lists start with a 1px ink rule; rows divide with 1px ink-200. Sections are numbered "NN — Label"; page heads "NN / snake_case".
- **Space:** generous. Section padding clamp(72px, 9vw, 120px); gutters clamp(16px, 4vw, 56px); reading measure 680px.
- **Corners:** square-ish — 2px tags, 3px controls, 6px panels. No shadows in the product UI.
- **Backgrounds:** flat page and panel (`--ink-100`) bands only in light mode; the federated-network section, context bar and footer are panel bands in light and raised dark bands in dark. No photography, stock imagery, or illustration collages.
- **Interaction:** hover on primary = ink → petrol (signal-700); secondary/ghost hover = panel fill; list titles underline on hover. No press shrink. Transitions 120ms, color only; respects reduced motion.
- **Focus:** 2px ink outline, 3px offset; mint (signal-400) on ink grounds.
- **Responsive:** fluid 320px → wide. Flex-wrap rows with fixed label columns collapse naturally; header collapses to a Menu button below 1000px; touch targets ≥ 44px, primary 48px.

## SLIDES
- 1920×1080, two grounds only: page (`--ink-50`) for content, ink (`--ink-950`) for title, section dividers, and close.
- Type tokens `--slide-*` in `tokens/typography.css`; nothing below 24px.
- Section dividers use a 220px mint index ("02"). Content slides carry a footer: ink lockup · deck title · page number.
- Tables and figures reuse the website's DataPanel motif at slide scale; schematics are labeled illustrative.
- Status tags: `existing`/`discussion` = ink fill; `info` = outline.
- Speaker notes live in `data-speaker-notes` on each section.

## DARK MODE
- Implemented in `CLIF Foundation Site.dc.html` with semantic CSS variables declared once (`:root` light, `[data-theme="dark"]`). Every inline style references a variable; no component carries two color sets. Theme = `system | light | dark`; default follows `prefers-color-scheme`, the header toggle overrides and persists (`clif-site-theme`).
- Dark values: page `#0E1111`, panel band `#161A18`, figure `#1F2421`, inverse/raised `#1A1F1D`, text `#F5F6F3` / body `#C4C9C3` / muted `#9AA19B`, rules `#2A2F2C`, strong rules `#5A605B`.
- Role swaps in dark: links and primary actions become green (`--accent` with ink text); "existing" tags invert to white fill; green tint becomes `#1F4A3A`; logo filter inverts to white. Green is never used as text on light grounds in either mode.
- Band tokens (`--bg-inverse`, `--text-inverse*`, `--border-inverse`) are *contrast bands*, not fixed dark: light mode renders the context bar, network band and footer as panel-gray bands (`#EAECE7`) with ink text; dark mode renders them raised (`#1A1F1D`) with light text. Light is fully light, dark fully dark; the page structure is identical in both.
- `--accent-text` is the green family as text: petrol in light, green in dark. Never use `--accent` itself as text on light grounds.

## NAVIGATION
- **Context bar** (top, inverse): one line of positioning + one external link to the Consortium. Never more.
- **Header** (sticky, 72px, 1px bottom rule): lockup (symbol · 1px rule · "Foundation") left; primary nav right: Mission, Our Work, Research & Resources, Board & Governance; then a filled "Support CLIF" button and a 42px theme toggle. Items are 15px/500, 14px side padding, hover = panel fill, current = 2px bottom bar in text color + `aria-current="page"`. Max five primary items; Support is always the action, never a nav item.
- **Below 1000px**: nav collapses to a 44px "Menu" button (`aria-expanded`, `aria-controls`); the open menu lists pages as 22px display rows with a mono index (01–04), then a full-width Support button and the theme toggle. Esc and page change close it.
- **Page heads**: every inner page opens with an index eyebrow "NN / snake_case" and a display headline; sections on the home page are numbered "NN — Label".
- **Footer**: white lockup, one-paragraph description, contact email in mono, footer nav = primary pages + Support + Consortium ↗ + GitHub ↗. Bottom row: license and version.
- **Keyboard**: skip link first in tab order; focus ring 2px `--focus`, 3px offset; targets ≥ 44px. Navigation scrolls to top and moves focus to `#main`.

## LOGO APPROVAL
Use of the CLIF logo for the Foundation is approved by the Consortium. Request official one-color SVG files for production.

## ICONOGRAPHY
No icon set. The system uses typographic glyphs only: → (internal next step), ↗ (external link), ● (site status in the network diagram), — and / in section labels. Do not add an icon library or emoji. If icons become necessary, propose a thin-stroke set and flag it.

## Fonts
Loaded from Google Fonts via `tokens/fonts.css` (Funnel Display, Funnel Sans, Spline Sans Mono — all OFL). **Self-host woff2 files for production.**

## Index
- `styles.css` — entry point (imports only)
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `fonts.css`, `base.css`
- `guidelines/` — foundation specimen cards (Colors incl. dark mode, Type, Spacing, Brand)
- `components/core/` — Button, TextLink, Tag, FilterChip
- `components/brand/` — Lockup, SectionHeader
- `components/data/` — DataPanel, KeyValueList, PublicationRow
- `components/navigation/` — ContextBar, SiteHeader, SiteFooter
- `ui_kits/website/` — click-through Home / Research / Support
- `ui_kits/slides/` — 10-layout 1920×1080 slide template (`slides.css` + `deck-stage.js`)
- `SKILL.md` — agent skill entry
- `CLIF Foundation Design System Guide.dc.html` — printable guide (PDF export)

## Intentional additions
Components were authored from scratch (no source component library): only the primitives the website uses. No form inputs, dialogs, or toasts — the site has none.
