<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Documented Solutions

`docs/solutions/` — documented solutions and infrastructure knowledge (e.g. domain DNS and email on Vercel DNS + Hostinger Mail), organized by category with YAML frontmatter (`module`, `tags`, `problem_type`). Relevant when changing DNS, email, deployment, or other documented areas.

## Site checks

`npm run check:site` runs the browser checks in `scripts/checks/` (keyboard menu, focus, axe, reduced motion) against a running production build: `npm run build && npx next start -p 43139` first, or set `SITE_URL`. Set `CHROME_PATH` off macOS. It exits non-zero on any failure. `npm run test:e2e` starts its own server.
