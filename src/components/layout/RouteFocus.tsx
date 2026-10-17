"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Survives client-side navigations, so the first page load keeps the
// browser's default focus and every later route change is announced.
let initialLoadDone = false;

/** Moves keyboard focus to #main after in-site navigation. */
export function RouteFocus() {
  const pathname = usePathname();

  useEffect(() => {
    if (!initialLoadDone) {
      initialLoadDone = true;
      return;
    }
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}
