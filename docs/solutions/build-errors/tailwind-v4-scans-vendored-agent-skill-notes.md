---
title: "Tailwind v4 generates CSS from class names in committed agent skill notes"
date: 2026-10-18
category: build-errors
module: site-styles
problem_type: build_error
component: tooling
symptoms:
  - "The production CSS contains a hover:scale-105 rule that no component uses"
  - "An e2e scan for ungated :hover rules fails on a class nobody wrote in src/"
root_cause: config_error
resolution_type: config_change
severity: low
tags: [tailwind-v4, source-detection, agent-skills, css-bundle, hover-gating]
---

# Tailwind v4 generates CSS from class names in committed agent skill notes

## Problem

Tailwind v4 has no `content` list. It detects sources automatically and scans every file in the repository that git does not ignore. This repo commits agent skill notes under `.agents/skills/` (with symlinks under `.claude/skills/`). One of them, `.agents/skills/design-motion-principles/references/anti-checklist.md`, mentions `hover:scale-105` as an anti-pattern. Tailwind found that string and shipped a `.hover\:scale-105:hover` rule in the site's CSS, though no component uses it.

## Symptoms

- The built stylesheet contains utility rules for classes that appear only in Markdown notes, docs or plans.
- The e2e test "every public hover rule is gated to fine pointers" (`tests/e2e/motion-ux.test.mjs`) failed on `.hover\:scale-105:hover`. Tailwind wraps its `hover:` variant in `@media (hover: hover)` only, so the rule was outside the site's `(hover: hover) and (pointer: fine)` gate.

## What Didn't Work

- Searching `src/` for the class found nothing, because the source was a skill note, not code. `grep -rn "hover:scale-105" .` outside `node_modules` is what located it.

## Solution

Exclude non-source folders from Tailwind's scan, directly after the import in `src/app/globals.css` (paths are relative to that file):

```css
@import "tailwindcss";
/* Skill notes and docs name classes as examples, not markup: keep Tailwind
   from generating CSS for them. */
@source not "../../.agents";
@source not "../../.claude";
@source not "../../.cursor";
@source not "../../docs";
```

`@source not` is supported in the installed Tailwind (4.3.3). After a clean rebuild, `grep -r "scale-105" .next/static` returns nothing and the hover-gating test passes. Fixed on branch `feat/website-edits` in PR #28, which was open, not yet merged, as of 2026-10-18.

## Prevention

- Whenever a folder of prose that names CSS classes is committed (agent skills, design notes, plans, vendored docs), add it to the `@source not` list.
- Keep a test that walks `document.styleSheets` for rules the site's own conventions forbid. The hover-gating scan in `tests/e2e/motion-ux.test.mjs` is what surfaced this. Without it, the stray rule would only have shown up as unexplained CSS weight.
