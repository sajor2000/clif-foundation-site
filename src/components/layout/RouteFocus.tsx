"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Last pathname seen across client navigations. Comparing against it (rather
// than a "first load done" flag) ignores Strict Mode's replayed mount effect,
// which runs again with the same pathname.
let lastPathname: string | null = null;

/** Moves keyboard focus to this page's main landmark after in-site navigation. */
export function RouteFocus({ mainId }: { mainId: string }) {
  const pathname = usePathname();

  useEffect(() => {
    const previous = lastPathname;
    lastPathname = pathname;
    if (previous !== null && previous !== pathname) {
      document.getElementById(mainId)?.focus({ preventScroll: true });
    }
  }, [pathname, mainId]);

  return null;
}
