---
title: "Vercel DNS for the website, Hostinger Mail for email: required zone records and safe cutover"
date: 2026-10-16
category: architecture-patterns
module: domain-dns-email
problem_type: architecture_pattern
component: infrastructure
severity: high
applies_when:
  - Changing nameservers or DNS records for clificufoundation.org
  - Editing the Vercel DNS zone (vercel dns add/rm) for this domain
  - Moving the domain back to Hostinger DNS or to another DNS host
  - Adding a new mail sender or subdomain, or tightening DMARC/MTA-STS
  - Debugging mail delivery to info@clificufoundation.org after a DNS change
related_components:
  - documentation
tags: [dns, vercel-dns, hostinger-mail, email-deliverability, dmarc, spf, wildcard-alias, nameserver-migration]
---

# Vercel DNS for the website, Hostinger Mail for email: required zone records and safe cutover

## Context

`clificufoundation.org` is split across two providers, and nothing in this repo shows that:

- **Web:** served by Vercel (project `clif-foundation-site`, team scope `sajor2000s-projects`).
- **Email:** `info@clificufoundation.org` is Hostinger Mail, and it is the foundation's main contact address.
- **Registrar:** still Hostinger.
- **DNS:** authoritative DNS moved on 2026-10-16 from Hostinger's parking nameservers (`cosmos.dns-parking.com` / `nova.dns-parking.com`) to Vercel DNS (`ns1.vercel-dns.com` / `ns2.vercel-dns.com`).

From that date every DNS record, web or mail, lives in the Vercel zone. Hostinger's DNS editor still shows the old zone but has no effect, because nothing points at it.

Two problems came with the move:

- **Mail records:** Vercel creates a fresh zone with only web defaults. Switching nameservers before copying Hostinger's mail records into it would have broken `info@` immediately.
- **Wildcard record:** Vercel's default zone includes a wildcard `*` ALIAS, so every made-up subdomain resolves to Vercel. That opens a subdomain-spoofing gap for mail unless it is guarded.

Before the move, an earlier session the same day planned to keep Hostinger's nameservers and change only the apex A record and the `www` CNAME at Hostinger. That plan never got applied, because Hostinger API access wasn't set up yet. The owner then chose to move DNS to Vercel instead (session history). That earlier session also recorded that Vercel now recommends `216.198.79.1` for the apex and a project-specific `*.vercel-dns-017.com` target for `www`. The legacy `76.76.21.21` and `cname.vercel-dns.com` values it used still work.

## Guidance

**Edit DNS in Vercel, not hPanel.** List and add records with the Vercel CLI:

```bash
vercel dns ls clificufoundation.org --scope sajor2000s-projects
vercel dns add clificufoundation.org <name> <TYPE> <value> [priority] --scope sajor2000s-projects
```

Hostinger remains the place for registrar settings: renewal, domain lock and nameservers.

**Required record set in the Vercel zone.** All of these were verified on 2026-10-16 with `dig @ns1.vercel-dns.com`.

| Name | Type | Value | Why |
|---|---|---|---|
| `@` | ALIAS (Vercel default) | Vercel apex target | Website |
| `www` | CNAME | `cname.vercel-dns.com.` | Website. Explicit, so it doesn't depend on the wildcard |
| `@` | MX | `5 mx1.hostinger.com.`, `10 mx2.hostinger.com.` | Inbound mail to Hostinger |
| `@` | TXT | `v=spf1 include:_spf.mail.hostinger.com ~all` | SPF for Hostinger outbound |
| `hostingermail-a._domainkey` | CNAME | `hostingermail-a.dkim.mail.hostinger.com.` | Active DKIM key (RSA-2048) |
| `hostingermail-b._domainkey`, `hostingermail-c._domainkey` | CNAME | `hostingermail-{b,c}.dkim.mail.hostinger.com.` | Standby DKIM selectors. Hostinger publishes them with an empty `p=`, which is expected, not an error |
| `autodiscover` | CNAME | `autodiscover.mail.hostinger.com.` | Outlook auto-setup |
| `autoconfig` | CNAME | `autoconfig.mail.hostinger.com.` | Thunderbird auto-setup |
| `_dmarc` | TXT | `v=DMARC1; p=none; sp=reject; rua=mailto:info@clificufoundation.org; adkim=r; aspf=r; fo=1` | DMARC reports to info@. Subdomain spoofing is rejected |
| `_smtp._tls` | TXT | `v=TLSRPTv1; rua=mailto:info@clificufoundation.org` | TLS delivery reports |
| `@` | CAA | `0 issue "letsencrypt.org"` (plus Vercel's default `pki.goog`, `sectigo.com`) | Limits which certificate authorities can issue. Vercel issues through Let's Encrypt |
| `@` | TXT | `google-site-verification=…` | Google Search Console ownership. **Keep it permanently.** Google re-checks it, and removing it drops Search Console access |

Hostinger documents only MX, SPF, DKIM and DMARC. Don't add SRV records.

**Guard the wildcard.** The default `*` ALIAS makes any subdomain resolve to Vercel. Mail-related records at the wildcard give unknown subdomains an explicit "no mail" answer. Names with their own records, such as `autodiscover` and the DKIM selectors, are unaffected.

| Name | Type | Value |
|---|---|---|
| `*` | TXT | `v=spf1 -all` |
| `*` | MX | `0 .` (null MX) |

Together with DMARC `sp=reject`, these stop anyone sending SPF-valid mail "from" a made-up subdomain. Deleting the `*` ALIAS outright would also work, now that `www` is explicit. It was kept in case preview subdomains rely on it.

**Safe migration order.** Use this whenever nameservers move, in either direction:

1. Copy every record into the destination zone first.
2. Query the destination nameservers directly, before delegation changes, and confirm each record answers: `dig +short @ns1.vercel-dns.com clificufoundation.org MX` (repeat for TXT, `_dmarc`, the DKIM selectors, `autodiscover`, `www`, and so on).
3. Only then change the nameservers at the registrar: in hPanel, or with the Hostinger API operation `domains_portfolio_update-nameservers`.
4. Confirm the delegation. `whois clificufoundation.org | grep -i "name server"` should show the new nameservers, then check that public resolvers (`1.1.1.1`, `8.8.8.8`) return the same MX, SPF and website answers. While caches age out, a resolver may return the old zone's answers. That is harmless only because the two zones match.
5. **Keep DNSSEC off.** Vercel DNS doesn't sign zones, and a DS record left at the registry would make the domain fail to resolve. whois showed `DNSSEC: unsigned` both before the move (checked this session) and after it.

**Rollback:** in hPanel, set the nameservers back to `cosmos.dns-parking.com` and `nova.dns-parking.com`. Per this session, the old Hostinger zone was left in place and matched the Vercel zone as of 2026-10-16. Re-check it in hPanel before relying on it. Any record added in Vercel since then, such as the wildcard guards, `_smtp._tls` and the Google verification TXT, would have to be re-added in hPanel first.

**Pending follow-ups (not done as of 2026-10-16):**

- **MTA-STS:** deferred until a real send from info@ to Gmail shows SPF, DKIM and DMARC all PASS under "Show original" and a reply reaches info@. Inbound TLS on port 25 couldn't be tested from the agent's network. When it's added, start in `mode: testing`. It needs an `mta-sts` host pointing at Vercel, a `_mta-sts` TXT record with `v=STSv1; id=<date>`, and the site serving `/.well-known/mta-sts.txt` listing `mx1.hostinger.com` and `mx2.hostinger.com`. Until those records exist, the wildcard guard answers `_mta-sts` TXT with `v=spf1 -all` and `mta-sts` resolves to Vercel through the `*` ALIAS. An explicit `_mta-sts` record overrides the wildcard.
- **DMARC enforcement:** move `p=none` to `p=quarantine` after 2–3 weeks of clean reports at info@, later to `p=reject`. Before tightening, add any new service that sends as `@clificufoundation.org` (a contact-form mailer, donation platform or newsletter tool) to SPF and DKIM.

## Why This Matters

- **Email:** `info@` is the foundation's main contact. A missing MX or SPF record silently drops or junks mail, and nobody notices until a donor or partner says their message bounced.
- **Hidden DNS:** the repo shows only the web side, so a future agent working only in the repo won't know the zone also carries mail. It might switch DNS providers, "reset" the zone, or remove records it doesn't recognize, such as the wildcard guards or the Google TXT.
- **Wrong editor:** after the move, edits in Hostinger's DNS editor appear to save and do nothing. Anyone following Hostinger's own docs will think they changed DNS when they didn't.
- **Spoofing:** the default wildcard is a quiet spoofing gap. Without the guards, mail claiming to be from an unused subdomain had no SPF to fail, so receivers had nothing to reject it on.

## When to Apply

- Adding, changing or removing any DNS record for `clificufoundation.org`, including verification TXTs for new services such as Bing, Google Workspace or a mail sender.
- Adding a new service that sends email as the domain. Update SPF and DKIM before tightening DMARC.
- Moving nameservers again, in either direction, or changing registrars.
- Debugging email delivery, bounces, or "website works but mail doesn't", or the reverse.
- Adding MTA-STS or tightening DMARC.

## Examples

**Before the move (wrong order, would have broken mail):** change the nameservers at Hostinger first, then add records in Vercel. Between the two steps, the Vercel zone answers MX with nothing.

**What was actually done:**

```bash
# 1. Copy mail records into the Vercel zone
vercel dns add clificufoundation.org @ MX mx1.hostinger.com 5 --scope sajor2000s-projects
vercel dns add clificufoundation.org @ MX mx2.hostinger.com 10 --scope sajor2000s-projects
vercel dns add clificufoundation.org @ TXT "v=spf1 include:_spf.mail.hostinger.com ~all" --scope sajor2000s-projects
vercel dns add clificufoundation.org hostingermail-a._domainkey CNAME hostingermail-a.dkim.mail.hostinger.com --scope sajor2000s-projects
# ...b, c, autodiscover, autoconfig, _dmarc likewise

# 2. Verify against Vercel's nameserver before delegating
dig +short @ns1.vercel-dns.com clificufoundation.org MX
dig +short @ns1.vercel-dns.com _dmarc.clificufoundation.org TXT

# 3. Then point the registrar at Vercel (hPanel → Domains → Nameservers, or the Hostinger API)
# 4. Confirm the delegation
whois clificufoundation.org | grep -i "name server"
dig +short @1.1.1.1 clificufoundation.org MX
```

**Wildcard guard check:** a made-up subdomain should refuse mail.

```bash
dig +short @ns1.vercel-dns.com zz-random.clificufoundation.org MX   # 0 .
dig +short @ns1.vercel-dns.com zz-random.clificufoundation.org TXT  # "v=spf1 -all"
```

**CLI notes from this session:**

- To change an existing record (for example adding `sp=reject` to DMARC), `vercel dns update <rec_id> --value <value>` is the simple path. This session used `vercel api /v1/domains/records/<rec_id> --method PATCH --input <json>`, which also works.
- `vercel api … --method DELETE` refuses to run non-interactively without an explicit confirmation flag (`--dangerously-skip-permissions`). Only pass that flag when the deletion was actually asked for.

## Related

- `docs/seo-plan.md`: Search Console and Bing verification steps, which add their TXT records with `vercel dns add` in this same zone.
- `README.md`: "Deploy on Vercel" covers the site build only; this doc covers the domain, DNS and mail.
