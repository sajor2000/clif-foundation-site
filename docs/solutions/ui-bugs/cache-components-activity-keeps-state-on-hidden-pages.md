---
title: "Next.js cacheComponents keeps visited pages mounted in <Activity>: effect cleanups run on hide, state survives"
date: 2026-10-18
category: ui-bugs
module: site-client-components
problem_type: ui_bug
component: frontend
severity: medium
symptoms:
  - "Phone menu is still open when the reader presses Back to a page where they opened it"
  - "Copy-email button stays on \"Copied\" forever after navigating away and back within the reset window"
  - "Duplicate element ids (skip-link target, menu aria-controls, theme toggle label) across pages that are simultaneously in the DOM"
  - "Escape does nothing to the open phone menu once focus has moved from the header into page content"
root_cause: logic_error
resolution_type: code_fix
related_components:
  - testing_framework
tags: [nextjs-16, cache-components, react-activity, useLayoutEffect, effect-cleanup, timers, useId, back-navigation, playwright]
---

# Next.js cacheComponents keeps visited pages mounted in `<Activity>`: effect cleanups run on hide, state survives

## Problem

This site enables `cacheComponents: true` (`next.config.ts:28`). In Next.js 16 that changes the page lifecycle: a page you navigate away from is **not unmounted**. Next hides it inside React's `<Activity>` so its DOM and React state can be restored on Back/Forward. The bundled guide says so directly:

> "Instead of unmounting pages on navigation, Next.js hides them using React's `<Activity>` component. Activity keeps the DOM in the document (hidden with `display: none`), so both React state and DOM state are preserved" (`node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md:17`), up to 3 routes (`:19`).

> "When Activity hides content, React runs effect cleanup functions just like it does on unmount." (`preserving-ui-state.md:476`), and "Effects run on every hide-to-visible transition, not just the initial mount." (`:520`)

So on hide, **cleanups run but state is kept**. On show, **effects run again**. Any component written for the old "navigation = unmount" model can break in one of three ways:

1. **Transient UI state survives.** A menu left open stays open when you come Back.
2. **A side effect started outside an effect is killed on hide and never restarted.** A cleanup cancels it, nothing re-arms it on show, and the state it was supposed to reset stays put.
3. **Hard-coded ids collide.** Several pages are in the DOM at once.

All three happened in PR #28 (`feat/website-edits`), which was still open, not yet merged to `main`, as of 2026-10-18.

## Symptoms

- (a) **Header menu stays open after Back.** Open the phone menu on `/mission`, tap a link, press Back. `/mission`'s `SiteHeader` was only hidden, so `open === true` survived.
- (b) **"Copied" sticks.** On `/support`, click "Copy email address", navigate to `/mission` before the 1.8 s reset fires, then press Back. The button shows "Copied" indefinitely.
- (c) **Duplicate ids.** Fixed `id="main"` / menu ids existed once per mounted page, so the skip link and `aria-controls` could resolve to a hidden page's element.
- (d) **Escape fails after focus leaves the header.** Open the menu, move focus into `<main>`, press Escape. The menu stays open.

## What Didn't Work

**Timer started in the click handler, cleared by an unmount-style cleanup.** This is the earlier `CopyEmailButton` (as first written in PR #28, before the review fix):

```tsx
const [state, setState] = useState<CopyState>("idle");
const reset = useRef<number | undefined>(undefined);

useEffect(() => () => window.clearTimeout(reset.current), []);   // "unmount" cleanup

async function onCopy() {
  window.clearTimeout(reset.current);
  // ...clipboard write...
  setState(next);
  reset.current = window.setTimeout(() => setState("idle"), 1800); // started in handler
}
```

This is correct under unmount semantics. Under Activity it fails. Hiding the page runs the cleanup, which clears the pending timer, but `state` stays `"copied"`. Showing the page re-runs the effect, and that effect only installs another cleanup. Nothing re-arms the reset, so "Copied" never goes away.

**The test that let it through was vacuous.** The button renders all three labels at once, stacked in one grid cell and switched with `data-active` (`src/components/support/CopyEmailButton.tsx:59-68`). The button's `textContent` therefore always contains "Copied", so an assertion on button text passes whatever the state is. The bug only showed once the assertion targeted `.copy-btn__label[data-active="true"]` (`tests/e2e/motion-ux.test.mjs:189`, `:208`).

**Escape guarded by focus containment.** The earlier header handler (as first written in PR #28, before the review fix) bailed out with `if (!headerRef.current?.contains(document.activeElement)) return;`. That guard was meant to stop hidden pages' headers from reacting to Escape. It also stopped the visible menu from closing once the reader tabbed into content.

## Solution

### (a) Close transient UI in a `useLayoutEffect` cleanup, and on `Link` `onNavigate`

This follows the guide's dropdown pattern (`preserving-ui-state.md:35-50`, `:70`, `:72`). `src/components/navigation/SiteHeader.tsx:22-24`:

```tsx
// Close the menu when Activity hides this page, so it is never open when the
// reader comes Back (pattern from Next's "Preserving UI state" guide).
useLayoutEffect(() => {
  return () => setOpen(false);
}, []);
```

The menu links also close it as soon as navigation starts (`SiteHeader.tsx:243`, `:272`):

```tsx
<Link href={item.href} onNavigate={() => setOpen(false)} /* ... */>
```

`useLayoutEffect` matters here. Its cleanup runs synchronously before the page is hidden, so there is no flash of the stale open menu on return (`preserving-ui-state.md:70`).

### (b) Derive the timer from state inside an effect, keyed by a counter

`src/components/support/CopyEmailButton.tsx:23-48`:

```tsx
// `n` counts copies, so a repeat click restarts the reset window.
const [copy, setCopy] = useState<{ state: CopyState; n: number }>({ state: "idle", n: 0 });

// The reset lives in an effect, not the click handler: its cleanup owns the
// timer, and it re-arms when a hidden (Activity) page is shown again.
useEffect(() => {
  if (copy.state === "idle") return;
  const reset = window.setTimeout(
    () => setCopy((c) => (c.n === copy.n ? { state: "idle", n: c.n } : c)),
    1800,
  );
  return () => window.clearTimeout(reset);
}, [copy]);

async function onCopy() {
  let next: CopyState = "copied";
  try { await navigator.clipboard.writeText(CONTACT_EMAIL); } catch { next = "failed"; }
  setCopy((c) => ({ state: next, n: c.n + 1 }));
}
```

The click handler now only changes state. The effect sets up the timer and its cleanup tears it down.

### (c) Generate ids with `useId` in a client component

`src/components/layout/MainLandmark.tsx:6-13`. `MainIdProvider` supplies a client-side `useId()` to `SkipLink` and `<main>`. It wraps the shell in `src/components/layout/SiteShell.tsx:15`. `SiteHeader` does the same for `menuId` and `themeToggleId` (`SiteHeader.tsx:11-14`). The comment at `MainLandmark.tsx:7-8` explains the choice: a client-side `useId` is unique across the whole app, while a server-side one repeats on every page.

### (d) Drop the focus-containment guard on Escape

Because of (a), a hidden page's menu is always closed. So whenever a menu is open, it belongs to the visible page, and the global handler no longer needs a guard. `SiteHeader.tsx:26-40`:

```tsx
if (e.key !== "Escape" || e.defaultPrevented) return;
const active = document.activeElement;
const inHeader = !!headerRef.current?.contains(active);
setOpen(false);
if (inHeader || !active || active === document.body) buttonRef.current?.focus();
```

Escape always closes the menu. Focus moves back to the Menu button only if it was in the header or nowhere, so a reader working in page content keeps their place.

## Why This Works

Under Activity, the lifecycle is a hide/show cycle rather than mount/unmount:

| Event | Effect cleanups | Effects | `useState` / refs |
|---|---|---|---|
| Navigate away (hide) | run | — | **kept** |
| Back/Forward (show) | — | **run again** | kept |

- A `useLayoutEffect` cleanup that resets state is the one hook that runs on hide, so it can return transient UI to a safe default before the page is stored.
- Work that should resume after a show has to be **created by an effect from state**, not by an event handler. The effect re-runs on show, sees `copy.state !== "idle"`, and starts a fresh 1.8 s reset. The handler-based version had nothing that ran on show. This matches the guide's `LiveTimer` example (`preserving-ui-state.md:483-490`): the interval lives in an effect, so it pauses on hide and resumes on show.
- The `{state, n}` counter turns every click into a distinct state value, even when `state` is already `"copied"`. That makes the effect restart the reset window on each copy. The `c.n === copy.n` check in the callback also stops a stale timer from resetting a newer copy.
- With several pages in the DOM at once, an id only has to be unique per component instance, and a client `useId` guarantees that.

## Prevention

- **Review rule for `cacheComponents` apps.** Look for any `setTimeout`/`setInterval`/subscription started in an event handler whose only cleanup is a mount-once `useEffect(() => () => clear…, [])`. Move it into an effect whose dependencies are the state it serves. Give transient open/closed UI (menus, popovers, toasts) a `useLayoutEffect` cleanup that resets it. Do not hard-code DOM ids in components that render on every page.
- **Test the Back path, not just the click.** These are the Playwright tests in `tests/e2e/motion-ux.test.mjs`:
  - `"phone menu is closed after navigating and going Back"` (`:132`): open menu → tap link → `goBack()` → assert no visible `.site-menu-panel` remains.
  - `"copy button resets after navigating away and back"` (`:196`):
    ```js
    await page.getByRole("button", { name: "Copy email address" }).click();
    await page.waitForTimeout(100);
    await page.locator('header a[href="/mission"]').first().click();
    await page.waitForURL("**/mission");
    await page.goBack();
    await page.waitForURL("**/support");
    await page.waitForTimeout(2200);
    const active = page.locator('.copy-btn__label[data-active="true"]').first();
    assert.equal((await active.textContent()).trim(), "Copy email address");
    ```
  - `"Escape closes the phone menu after focus leaves the header"` (`:107`): open menu → focus the first link or button in `main` → Escape → assert that no `.site-menu-panel` is displayed.
- **Make assertions read the visible state, not all of the DOM.** When a component renders every variant and toggles one, as these stacked labels do, assert on the active marker (`[data-active="true"]`), not on container `textContent`. Hidden Activity pages are still in the DOM too, so prefer `getByRole` or `.filter({ visible: true })` (`preserving-ui-state.md:376-389`). Otherwise a locator may match the hidden copy.
- **Check that a new test fails against the old code first.** Running the Back-navigation test against the pre-fix version from PR #28 would have exposed the vacuous assertion right away.
