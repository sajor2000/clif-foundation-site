# SEO plan — CLIF Foundation site

Status: proposal (October 2026). Owner: site maintainers. Production URL:
<https://www.clificufoundation.org>.

This plan is bound by `PRODUCT.md` and `DESIGN.md`:

- Never claim 501(c)(3) status or tax-deductibility until the IRS
  determination letter is posted. The application is pending.
- Never invent partnerships, impact statistics, biographies or funding.
- The Foundation is distinct from the CLIF Consortium (<https://clif-icu.com/>).
  Research and the specification belong to the Consortium.
- Out of scope: no OMOP/PCORnet association (owner decision 2026-10-16).

## What the technical PR ships

| Item | Detail |
| --- | --- |
| Per-page metadata | Unique `<title>` and meta description on all six pages (`src/lib/seo.ts` → `pageMetadata`) |
| Canonical URLs | `alternates.canonical` per page, resolved against `metadataBase` |
| Open Graph + Twitter | `og:title/description/url/type/site_name/image`, `twitter:card=summary_large_image` |
| Default share image | `src/app/opengraph-image.tsx` (next/og, prerendered at build). Ink ground, Funnel Display + Spline Sans Mono, mint accent, 1px rule, no gradients. Fonts are OFL, vendored in `src/assets/og/` with their licences |
| Structured data | `Organization` JSON-LD in the root layout: name, url, logo, email, contact point, Illinois address region, `knowsAbout`. No `nonprofitStatus`, no `sameAs` (see below) |
| Already present | `metadataBase`, `robots.ts`, `sitemap.ts`, security headers, title template |

Why no `sameAs`: clif-icu.com and the GitHub organization
`Common-Longitudinal-ICU-data-Format` belong to the CLIF Consortium, not the
Foundation. `sameAs` asserts "this is the same entity", which would be false.
Add `sameAs` only for profiles the Foundation itself owns (for example a
Foundation LinkedIn page, a Candid/GuideStar profile, or a Wikidata item, once
they exist).

Once the 501(c)(3) determination letter is posted, add
`"nonprofitStatus": "Nonprofit501c3"` to the JSON-LD in the same PR that
updates the site copy.

## (a) Search Console and Bing Webmaster Tools

### Google Search Console — Domain property (covers www, apex, http and https)

1. Sign in at <https://search.google.com/search-console> with the account that
   should own the property (use a shared Foundation Google account, not a
   personal one, and add a second owner).
2. Add property → **Domain** → enter `clificufoundation.org`.
3. Google shows a TXT record such as `google-site-verification=XXXX`. Copy it.
4. DNS is hosted on Vercel. Add the record:

   ```sh
   vercel dns add clificufoundation.org @ TXT "google-site-verification=XXXX" --scope sajor2000s-projects
   vercel dns ls clificufoundation.org --scope sajor2000s-projects   # confirm
   dig +short TXT clificufoundation.org                             # confirm it resolves
   ```

5. Click **Verify**. If it fails, wait 10–60 minutes for propagation and retry.
   Leave the TXT record in place permanently; removing it un-verifies the
   property.
6. **Sitemaps** → submit `https://www.clificufoundation.org/sitemap.xml`.
7. **URL inspection** → inspect each of the six URLs below → **Request
   indexing** (the daily quota is small; do the home page first):
   - `https://www.clificufoundation.org/`
   - `https://www.clificufoundation.org/mission`
   - `https://www.clificufoundation.org/our-work`
   - `https://www.clificufoundation.org/research`
   - `https://www.clificufoundation.org/board`
   - `https://www.clificufoundation.org/support`
8. In URL inspection, confirm "User-declared canonical" equals "Google-selected
   canonical" and that the page is "URL is on Google" within 1–2 weeks.
9. Settings → Users and permissions: add a second owner.

### Bing Webmaster Tools

1. Sign in at <https://www.bing.com/webmasters>.
2. Choose **Import from Google Search Console** (fastest; imports the verified
   site and sitemap). Otherwise add the site and verify by DNS: Bing gives a
   CNAME record, which can be added the same way:
   `vercel dns add clificufoundation.org <host> CNAME verify.bing.com --scope sajor2000s-projects`.
3. Submit the sitemap and use **URL submission** for the six pages.
4. Optional: enable IndexNow later if content starts changing frequently. Not
   needed for six static pages.

### Post-deploy checks (after this PR merges)

- <https://search.google.com/test/rich-results> and
  <https://validator.schema.org/> on the home page: the `Organization`
  block should parse with no errors.
- Share-card preview: paste a URL into LinkedIn Post Inspector
  (<https://www.linkedin.com/post-inspector/>) and confirm the image appears.

## (b) Keyword map

Search volume for these terms is low and specialist. The realistic goal is to
rank for brand and near-brand queries ("CLIF Foundation", "CLIF ICU data
format nonprofit", "Common Longitudinal ICU data Format") and to be the
Foundation answer next to clif-icu.com, not to outrank the Consortium for the
standard itself. Do not copy keywords into body text; the terms below should
appear only where the existing copy already says them naturally.

| Page | Primary query cluster | Secondary | Intent | Notes |
| --- | --- | --- | --- | --- |
| `/` | CLIF Foundation; Common Longitudinal ICU data Format nonprofit | open critical care data infrastructure; ICU data standard nonprofit | Navigational / brand | Title now leads with brand + "Open infrastructure for critical care data" |
| `/mission` | critical care data standard adoption | open ICU data standard; scaling CLIF beyond research | Informational | Existing copy covers "conversion tools, terminology mapping, implementation help" |
| `/our-work` | CLIF implementation support; EHR to CLIF conversion (ETL) | critical care data science education; open-source ICU data tools | Informational / commercial-investigation (health-system data teams) | Programs link to Consortium resources |
| `/research` | federated ICU research; CLIF publications | critical care EHR research; multicenter ICU data | Informational | Credit Consortium and investigators; link out |
| `/board` | CLIF Foundation board | — | Navigational / trust | E-E-A-T: real people, real roles (already present) |
| `/support` | donate critical care data science nonprofit; support CLIF | ICU research nonprofit giving | Transactional | Must say "501(c)(3) application pending"; never "tax-deductible" |

## (c) Content plan

### C1. Improvements to existing pages (proposals)

- `/research`: add a short "Data access" line pointing to MIMIC-IV-Ext-CLIF on
  PhysioNet [S1] — a real, citable resource that searchers for "ICU dataset"
  look for.
- Add `last updated` dates to publication lists to give crawlers freshness
  signals (only real dates).
- Do **not** add an FAQ block purely for rich results; Google no longer shows
  FAQ rich results for most sites.

### Sources

- [S1] MIMIC-IV-Ext-CLIF on PhysioNet.
  <https://physionet.org/content/mimic-iv-ext-clif/>
- [S2] CLIF Consortium site. <https://clif-icu.com/>

## (d) Off-site and backlink plan (honest only)

| Action | Who | When | Notes |
| --- | --- | --- | --- |
| Ask the Consortium to link to the Foundation from clif-icu.com (footer or About) | Board → Consortium leads | Now | The single most relevant link available. Use accurate anchor text, e.g. "CLIF Foundation" |
| Ask for a link from the CLIF GitHub org README / CLIF repo README | Consortium maintainers | Now | Only if maintainers agree; describe the Foundation as supporting adoption |
| Board members add the Foundation to ORCID (Employment/Service → "CLIF Foundation, board member") and institutional profile pages | Each director | Now | Only real roles; no implied institutional endorsement |
| Mention the Foundation in author disclosures / acknowledgements only where it actually funded or supported work | Investigators | Ongoing | Never retro-fit |
| LinkedIn organization page for the Foundation | Board | Now | Then add its URL to JSON-LD `sameAs` |
| Candid (GuideStar) profile | Board | Now | Candid lists organizations with an EIN; keep status field "501(c)(3) pending" until determined |
| Wikidata item for the Foundation | Board | After LinkedIn/Candid exist | Requires independent references; do not create without them |
| Nonprofit directories (e.g., charity navigators, state registries) | Board | **After** IRS determination | Many require 501(c)(3) status |
| Google for Nonprofits → Google Ad Grants | Board | **After** determination letter | Google for Nonprofits requires a charitable organization in good standing under the country's eligibility rules (in the US, 501(c)(3) status), verified by a Google verification partner; hospitals and healthcare organizations are excluded, so describe the Foundation accurately as a nonprofit supporting a data standard. Ad Grants adds website-quality requirements (HTTPS, substantial unique content, clear mission). See <https://www.google.com/nonprofits/eligibility/> and <https://www.google.com/grants/> |
| Conference talks / grand rounds that mention the Foundation | Directors | Ongoing | Ask hosts to link to the site on event pages |

Avoid: paid links, link exchanges, directory spam, guest posts written for
links, and any wording that implies endorsement by other organizations.

## (e) Measurement

- **Search Console**: impressions/clicks for brand vs non-brand queries;
  Pages report (indexed count should be 6); Enhancements (none expected);
  Core Web Vitals.
- **Bing Webmaster Tools**: indexed pages, crawl errors.
- **Vercel Web Analytics** (proposal, separate PR): enable in the Vercel
  project dashboard, add `@vercel/analytics` and `<Analytics />` to the root
  layout. Cookieless; no consent banner needed. Track page views for
  `/support` and clicks on the gift email CTA as a custom event. Optionally
  add Vercel Speed Insights for real-user Core Web Vitals.
- KPIs: (1) all six URLs indexed; (2) position 1 for "CLIF Foundation";
  (3) Foundation appears on page 1 for "CLIF ICU data format" alongside
  clif-icu.com; (4) referral traffic from clif-icu.com and GitHub;
  (5) `/support` visits and gift inquiries per month.

### 30 / 60 / 90-day checklist

**Day 0–30**

- [ ] Merge this PR; confirm production HTML shows the new titles, canonicals,
      OG tags and JSON-LD.
- [ ] Verify the Domain property in Search Console (DNS TXT via Vercel).
- [ ] Submit sitemap; request indexing for all six URLs.
- [ ] Import the site into Bing Webmaster Tools; submit sitemap.
- [ ] Run Rich Results Test and LinkedIn Post Inspector.
- [ ] Ask the Consortium for a link from clif-icu.com and the GitHub README.
- [ ] Create the Foundation LinkedIn page; directors update ORCID.

**Day 31–60**

- [ ] Enable Vercel Web Analytics (separate PR).
- [ ] Create Candid profile.
- [ ] Review Search Console queries; adjust descriptions (not body copy) if
      click-through is poor for queries where the site already ranks.

**Day 61–90**

- [ ] Review indexed pages, canonical selection and Core Web Vitals.
- [ ] Add `sameAs` for Foundation-owned profiles created so far.
- [ ] When the IRS determination letter arrives: update copy and JSON-LD
      (`nonprofitStatus`), then apply to Google for Nonprofits, Ad Grants and
      nonprofit directories.
- [ ] Decide whether a short news/updates page is worth maintaining
      (only if there will be real updates at least quarterly).
