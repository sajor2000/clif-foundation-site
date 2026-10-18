"use client";

import { createContext, useContext, useId, type ReactNode } from "react";
import { RouteFocus } from "@/components/layout/RouteFocus";

// Next keeps visited pages mounted but hidden (React <Activity>), so the skip
// link and <main> need an id that is unique across all of them. A client-side
// useId is unique within the whole app; a server-side one repeats per page.
const MainIdContext = createContext<string>("main");

export function MainIdProvider({ children }: { children: ReactNode }) {
  return <MainIdContext.Provider value={useId()}>{children}</MainIdContext.Provider>;
}

export function SkipLink() {
  return (
    <a className="skip-link" href={`#${useContext(MainIdContext)}`}>
      Skip to content
    </a>
  );
}

export function Main({ children }: { children: ReactNode }) {
  const id = useContext(MainIdContext);
  return (
    <main id={id} tabIndex={-1} style={{ outline: "none", flex: 1 }}>
      <RouteFocus mainId={id} />
      {children}
    </main>
  );
}
