# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: clinicians, researchers, hospital data teams, and funders evaluating open infrastructure for critical care data — especially people who already know CLIF (Common Longitudinal ICU data Format) or the CLIF Consortium and want a clear, factual home for the Foundation’s proposed programs and giving path.

Secondary: proposed Foundation board members who need a private document portal (not linked from public navigation).

## Product Purpose

The CLIF Foundation site explains who the Foundation is, what it proposes to fund or support around CLIF adoption, how research is credited to the Consortium, and how to start a gift conversation. Success means visitors leave with accurate legal/status language, a clear distinction from the Consortium, and a low-friction inquiry path — without inventing impact stats, bios, or tax-deductibility claims.

## Positioning

Distinct from the CLIF Consortium (clif-icu.com): the Consortium owns the specification and federated research; the Foundation is an Illinois nonprofit that proposes to support wider adoption. They share the CLIF symbol but not the same brand chrome (no Consortium crimson in Foundation UI).

## Operating Context

- Public marketing site: Home, Mission, Our Work, Research & Resources, Board & Governance, Support.
- Board portal at `/portal/*` (Clerk-gated, bookmark-only; not in public nav).
- Giving today: email inquiry to `info@clificufoundation.org`. Online checkout is Coming soon until bank + Stripe Nonprofit exist.
- Design authority lives in `design/` (tokens + kit) and is ported into `src/styles/` and `src/components/`.

## Capabilities and Constraints

- Stack: Next.js App Router, TypeScript, Tailwind, Effect 4, Convex, Clerk; Stripe stubbed.
- Legal status (confirmed): Illinois nonprofit corporation, EIN issued, 501(c)(3) application pending. Never claim tax-exempt status or deductibility until an IRS determination letter is posted.
- Programs and board appointments that are not yet real must stay labeled **proposed**.
- Do not invent biographies, partnerships, funding commitments, or impact statistics.
- Credit research to the CLIF Consortium and original investigators; link out rather than reproducing the CLIF/mCIDE specification.
- Data schematics are illustrative donor concepts only (“Illustrative schematic · not patient data”).

## Brand Commitments

- Voice: plain, factual, third person for the organization; “we/us” only in direct calls to act. Conditional voice for unrealized work (“would support”, “proposes to”).
- Sentence case everywhere. No exclamation points, no emoji.
- Short declarative headlines. CLIF technical vocabulary in mono (`respiratory_support`, `mCIDE`, etc.).
- External destinations end with ↗. CTAs name the outcome (“Email a gift inquiry”).
- Visual identity is binding: Funnel Display / Funnel Sans / Spline Sans Mono; ink + petrol + mint; hairline lists; DataPanel motif; square-ish radii; no gradients; no Consortium crimson in Foundation UI. See `DESIGN.md` and `design/readme.md`.

## Evidence on Hand

- `design/` — approved design kit, tokens, component prompts, and prototype HTML.
- `src/app/*` — six public pages + portal implemented from that kit.
- Consortium reference site: https://clif-icu.com/ (content/publications/logos; logos hot-linked, not copied).
- Contact: `info@clificufoundation.org`.
- No customer testimonials or quantified impact studies on hand — do not fabricate them.

## Product Principles

1. **Factual first.** Prefer precise legal and program language over persuasive flourish.
2. **Proposed means labeled.** Anything not yet real stays tagged and conditional.
3. **Consortium credit.** Research and the format belong to the Consortium; the Foundation does not absorb that identity.
4. **Inquiry over checkout (for now).** Giving starts with a conversation until Stripe is configured.
5. **Design kit is law.** New UI extends the ink/petrol/mint system in `design/`; it does not invent a parallel aesthetic.

## Accessibility & Inclusion

Baseline WCAG 2.1 AA. Skip link first in tab order; focus ring 2px with 3px offset; touch targets ≥ 44px (primary 48px); respect `prefers-reduced-motion`; theme follows system with a header toggle. Semantic structure over ARIA decoration.
