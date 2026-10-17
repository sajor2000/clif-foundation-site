# Prime-time readiness plan (2026-10-17)

Source: two-axis audit (Standards + Spec) of everything since the root commit
`bfc4288`, plus a signed-in walkthrough of every portal page on Convex dev.
Public site and Givebutter giving are live and pass; the findings below are
almost all in the **board portal**, which has no real users yet.

## P0 — fix before any director signs in

| # | Problem | Where | Fix |
|---|---------|-------|-----|
| 1 | Admin lock fails **open** if `BOOTSTRAP_ADMIN_EMAIL` is unset | `convex/lib/access.ts` | Fail closed: unset → nobody can claim admin. Set the var on dev too. |
| 2 | No way to remove a member; departed or mis-approved people keep access | `convex/board.ts`, `MembersView` | `removeMember` (admin, audited, cannot remove the last admin) + Remove button. |
| 3 | Any allowlisted member can vote and is counted; `recuse` shrinks the consent denominator freely | `convex/motions.ts` | Only directors cast ballots; tally counts directors only; one shared tally helper. |
| 4 | Documents page crashes once a document has `policyType` (returns validator drift, same class as the meetings/votes bug) | `convex/documents.ts` | Build the validator from the schema. |
| 5 | "Archive" hard-deletes the row and file, ignoring retention | `convex/documents.ts` | Soft-archive (`archivedAt`, hidden from lists), never delete before retention ends; UI button only for roles allowed. |
| 6 | Production visitors can see env-var names / setup hints | `PortalGate.tsx` | Generic "portal unavailable" copy in production. |

## P1 — compliance logic matches the plan

| # | Problem | Fix |
|---|---------|-----|
| 7 | Minutes go draft → approved, skipping review | Enforce draft → review → approved. |
| 8 | COI "complete" counts all members and compares counts | Eligible = directors; match disclosures per person. |
| 9 | Form 990 review keyed to the current calendar year | Default to prior tax year; year selectable. |
| 10 | Minutes-gap check reads the oldest version | Read latest version. |
| 11 | In-memory `.filter` after `.take(500)`; unbounded `.collect()` | Use `by_year_member` / time indexes; bound collects. |
| 12 | `registerPolicy`, `addMinutesItem` not audited | Add `logAudit`. |

## P2 — cleanup so it stays maintainable

- One source of truth for roles, categories, retention, policy types (export from `convex/schema.ts`; client imports them). Removes ~8 hand copies.
- Shared helpers: verified-email, env "is configured", ballot tally.
- Delete dead code (`src/lib/env.ts` unused paths, `getDocumentUrl`, unreachable Givebutter null branch, unused `reporting` flag).
- Typed `myRole` result; validate route IDs instead of casting.
- Docs/copy: `PRODUCT.md` Givebutter line; brand-voice fixes on `/support` and receipt text; review "earlier gifts may qualify" wording against the never-claim-deductibility rule.
- Convex function tests (`convex-test`) for access, roles, voting, minutes, documents — so the walkthrough becomes a repeatable suite.

## P3 — operations (owner actions)

- Claim admin as info@clificufoundation.org.
- Convex: turn on scheduled backups for the production deployment (dashboard; may need a paid plan).
- Givebutter: thank-you text, email sender, team dropdown, $1 test gift.
- Google sign-in: create a Google OAuth web client (then enable in Clerk prod).

## Deferred (feature gaps, not blockers)

Reporting-pack date-range filter; COI recusal lines in minutes items; motion
tallies in the reporting-pack minutes; linking policy adoption to a motion.

## Verification

Each PR: lint, unit + Convex tests, build, e2e (with and without keys), and the
signed-in walkthrough on Convex dev with Clerk test users; deploy, then smoke the
live site.
