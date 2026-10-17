# Board allowlist seed

`src/data/board-members.json` does **not** include email addresses (public roster only).

## How to seed

1. Sign in at `/portal/sign-in`.
2. If the allowlist is empty, click **Claim admin** on Overview.
3. Open **Members** (`/portal/members`) and add each director email + role.

Alternatively, use the Convex dashboard to insert rows into `boardMembers` with fields `email`, `role` (`member` | `secretary` | `chair` | `admin`), and optional `displayName`.

Once any `boardMembers` row exists, only allowlisted emails can call portal Convex functions.
