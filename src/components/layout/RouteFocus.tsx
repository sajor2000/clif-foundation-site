"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Last pathname seen across client navigations. Comparing against it (rather
// than a "first load done" flag) ignores Strict Mode's replayed mount effect,
// which runs again with the same pathname.
let lastPathname: string | null = null;

/**
 * Moves keyboard focus to this page's <main> after in-site navigation. Next
 * keeps earlier pages mounted but hidden, so look up our own <main> rather
 * than the first #main in the document.
 */
export function RouteFocus() {
  const pathname = usePathname();
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const previous = lastPathname;
    lastPathname = pathname;
    if (previous !== null && previous !== pathname) {
      marker.current?.closest("main")?.focus({ preventScroll: true });
    }
  }, [pathname]);

  return <span ref={marker} hidden />;
}
