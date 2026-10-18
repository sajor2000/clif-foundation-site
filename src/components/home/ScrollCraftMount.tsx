"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ScrollCraftApi = {
  mount: (
    root: Element | Document,
    opts?: { lerp?: number },
  ) => { destroy: () => void };
};

declare global {
  interface Window {
    ScrollCraft?: ScrollCraftApi;
  }
}

function loadEngine(): Promise<ScrollCraftApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("ScrollCraft requires a browser"));
  }
  if (window.ScrollCraft) {
    return Promise.resolve(window.ScrollCraft);
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-scrollcraft-engine="1"]',
    );
    if (existing) {
      if (window.ScrollCraft) {
        resolve(window.ScrollCraft);
        return;
      }
      existing.addEventListener("load", () => {
        if (window.ScrollCraft) resolve(window.ScrollCraft);
        else reject(new Error("ScrollCraft failed to load"));
      });
      existing.addEventListener("error", () =>
        reject(new Error("ScrollCraft script error")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = "/scrollcraft/scrollcraft.js";
    script.async = true;
    script.dataset.scrollcraftEngine = "1";
    script.onload = () => {
      if (window.ScrollCraft) resolve(window.ScrollCraft);
      else reject(new Error("ScrollCraft failed to load"));
    };
    script.onerror = () => reject(new Error("ScrollCraft script error"));
    document.head.appendChild(script);
  });
}

export function ScrollCraftMount({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let destroyed = false;
    let engine: ScrollCraftApi | null = null;
    let instance: { destroy: () => void } | null = null;

    // The engine reads reduced motion when it mounts, so follow a change of the
    // OS setting by remounting. Destroy and mount run in one task, so no frame
    // paints between them. A change while the script is still loading needs
    // nothing: the first mount reads the current setting.
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => {
      if (destroyed || !engine || !instance || !rootRef.current) return;
      instance.destroy();
      instance = engine.mount(rootRef.current, { lerp: 0.2 });
    };
    motion.addEventListener("change", onMotionChange);

    void loadEngine()
      .then((api) => {
        if (destroyed || !rootRef.current) return;
        engine = api;
        instance = api.mount(rootRef.current, { lerp: 0.2 });
        if (destroyed) {
          instance.destroy();
          instance = null;
          return;
        }
        rootRef.current.classList.add("sc-ready");
        rootRef.current.classList.remove("sc-fallback");
      })
      .catch(() => {
        if (destroyed || !rootRef.current) return;
        rootRef.current.classList.add("sc-fallback");
      });

    return () => {
      destroyed = true;
      motion.removeEventListener("change", onMotionChange);
      instance?.destroy();
      instance = null;
    };
  }, []);

  return (
    <div ref={rootRef} className="sc-home">
      {children}
    </div>
  );
}
